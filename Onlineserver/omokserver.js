//////////////////////////////
// onlineserver.js
//////////////////////////////
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = 3001;

/*
 rooms = {
   "006": {
     players: [
       { socketId, nickname, stone }, ...
     ],
     randomBlack: null,
     board: [...],
     blackTime: 60,
     whiteTime: 60,
     currentPlayer: 1,
     winner: null,
     gameStarted: false,
     lastMove: null,
     timerInterval: null,
     ...
   }
 }
*/
const rooms = {};

function createRoomData() {
  return {
    players: [],
    randomBlack: null,
    board: createEmptyBoard(15),
    blackTime: 60,
    whiteTime: 60,
    timeMode: 60,
    currentPlayer: 1,
    winner: null,
    gameStarted: false,
    lastMove: null,
    timerInterval: null
  };
}
function createEmptyBoard(size){
  return Array.from({ length: size }, () => Array(size).fill(0));
}

// 소켓 연결
io.on('connection', (socket) => {
  console.log(`새 연결: ${socket.id}, 아직 room 미정`);

  socket.on('joinRoom', (payload) => {
    const { roomId, nickname, timeChoice } = payload;
    socket.join(roomId);

    console.log(`새 연결: ${socket.id}, roomId=${roomId}, nickname=${nickname}`);

    // 방 정보가 없으면 생성
    if(!rooms[roomId]) {
      rooms[roomId] = createRoomData();
    }
    const roomData = rooms[roomId];

    // 혹시 이 소켓ID가 이미 players 배열에 있으면 => 중복 추가 방지
    const existingIdx = roomData.players.findIndex(p => p.socketId === socket.id);
    if(existingIdx >= 0) {
      console.log(`중복 joinRoom 감지: socket=${socket.id} (이미 방에 있음)`);
      // 이미 방에 있는 사용자면, roomData 다시 브로드캐스트만 해주고 끝낸다
      io.to(roomId).emit('roomData', buildRoomPayload(roomId));
      return;
    }

    // 만약 이미 2명 있다면 => roomFull
    if(roomData.players.length >= 2) {
      console.log(`3번째 유저(${socket.id})가 roomId=${roomId} -> roomFull`);
      socket.emit('roomFull');
      return;
    }

    // 첫 번째 입장 => randomBlack 결정(코인플립)
    if(roomData.players.length === 0) {
      const coin = (Math.random() < 0.5) ? 1 : 2;
      roomData.randomBlack = coin;
      console.log(`roomId=${roomId} 첫번째 -> randomBlack=${coin}`);
    }

    // 배정할 돌
    let assignedStone;
    if(roomData.players.length === 0) {
      assignedStone = roomData.randomBlack;
    } else {
      // 두번째 사람은 반대 돌
      assignedStone = (roomData.randomBlack === 1 ? 2 : 1);
    }

    // 시간 모드 설정(1분=60,3분=180,5분=300)
    if(roomData.players.length < 2 && timeChoice) {
      roomData.timeMode = parseTimeToSeconds(timeChoice);
      roomData.blackTime = roomData.timeMode;
      roomData.whiteTime = roomData.timeMode;
    }

    // players에 추가
    roomData.players.push({
      socketId: socket.id,
      nickname,
      stone: assignedStone
    });

    // 2명이 되면 => gameStarted
    if(roomData.players.length === 2) {
      roomData.gameStarted = true;
      roomData.currentPlayer = 1; // 흑부터
      startTimer(roomId);
      console.log(`roomId=${roomId}, 2명 입장, gameStarted=true, randomBlack=${roomData.randomBlack}`);
    }

    // 브로드캐스트
    io.to(roomId).emit('roomData', buildRoomPayload(roomId));
  });


  // 착수
  socket.on('placeStone', ({ roomId, row, col }) => {
    const d = rooms[roomId];
    if(!d) return;
    console.log(`placeStone from ${socket.id}, roomId=${roomId}, row=${row}, col=${col}`);

    if(!d.gameStarted || d.winner) return;
    if(d.board[row][col] !== 0) return;

    const stone = d.currentPlayer;
    // 삼삼
    if(isDoubleThree(d.board, row, col, stone)){
      console.log(`삼삼 거부 -> socket=${socket.id}, roomId=${roomId}`);
      socket.emit('rejectMove', { reason:"삼삼 금수" });
      return;
    }
    d.board[row][col] = stone;

    // 5목
    const isWin = checkWinner(d.board, row, col, stone);
    if(isWin) {
      d.winner = stone;
    } else {
      d.currentPlayer = (stone===1 ? 2 : 1);
    }
    d.lastMove = { row, col };

    io.to(roomId).emit('updateGame', {
      board: d.board,
      currentPlayer: d.currentPlayer,
      winner: d.winner,
      blackTime: d.blackTime,
      whiteTime: d.whiteTime,
      lastMove: d.lastMove
    });
  });

  // 채팅
  socket.on('chatMessage', ({ roomId, msg }) => {
    const d = rooms[roomId];
    if(!d) return;
    const p = d.players.find(x => x.socketId===socket.id);
    const name = p ? p.nickname : "???";
    console.log(`[채팅] roomId=${roomId}, ${name}: ${msg}`);

    io.to(roomId).emit('chatMessage', {
      sender: name,
      text: msg
    });
  });

  // 연결 해제
  socket.on('disconnect', ()=> {
    // 어떤 방에 속해있을 지 전체 rooms 검색
    let foundRoomId=null;
    for(const rId in rooms) {
      const rm= rooms[rId];
      const idx= rm.players.findIndex(p=> p.socketId===socket.id);
      if(idx>=0){
        foundRoomId=rId;
        rm.players.splice(idx,1);
        // 한 명 나갔으면
        if(rm.players.length<2 && !rm.winner){
          rm.gameStarted=false;
        }
        io.to(rId).emit('roomData', buildRoomPayload(rId));
        break;
      }
    }
    console.log(`연결 해제: ${socket.id}, roomId=${foundRoomId ? foundRoomId:"N/A"}`);
  });
});

