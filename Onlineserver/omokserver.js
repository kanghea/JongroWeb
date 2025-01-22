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
 *   roomName: string,
 * }
 */
const rooms = {};

/** ★ 서버 전체 접속자 추적 객체 (소켓ID -> 닉네임) */
const onlineUsers = {};

/** ★ Guest 방 닉네임 배정용 카운터 */
let guestCounter = 0;

/** ★ 서버 전체 유저(글로벌) 카운터 (HomeBody.js에서 보이는 '접속자 목록') */
let globalUserCounter = 0;

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
    roomName: "", // 방 이름
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
    roomName: d.roomName, // 방 이름
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
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dx, dy] of dirs) {
    const c1 = countStones(board, row, col, player, dx, dy);
    const c2 = countStones(board, row, col, player, -dx, -dy);
    if (c1 + c2 - 1 >= 5) return true;
  }
  return false;
}

/** 삼삼금수(흑) - 간단히 open three만 체크하는 예시 */
function isDoubleThree(board, row, col, player) {
  let openThreeCount = 0;
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
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

/**
 * ★ getWaitingRoomsList:
 *    - 승자가 정해지지 않은 모든 방(대기중 + 진행중) 노출
 */
function getWaitingRoomsList() {
  const list = [];
  for (const rid in rooms) {
    const rm = rooms[rid];
    // 이미 winner가 있으면 게임 종료된 방이므로 제외
    if (rm.winner) {
      continue;
    }
    // 그 외 (대기중 + 진행중) 전부 목록에 추가
    list.push({
      roomId: rid,
      timeMode: rm.timeMode,
      players: rm.players.map(p => ({
        nickname: p.nickname,
        stone: p.stone
      })),
      roomName: rm.roomName,
      gameStarted: rm.gameStarted
    });
  }
  return list;
}

/////////////////////////////////////////////////////////////
// Socket.IO
/////////////////////////////////////////////////////////////

io.on("connection", (socket) => {
  console.log(`새 클라이언트 접속! 소켓ID=${socket.id}`);

  globalUserCounter++;
  const globalGuestName = `User${globalUserCounter}`;
  onlineUsers[socket.id] = globalGuestName;

  // 전체 유저 목록
  socket.on("requestOnlineUsers", () => {
    const userList = Object.values(onlineUsers);
    socket.emit("onlineUsers", userList);
  });

  // 대기(및 진행중) 방 목록 요청
  socket.on("requestWaitingRooms", () => {
    const waitingRooms = getWaitingRoomsList();
    socket.emit("waitingRooms", waitingRooms);
  });

  /**
   * 방 참여
   */
  socket.on("joinRoom", ({ roomId, roomName, timeChoice }) => {
    if (!roomName || !roomName.trim()) {
      roomName = "NoName";
    }
    socket.join(roomId);
    console.log(` > [joinRoom] 소켓ID=${socket.id}, 방번호=${roomId}, 방이름=${roomName}`);

    if (!rooms[roomId]) {
      rooms[roomId] = createRoomData();
      rooms[roomId].roomName = roomName;
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

    // 플레이어 닉네임: Guest#
    guestCounter++;
    const assignedNick = `Guest${guestCounter}`;

    d.players.push({
      socketId: socket.id,
      nickname: assignedNick,
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
   * ★ leaveRoom (뒤로가기)
   */
  socket.on("leaveRoom", ({ roomId }) => {
    const rm = rooms[roomId];
    if (!rm) return;
    const idx = rm.players.findIndex(p => p.socketId === socket.id);
    if (idx >= 0) {
      rm.players.splice(idx, 1);

      // 1명만 남았고 승자없으면 => 남은사람 승리
      if (rm.players.length === 1 && !rm.winner) {
        rm.winner = rm.players[0].stone;
        rm.winReason = "상대방 이탈";
        clearInterval(rm.timerInterval);
        rm.gameStarted = false;

        io.to(roomId).emit("updateGame", {
          board: rm.board,
          currentPlayer: rm.currentPlayer,
          winner: rm.winner,
          blackTime: rm.blackTime,
          whiteTime: rm.whiteTime,
          lastMove: rm.lastMove
        });
      }
      // 0명이면 방 완전 리셋
      else if (rm.players.length === 0) {
        resetGame(roomId);
      }
      // 1명 미만(=0)이 아니고, 승자도 없으면 gameStarted=false
      else if (rm.players.length < 2 && !rm.winner) {
        rm.gameStarted = false;
      }

      io.to(roomId).emit("roomData", buildRoomPayload(roomId));
    }

    // 대기방 목록 갱신
    io.emit("waitingRooms", getWaitingRoomsList());
  });

  /**
   * 연결 해제(disconnect) -> 상대방 이탈 처리
   */
  socket.on("disconnect", () => {
    console.log(`연결 해제: ${socket.id}`);

    // onlineUsers 에서 제거
    delete onlineUsers[socket.id];

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

    // 대기방 목록 갱신
    io.emit("waitingRooms", getWaitingRoomsList());
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`온라인 오목 서버가 포트 ${PORT}에서 대기 중입니다.`);
});
