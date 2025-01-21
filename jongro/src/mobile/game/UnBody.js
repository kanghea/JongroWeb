import React, {
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef,
    useCallback,
    useRef
  } from "react";
  import player1Image from "../images/player1.png"; 
  import player2Image from "../images/player2.png"; 
  import { getAiMove } from "../engines/omokEngine"; 
  
  const BOARD_SIZE = 15;
  
  function Body({ onUndoRef, onRedoRef, onNewRef, onHintRef, onGiveUpRef }, ref) {
    // -----------------------------
    // 1) 상태
    // -----------------------------
    const [history, setHistory] = useState([
      {
        board: createEmptyBoard(),
        currentPlayer: 1, // 1=흑, 2=백
        winner: null,
        lastMove: null,
      },
    ]);
    const [stepIndex, setStepIndex] = useState(0);
    const [movesList, setMovesList] = useState([]);
  
    const currentState = history[stepIndex];
    const { board, currentPlayer, winner, lastMove } = currentState;
  
    // 시간 옵션
    const timeOptions = ["1분","3분","5분","10분"];
    const [selectedTime, setSelectedTime] = useState("1분");
    const [timePanelOpen, setTimePanelOpen] = useState(false);
  
    // 타이머
    const [blackTime, setBlackTime] = useState(60);
    const [whiteTime, setWhiteTime] = useState(60);
  
    const [gameStarted, setGameStarted] = useState(false);
    const [actualTimerRunning, setActualTimerRunning] = useState(false);
  
    // 돌 배정
    const [myStone, setMyStone] = useState(1);
    const [oppStone, setOppStone] = useState(2);
  
    const [activePlayer, setActivePlayer] = useState(1);
  
    const [hintMove, setHintMove] = useState(null);
  
    // 승리 모달
    const [showWinModal, setShowWinModal] = useState(false);
    const [winReason, setWinReason] = useState("시간으로");
  
    // 채팅
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);
    const chatInputRef = useRef(null);
  
    // -----------------------------
    // 2) 시간 변경 => 리셋
    // -----------------------------
    useEffect(() => {
      if(!gameStarted){
        const sec= parseTimeToSeconds(selectedTime);
        setBlackTime(sec);
        setWhiteTime(sec);
      }
    }, [selectedTime, gameStarted]);
  
    // -----------------------------
    // 3) 타이머 useEffect
    // -----------------------------
    useEffect(() => {
      if(!actualTimerRunning || winner) return;
  
      const interval = setInterval(() => {
        if(activePlayer===1){
          setBlackTime(prev=>{
            if(prev<=0){
              handleTimeOver(1);
              return 0;
            }
            return prev-1;
          });
        } else {
          setWhiteTime(prev=>{
            if(prev<=0){
              handleTimeOver(2);
              return 0;
            }
            return prev-1;
          });
        }
      },1000);
  
      return ()=> clearInterval(interval);
    }, [actualTimerRunning, winner, activePlayer]);
  
    function handleTimeOver(stone){
      const other= (stone===1?2:1);
      const newHist=[...history];
      const st={...newHist[stepIndex]};
      st.winner= other;
      newHist[stepIndex]= st;
      setHistory(newHist);
  
      setShowWinModal(true);
      setWinReason("시간으로");
    }
  
    // -----------------------------
    // 4) 착수
    // -----------------------------
    const handleCellClick= (row, col)=>{
      if(!gameStarted) return;
      if(winner) return;
      if(board[row][col]!==0) return;
  
      // 흑 첫 착수 => 타이머
      if(!actualTimerRunning && currentPlayer===1){
        setActualTimerRunning(true);
      }
  
      const newBoard= board.map(r=>[...r]);
      newBoard[row][col]= currentPlayer;
  
      if(isDoubleThree(newBoard, row, col, currentPlayer)){
        alert("삼삼 금수!");
        return;
      }
      const newWinner= checkWinner(newBoard, row, col, currentPlayer);
  
      const stObj={
        board:newBoard,
        currentPlayer: newWinner? currentPlayer : (currentPlayer===1?2:1),
        winner:newWinner,
        lastMove:{row,col},
      };
  
      const updated= history.slice(0, stepIndex+1);
      setHistory([...updated, stObj]);
      setStepIndex(updated.length);
  
      const moveNum= movesList.length+1;
      setMovesList([...movesList,{ moveNum, player: currentPlayer, row, col }]);
      setHintMove(null);
  
      if(!newWinner){
        setActivePlayer(currentPlayer===1?2:1);
      }else{
        setShowWinModal(true);
        setWinReason("5목");
      }
    };
  
    // -----------------------------
    // 5) Play => 랜덤 돌 배정
    // -----------------------------
    function handlePlay(){
      if(gameStarted) return;
  
      setGameStarted(true);
      setTimePanelOpen(false);
  
      const randomMeBlack= (Math.random()<0.5);
      if(randomMeBlack){
        setMyStone(1);
        setOppStone(2);
        setActivePlayer(1);
      }else{
        setMyStone(2);
        setOppStone(1);
        setActivePlayer(1);
      }
      setActualTimerRunning(false);
  
      let colorText= randomMeBlack? "(흑)" : "(백)";
      setChatMessages([
        { system:true, text:`[Info] 당신은 ${colorText} 입니다.`}
      ]);
    }
  
    // -----------------------------
    // 6) Undo/Redo/New/Hint/GiveUp
    // -----------------------------
    const handleUndo= useCallback(()=>{
      if(stepIndex>0){
        setStepIndex(stepIndex-1);
        setMovesList(prev=> prev.slice(0, prev.length-1));
        setHintMove(null);
      }
    },[stepIndex]);
  
    const handleRedo= useCallback(()=>{
      if(stepIndex< history.length-1){
        const nextI= stepIndex+1;
        const undone= history[nextI];
        setStepIndex(nextI);
  
        if(undone && undone.lastMove){
          const {row,col}= undone.lastMove;
          const moveNum= movesList.length+1;
          const player= undone.currentPlayer===1?2:1;
          setMovesList([...movesList,{ moveNum, player, row, col}]);
        }
        setHintMove(null);
      }
    },[stepIndex, history, movesList]);
  
    const handleNew= useCallback(()=>{
      const fresh=[
        {
          board:createEmptyBoard(),
          currentPlayer:1,
          winner:null,
          lastMove:null
        }
      ];
      setHistory(fresh);
      setStepIndex(0);
      setMovesList([]);
      setHintMove(null);
  
      setGameStarted(false);
      setActualTimerRunning(false);
      setActivePlayer(1);
      setShowWinModal(false);
    },[]);
  
    const handleHint= useCallback(()=>{
      if(winner) return;
      const best= getAiMove(board.map(r=>[...r]), 1, "intermediate");
      if(best){
        setHintMove({ row:best[0], col:best[1]});
      }
    },[board, winner]);
  
    const handleGiveUp= useCallback(()=>{
      if(winner) return;
      const other= (currentPlayer===1?2:1);
      const newHist=[...history];
      const st={...newHist[stepIndex]};
      st.winner= other;
      newHist[stepIndex]= st;
      setHistory(newHist);
  
      setShowWinModal(true);
      setWinReason("기권");
    },[winner, currentPlayer, history, stepIndex]);
  
    useEffect(()=>{
      if(onUndoRef)   onUndoRef.current= handleUndo;
      if(onRedoRef)   onRedoRef.current= handleRedo;
      if(onNewRef)    onNewRef.current= handleNew;
      if(onHintRef)   onHintRef.current= handleHint;
      if(onGiveUpRef) onGiveUpRef.current= handleGiveUp;
    },[
      onUndoRef,onRedoRef,onNewRef,onHintRef,onGiveUpRef,
      handleUndo,handleRedo,handleNew,handleHint,handleGiveUp
    ]);
  
    // -----------------------------
    // 7) MovesList
    // -----------------------------
    function renderMovesPairs(moves){
      const pairs=[];
      for(let i=0; i<moves.length; i+=2){
        const first= moves[i];
        const second= moves[i+1];
        const turnNumber= Math.floor(i/2)+1;
  
        const fTxt= `(${first.row},${first.col})`;
        const sTxt= second? `(${second.row},${second.col})`: "...";
  
        pairs.push(
          <div className="flex text-xs" key={turnNumber}>
            <div className="w-6">{turnNumber}.</div>
            <div className="w-16">{fTxt}</div>
            <div className="w-16">{sTxt}</div>
          </div>
        );
      }
      return pairs;
    }
  
    // -----------------------------
    // 8) 타이머 표시
    // -----------------------------
    function formatTime(sec){
      const m= Math.floor(sec/60);
      const s= sec%60;
      return `${m}:${ s<10? "0"+s : s}`;
    }
  
    const blackActive = actualTimerRunning && !winner && activePlayer===1;
    const whiteActive = actualTimerRunning && !winner && activePlayer===2;
  
    // -----------------------------
    // 9) 채팅
    // -----------------------------
    function handleSendChat(){
      if(chatInput.trim()==="") return;
      const prefix= myStone===1? "(흑)":"(백)";
      setChatMessages(prev=> [
        ...prev,
        { system:false, sender: prefix+"kanghaeda", text: chatInput.trim()}
      ]);
      setChatInput("");
      setEmojiPanelOpen(false);
    }
  
    const emojis= ["😀","🤣","😅","😎","🤩","🤔","😰","👍","👎","❤️"];
  
    // 이모티콘 => 바로 전송
    function handleSelectEmoji(emo){
      const combinedText= chatInput + emo;
      setChatInput(combinedText);
  
      setTimeout(()=>{
        if(combinedText.trim()!==""){
          const prefix= myStone===1? "(흑)":"(백)";
          setChatMessages(prev=> [
            ...prev,
            { system:false, sender: prefix+"kanghaeda", text:combinedText.trim()}
          ]);
        }
        setChatInput("");
        setEmojiPanelOpen(false);
      },0);
    }
  
    let winnerText="";
    if(winner===1) winnerText="흑승";
    else if(winner===2) winnerText="백승";
  
    return (
      <div
        className="
          bg-[#3A3A3A]
          text-white
          min-h-screen
          overflow-auto
          flex
          flex-col
          lg:flex-row
          pb-14
        "
      >
        {/* 메인(보드+프로필) */}
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
                상대 ({oppStone===1?"흑":"백"})
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
              {oppStone===1? formatTime(blackTime) : formatTime(whiteTime)}
            </div>
          </div>
  
          {/* 보드 */}
          <div className="w-full max-w-4xl mt-2 px-4 flex justify-center">
            <Goban
              board={board}
              lastMove={lastMove}
              onCellClick={handleCellClick}
              hintMove={hintMove}
            />
          </div>
  
          {/* 나(흑/백) */}
          <div className="w-full max-w-4xl px-4 mt-2 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <img
                src={player2Image}
                alt="나"
                className="w-10 h-10 border border-gray-300 object-cover"
              />
              <span className="text-base font-bold">
                kanghaeda ({myStone===1?"흑":"백"})
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
              {myStone===1? formatTime(blackTime): formatTime(whiteTime)}
            </div>
          </div>
  
          {/* 시간설정 + Play */}
          <div className="w-full max-w-2xl px-4 mt-4">
            <div
              onClick={()=> !gameStarted && setTimePanelOpen(!timePanelOpen)}
              className="bg-[#2B2B2B] rounded px-3 py-2 flex items-center justify-between cursor-pointer"
            >
              <span className="text-sm font-bold">🚀 {selectedTime}</span>
              <span>{timePanelOpen?"▲":"▼"}</span>
            </div>
            {timePanelOpen && !gameStarted && (
              <div className="bg-[#2B2B2B] mt-2 rounded p-2 h-32 overflow-y-auto">
                <div className="text-xs text-gray-400 mb-1">시간 선택</div>
                <div className="flex flex-wrap gap-2">
                  {timeOptions.map(opt=>(
                    <button
                      key={opt}
                      onClick={()=> setSelectedTime(opt)}
                      className={`
                        px-3 py-1 rounded text-sm
                        ${selectedTime===opt
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
  
            <button
              onClick={handlePlay}
              disabled={gameStarted}
              className={`
                mt-2 w-full py-3 text-lg font-bold rounded
                ${
                  gameStarted
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }
              `}
            >
              플레이
            </button>
          </div>
        </div>
  
        {/* 우측(대국 기록 + 채팅) [큰 화면 전용], 작은화면=아래 */}
        <div className="hidden lg:flex flex-col w-72 bg-[#2B2B2B] p-2">
          {/* 대국 기록 (높이 + 스크롤) */}
          <div className="bg-[#3A3A3A] rounded p-2 overflow-y-auto h-60 mb-2">
            <h3 className="text-sm font-bold mb-2">대국 기록</h3>
            {movesList.length===0?(
              <div className="text-xs text-gray-300">No moves yet.</div>
            ):(
              <div className="text-white space-y-1">
                {renderMovesPairs(movesList)}
              </div>
            )}
          </div>
  
          {/* 채팅창 */}
          <div
            className="bg-[#3A3A3A] rounded p-2 flex flex-col h-64 cursor-pointer"
            onClick={()=>{
              if(chatInputRef.current) chatInputRef.current.focus();
            }}
          >
            <div className="flex-1 overflow-y-auto text-sm space-y-2 pb-14">
              {chatMessages.map((msg, idx)=>
                msg.system?(
                  <div key={idx} className="text-gray-300 whitespace-pre-line">
                    {msg.text}
                  </div>
                ):(
                  <div key={idx} className="text-white">
                    <span className="font-bold">{msg.sender}:</span> {msg.text}
                  </div>
                )
              )}
              {winner && (
                <div className="text-sm text-gray-300">
                  MP-4님은 친절했나요? <span>👍</span> <span>👎</span>
                </div>
              )}
            </div>
  
            {/* (수정) 채팅 입력 + 이모티콘 버튼 => 한 줄 */}
            <div className="mt-2 flex items-center">
              <input
                ref={chatInputRef}
                type="text"
                className="
                  flex-1 px-2 py-1 rounded text-sm
                  bg-[#4B4B4B]
                  text-white
                  placeholder-gray-400
                "
                placeholder="메시지를 보내세요..."
                value={chatInput}
                onChange={e=> setChatInput(e.target.value)}
                onKeyDown={e=>{
                  if(e.key==="Enter" && !e.nativeEvent.isComposing){
                    handleSendChat();
                  }
                }}
              />
              {/* 이모티콘 버튼 (오른쪽, same line) */}
              <button
                onClick={()=> setEmojiPanelOpen(!emojiPanelOpen)}
                className="ml-2 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded"
              >
                🙂
              </button>
            </div>
  
            {emojiPanelOpen && (
              <div className="bg-[#4B4B4B] p-2 rounded mt-2 grid grid-cols-5 gap-2">
                {emojis.map((emo, i)=>(
                  <button
                    key={i}
                    onClick={()=> handleSelectEmoji(emo)}
                    className="text-2xl hover:bg-gray-500 rounded"
                  >
                    {emo}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
  
        {/* 작은 화면 전용: 대국 기록 + 채팅 아래 */}
        {!winner && (
          <div className="block lg:hidden bg-[#2B2B2B] p-2">
            <div className="bg-[#3A3A3A] rounded p-2 overflow-y-auto h-48 mb-2">
              <h3 className="text-sm font-bold mb-2">대국 기록</h3>
              {movesList.length===0?(
                <div className="text-xs text-gray-300">No moves yet.</div>
              ):(
                <div className="text-white space-y-1">
                  {renderMovesPairs(movesList)}
                </div>
              )}
            </div>
  
            {/* 채팅 */}
            <div
              className="bg-[#3A3A3A] rounded p-2 h-48 flex flex-col cursor-pointer"
              onClick={()=>{
                if(chatInputRef.current) chatInputRef.current.focus();
              }}
            >
              <div className="flex-1 overflow-y-auto text-sm space-y-2 pb-14">
                {chatMessages.map((msg, idx)=>
                  msg.system?(
                    <div key={idx} className="text-gray-300 whitespace-pre-line">
                      {msg.text}
                    </div>
                  ):(
                    <div key={idx} className="text-white">
                      <span className="font-bold">{msg.sender}:</span> {msg.text}
                    </div>
                  )
                )}
                {winner && (
                  <div className="text-sm text-gray-300">
                    MP-4님은 친절했나요? <span>👍</span> <span>👎</span>
                  </div>
                )}
              </div>
  
              {/* 한 줄에 input + 이모티콘 */}
              <div className="mt-2 flex items-center">
                <input
                  ref={chatInputRef}
                  type="text"
                  className="
                    flex-1 px-2 py-1 rounded text-sm
                    bg-[#4B4B4B]
                    text-white
                    placeholder-gray-400
                  "
                  placeholder="메시지를 보내세요..."
                  value={chatInput}
                  onChange={e=> setChatInput(e.target.value)}
                  onKeyDown={e=>{
                    if(e.key==="Enter" && !e.nativeEvent.isComposing){
                      handleSendChat();
                    }
                  }}
                />
                <button
                  onClick={()=> setEmojiPanelOpen(!emojiPanelOpen)}
                  className="ml-2 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-sm rounded"
                >
                  🙂
                </button>
              </div>
  
              {emojiPanelOpen && (
                <div className="bg-[#4B4B4B] p-2 rounded mt-2 grid grid-cols-5 gap-2">
                  {emojis.map((emo, i)=>(
                    <button
                      key={i}
                      onClick={()=> handleSelectEmoji(emo)}
                      className="text-2xl hover:bg-gray-500 rounded"
                    >
                      {emo}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
  
        {/* 승리 모달 */}
        {showWinModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#2B2B2B] w-64 rounded p-4 space-y-3 relative">
              <button
                onClick={()=> setShowWinModal(false)}
                className="absolute top-2 right-2 text-gray-300 hover:text-white"
              >
                X
              </button>
              <div className="text-xl font-bold flex items-center space-x-2 mt-2 justify-center">
                <span className="text-yellow-400">🏆</span>
                {winner===1? "흑승":"백승"}
              </div>
              <div className="text-sm text-gray-300 text-center">{winReason}</div>
  
              <div className="text-xs text-gray-200 space-y-1 flex justify-around mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-orange-300">❓ 5</span>
                  <span>실수</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-red-400">?? 6</span>
                  <span>블런더</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-pink-400">❌ 0</span>
                  <span>놓친 수</span>
                </div>
              </div>
  
              <button className="w-full bg-green-600 hover:bg-green-700 py-2 rounded mt-3">
                게임 리뷰
              </button>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <button
                  onClick={()=> handleNew()}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded"
                >
                  신규 {selectedTime}
                </button>
                <button className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded">
                  재대국
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  export default forwardRef(Body);
  
  // Goban + 보조함수들
  function Goban({ board, lastMove, onCellClick, hintMove }) {
    const SIZE_PX=600;
    const cellGap= SIZE_PX/(BOARD_SIZE-1);
  
    return (
      <div
        className="relative"
        style={{
          width: SIZE_PX+"px",
          height: SIZE_PX+"px",
          backgroundColor:"#DAB86F",
        }}
      >
        {Array.from({ length: BOARD_SIZE }, (_, i)=>(
          <div key={i}>
            <div
              className="absolute"
              style={{
                top: i*cellGap,
                left: 0,
                width: SIZE_PX,
                height:"2px",
                backgroundColor:"#5A3A1B",
              }}
            />
            <div
              className="absolute"
              style={{
                left: i*cellGap,
                top:0,
                width:"2px",
                height:SIZE_PX,
                backgroundColor:"#5A3A1B",
              }}
            />
          </div>
        ))}
        {board.map((rowArr, row)=>
          rowArr.map((stone, col)=>{
            const x= col*cellGap;
            const y= row*cellGap;
            const isLast= lastMove && lastMove.row===row && lastMove.col===col;
            return(
              <div
                key={`${row}-${col}`}
                onClick={()=> onCellClick(row,col)}
                className="absolute"
                style={{
                  width: cellGap,
                  height: cellGap,
                  top: y-cellGap/2,
                  left: x-cellGap/2,
                }}
              >
                {stone!==0 && (
                  <div
                    className={`
                      absolute
                      ${stone===1?"bg-black":"bg-white"}
                      rounded-full
                      border
                      ${stone===2?"border-gray-400":"border-black"}
                      ${isLast?"outline outline-2 outline-yellow-300":""}
                    `}
                    style={{
                      width: cellGap*0.5,
                      height: cellGap*0.5,
                      top: cellGap/2 - (cellGap*0.5)/2,
                      left: cellGap/2 - (cellGap*0.5)/2,
                    }}
                  />
                )}
                {hintMove && hintMove.row===row && hintMove.col===col && stone===0 && (
                  <div
                    className="absolute bg-green-400 rounded-full opacity-50"
                    style={{
                      width: cellGap*0.5,
                      height: cellGap*0.5,
                      top: cellGap/2-(cellGap*0.5)/2,
                      left: cellGap/2-(cellGap*0.5)/2,
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }
  
  /** parseTimeToSeconds, createEmptyBoard, isDoubleThree, checkWinner, countStones, isInside */
  function parseTimeToSeconds(mode){
    const n= parseInt(mode.replace("분",""),10);
    if(isNaN(n)) return 60;
    return n*60;
  }
  
  // --------------------
  // 이하: 오목 보조 함수들
  // --------------------
  function createEmptyBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
  }
  
  function isDoubleThree(board, row, col, player) {
    let openThreeCount = 0;
    const dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
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
  
    const e1r = row + dx * c1;
    const e1c = col + dy * c1;
    const e2r = row - dx * c2;
    const e2c = col - dy * c2;
  
    const isOpen1 = isInside(e1r, e1c) && board[e1r][e1c] === 0;
    const isOpen2 = isInside(e2r, e2c) && board[e2r][e2c] === 0;
    return isOpen1 && isOpen2;
  }
  
  function checkWinner(board, row, col, player) {
    const dirs = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];
    for (const [dx, dy] of dirs) {
      const c1 = countStones(board, row, col, player, dx, dy);
      const c2 = countStones(board, row, col, player, -dx, -dy);
      if (c1 + c2 - 1 >= 5) {
        return player;
      }
    }
    return null;
  }
  
  function countStones(board, row, col, player, dx, dy) {
    let r = row,
      c = col,
      cnt = 0;
    while (isInside(r, c) && board[r][c] === player) {
      cnt++;
      r += dx;
      c += dy;
    }
    return cnt;
  }
  
  function isInside(r, c) {
    return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
  }
  