////////////////////////////////////////
// src/mobile/game/OnlineBody.js
////////////////////////////////////////
import React, {
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef,
    useCallback,
    useRef
  } from "react";
  import { useParams, useSearchParams } from "react-router-dom"; 
  import { io } from "socket.io-client";
  
  import player1Image from "../images/player1.png"; 
  import player2Image from "../images/player2.png"; 
  
  ////////////////////////////////////////
  // 1) 소켓 주소: PC IP + 3001
  ////////////////////////////////////////
  const socket = io("http://192.168.0.22:3001"); // 꼭 PC IP, 방화벽 허용
  
  const BOARD_SIZE = 15;
  
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0'+s : s}`;
  }
  
  function Body(props, ref) {
    // === (A) URL 파라미터 ===
    const { roomId } = useParams();
    const [searchParams] = useSearchParams();
    const nickname   = searchParams.get("nickname")   || "Guest"; 
    const timeChoice = searchParams.get("timeChoice") || "1분";
  
    // === (B) State ===
    const [board, setBoard] = useState(createEmptyBoard());
    const [currentPlayer, setCurrentPlayer] = useState(1);
    const [winner, setWinner] = useState(null);
    const [lastMove, setLastMove] = useState(null);
  
    const [blackTime, setBlackTime] = useState(60);
    const [whiteTime, setWhiteTime] = useState(60);
    const [gameStarted, setGameStarted] = useState(false);
  
    const [myStone, setMyStone] = useState(1);
    const [oppStone, setOppStone] = useState(2);
  
    // 채팅
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);
    const chatInputRef = useRef(null);
  
    // === (C) 소켓 연결 & 방 입장 ===
    useEffect(() => {
      if(!roomId || !nickname) {
        console.warn("roomId 혹은 nickname 없음:", roomId, nickname);
        return;
      }
      // 방 입장
      socket.emit("joinRoom", { roomId, nickname, timeChoice });
  
      // 소켓 이벤트
      socket.on("roomData", (data) => {
        if(!data) return;
        console.log("roomData:", data);
  
        setBoard(data.board);
        setCurrentPlayer(data.currentPlayer);
        setWinner(data.winner);
        setBlackTime(data.blackTime);
        setWhiteTime(data.whiteTime);
        setGameStarted(data.gameStarted);
  
        if(data.players.length>0){
          const me = data.players.find(p=>p.nickname===nickname);
          if(me){
            setMyStone(me.stone);
            setOppStone(me.stone===1?2:1);
          }
        }
      });
  
      socket.on("updateGame", (payload) => {
        setBoard(payload.board);
        setCurrentPlayer(payload.currentPlayer);
        setWinner(payload.winner);
        setBlackTime(payload.blackTime);
        setWhiteTime(payload.whiteTime);
        setLastMove(payload.lastMove);
      });
  
      socket.on("timeUpdate", (payload)=>{
        setBlackTime(payload.blackTime);
        setWhiteTime(payload.whiteTime);
        if(payload.winner){
          setWinner(payload.winner);
        }
      });
  
      socket.on("chatMessage", ({ sender, text })=>{
        setChatMessages(prev=> [...prev, { sender, text }]);
      });
  
      socket.on("roomFull", ()=>{
        alert("이미 2명으로 가득찬 방입니다.");
      });
  
      socket.on("rejectMove", ({ reason })=>{
        alert("착수 거부: " + reason);
      });
  
      return ()=>{
        socket.off("roomData");
        socket.off("updateGame");
        socket.off("timeUpdate");
        socket.off("chatMessage");
        socket.off("roomFull");
        socket.off("rejectMove");
      };
    }, [roomId, nickname, timeChoice]);
  
    // === (D) 착수 ===
    function handleCellClick(r,c){
      if(winner||!gameStarted) return;
      socket.emit("placeStone",{ roomId, row:r, col:c });
    }
  
    // === (E) 채팅 ===
    function handleSendChat(){
      if(chatInput.trim()==="") return;
      socket.emit("chatMessage", { roomId, msg: chatInput.trim() });
      setChatInput("");
      setEmojiPanelOpen(false);
    }
    function handleSelectEmoji(emo){
      const combined = chatInput + emo;
      socket.emit("chatMessage",{ roomId, msg: combined });
      setChatInput("");
      setEmojiPanelOpen(false);
    }
  
    // === (F) 렌더 ===
    const blackActive = (!winner && currentPlayer===1);
    const whiteActive = (!winner && currentPlayer===2);
  
    return (
      <div className="bg-[#3A3A3A] text-white min-h-screen overflow-auto flex flex-col lg:flex-row pb-14">
        {/* 상단(상대) */}
        <div className="flex-1 flex flex-col items-center">
          <div className="w-full max-w-4xl mt-4 px-4 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <img
                src={player1Image}
                alt="상대"
                className="w-10 h-10 border border-gray-300 object-cover"
              />
              <span className="text-base font-bold">
                상대 ({oppStone===1 ? "흑":"백"})
              </span>
            </div>
            <div
              className={`
                ml-auto text-sm px-2 py-1 rounded
                ${
                  oppStone===1
                    ? "bg-black " + (blackActive?"text-white":"text-gray-400")
                    : "bg-white " + (whiteActive?"text-black":"text-gray-400")
                }
              `}
            >
              {oppStone===1 ? formatTime(blackTime) : formatTime(whiteTime)}
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
  
          {/* 나(내 프로필) */}
          <div className="w-full max-w-4xl px-4 mt-2 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <img
                src={player2Image}
                alt="나"
                className="w-10 h-10 border border-gray-300 object-cover"
              />
              <span className="text-base font-bold">
                {nickname} ({myStone===1?"흑":"백"})
              </span>
            </div>
            <div
              className={`
                ml-auto text-sm px-2 py-1 rounded
                ${
                  myStone===1
                    ? "bg-black " + (blackActive?"text-white":"text-gray-400")
                    : "bg-white " + (whiteActive?"text-black":"text-gray-400")
                }
              `}
            >
              {myStone===1 ? formatTime(blackTime) : formatTime(whiteTime)}
            </div>
          </div>
  
          {/* 채팅 */}
          <div className="mt-4 px-4 w-full max-w-2xl">
            <div className="bg-[#2B2B2B] p-2 rounded">
              <div className="h-32 overflow-y-auto text-sm">
                {chatMessages.map((m,i)=>(
                  <div key={i}>
                    <b>{m.sender}:</b> {m.text}
                  </div>
                ))}
              </div>
              <div className="flex mt-2">
                <input
                  ref={chatInputRef}
                  type="text"
                  className="flex-1 text-black text-sm px-2 py-1"
                  placeholder="채팅..."
                  value={chatInput}
                  onChange={e=> setChatInput(e.target.value)}
                  onKeyDown={e=>{
                    if(e.key==="Enter") handleSendChat();
                  }}
                />
                <button
                  onClick={()=> setEmojiPanelOpen(!emojiPanelOpen)}
                  className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded text-white ml-2"
                >
                  🙂
                </button>
              </div>
              {emojiPanelOpen && (
                <div className="bg-[#4B4B4B] p-2 mt-2 grid grid-cols-5 gap-2 rounded">
                  {["😀","🤣","😅","😎","🤩","🤔","😰","👍","👎","❤️"].map((emo, idx)=>(
                    <button
                      key={idx}
                      className="text-2xl hover:bg-gray-500 rounded"
                      onClick={()=> handleSelectEmoji(emo)}
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
  
        {/* 승리 모달 */}
        {winner && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#2B2B2B] w-64 p-4 rounded text-center">
              <h2 className="text-yellow-400 text-xl font-bold mb-2">승리!</h2>
              {winner===1? "흑 승리" : "백 승리"}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  export default forwardRef(Body);
  
  ////////////////////////////////////////
  // Goban: 반응형 (모바일 기기 폭 사용)
  ////////////////////////////////////////
  function Goban({ board, lastMove, onCellClick }) {
    const [boardSizePx, setBoardSizePx] = useState(600);
  
    useEffect(() => {
      // 초기 및 리사이즈 시 보드 크기 세팅
      function handleResize() {
        // 기기 너비
        const w = window.innerWidth;
        // 여백 등 감안해서 약간 줄임
        const newSize = (w < 640) ? (w - 24) : 600; 
        setBoardSizePx(newSize > 200 ? newSize : 200);
      }
  
      handleResize(); // 초기
      window.addEventListener('resize', handleResize);
      return ()=> {
        window.removeEventListener('resize', handleResize);
      };
    }, []);
  
    const BOARD_SIZE = 15;
    const cellGap = boardSizePx / (BOARD_SIZE - 1);
  
    return (
      <div
        className="relative"
        style={{
          width: boardSizePx + "px",
          height: boardSizePx + "px",
          backgroundColor: "#DAB86F",
        }}
      >
        {/* 격자 라인 */}
        {Array.from({ length: BOARD_SIZE }, (_, i)=>(
          <div key={i}>
            <div
              className="absolute"
              style={{
                top: i*cellGap,
                left: 0,
                width: boardSizePx,
                height: "2px",
                backgroundColor: "#5A3A1B",
              }}
            />
            <div
              className="absolute"
              style={{
                left: i*cellGap,
                top: 0,
                width: "2px",
                height: boardSizePx,
                backgroundColor: "#5A3A1B",
              }}
            />
          </div>
        ))}
  
        {/* 돌 */}
        {board.map((rowArr, r)=>
          rowArr.map((val,c)=>{
            if(val===0) return null;
            const isLast = lastMove && lastMove.row===r && lastMove.col===c;
            return (
              <div
                key={r+"-"+c}
                className={`
                  absolute
                  ${val===1 ? "bg-black":"bg-white"}
                  rounded-full
                  border
                  ${val===2?"border-gray-500":"border-black"}
                  ${isLast ? "outline outline-2 outline-yellow-300":""}
                `}
                style={{
                  width: cellGap * 0.5,
                  height: cellGap * 0.5,
                  top: (r*cellGap)-(cellGap*0.5)/2,
                  left: (c*cellGap)-(cellGap*0.5)/2
                }}
              />
            );
          })
        )}
  
        {/* 클릭 영역 */}
        {Array.from({ length: BOARD_SIZE },(_,r)=>
          Array.from({ length: BOARD_SIZE },(_,c)=>
            <div
              key={`pos-${r}-${c}`}
              onClick={()=> onCellClick(r,c)}
              className="absolute"
              style={{
                width: cellGap,
                height: cellGap,
                top: r*cellGap - cellGap/2,
                left: c*cellGap - cellGap/2
              }}
            />
          )
        )}
      </div>
    );
  }
  
  function createEmptyBoard() {
    const size=15;
    return Array.from({ length: size}, ()=> Array(size).fill(0));
  }
  