//////////////////////////////
// 타이머
//////////////////////////////
function startTimer(roomId){
  const d = rooms[roomId];
  if(!d) return;
  if(d.timerInterval) {
    clearInterval(d.timerInterval);
  }
  d.timerInterval = setInterval(()=>{
    if(d.winner || !d.gameStarted){
      clearInterval(d.timerInterval);
      return;
    }
    // 흑=1->blackTime, 백=2->whiteTime
    if(d.currentPlayer===1){
      if(d.blackTime>0){
        d.blackTime--;
        if(d.blackTime<=0){
          d.winner=2;
        }
      }
    } else {
      if(d.whiteTime>0){
        d.whiteTime--;
        if(d.whiteTime<=0){
          d.winner=1;
        }
      }
    }
    if(d.winner){
      clearInterval(d.timerInterval);
    }
    io.to(roomId).emit('timeUpdate',{
      blackTime: d.blackTime,
      whiteTime: d.whiteTime,
      winner: d.winner
    });
  },1000);
}

function buildRoomPayload(roomId){
  const d = rooms[roomId];
  if(!d) return null;
  return {
    players: d.players.map(p=>({
      nickname: p.nickname,
      stone: p.stone
    })),
    board: d.board,
    currentPlayer: d.currentPlayer,
    blackTime: d.blackTime,
    whiteTime: d.whiteTime,
    winner: d.winner,
    gameStarted: d.gameStarted
  };
}

//////////////////////////////
// 5목 & 삼삼 보조 함수들
//////////////////////////////
function checkWinner(board, row, col, player){
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(const [dx,dy] of dirs){
    const c1= countStones(board,row,col,player,dx,dy);
    const c2= countStones(board,row,col,player,-dx,-dy);
    if(c1+c2-1>=5){
      return true;
    }
  }
  return false;
}
function isDoubleThree(board, row, col, player){
  let openThreeCount=0;
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(const [dx,dy] of dirs){
    if(isOpenThree(board,row,col,player,dx,dy)){
      openThreeCount++;
    }
  }
  return openThreeCount>=2;
}
function isOpenThree(board, row,col, player, dx,dy){
  const c1= countStones(board,row,col,player,dx,dy);
  const c2= countStones(board,row,col,player,-dx,-dy);
  const total= c1+c2-1;
  if(total!==3) return false;

  const e1r= row+ dx*c1, e1c= col+ dy*c1;
  const e2r= row- dx*c2, e2c= col- dy*c2;
  if(!isInside(e1r,e1c,board.length)|| !isInside(e2r,e2c,board.length)) return false;
  if(board[e1r][e1c]!==0) return false;
  if(board[e2r][e2c]!==0) return false;

  return true;
}
function countStones(board, row,col, player, dx,dy){
  let r=row, c=col, cnt=0;
  while(isInside(r,c,board.length)&& board[r][c]===player){
    cnt++;
    r+=dx; c+=dy;
  }
  return cnt;
}
function isInside(r,c,size){
  return (r>=0 && r<size && c>=0 && c<size);
}

function parseTimeToSeconds(mode){
  if(mode==="3분") return 180;
  if(mode==="5분") return 300;
  return 60; // 기본=1분
}

// 서버 실행
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Onlineserver listening on port ${PORT}`);
});
