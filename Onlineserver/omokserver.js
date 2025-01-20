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
   "001": {
     players: [
       { socketId, nickname, stone:1|2|null },
       ...
     ],
     board: [ [...], ... ],
     blackTime: 60,
     whiteTime: 60,
     timeMode: 60,
     currentPlayer: 1 or 2,
     winner: null,        // 1=흑승,2=백승,null=미결
     winReason: null,     // "5목"|"시간"|"기권" 등
     gameStarted: false,
     lastMove: null,
     timerInterval: null,
   }
 }
*/
const rooms = {};

function createRoomData() {
  return {
    players: [],               // [{socketId, nickname, stone}, ...]
    board: createEmptyBoard(15),
    blackTime: 60,             // 기본 1분(60초)
    whiteTime: 60,
    timeMode: 60,              // 3분=180,5분=300
    currentPlayer: 1,
    winner: null,
    winReason: null,
    gameStarted: false,
    lastMove: null,
    timerInterval: null
  };
}

function createEmptyBoard(size){
  return Array.from({ length: size }, () => Array(size).fill(0));
}

// 5목/삼삼 보조
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
  if(!isInside(e1r,e1c,board.length) || !isInside(e2r,e2c,board.length)) return false;
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
  return (r>=0 && r<size && c>=0 && c<size);
}
function parseTimeToSeconds(mode){
  // "1분"=60, "3분"=180, "5분"=300
  if(mode==="3분") return 180;
  if(mode==="5분") return 300;
  return 60; // default=1분
}

