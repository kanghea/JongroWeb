//////////////////////////////////////////////
// onlineserver.js
//////////////////////////////////////////////
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

const PORT = 3001;

/**
 * rooms[roomId] = {
 *   players:[ { socketId, nickname, stone }, ...],
 *   board: [...],
 *   blackTime: number,
 *   whiteTime: number,
 *   timeMode: number,
 *   currentPlayer:1 or 2,
 *   winner:null or 1 or 2,
 *   winReason:null or "5목"/"시간"/"상대방 이탈",
 *   gameStarted:false or true,
 *   lastMove:{row,col} or null,
 *   timerInterval: null,
 * }
 */
const rooms = {};

/** 15x15 짜리 빈 오목판 생성 */
function createEmptyBoard(size = 15) {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

/** 방 생성 시 기본 구조 */
function createRoomData() {
  return {
    players: [],
    board: createEmptyBoard(15),
    blackTime: 60,
    whiteTime: 60,
    timeMode: 60,     // "1분"=60, "3분"=180, "5분"=300
    currentPlayer: 1, // 1=흑, 2=백
    winner: null,
    winReason: null,
    gameStarted: false,
    lastMove: null,
    timerInterval: null,
  };
}

/** "3분"->180, "5분"->300, 기본=60초 */
function parseTimeToSeconds(mode) {
  if (mode === "3분") return 180;
  if (mode === "5분") return 300;
  return 60;
}

/** 클라이언트로 전송할 roomData */
function buildRoomPayload(roomId) {
  const d = rooms[roomId];
  if (!d) return null;
  return {
    players: d.players.map((p) => ({
      nickname: p.nickname,
      stone: p.stone, // 1=흑,2=백
      socketId: p.socketId,
    })),
    board: d.board,
    currentPlayer: d.currentPlayer,
    blackTime: d.blackTime,
    whiteTime: d.whiteTime,
    winner: d.winner,
    gameStarted: d.gameStarted,
  };
}

/** 범위 체크 */
function isInside(r, c, size) {
  return r >= 0 && r < size && c >= 0 && c < size;
}

/** 연속된 돌 개수 */
function countStones(board, row, col, player, dx, dy) {
  let cnt = 0;
  let r = row, c = col;
  while (isInside(r, c, board.length) && board[r][c] === player) {
    cnt++;
    r += dx;
    c += dy;
  }
  return cnt;
}

/** 5목 체크 */
function checkWinner(board, row, col, player) {
  const dirs = [
    [0,1],[1,0],[1,1],[1,-1]
  ];
  for (const [dx, dy] of dirs) {
    const c1 = countStones(board, row, col, player, dx, dy);
    const c2 = countStones(board, row, col, player, -dx, -dy);
    if (c1 + c2 - 1 >= 5) return true;
  }
  return false;
}

/** 삼삼금수(흑) */
function isDoubleThree(board, row, col, player) {
  let openThreeCount = 0;
  const dirs = [
    [0,1],[1,0],[1,1],[1,-1]
  ];
  for (const [dx, dy] of dirs) {
    if (isOpenThree(board, row, col, player, dx, dy)) {
      openThreeCount++;
    }
  }
  return openThreeCount >= 2;
}
function isOpenThree(board, row, col, player, dx, dy) {
  const c1 = countStones(board, row, col, player, dx, dy);
  const c2 = countStones(board, row, col, player, -dx, -dy);
  const total = c1 + c2 - 1;
  if (total !== 3) return false;

  const e1r = row + dx*c1, e1c = col + dy*c1;
  const e2r = row - dx*c2, e2c = col - dy*c2;
  if (!isInside(e1r,e1c,board.length) || !isInside(e2r,e2c,board.length)) return false;
  if (board[e1r][e1c] !== 0) return false;
  if (board[e2r][e2c] !== 0) return false;
  return true;
}

/** 타이머 시작(1초마다) */
function startTimer(roomId) {
  const d = rooms[roomId];
  if (!d) return;
  if (d.timerInterval) clearInterval(d.timerInterval);

  d.timerInterval = setInterval(() => {
    if (d.winner || !d.gameStarted) {
      clearInterval(d.timerInterval);
      return;
    }

    // 현재 턴 시간 감소
    if (d.currentPlayer === 1) {
      if (d.blackTime > 0) {
        d.blackTime--;
        if (d.blackTime <= 0) {
          d.winner = 2;
          d.winReason = "시간";
          io.to(roomId).emit("updateGame", {
            board: d.board,
            currentPlayer: d.currentPlayer,
            winner: d.winner,
            blackTime: d.blackTime,
            whiteTime: d.whiteTime,
            lastMove: d.lastMove,
          });
        }
      }
    } else {
      if (d.whiteTime > 0) {
        d.whiteTime--;
        if (d.whiteTime <= 0) {
          d.winner = 1;
          d.winReason = "시간";
          io.to(roomId).emit("updateGame", {
            board: d.board,
            currentPlayer: d.currentPlayer,
            winner: d.winner,
            blackTime: d.blackTime,
            whiteTime: d.whiteTime,
            lastMove: d.lastMove,
          });
        }
      }
    }

    // 승자가 없으면 timeUpdate
    if (!d.winner) {
      io.to(roomId).emit("timeUpdate", {
        blackTime: d.blackTime,
        whiteTime: d.whiteTime,
        winner: d.winner,
      });
    }
  }, 1000);
}

/** 보드/시간 등 초기화 & 채팅 리셋 */
function resetGame(roomId) {
  const d = rooms[roomId];
  if (!d) return;

  clearInterval(d.timerInterval);

  d.board = createEmptyBoard(15);
  d.lastMove = null;
  d.winner = null;
  d.winReason = null;

  d.blackTime = d.timeMode;
  d.whiteTime = d.timeMode;

  d.currentPlayer = 1;
  d.gameStarted = true;

  startTimer(roomId);
  console.log(`[${roomId}] 보드/채팅 초기화 완료!`);

  // 채팅 리셋
  io.to(roomId).emit("resetChat");
}

/////////////////////////////////////////////////////
// ★ 추가 이벤트: 현재 대기 중인 방 목록 요청
/////////////////////////////////////////////////////
function getWaitingRoomsList() {
  // 현재 "게임시작 전"이거나 "인원<2" 인 방들만 반환
  const list = [];
  for (const rid in rooms) {
    const rm = rooms[rid];
    // 예: 'gameStarted=false' 이거나 인원<2
    // 여기서는 "1명만 있는 방" 정도를 대기 중으로 취급
    if (!rm.gameStarted && rm.players.length < 2 && !rm.winner) {
      list.push({
        roomId: rid,
        timeMode: rm.timeMode,
        players: rm.players.map(p => ({
          nickname: p.nickname,
          stone: p.stone
        }))
      });
    }
  }
  return list;
}

io.on("connection", (socket) => {
  console.log(`새 클라이언트 접속! 소켓ID=${socket.id}`);

  // [이벤트] 대기 중인 방 목록을 달라고 요청
  socket.on("requestWaitingRooms", () => {
    const waitingRooms = getWaitingRoomsList();
    // 클라이언트에게 대기방 목록 전송
    socket.emit("waitingRooms", waitingRooms);
  });

  /**
   * 방 참여
   */
  socket.on("joinRoom", ({ roomId, nickname, timeChoice }) => {
    socket.join(roomId);
    console.log(` > [joinRoom] 소켓ID=${socket.id}, 방번호=${roomId}, 닉네임=${nickname}`);

    if (!rooms[roomId]) {
      rooms[roomId] = createRoomData();
    }
    const d = rooms[roomId];

    // 이미 등록된 소켓?
    const existing = d.players.findIndex(p => p.socketId === socket.id);
    if (existing >= 0) {
      io.to(roomId).emit("roomData", buildRoomPayload(roomId));
      return;
    }

    // 2명 초과 -> roomFull
    if (d.players.length >= 2) {
      console.log(" -> 이미 2명, roomFull");
      socket.emit("roomFull");
      return;
    }

    // timeChoice 반영
    if (d.players.length < 2 && timeChoice) {
      const t = parseTimeToSeconds(timeChoice);
      d.timeMode = t;
      d.blackTime = t;
      d.whiteTime = t;
    }

    d.players.push({
      socketId: socket.id,
      nickname,
      stone: null,
    });

    // 2명 -> 게임 시작
    if (d.players.length === 2 && !d.gameStarted) {
      const coin = Math.random() < 0.5 ? 1 : 2;
      d.players[0].stone = coin;
      d.players[1].stone = (coin === 1 ? 2 : 1);

      d.gameStarted = true;
      d.currentPlayer = 1;
      startTimer(roomId);

      d.players.forEach(pl => {
        const stoneLabel = (pl.stone===1 ? "흑" : "백");
        io.to(pl.socketId).emit("chatMessage", {
          sender: "[Info]",
          text: `당신은 (${stoneLabel}) 입니다.`,
        });
      });
      console.log(`[${roomId}] 2명 참여 -> 동전결과: ${(coin===1?"흑":"백")} 선`);
    }

    io.to(roomId).emit("roomData", buildRoomPayload(roomId));
    io.emit("waitingRooms", getWaitingRoomsList());
  });

  /**
   * 착수
   */
  socket.on("placeStone", ({ roomId, row, col }) => {
    const d = rooms[roomId];
    if (!d) return;
    console.log(` > [placeStone] 소켓ID=${socket.id}, 방=${roomId}, 위치=(${row},${col})`);

    if (!d.gameStarted || d.winner) return;
    if (d.board[row][col] !== 0) return;

    const p = d.players.find(x => x.socketId === socket.id);
    if (!p) return;

    if (p.stone !== d.currentPlayer) {
      console.log(`    착수 거부: 현재 턴 아님 (current=${d.currentPlayer}, player=${p.stone})`);
      return;
    }

    // 흑 삼삼
    if (p.stone === 1 && isDoubleThree(d.board, row, col, p.stone)) {
      console.log(`    삼삼 금수 (r=${row}, c=${col})`);
      socket.emit("rejectMove", { reason: "삼삼 금수" });
      return;
    }

    d.board[row][col] = d.currentPlayer;
    d.lastMove = { row, col };

    const isWin = checkWinner(d.board, row, col, d.currentPlayer);
    if (isWin) {
      d.winner = d.currentPlayer;
      d.winReason = "5목";
    } else {
      d.currentPlayer = (d.currentPlayer === 1 ? 2 : 1);
    }

    io.to(roomId).emit("updateGame", {
      board: d.board,
      currentPlayer: d.currentPlayer,
      winner: d.winner,
      blackTime: d.blackTime,
      whiteTime: d.whiteTime,
      lastMove: d.lastMove,
    });
  });

  /**
   * 채팅
   */
  socket.on("chatMessage", ({ roomId, msg }) => {
    const d = rooms[roomId];
    if (!d) return;
    const p = d.players.find(x => x.socketId === socket.id);
    if (!p) return;

    if (!msg || !msg.trim()) return;
    const cleanMsg = msg.replace(/\s+/g, " ").trim();
    if (!cleanMsg) return;

    const stoneLabel = (p.stone===1?"(흑)": p.stone===2?"(백)":"(??)");
    const dispName = p.nickname || "???";
    io.to(roomId).emit("chatMessage", {
      sender: stoneLabel + dispName,
      text: cleanMsg
    });
  });

  /**
   * 보드 초기화 요청
   */
  socket.on("requestResetGame", ({ roomId }) => {
    const d = rooms[roomId];
    if (!d) return;
    resetGame(roomId);
    io.to(roomId).emit("roomData", buildRoomPayload(roomId));
  });

  /**
   * 연결 해제 -> 상대방 이탈 처리
   */
  socket.on("disconnect", () => {
    console.log(`연결 해제: ${socket.id}`);
    let foundRoom = null;

    // 참여중인 방에서 제거
    for (const rId in rooms) {
      const rm = rooms[rId];
      const idx = rm.players.findIndex(p => p.socketId === socket.id);
      if (idx >= 0) {
        foundRoom = rId;
        rm.players.splice(idx, 1);

        // 1명만 남았고 승자없으면 남은사람 승리
        if (rm.players.length === 1 && !rm.winner) {
          rm.winner = rm.players[0].stone;
          rm.winReason = "상대방 이탈";
          clearInterval(rm.timerInterval);
          rm.gameStarted = false;

          io.to(rId).emit("updateGame", {
            board: rm.board,
            currentPlayer: rm.currentPlayer,
            winner: rm.winner,
            blackTime: rm.blackTime,
            whiteTime: rm.whiteTime,
            lastMove: rm.lastMove
          });
        }
        // 아무도 없으면 -> reset
        else if (rm.players.length === 0) {
          resetGame(rId);
        }
        // 1명 남았는데 승자 없으면 gameStarted=false
        else if (rm.players.length < 2 && !rm.winner) {
          rm.gameStarted = false;
        }

        io.to(rId).emit("roomData", buildRoomPayload(rId));
        break;
      }
    }
    console.log(`  -> 정리된 방번호=${foundRoom??"없음"}`);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`온라인 오목 서버가 포트 ${PORT}에서 대기 중입니다.`);
});
