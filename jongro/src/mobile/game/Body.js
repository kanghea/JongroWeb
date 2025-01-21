////////////////////////////////////////
// src/mobile/game/body.js
////////////////////////////////////////
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useRef
} from "react";
import { useNavigate } from "react-router-dom"; // ★ 추가
import player1Image from "../images/player1.png";
import player2Image from "../images/player2.png";
import { getAiMove } from "../engines/omokEngine";

const BOARD_SIZE = 15;

function Body({ onUndoRef, onRedoRef, onNewRef, onHintRef, onGiveUpRef }, ref) {
  // 기존 상태들...
  const [history, setHistory] = useState([
    {
      board: createEmptyBoard(),
      currentPlayer: 1,
      winner: null,
      lastMove: null
    }
  ]);
  const [stepIndex, setStepIndex] = useState(0);
  const [movesList, setMovesList] = useState([]);
  const currentState = history[stepIndex];
  const { board, currentPlayer, winner, lastMove } = currentState;

  // 시간 옵션
  const timeOptions = ["1분", "3분", "5분", "10분"];
  const [selectedTime, setSelectedTime] = useState("1분");
  const [timePanelOpen, setTimePanelOpen] = useState(false);

  // 닉네임(사용자 입력)
  const [nickname, setNickname] = useState("LocalUser");

  // 타이머 (로컬 테스트용)
  const [blackTime, setBlackTime] = useState(60);
  const [whiteTime, setWhiteTime] = useState(60);

  const [gameStarted, setGameStarted] = useState(false);
  const [actualTimerRunning, setActualTimerRunning] = useState(false);

  // 돌 배정(로컬 테스트)
  const [myStone, setMyStone] = useState(1);
  const [oppStone, setOppStone] = useState(2);
  const [activePlayer, setActivePlayer] = useState(1);

  const [hintMove, setHintMove] = useState(null);

  // 승리 모달 (로컬 테스트)
  const [showWinModal, setShowWinModal] = useState(false);
  const [winReason, setWinReason] = useState("시간으로");

  // 채팅 (로컬)
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);

  const chatInputRef = useRef(null);

  // ★ react-router-dom
  const navigate = useNavigate();

  // 시간 변경 => 로컬 타이머 세팅
  useEffect(() => {
    if (!gameStarted) {
      const sec = parseTimeToSeconds(selectedTime);
      setBlackTime(sec);
      setWhiteTime(sec);
    }
  }, [selectedTime, gameStarted]);

  // (로컬 테스트) 타이머 useEffect
  useEffect(() => {
    if (!actualTimerRunning || winner) return;
    const interval = setInterval(() => {
      if (activePlayer === 1) {
        setBlackTime((prev) => {
          if (prev <= 0) {
            handleTimeOver(1);
            return 0;
          }
          return prev - 1;
        });
      } else {
        setWhiteTime((prev) => {
          if (prev <= 0) {
            handleTimeOver(2);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [actualTimerRunning, winner, activePlayer]);

  function handleTimeOver(stone) {
    const other = stone === 1 ? 2 : 1;
    const newHist = [...history];
    const st = { ...newHist[stepIndex] };
    st.winner = other;
    newHist[stepIndex] = st;
    setHistory(newHist);
    setShowWinModal(true);
    setWinReason("시간으로");
  }

  // ---------------------------
  // (중요 수정) handlePlay => /m/game/:roomId
  // ---------------------------
  function handlePlay() {
    // 1) 고유 방 ID 생성
    const roomId = "room_" + Date.now(); // or any random/uuid

    // 2) 이동할 URL
    // 예) /m/game/room_1689999999?timeChoice=3분&nickname=홍길동
    const url = `/m/game/${roomId}?timeChoice=${selectedTime}&nickname=${encodeURIComponent(
      nickname
    )}`;

    // 3) 라우터 이동
    navigate(url);
  }

  // ---------------------------
  // 기존 로직(Undo/Redo/New/Hint/GiveUp)...
  // ---------------------------
  const handleCellClick = (r, c) => {
    // 로컬 테스트용
  };
  const handleUndo = useCallback(() => {}, []);
  const handleRedo = useCallback(() => {}, []);
  const handleNew = useCallback(() => {}, []);
  const handleHint = useCallback(() => {}, []);
  const handleGiveUp = useCallback(() => {}, []);

  // ... onEffect for onUndoRef, onRedoRef, etc. ...

  // ---------------------------
  // 렌더
  // ---------------------------
  return (
    <div className="bg-[#3A3A3A] text-white min-h-screen">
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">오목 세팅 (로컬 테스트/준비)</h1>

        {/* 닉네임 입력 */}
        <div className="mb-3">
          <label className="block text-sm text-gray-300 mb-1">닉네임</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full px-2 py-1 rounded bg-gray-700 text-white"
          />
        </div>

        {/* 시간 옵션 */}
        <div
          className="bg-[#2B2B2B] rounded px-3 py-2 flex items-center justify-between cursor-pointer"
          onClick={() => !gameStarted && setTimePanelOpen(!timePanelOpen)}
        >
          <span className="text-sm font-bold">시간: {selectedTime}</span>
          <span>{timePanelOpen ? "▲" : "▼"}</span>
        </div>
        {timePanelOpen && !gameStarted && (
          <div className="bg-[#2B2B2B] mt-2 rounded p-2">
            <div className="text-xs text-gray-400 mb-1">시간 선택</div>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedTime(opt)}
                  className={`
                    px-3 py-1 rounded text-sm
                    ${
                      selectedTime === opt
                        ? "bg-green-600"
                        : "bg-gray-600 hover:bg-gray-700"
                    }
                  `}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 온라인 게임 시작 버튼 */}
        <button
          onClick={handlePlay}
          className="mt-4 w-full py-3 text-lg font-bold rounded bg-green-500 hover:bg-green-600"
        >
          온라인 게임 시작
        </button>

        {/* 아래는 로컬 테스트용(생략 가능)... */}
      </div>
    </div>
  );
}

export default forwardRef(Body);

/** 보조 함수 */
function parseTimeToSeconds(mode) {
  if (!mode) return 60;
  const n = parseInt(mode.replace("분", ""), 10);
  if (isNaN(n)) return 60;
  return n * 60;
}
function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}
// etc. ...
