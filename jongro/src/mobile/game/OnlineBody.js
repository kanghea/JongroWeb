import React, {
  useState,
  useEffect,
  useRef,
  forwardRef
} from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getSocket } from "../../socket.js";

import player1Image from "../images/player1.png";
import player2Image from "../images/player2.png";

/** 초 -> "m:ss" 포맷 */
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" + s : s}`;
}

/** size=15 오목판 */
function createEmptyBoard(size = 15) {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

/** Goban(오목판) */
function Goban({ board, lastMove, onCellClick }) {
  const [boardSizePx, setBoardSizePx] = useState(600);

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      const newSize = w < 640 ? w - 24 : 600;
      setBoardSizePx(newSize > 200 ? newSize : 200);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const size = 15;
  const cellGap = boardSizePx / (size - 1);

  return (
    <div
      className="relative"
      style={{
        width: boardSizePx + "px",
        height: boardSizePx + "px",
        backgroundColor: "#DAB86F",
      }}
    >
      {/* 격자선 */}
      {Array.from({ length: size }, (_, i) => (
        <div key={i}>
          <div
            className="absolute"
            style={{
              top: i * cellGap,
              left: 0,
              width: boardSizePx,
              height: "2px",
              backgroundColor: "#5A3A1B",
            }}
          />
          <div
            className="absolute"
            style={{
              left: i * cellGap,
              top: 0,
              width: "2px",
              height: boardSizePx,
              backgroundColor: "#5A3A1B",
            }}
          />
        </div>
      ))}
      {/* 돌 표시 */}
      {board.map((rowArr, r) =>
        rowArr.map((val, c) => {
          if (val === 0) return null;
          const isLast = lastMove && lastMove.row === r && lastMove.col === c;
          return (
            <div
              key={`${r}-${c}`}
              className={`
                absolute
                ${val === 1 ? "bg-black" : "bg-white"}
                rounded-full
                border
                ${val === 2 ? "border-gray-500" : "border-black"}
                ${isLast ? "outline outline-2 outline-yellow-300" : ""}
              `}
              style={{
                width: cellGap * 0.65,
                height: cellGap * 0.65,
                top: r * cellGap - (cellGap * 0.65) / 2,
                left: c * cellGap - (cellGap * 0.65) / 2,
              }}
              onClick={() => onCellClick(r, c)}
            />
          );
        })
      )}
      {/* 클릭 영역(투명) */}
      {Array.from({ length: size }, (_, r) =>
        Array.from({ length: size }, (_, c) => (
          <div
            key={`pos-${r}-${c}`}
            className="absolute"
            style={{
              width: cellGap,
              height: cellGap,
              top: r * cellGap - cellGap / 2,
              left: c * cellGap - cellGap / 2,
            }}
            onClick={() => onCellClick(r, c)}
          />
        ))
      )}
    </div>
  );
}

function OnlineBody() {
  const navigate = useNavigate();

  // URL 파라미터와 쿼리
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const roomName = searchParams.get("roomName") || "";
  const timeChoice = searchParams.get("timeChoice") || "1분";

  // 기본 상태들
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [blackTime, setBlackTime] = useState(60);
  const [whiteTime, setWhiteTime] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);

  // 돌 배정
  const [myStone, setMyStone] = useState(null);
  const [oppStone, setOppStone] = useState(null);
  const [oppNickname, setOppNickname] = useState("");

  // 방 이름 표시용 State
  const [theRoomName, setTheRoomName] = useState(roomName);

  // 채팅 관련
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);
  const chatInputRef = useRef(null);

  // 승리 모달
  const [showWinModal, setShowWinModal] = useState(false);
  const [amIWinner, setAmIWinner] = useState(false);
  const [winReason, setWinReason] = useState("");

  // 소켓 + 이벤트 등록 여부
  const socketRef = useRef(null);
  const joinedRef = useRef(false);       // joinRoom 실행 여부
  const isSetupEventRef = useRef(false); // 소켓 이벤트 등록 여부

  // 1) 최초(마운트) 시 소켓 이벤트 등록 (단 한 번만)
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = getSocket(); // 전역 싱글톤 소켓
    }
    const socket = socketRef.current;

    if (!isSetupEventRef.current) {
      isSetupEventRef.current = true;

      // 소켓 이벤트 등록
      socket.on("roomData", (data) => {
        if (!data) return;
        setBoard(data.board);
        setCurrentPlayer(data.currentPlayer);
        setWinner(data.winner);
        setBlackTime(data.blackTime);
        setWhiteTime(data.whiteTime);
        setGameStarted(data.gameStarted);

        // 방 이름 표시
        if (data.roomName) {
          setTheRoomName(data.roomName);
        }

        // 내 돌 / 상대 돌
        const me = data.players.find((p) => p.socketId === socket.id);
        const opp = data.players.find((p) => p.socketId !== socket.id);
        if (me) setMyStone(me.stone);
        if (opp) {
          setOppStone(opp.stone);
          setOppNickname(opp.nickname);
        }
      });

      socket.on("updateGame", (payload) => {
        setBoard(payload.board);
        setCurrentPlayer(payload.currentPlayer);
        setWinner(payload.winner);
        setBlackTime(payload.blackTime);
        setWhiteTime(payload.whiteTime);
        setLastMove(payload.lastMove);

        if (payload.winner) {
          const iWin = payload.winner === myStone;
          setAmIWinner(iWin);
          setWinReason(
            payload.winner === 1 || payload.winner === 2
              ? "5목"
              : payload.winReason || ""
          );
          setShowWinModal(true);
        }
      });

      socket.on("timeUpdate", (payload) => {
        setBlackTime(payload.blackTime);
        setWhiteTime(payload.whiteTime);
        if (payload.winner) {
          setWinner(payload.winner);
          const iWin = payload.winner === myStone;
          setAmIWinner(iWin);
          setWinReason(payload.winReason || "시간");
          setShowWinModal(true);
        }
      });

      socket.on("chatMessage", ({ sender, text }) => {
        setChatMessages((prev) => [...prev, { sender, text }]);
      });

      socket.on("roomFull", () => {
        window.alert("이미 2명으로 가득 찬 방입니다.");
        navigate("/m/game");
      });

      socket.on("rejectMove", ({ reason }) => {
        window.alert("착수 거부: " + reason);
      });
    }
  }, [navigate, myStone]);

  // 2) roomId 변경 시 → joinRoom (단 한 번만), 언마운트 시 leaveRoom
  useEffect(() => {
    if (!roomId) {
      navigate("/m/game");
      return;
    }
    const socket = socketRef.current;

    if (!joinedRef.current) {
      joinedRef.current = true;
      socket.emit("joinRoom", { roomId, roomName, timeChoice });
    }

    // 언마운트 시 leaveRoom
    return () => {
      socket.emit("leaveRoom", { roomId });
    };
  }, [roomId, roomName, timeChoice, navigate]);

  // 오목판 클릭
  function handleCellClick(r, c) {
    if (!gameStarted || winner) return;
    if (myStone !== currentPlayer) return;
    socketRef.current.emit("placeStone", { roomId, row: r, col: c });
  }

  // 채팅 전송
  function handleSendChat() {
    if (!chatInput.trim()) return;
    socketRef.current.emit("chatMessage", { roomId, msg: chatInput.trim() });
    setChatInput("");
    setEmojiPanelOpen(false);
  }
  function handleSelectEmoji(emo) {
    socketRef.current.emit("chatMessage", { roomId, msg: chatInput + emo });
    setChatInput("");
    setEmojiPanelOpen(false);
  }

  // 승리 모달 닫기 => /m/game 페이지로
  function handleCloseModal() {
    setShowWinModal(false);
    navigate("/m/game");
  }

  // 재대국 => 페이지 새로고침
  function handleRematch() {
    window.location.reload();
  }

  // 현재 턴 표시 (흑 or 백)
  const blackActive = !winner && currentPlayer === 1;
  const whiteActive = !winner && currentPlayer === 2;

  return (
    <div className="bg-[#3A3A3A] text-white min-h-screen overflow-auto flex flex-col lg:flex-row pb-14">
      {/* 메인 영역 (보드+프로필) */}
      <div className="flex-1 flex flex-col items-center">
        {/* 상대 플레이어 영역 */}
        <div className="w-full max-w-4xl mt-4 px-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <img
              src={player1Image}
              alt="상대"
              className="w-10 h-10 border border-gray-300 object-cover"
            />
            <span className="text-base font-bold">
              {oppNickname || "상대"}{" "}
              {oppStone === 1 ? "(흑)" : oppStone === 2 ? "(백)" : ""}
            </span>
          </div>
          {/* 상대 시간 */}
          <div
            className={`
              ml-auto text-sm px-2 py-1 rounded
              ${
                oppStone === 1
                  ? "bg-black " + (blackActive ? "text-white" : "text-gray-400")
                  : oppStone === 2
                  ? "bg-white " + (whiteActive ? "text-black" : "text-gray-400")
                  : "bg-gray-600 text-gray-300"
              }
            `}
          >
            {oppStone === 1
              ? formatTime(blackTime)
              : oppStone === 2
              ? formatTime(whiteTime)
              : "0:00"}
          </div>
        </div>

        {/* 오목판 */}
        <div className="w-full max-w-4xl mt-2 px-4 flex justify-center">
          <Goban
            board={board}
            lastMove={lastMove}
            onCellClick={handleCellClick}
          />
        </div>

        {/* 내 프로필 */}
        <div className="w-full max-w-4xl px-4 mt-2 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <img
              src={player2Image}
              alt="나"
              className="w-10 h-10 border border-gray-300 object-cover"
            />
            <span className="text-base font-bold">
              {theRoomName ? `[${theRoomName}]` : "내 방?"}{" "}
              {myStone === 1 ? "(흑)" : myStone === 2 ? "(백)" : ""}
            </span>
          </div>
          {/* 내 시간 */}
          <div
            className={`
              ml-auto text-sm px-2 py-1 rounded
              ${
                myStone === 1
                  ? "bg-black " + (blackActive ? "text-white" : "text-gray-400")
                  : myStone === 2
                  ? "bg-white " + (whiteActive ? "text-black" : "text-gray-400")
                  : "bg-gray-600 text-gray-300"
              }
            `}
          >
            {myStone === 1
              ? formatTime(blackTime)
              : myStone === 2
              ? formatTime(whiteTime)
              : "0:00"}
          </div>
        </div>
      </div>

      {/* 우측(대국 기록 + 채팅) [PC 화면 전용] */}
      <div className="hidden lg:flex flex-col w-72 bg-[#2B2B2B] p-2">
        <div className="bg-[#3A3A3A] rounded p-2 overflow-y-auto h-40 mb-2">
          <h3 className="text-sm font-bold mb-2">대국 기록</h3>
          <div className="text-xs text-gray-300">로그 표시..</div>
        </div>
        {/* 채팅 영역 */}
        <div
          className="bg-[#3A3A3A] rounded p-2 flex flex-col h-64 cursor-pointer"
          onClick={() => chatInputRef.current?.focus()}
        >
          <div className="flex-1 overflow-y-auto text-sm space-y-2 pb-14">
            {chatMessages.map((m, i) => (
              <div key={i}>
                <b>{m.sender}:</b> {m.text}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center">
            <input
              ref={chatInputRef}
              type="text"
              className="flex-1 px-2 py-1 rounded text-sm bg-[#4B4B4B] text-white"
              placeholder="채팅..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  handleSendChat();
                }
              }}
            />
            <button
              onClick={() => setEmojiPanelOpen(!emojiPanelOpen)}
              className="ml-2 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded"
            >
              🙂
            </button>
          </div>

          {emojiPanelOpen && (
            <div className="bg-[#4B4B4B] p-2 rounded mt-2 grid grid-cols-5 gap-2">
              {["😀","🤣","😅","😎","🤩","🤔","😰","👍","👎","❤️"].map((emo, idx) => (
                <button
                  key={idx}
                  className="text-2xl hover:bg-gray-500 rounded"
                  onClick={() => handleSelectEmoji(emo)}
                >
                  {emo}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 하단(대국 기록 + 채팅) [모바일 전용] */}
      <div className="block lg:hidden bg-[#2B2B2B] p-2">
        <div className="bg-[#3A3A3A] rounded p-2 h-32 overflow-y-auto mb-2">
          <h3 className="text-sm font-bold mb-2">대국 기록(모바일)</h3>
          <div className="text-xs text-gray-300">로그 표시..</div>
        </div>
        <div
          className="bg-[#3A3A3A] rounded p-2 h-48 flex flex-col cursor-pointer"
          onClick={() => chatInputRef.current?.focus()}
        >
          <div className="flex-1 overflow-y-auto text-sm space-y-2 pb-14">
            {chatMessages.map((m, i) => (
              <div key={i}>
                <b>{m.sender}:</b> {m.text}
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center">
            <input
              ref={chatInputRef}
              type="text"
              className="flex-1 px-2 py-1 rounded text-sm bg-[#4B4B4B] text-white"
              placeholder="채팅..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  handleSendChat();
                }
              }}
            />
            <button
              onClick={() => setEmojiPanelOpen(!emojiPanelOpen)}
              className="ml-2 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded"
            >
              🙂
            </button>
          </div>

          {emojiPanelOpen && (
            <div className="bg-[#4B4B4B] p-2 rounded mt-2 grid grid-cols-5 gap-2">
              {["😀","🤣","😅","😎","🤩","🤔","😰","👍","👎","❤️"].map((emo, idx) => (
                <button
                  key={idx}
                  className="text-2xl hover:bg-gray-500 rounded"
                  onClick={() => handleSelectEmoji(emo)}
                >
                  {emo}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 승리 모달 */}
      {showWinModal && winner && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2B2B2B] w-64 p-4 rounded text-center relative">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-300 hover:text-white"
            >
              X
            </button>
            <h2 className="text-yellow-400 text-xl font-bold mb-2">
              {amIWinner
                ? myStone === 1
                  ? "흑승"
                  : "백승"
                : myStone === 1
                ? "백승"
                : "흑승"}
            </h2>
            <div className="text-sm text-gray-300 mb-3">
              {winReason || "승리"}
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold mb-2">
              게임 리뷰
            </button>
            <div className="flex items-center justify-center space-x-2">
              <button className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded">
                신규 5분
              </button>
              <button
                onClick={handleRematch}
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded"
              >
                재대국
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default forwardRef(OnlineBody);
