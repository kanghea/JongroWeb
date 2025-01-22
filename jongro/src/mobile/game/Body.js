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
import { useNavigate } from "react-router-dom"; // ★ 기존코드에 이미 추가됨
import player1Image from "../images/player1.png";
import player2Image from "../images/player2.png";
import { getAiMove } from "../engines/omokEngine";

const BOARD_SIZE = 15;

function Body({ onUndoRef, onRedoRef, onNewRef, onHintRef, onGiveUpRef }, ref) {
  // --------------------------------
  // 1) 기존 상태들 (절대 수정 금지)
  // --------------------------------
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

  // "방 이름" 입력받기
  const [roomName, setRoomName] = useState("LocalRoom");

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

  // react-router-dom
  const navigate = useNavigate();

  // --------------------------------
  // 2) StrictMode 중복 실행 방지 ref (절대 수정 금지)
  // --------------------------------
  const didMountRef = useRef(false);

  // --------------------------------
  // 3) useEffect 예시: 시간 설정 (절대 수정 금지)
  // --------------------------------
  useEffect(() => {
    if (!didMountRef.current) {
      // 첫 마운트
      didMountRef.current = true;
      console.log("Body component mounted (first time)");
    } else {
      console.log("Body component re-mounted (StrictMode check)");
    }

    // gameStarted가 false일 때만 시간을 초기화
    if (!gameStarted) {
      const sec = parseTimeToSeconds(selectedTime);
      setBlackTime(sec);
      setWhiteTime(sec);
    }
  }, [selectedTime, gameStarted]);

  // --------------------------------
  // 4) 로컬 테스트 타이머 (절대 수정 금지)
  // --------------------------------
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

  // --------------------------------
  // 5) 방 만들기 -> /m/game/:roomId?timeChoice=...&roomName=...
  // --------------------------------
  function handlePlay() {
    // 1) 고유 방 ID 생성
    const roomId = "room_" + Date.now(); // or any random/uuid

    // 2) 이동할 URL
    // 예) /m/game/room_1689999999?timeChoice=3분&roomName=테스트방
    const url = `/m/game/${roomId}?timeChoice=${selectedTime}&roomName=${encodeURIComponent(
      roomName
    )}`;

    // 3) 라우터 이동
    navigate(url);
  }

  // --------------------------------
  // 6) 기타 로직(Undo/Redo/New/Hint/GiveUp)... (절대 수정 금지)
  // --------------------------------
  const handleCellClick = (r, c) => {
    // 로컬 테스트용
  };
  const handleUndo = useCallback(() => {}, []);
  const handleRedo = useCallback(() => {}, []);
  const handleNew = useCallback(() => {}, []);
  const handleHint = useCallback(() => {}, []);
  const handleGiveUp = useCallback(() => {}, []);

  // --------------------------------
  // (추가) 가로로 가득 찬 오목판: 돌 클릭 불가
  // --------------------------------
  function FullWidthGoban() {
    // 단순히 15x15 선만 그려주는 예시
    // (onClick 이벤트 없이 돌을 놓을 수 없게 처리)
    return (
      <div className="relative w-full aspect-square bg-[#DAB86F]">
        {/* 수평, 수직 줄 15개씩 */}
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <React.Fragment key={i}>
            {/* 가로줄 */}
            <div
              className="absolute left-0 right-0 h-[2px] bg-[#5A3A1B]"
              style={{
                top: `${(100 / (BOARD_SIZE - 1)) * i}%`
              }}
            />
            {/* 세로줄 */}
            <div
              className="absolute top-0 bottom-0 w-[2px] bg-[#5A3A1B]"
              style={{
                left: `${(100 / (BOARD_SIZE - 1)) * i}%`
              }}
            />
          </React.Fragment>
        ))}
      </div>
    );
  }

  // --------------------------------
  // 7) 렌더
  // --------------------------------
  return (
    <div className="bg-[#3A3A3A] text-white min-h-screen">
      <div className="max-w-md mx-auto p-4">
        
        {/* (추가) 방 이름 위쪽에 새 오목판을 가득 넣어보기 */}
        <div className="mb-4">
          <FullWidthGoban />
        </div>

        <h1 className="text-2xl font-bold mb-4">오목 세팅 (로컬 테스트/준비)</h1>

        {/* 방 이름 입력 */}
        <div className="mb-3">
          <label className="block text-sm text-gray-300 mb-1">방 이름</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
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
          방 만들기 (온라인)
        </button>

        {/* 아래는 로컬 테스트용 UI 등... (생략 가능) */}
      </div>
    </div>
  );
}

export default forwardRef(Body);

/** (기존) 보조 함수들 - 수정 금지 */
function parseTimeToSeconds(mode) {
  if (!mode) return 60;
  const n = parseInt(mode.replace("분", ""), 10);
  if (isNaN(n)) return 60;
  return n * 60;
}
function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}