// 방 상태 빌드
function buildRoomPayload(roomId){
  const d= rooms[roomId];
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

// 타이머
function startTimer(roomId){
  const d= rooms[roomId];
  if(!d) return;
  if(d.timerInterval){
    clearInterval(d.timerInterval);
  }
  d.timerInterval= setInterval(()=>{
    if(d.winner || !d.gameStarted){
      clearInterval(d.timerInterval);
      return;
    }
    if(d.currentPlayer===1){
      if(d.blackTime>0){
        d.blackTime--;
        if(d.blackTime<=0){
          d.winner=2;
          d.winReason="시간";
        }
      }
    } else {
      if(d.whiteTime>0){
        d.whiteTime--;
        if(d.whiteTime<=0){
          d.winner=1;
          d.winReason="시간";
        }
      }
    }
    if(d.winner){
      clearInterval(d.timerInterval);
    }
    // broadcast
    // (winReason은 별도 이벤트에서 안내하거나 클라이언트가 추정)
    // 여기서는 winner만 보냄
    // 만약 winReason도 넘기려면 payload에 추가
    // e.g. { winner: d.winner, reason: d.winReason, ... }
    io.to(roomId).emit('timeUpdate',{
      blackTime: d.blackTime,
      whiteTime: d.whiteTime,
      winner: d.winner
    });
  },1000);
}

//////////////////////////////////////////////
// 소켓
//////////////////////////////////////////////
const ioListener = io.on('connection', (socket)=>{
  console.log(`새 연결: ${socket.id}, 아직 room 미정`);

  socket.on('joinRoom', ({ roomId, nickname, timeChoice }) => {
    socket.join(roomId);
    console.log(`joinRoom: sock=${socket.id}, room=${roomId}, nick=${nickname}`);

    if(!rooms[roomId]){
      rooms[roomId] = createRoomData();
    }
    const roomData= rooms[roomId];

    // 혹시 이미 등록된 플레이어라면(새로고침 등) -> 중복
    const existing= roomData.players.findIndex(p=> p.socketId===socket.id);
    if(existing>=0){
      console.log(`중복 joinRoom -> sock=${socket.id}, room=${roomId}`);
      io.to(roomId).emit('roomData', buildRoomPayload(roomId));
      return;
    }

    // 2명이면 방 꽉참
    if(roomData.players.length>=2){
      console.log(`3번째(${socket.id}) -> roomFull`);
      socket.emit('roomFull');
      return;
    }

    // 첫 사람 -> 시간모드 세팅
    if(roomData.players.length<2 && timeChoice){
      roomData.timeMode = parseTimeToSeconds(timeChoice);
      roomData.blackTime= roomData.timeMode;
      roomData.whiteTime= roomData.timeMode;
    }

    // 새 player
    roomData.players.push({
      socketId: socket.id,
      nickname,
      stone:null
    });

    // 만약 2명 -> 흑백 배정
    if(roomData.players.length===2){
      // coin
      const coin= (Math.random()<0.5)?1:2;
      // 첫 player
      roomData.players[0].stone= coin;
      // 두 번째
      roomData.players[1].stone= (coin===1?2:1);

      roomData.gameStarted=true;
      roomData.currentPlayer=1; // 흑부터
      startTimer(roomId);

      // 각자에게 안내 메시지: "[Info] 당신은 (흑) 입니다."
      roomData.players.forEach(pl=>{
        const stoneLabel= (pl.stone===1?"흑":"백");
        // 채팅을 보낼 때 stonelabel+nickname 으로
        io.to(pl.socketId).emit('chatMessage',{
          sender: "System",
          text: `[Info] 당신은 (${stoneLabel}) 입니다.`
        });
      });
    }

    io.to(roomId).emit('roomData', buildRoomPayload(roomId));
  });

  // 착수
  socket.on('placeStone', ({ roomId, row, col })=>{
    const d= rooms[roomId];
    if(!d) return;
    console.log(`placeStone: sock=${socket.id}, r=${row}, c=${col}`);

    if(!d.gameStarted|| d.winner) return;
    if(d.board[row][col]!==0) return;

    // 현재 턴
    const stone= d.currentPlayer;
    // 소켓이 가진 돌?
    const p= d.players.find(x=> x.socketId===socket.id);
    if(!p) return;
    if(p.stone!==stone){
      // 자기 차례가 아님
      console.log(`착수 거부: turn=${stone}, playerStone=${p.stone}`);
      return;
    }

    // 삼삼
    if(isDoubleThree(d.board, row, col, stone)){
      console.log(`삼삼 거부: sock=${socket.id}, row=${row}, col=${col}`);
      socket.emit('rejectMove',{ reason:"삼삼 금수" });
      return;
    }

    d.board[row][col]= stone;
    // 5목
    const isWin= checkWinner(d.board, row, col, stone);
    if(isWin){
      d.winner= stone;
      d.winReason="5목";
    } else {
      d.currentPlayer= (stone===1?2:1);
    }
    d.lastMove= {row,col};

    io.to(roomId).emit('updateGame',{
      board: d.board,
      currentPlayer: d.currentPlayer,
      winner: d.winner,
      blackTime: d.blackTime,
      whiteTime: d.whiteTime,
      lastMove: d.lastMove
    });
  });

  // 채팅
  socket.on('chatMessage',({ roomId, msg })=>{
    const d= rooms[roomId];
    if(!d) return;
    const p= d.players.find(x=> x.socketId===socket.id);
    const stoneLabel= p? (p.stone===1?"(흑)":"(백)") : "(??)";
    const name= p? p.nickname:"???";
    const displayName= `${stoneLabel}${name}`;

    console.log(`[채팅] room=${roomId}, ${displayName}: ${msg}`);
    io.to(roomId).emit('chatMessage',{
      sender: displayName,
      text: msg
    });
  });

  // 연결 해제
  socket.on('disconnect',()=>{
    console.log(`연결 해제: ${socket.id}`);
    let foundRoom=null;
    for(const rId in rooms){
      const rm= rooms[rId];
      const idx= rm.players.findIndex(p=> p.socketId===socket.id);
      if(idx>=0){
        foundRoom=rId;
        rm.players.splice(idx,1);
        if(rm.players.length<2 && !rm.winner){
          rm.gameStarted=false;
        }
        io.to(rId).emit('roomData', buildRoomPayload(rId));
        break;
      }
    }
    console.log(` -> roomId=${foundRoom??"N/A"} 정리`);
  });
});

server.listen(PORT,'0.0.0.0',()=>{
  console.log(`Onlineserver listening on port ${PORT}`);
});
