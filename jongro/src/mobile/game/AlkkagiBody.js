//////////////////////////////////////
// Body.js : w-full + 15x15 격자 오목판 알까기 (턴제 bug fix + 돌 사이즈↑)
//////////////////////////////////////
import React, {
    useState,
    useEffect,
    useRef,
    forwardRef
  } from "react";
  import Matter from "matter-js";
  
  import player1Image from "../images/player1.png";
  import player2Image from "../images/player2.png";
  
  // 15x15 격자 배경 CSS
  import "./gomokuBoard.css";
  
  function Body(props, ref) {
    // -----------------------------
    // 1) State
    // -----------------------------
    const [winner, setWinner] = useState(null);
    const [gameStarted, setGameStarted] = useState(false);
  
    const [myStone, setMyStone] = useState(1);   // 흑
    const [oppStone, setOppStone] = useState(2); // 백
    const [activePlayer, setActivePlayer] = useState(1);
  
    const [showWinModal, setShowWinModal] = useState(false);
    const [winReason, setWinReason] = useState("");
  
    // 채팅
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState("");
    const [emojiPanelOpen, setEmojiPanelOpen] = useState(false);
    const chatInputRef = useRef(null);
  
    // Matter.js
    const [engineRef] = useState(Matter.Engine.create());
    const [runnerRef] = useState(Matter.Runner.create());
    const renderRef = useRef(null);
  
    // 보드 컨테이너
    const boardContainerRef = useRef(null);
  
    // ** 드래그 유효성 체크 ref **
    const validDragRef = useRef(false);
  
    // -----------------------------
    // 2) 게임 시작 handlePlay
    // -----------------------------
    function handlePlay() {
      if (gameStarted) return;
      setGameStarted(true);
  
      // 흑/백 랜덤
      const randomBlack = Math.random() < 0.5;
      if(randomBlack) {
        setMyStone(1);
        setOppStone(2);
        setActivePlayer(1); // 흑부터 시작
      } else {
        setMyStone(2);
        setOppStone(1);
        setActivePlayer(1); // 그래도 흑부터 시작
      }
  
      const colorText = randomBlack ? "(흑)" : "(백)";
      setChatMessages([
        { system: true, text: `[Info] 당신은 ${colorText} 입니다.` }
      ]);
  
      initMatter();
    }
  
    // -----------------------------
    // 3) Matter.js 초기화
    // -----------------------------
    function initMatter() {
      const engine = engineRef;
      const runner = runnerRef;
  
      // 기존 world 초기화
      Matter.World.clear(engine.world);
      Matter.Engine.clear(engine);
      engine.world.gravity.y = 0;
  
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        renderRef.current.canvas.remove();
        renderRef.current.textures = {};
      }
  
      // 보드 컨테이너 크기 측정
      const containerEl = boardContainerRef.current;
      if(!containerEl) return;
      const rect = containerEl.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
  
      // Render 생성
      const render = Matter.Render.create({
        element: containerEl,
        engine: engine,
        options: {
          width,
          height,
          wireframes: false,
          background: "transparent"
        }
      });
      renderRef.current = render;
  
      // 벽 (테두리)
      const walls = [
        Matter.Bodies.rectangle(width/2, -20, width, 40, { isStatic:true }),
        Matter.Bodies.rectangle(width/2, height+20, width, 40, { isStatic:true }),
        Matter.Bodies.rectangle(-20, height/2, 40, height, { isStatic:true }),
        Matter.Bodies.rectangle(width+20, height/2, 40, height, { isStatic:true }),
      ];
  
      // 돌 생성 (반지름 21로 키움: 기존 15 → 21, 약 40% 증가)
      const blackStones = [];
      const whiteStones = [];
      for (let i = 0; i < 5; i++) {
        const bx = width * 0.2;
        const by = (height * 0.15) + i * (height * 0.12);
        const black = Matter.Bodies.circle(bx, by, 21, {
          label: "blackStone",
          friction: 0.3,
          frictionAir: 0.04,
          restitution: 0.2,
          render: { fillStyle: "#000" }
        });
        blackStones.push(black);
  
        const wx = width * 0.8;
        const wy = (height * 0.15) + i * (height * 0.12);
        const white = Matter.Bodies.circle(wx, wy, 21, {
          label: "whiteStone",
          friction: 0.3,
          frictionAir: 0.04,
          restitution: 0.2,
          render: { fillStyle: "#FFF" }
        });
        whiteStones.push(white);
      }
  
      // 마우스 컨스트레인트
      const mouse = Matter.Mouse.create(render.canvas);
      const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.4,
          angularStiffness: 0.5,
          render: { visible: false }
        }
      });
      render.mouse = mouse;
  
      // --- 턴제 로직 ---
      Matter.Events.on(mouseConstraint, "startdrag", e => {
        validDragRef.current = false; // 기본값 false
        const body = e.body;
        if(!body) return;
  
        // 현재 턴과 돌 색이 일치할 때만 유효
        if(body.label === "blackStone" && activePlayer === 1) {
          validDragRef.current = true;
        } else if(body.label === "whiteStone" && activePlayer === 2) {
          validDragRef.current = true;
        } else {
          // 틀리면 즉시 드래그 취소
          mouseConstraint.body = null;
        }
      });
  
      // 드래그 도중에도 검사(혹시 다른 돌로 바뀌었을 때 즉시 해제)
      Matter.Events.on(mouseConstraint, "mousemove", () => {
        if(mouseConstraint.body) {
          if(mouseConstraint.body.label==="blackStone" && activePlayer!==1) {
            mouseConstraint.body=null;
          } else if(mouseConstraint.body.label==="whiteStone" && activePlayer!==2){
            mouseConstraint.body=null;
          }
        }
      });
  
      Matter.Events.on(mouseConstraint, "enddrag", e => {
        // 유효 드래그였다면 턴 교체
        if(validDragRef.current) {
          setActivePlayer(prev => (prev === 1 ? 2 : 1));
        }
      });
  
      // 월드 추가
      Matter.World.add(engine.world, [
        ...walls,
        ...blackStones,
        ...whiteStones,
        mouseConstraint
      ]);
  
      // 엔진 실행
      Matter.Runner.run(runner, engine);
      Matter.Render.run(render);
  
      // remove out-of-bounds + 승리 판정
      Matter.Events.on(engine, "beforeUpdate", () => {
        removeOutOfBounds(engine.world, width, height);
  
        const blacks = engine.world.bodies.filter(b => b.label==="blackStone");
        const whites = engine.world.bodies.filter(b => b.label==="whiteStone");
        if(!winner){
          if(blacks.length===0){
            setWinner(2);
            setWinReason("흑돌 전부 떨어짐!");
            setShowWinModal(true);
          } else if(whites.length===0){
            setWinner(1);
            setWinReason("백돌 전부 떨어짐!");
            setShowWinModal(true);
          }
        }
      });
    }
  
    function removeOutOfBounds(world, w, h) {
      world.bodies.forEach(body => {
        if(body.label==="blackStone" || body.label==="whiteStone"){
          const { x, y } = body.position;
          if(x<0 || x>w || y<0 || y>h){
            Matter.World.remove(world, body);
          }
        }
      });
    }
  
    // -----------------------------
    // 4) 채팅
    // -----------------------------
    function handleSendChat() {
      if(chatInput.trim()==="") return;
      const prefix = (myStone===1 ? "(흑)" : "(백)");
      setChatMessages(prev=>[
        ...prev,
        { system:false, sender: prefix+"kanghaeda", text: chatInput.trim()}
      ]);
      setChatInput("");
      setEmojiPanelOpen(false);
    }
  
    const emojis = ["😀","🤣","😅","😎","🤩","🤔","😰","👍","👎","❤️"];
    function handleSelectEmoji(emo) {
      const combined = chatInput + emo;
      setChatInput(combined);
      setTimeout(() => {
        if (combined.trim() !== "") {
          const prefix = (myStone===1 ? "(흑)" : "(백)");
          setChatMessages(prev => [
            ...prev,
            { system:false, sender: prefix + "kanghaeda", text: combined.trim()}
          ]);
        }
        setChatInput("");
        setEmojiPanelOpen(false);
      }, 0);
    }
  
    // -----------------------------
    // 5) 렌더링
    // -----------------------------
    let winnerText = "";
    if (winner === 1) winnerText = "흑승";
    else if (winner === 2) winnerText = "백승";
  
    return (
      <div className="
        bg-[#3A3A3A]
        text-white
        min-h-screen
        overflow-auto
        flex
        flex-col
        lg:flex-row
        pb-14
      ">
        {/* 좌측 (프로필 + 보드) */}
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
            {/* 턴 표시 */}
            <div className="ml-auto px-2 py-1 rounded bg-gray-700 text-sm">
              {activePlayer===1 ? "흑 턴" : "백 턴"}
            </div>
          </div>
  
          {/* 보드 (aspect-square, w-full) */}
          <div className="w-full max-w-4xl mt-2 px-4 flex justify-center">
            <div
              ref={boardContainerRef}
              className="relative w-full aspect-square gomoku-board"
            >
              {/* Matter.js canvas is appended here */}
            </div>
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
                kanghaeda ({myStone===1?"흑":"백"})
              </span>
            </div>
            <div className="ml-auto px-2 py-1 rounded bg-gray-700 text-sm">
              {activePlayer===myStone ? "내 차례" : "상대 차례"}
            </div>
          </div>
  
          {/* 플레이 버튼 */}
          {!gameStarted && (
            <div className="w-full max-w-2xl px-4 mt-4">
              <button
                onClick={handlePlay}
                className="w-full py-3 text-lg font-bold rounded bg-green-500 hover:bg-green-600"
              >
                플레이 시작
              </button>
            </div>
          )}
        </div>
  
        {/* 우측: 채팅 영역 */}
        <div className="hidden lg:flex flex-col w-72 bg-[#2B2B2B] p-2">
          <div className="bg-[#3A3A3A] rounded p-2 overflow-y-auto h-60 mb-2">
            <h3 className="text-sm font-bold mb-2">알까기 진행</h3>
            <div className="text-xs text-gray-300">
              화면에 맞춰 15x15 격자가 채워집니다.
            </div>
          </div>
  
          {/* 채팅 */}
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
                {emojis.map((emo,i)=>(
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
  
        {/* 작은 화면 전용: 채팅 아래 */}
        {!winner && (
          <div className="block lg:hidden bg-[#2B2B2B] p-2">
            <div className="bg-[#3A3A3A] rounded p-2 overflow-y-auto h-48 mb-2">
              <h3 className="text-sm font-bold mb-2">알까기 진행</h3>
              <div className="text-xs text-gray-300">
                화면 전체 15x15 격자판
              </div>
            </div>
  
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
                  {emojis.map((emo,i)=>(
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
                {winnerText}
              </div>
              <div className="text-sm text-gray-300 text-center">{winReason}</div>
  
              <button
                className="w-full bg-green-600 hover:bg-green-700 py-2 rounded mt-3"
                onClick={()=> setShowWinModal(false)}
              >
                게임 리뷰(?)
              </button>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <button
                  onClick={()=> {
                    setShowWinModal(false);
                    setGameStarted(false);
                    setWinner(null);
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 py-2 rounded"
                >
                  신규
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
  