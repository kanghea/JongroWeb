////////////////////////////////////////
// src/mobile/game/OnlineBody.js
////////////////////////////////////////
import React, {
  useState,
  useEffect,
  forwardRef,
  useRef
} from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";

import player1Image from "../images/player1.png";
import player2Image from "../images/player2.png";

// 소켓 서버
const socket = io("http://192.168.0.22:3001");

function formatTime(sec){
  const m=Math.floor(sec/60);
  const s=sec%60;
  return `${m}:${s<10? "0"+s : s}`;
}

function createEmptyBoard(size=15){
  return Array.from({ length:size }, ()=> Array(size).fill(0));
}

function OnlineBody(props, ref){
  const navigate= useNavigate();
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const nickname= searchParams.get("nickname") || "Guest";
  const timeChoice= searchParams.get("timeChoice")|| "1분";

  // Game states
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [winner, setWinner] = useState(null);
  const [lastMove, setLastMove] = useState(null);

  const [blackTime, setBlackTime]= useState(60);
  const [whiteTime, setWhiteTime]= useState(60);
  const [gameStarted, setGameStarted]= useState(false);

  // 내 돌(1=흑 or 2=백), 상대 돌
  const [myStone, setMyStone] = useState(null);
  const [oppStone, setOppStone] = useState(null);

  // 승리 모달
  const [showWinModal, setShowWinModal] = useState(false);
  const [winReason, setWinReason] = useState(""); 
  const [amIWinner, setAmIWinner] = useState(false);

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);
  const chatInputRef= useRef(null);

  useEffect(()=>{
    if(!roomId || !nickname){
      console.warn("roomId/nickname 누락", roomId, nickname);
      return;
    }
    // joinRoom
    socket.emit("joinRoom",{ roomId, nickname, timeChoice });

    // roomData
    socket.on("roomData",(data)=>{
      if(!data) return;
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setWinner(data.winner);
      setBlackTime(data.blackTime);
      setWhiteTime(data.whiteTime);
      setGameStarted(data.gameStarted);

      // 내 돌
      if(data.players?.length){
        const me= data.players.find(x=> x.nickname===nickname);
        if(me){
          setMyStone(me.stone);
          setOppStone(me.stone===1? 2:1);
        }
      }
    });

    // updateGame
    socket.on("updateGame",(payload)=>{
      setBoard(payload.board);
      setCurrentPlayer(payload.currentPlayer);
      setWinner(payload.winner);
      setBlackTime(payload.blackTime);
      setWhiteTime(payload.whiteTime);
      setLastMove(payload.lastMove);

      if(payload.winner){
        const amWinner= (payload.winner===myStone);
        setAmIWinner(amWinner);
        // winReason은 timeUpdate에서만 전송 or서버payload에추가
        // 여기서는 임시로 "5목"추정
        setWinReason("5목");
        setShowWinModal(true);
      }
    });

    // timeUpdate
    socket.on("timeUpdate",(payload)=>{
      setBlackTime(payload.blackTime);
      setWhiteTime(payload.whiteTime);
      if(payload.winner){
        setWinner(payload.winner);
        setAmIWinner(payload.winner===myStone);
        setWinReason("시간"); // 시간초과
        setShowWinModal(true);
      }
    });

    // chatMessage
    socket.on("chatMessage",({sender,text})=>{
      setChatMessages(prev=> [...prev, { sender, text }]);
    });

    // roomFull
    socket.on("roomFull",()=>{
      alert("이미 2명으로 가득 찬 방입니다!");
      navigate("/m/game");
    });

    // rejectMove
    socket.on("rejectMove",({reason})=>{
      alert("착수 거부: "+reason);
    });

    return ()=>{
      socket.off("roomData");
      socket.off("updateGame");
      socket.off("timeUpdate");
      socket.off("chatMessage");
      socket.off("roomFull");
      socket.off("rejectMove");
    };
  },[roomId,nickname,timeChoice,navigate]);

  // 착수
  function handleCellClick(r,c){
    // 내 차례 + 미결
    if(!gameStarted || winner) return;
    // 서버에서도 검사하지만, 클라이언트에서도 가드
    if(myStone!==currentPlayer){
      console.log(`내 돌=${myStone}, current=${currentPlayer} -> 착수불가`);
      return;
    }
    socket.emit("placeStone",{ roomId, row:r, col:c });
  }

  // 채팅
  function handleSendChat(){
    if(chatInput.trim()==="") return;
    socket.emit("chatMessage",{ roomId, msg: chatInput.trim() });
    setChatInput("");
    setEmojiPanelOpen(false);
  }
  function handleSelectEmoji(emo){
    // 바로 전송
    socket.emit("chatMessage",{ roomId, msg: chatInput + emo });
    setChatInput("");
    setEmojiPanelOpen(false);
  }

  // 승리 모달
  function handleCloseModal(){
    setShowWinModal(false);
    navigate("/m/game");
  }
  let modalTitle="";
  let modalDesc= winReason||"";
  if(amIWinner){
    modalTitle= (myStone===1?"흑승":"백승");
  } else {
    modalTitle= (myStone===1?"패배 (백승)":"패배 (흑승)");
  }

  // 타이머 상태
  const blackActive= (!winner && currentPlayer===1);
  const whiteActive= (!winner && currentPlayer===2);

  return (
    <div className="bg-[#3A3A3A] text-white min-h-screen overflow-auto flex flex-col lg:flex-row pb-14">
      {/* 상대 (화면 위) */}
      <div className="flex-1 flex flex-col items-center">
        {/* 상대 프로필 */}
        <div className="w-full max-w-4xl mt-4 px-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <img
              src={player1Image}
              alt="상대"
              className="w-10 h-10 border border-gray-300 object-cover"
            />
            <span className="text-base font-bold">
              상대 ({oppStone===1?"흑":oppStone===2?"백":"??"})
            </span>
          </div>
          {/* 상대 타이머 */}
          <div
            className={`
              ml-auto text-sm px-2 py-1 rounded
              ${
                oppStone===1
                  ? "bg-black " + (blackActive?"text-white":"text-gray-400")
                  : oppStone===2
                    ? "bg-white " + (whiteActive?"text-black":"text-gray-400")
                    : "bg-gray-600 text-gray-300"
              }
            `}
          >
            {oppStone===1
              ? formatTime(blackTime)
              : oppStone===2
                ? formatTime(whiteTime)
                : "0:00"
            }
          </div>
        </div>

        {/* 바둑판 */}
        <div className="w-full max-w-4xl mt-2 px-4 flex justify-center">
          <Goban
            board={board}
            lastMove={lastMove}
            onCellClick={handleCellClick}
          />
        </div>

        {/* 나 (화면 아래) */}
        <div className="w-full max-w-4xl px-4 mt-2 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <img
              src={player2Image}
              alt="나"
              className="w-10 h-10 border border-gray-300 object-cover"
            />
            <span className="text-base font-bold">
              {nickname} ({myStone===1?"흑":myStone===2?"백":"??"})
            </span>
          </div>
          {/* 내 타이머 */}
          <div
            className={`
              ml-auto text-sm px-2 py-1 rounded
              ${
                myStone===1
                  ? "bg-black " + (blackActive?"text-white":"text-gray-400")
                  : myStone===2
                    ? "bg-white " + (whiteActive?"text-black":"text-gray-400")
                    : "bg-gray-600 text-gray-300"
              }
            `}
          >
            {myStone===1
              ? formatTime(blackTime)
              : myStone===2
                ? formatTime(whiteTime)
                : "0:00"
            }
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="mt-4 px-4 w-full max-w-2xl">
          <div className="bg-[#2B2B2B] p-2 rounded">
            {/* 메시지 목록 */}
            <div
              className="h-32 overflow-y-auto text-sm cursor-pointer"
              onClick={()=> chatInputRef.current?.focus()}
            >
              {chatMessages.map((m,i)=>(
                <div key={i}>
                  <b>{m.sender}:</b> {m.text}
                </div>
              ))}
            </div>
            {/* 입력 + 이모티콘 */}
            <div className="flex mt-2">
              <input
                ref={chatInputRef}
                type="text"
                className="flex-1 text-sm px-2 py-1 bg-[#4B4B4B] text-white placeholder-gray-300 rounded"
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
      {showWinModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#2B2B2B] w-64 p-4 rounded text-center relative">
            {/* 닫기 버튼(X) */}
            <button
              onClick={()=> {
                setShowWinModal(false);
                navigate("/m/game");
              }}
              className="absolute top-2 right-2 text-gray-300 hover:text-white"
            >
              X
            </button>
            <h2 className="text-yellow-400 text-xl font-bold mb-2">
              {modalTitle}
            </h2>
            <div className="text-sm text-gray-300 mb-3">
              {modalDesc}
            </div>

            {/* 임의의 스탯 표시 */}
            <div className="text-xs text-gray-200 flex justify-around mb-3">
              <div className="flex flex-col items-center">
                <span className="text-orange-300">❓5</span>
                <span>실수</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-red-400">??6</span>
                <span>블런더</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-pink-400">❌0</span>
                <span>놓친 수</span>
              </div>
            </div>

            <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold">
              게임 리뷰
            </button>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <button
                onClick={()=>{/* 신규 5분 등 원하는 로직 */}
                }
                className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded"
              >
                신규 5분
              </button>
              <button
                onClick={()=>{/* 재대국 로직 */}
                }
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

////////////////////////////////////////
// Goban: 모바일 기기에 맞춰 반응형
// 돌 크기 = cellGap * 0.65 (30% 증가)
////////////////////////////////////////
function Goban({ board, lastMove, onCellClick }) {
  const [boardSizePx, setBoardSizePx] = useState(600);

  useEffect(()=>{
    function handleResize(){
      const w = window.innerWidth;
      const newSize= (w<640)? (w-24):600;
      setBoardSizePx(newSize>200? newSize:200);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return ()=> window.removeEventListener('resize', handleResize);
  },[]);

  const size=15;
  const cellGap= boardSizePx/(size-1);

  return (
    <div
      className="relative"
      style={{
        width: boardSizePx+"px",
        height: boardSizePx+"px",
        backgroundColor:"#DAB86F"
      }}
    >
      {/* 선 */}
      {Array.from({length:size},(_,i)=>(
        <div key={i}>
          <div
            className="absolute"
            style={{
              top:i*cellGap,
              left:0,
              width: boardSizePx,
              height:"2px",
              backgroundColor:"#5A3A1B"
            }}
          />
          <div
            className="absolute"
            style={{
              left:i*cellGap,
              top:0,
              width:"2px",
              height: boardSizePx,
              backgroundColor:"#5A3A1B"
            }}
          />
        </div>
      ))}

      {/* 돌 */}
      {board.map((rowArr,r)=>
        rowArr.map((val,c)=>{
          if(val===0) return null;
          const isLast= lastMove && lastMove.row===r && lastMove.col===c;
          return(
            <div
              key={`${r}-${c}`}
              className={`
                absolute
                ${val===1?"bg-black":"bg-white"}
                rounded-full
                border
                ${val===2?"border-gray-500":"border-black"}
                ${isLast?"outline outline-2 outline-yellow-300":""}
              `}
              style={{
                width: cellGap*0.65, // 30% 증가
                height: cellGap*0.65,
                top:(r*cellGap)-(cellGap*0.65)/2,
                left:(c*cellGap)-(cellGap*0.65)/2
              }}
            />
          );
        })
      )}

      {/* 클릭 영역 */}
      {Array.from({length:size},(_,r)=>
        Array.from({length:size},(_,c)=>
          <div
            key={`pos-${r}-${c}`}
            onClick={()=> onCellClick(r,c)}
            className="absolute"
            style={{
              width:cellGap,
              height:cellGap,
              top:r*cellGap-(cellGap/2),
              left:c*cellGap-(cellGap/2)
            }}
          />
        )
      )}
    </div>
  );
}
