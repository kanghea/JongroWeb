//////////////////////////////////////////////
// onlineserver.js
//////////////////////////////////////////////
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
       { socketId, nickname, stone:1|2 (null if not assigned) },
       ...
     ],
     board: [...],
     blackTime: 60,
     whiteTime: 60,
     timeMode: 60,
     currentPlayer: 1,
     winner: null,
     gameStarted: false,
     lastMove: null,
     timerInterval: null,
   }
 }
*/
const rooms = {};

function createRoomData() {
  return {
    players: [],         // [{socketId, nickname, stone:null|1|2}]
    board: createEmptyBoard(15),
    blackTime: 60,
    whiteTime: 60,
    timeMode: 60,        // 1분=60,3분=180,5분=300
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

// ------------------------------
// 소켓 연결
// ------------------------------
io.on('connection', (socket) => {
  console.log(`새 연결: ${socket.id}, 아직 room 미정`);

  // joinRoom
  socket.on('joinRoom', (payload) => {
    const { roomId, nickname, timeChoice } = payload;
    socket.join(roomId);
    console.log(`joinRoom: socket=${socket.id}, roomId=${roomId}, nickname=${nickname}`);

    if(!rooms[roomId]) {
      rooms[roomId] = createRoomData();
    }
    const roomData = rooms[roomId];

    // 이미 이 소켓이 players에 있으면 중복 방지
    const existingIdx = roomData.players.findIndex(p=> p.socketId===socket.id);
    if(existingIdx>=0) {
      console.log(`중복 joinRoom: socket=${socket.id} (이미 ${roomId}에 있음)`);
      io.to(roomId).emit('roomData', buildRoomPayload(roomId));
      return;
    }

    // 이미 2명 있으면 -> roomFull
    if(roomData.players.length>=2) {
      console.log(`3번째 유저(${socket.id})가 roomId=${roomId} -> roomFull`);
      socket.emit('roomFull');
      return;
    }

    // timeChoice => timeMode
    if(roomData.players.length<2 && timeChoice) {
      roomData.timeMode = parseTimeToSeconds(timeChoice);
      roomData.blackTime = roomData.timeMode;
      roomData.whiteTime = roomData.timeMode;
    }

    // 아직 돌은 배정하지 않음(두 명 찼을 때 배정)
    roomData.players.push({
      socketId: socket.id,
      nickname,
      stone: null
    });

    // 만약 2명이 되면 => 게임 시작
    if(roomData.players.length===2) {
      // 흑백 랜덤 배정
      const coin = (Math.random()<0.5) ? 1 : 2; 
      // 첫번째 players[0].stone=coin, 두번째=반대
      roomData.players[0].stone = coin;
      roomData.players[1].stone = (coin===1 ? 2 : 1);

      roomData.gameStarted=true;
      roomData.currentPlayer=1; // 흑 먼저
      startTimer(roomId);
      console.log(`roomId=${roomId} 2명 입장 -> 흑백랜덤=${coin}, gameStarted=true`);
    }

    // 브로드캐스트
    io.to(roomId).emit('roomData', buildRoomPayload(roomId));
  });

  // 착수
  socket.on('placeStone', ({ roomId, row, col }) => {
    const d = rooms[roomId];
    if(!d) return;
    console.log(`placeStone: socket=${socket.id}, room=${roomId}, row=${row}, col=${col}`);

    if(!d.gameStarted || d.winner) return;
    if(d.board[row][col]!==0) return;

    // 현재 플레이어가 놓아야만 착수 가능
    // => 1(흑) 차례면, 착수 소켓의 stone이 1이어야 함
    // => 2(백) 차례면, 착수 소켓의 stone이 2
    const currentStone = d.currentPlayer;
    // 소켓id -> roomData.players에서 stone 찾기
    const p = d.players.find(x=> x.socketId===socket.id);
    if(!p) return; // 해당 플레이어 없음
    if(p.stone!== currentStone) {
      console.log(`착수 거부 -> ${socket.id}은 player.stone=${p.stone}, 그러나 currentStone=${currentStone}`);
      // 착수 거부 (턴 아님)
      return;
    }

    // 삼삼?
    if(isDoubleThree(d.board, row, col, currentStone)){
      console.log(`삼삼 거부 -> socket=${socket.id}`);
      socket.emit('rejectMove', { reason:"삼삼 금수" });
      return;
    }
    d.board[row][col] = currentStone;

    // 5목
    const isWin = checkWinner(d.board, row, col, currentStone);
    if(isWin) {
      d.winner = currentStone;
    } else {
      d.currentPlayer = (currentStone===1?2:1);
    }
    d.lastMove={row,col};

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
    const d= rooms[roomId];
    if(!d) return;
    const p= d.players.find(x=> x.socketId===socket.id);
    const name= p? p.nickname:"???";

    console.log(`[채팅] roomId=${roomId}, ${name}: ${msg}`);
    io.to(roomId).emit('chatMessage', {
      sender: name,
      text: msg
    });
  });

  // 연결 해제
  socket.on('disconnect', () => {
    console.log(`연결 해제: ${socket.id}`);
    // 어떤 room에 있는지 찾기
    let foundRoomId=null;
    for(const rId in rooms){
      const rm= rooms[rId];
      const idx= rm.players.findIndex(p=> p.socketId===socket.id);
      if(idx>=0){
        foundRoomId=rId;
        rm.players.splice(idx,1);
        // 1명 이하가 남으면 gameStarted=false
        if(rm.players.length<2 && !rm.winner){
          rm.gameStarted=false;
        }
        io.to(rId).emit('roomData', buildRoomPayload(rId));
        break;
      }
    }
  });
});

// ------------------------------
// 타이머
// ------------------------------
function startTimer(roomId){
  const d= rooms[roomId];
  if(!d) return;
  if(d.timerInterval){
    clearInterval(d.timerInterval);
  }
  d.timerInterval= setInterval(()=>{
    if(d.winner||!d.gameStarted){
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
    io.to(roomId).emit('timeUpdate', {
      blackTime:d.blackTime,
      whiteTime:d.whiteTime,
      winner:d.winner
    });
  },1000);
}

function buildRoomPayload(roomId){
  const d= rooms[roomId];
  if(!d) return null;
  return {
    players: d.players.map(p=>({
      nickname:p.nickname,
      stone:p.stone
    })),
    board: d.board,
    currentPlayer:d.currentPlayer,
    blackTime:d.blackTime,
    whiteTime:d.whiteTime,
    winner:d.winner,
    gameStarted:d.gameStarted
  };
}

// ------------------------------
// 5목 & 삼삼
// ------------------------------
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
function isDoubleThree(board, row,col, player){
  let openThreeCount=0;
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(const [dx,dy]of dirs){
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
  
  const e1r= row+dx*c1, e1c= col+dy*c1;
  const e2r= row-dx*c2, e2c= col-dy*c2;
  if(!isInside(e1r,e1c,board.length)|| !isInside(e2r,e2c,board.length)) return false;
  if(board[e1r][e1c]!==0) return false;
  if(board[e2r][e2c]!==0) return false;
  return true;
}
function countStones(board, row,col, player, dx,dy){
  let r=row, c=col, cnt=0;
  while(isInside(r,c,board.length) && board[r][c]===player){
    cnt++;
    r+=dx; c+=dy;
  }
  return cnt;
}
function isInside(r,c,size){
  return(r>=0 && r<size && c>=0 && c<size);
}
function parseTimeToSeconds(mode){
  if(mode==="3분") return 180;
  if(mode==="5분") return 300;
  return 60; // 1분 기본
}

server.listen(PORT,'0.0.0.0', ()=>{
  console.log(`Onlineserver listening on port ${PORT}`);
});
