import React, {
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef,
    useCallback,
  } from "react";
  import { getAiMove } from "../engines/omokEngine";
  
  // 예시 아바타
  import aiAvatar from "../images/player1.png";
  import userAvatar from "../images/player2.png";
  
  const BOARD_SIZE = 15;
  
  function AIBody(
    {
      onUndoRef,
      onRedoRef,
      onHintRef,
      onNewRef,
      onGiveUpRef,
    }, // props
    ref
  ) {
    // ------------------------
    // 1) 상태
    // ------------------------
    const [playerColor, setPlayerColor] = useState("black"); 
    const [history, setHistory] = useState([
      {
        board: createEmptyBoard(),
        currentPlayer: 1,
        winner: null,
        lastMove: null,
      },
    ]);
    const [stepIndex, setStepIndex] = useState(0);
    const [movesList, setMovesList] = useState([]);
    const [aiLevel, setAiLevel] = useState("kingBeginner");
    const [hintMove, setHintMove] = useState(null);
  
    const currentState = history[stepIndex];
    const { board, currentPlayer, winner, lastMove } = currentState;
  
    // ------------------------
    // resetGame
    // ------------------------
    function resetGame(){
      const initPlayer = (playerColor==="black"? 1: 2);
      const initBoard = createEmptyBoard();
      setHistory([
        {
          board: initBoard,
          currentPlayer: initPlayer,
          winner:null,
          lastMove:null,
        },
      ]);
      setStepIndex(0);
      setMovesList([]);
      setHintMove(null);
    }
  
    // playerColor 바뀌면 게임 리셋
    useEffect(()=>{
      resetGame();
      // eslint-disable-next-line
    }, [playerColor]);
  
    // ------------------------
    // 착수
    // ------------------------
    const handleCellClick = (row, col) => {
      if(winner) return;
      const userStone = (playerColor==="black"? 1: 2);
      if(currentPlayer!== userStone) return; // AI 차례
      placeStone(row, col, userStone);
    };
  
    function placeStone(row, col, stone){
      if(board[row][col]!==0) return;
      const newBoard = board.map(r=>[...r]);
      newBoard[row][col] = stone;
  
      if(isDoubleThree(newBoard, row,col, stone)){
        alert("삼삼 금수!");
        return;
      }
      const newWinner = checkWinner(newBoard, row,col, stone);
  
      const nextState={
        board: newBoard,
        currentPlayer: newWinner? stone: (stone===1? 2:1),
        winner: newWinner,
        lastMove:{row,col},
      };
  
      const updated= history.slice(0, stepIndex+1);
      setHistory([...updated, nextState]);
      setStepIndex(updated.length);
  
      const moveNum = movesList.length+1;
      setMovesList([...movesList,{moveNum, player:stone, row, col}]);
  
      setHintMove(null);
    }
  
    // ------------------------
    // AI 착수
    // ------------------------
    useEffect(()=>{
      if(winner) return;
      const aiStone= (playerColor==="black"? 2:1);
      if(currentPlayer=== aiStone){
        // AI
        const [rAi, cAi] = getAiMove(board.map(r=>[...r]), aiStone, aiLevel);
        setTimeout(()=>{
          placeStone(rAi, cAi, aiStone);
        }, 600);
      }
    }, [currentPlayer, winner, board, aiLevel, playerColor]);
  
    // ------------------------
    // Undo/Redo
    // ------------------------
    const handleUndo = useCallback(()=>{
      if(stepIndex>0){
        setStepIndex(stepIndex-1);
        setMovesList(prev=> prev.slice(0, prev.length-1));
        setHintMove(null);
      }
    }, [stepIndex]);
  
    const handleRedo = useCallback(()=>{
      if(stepIndex< history.length-1){
        const nextI = stepIndex+1;
        const undone= history[nextI];
        setStepIndex(nextI);
  
        if(undone && undone.lastMove){
          const { row, col }= undone.lastMove;
          const moveNum= movesList.length+1;
          const player= undone.currentPlayer===1? 2:1;
          setMovesList([...movesList,{moveNum, player, row, col}]);
        }
        setHintMove(null);
      }
    }, [stepIndex, history, movesList]);
  
    // ------------------------
    // Hint
    // ------------------------
    function handleHint(){
      if(winner) return;
      const userStone=(playerColor==="black"?1:2);
      if(currentPlayer!== userStone) return;
  
      const [hr,hc] = getAiMove(board.map(r=>[...r]), userStone, aiLevel);
      setHintMove({ row:hr, col:hc });
    }
  
    // ------------------------
    // 기권
    // ------------------------
    function handleGiveUp(){
      if(winner) return;
      const currentP = currentPlayer;
      const otherP = (currentP===1? 2:1);
      // 현재 state 복사
      const updated = [...history];
      const last = {...updated[stepIndex]};
      last.winner= otherP;
      updated[stepIndex]= last;
      setHistory(updated);
    }
  
    // ------------------------
    // 신규
    // ------------------------
    function handleNew(){
      resetGame();
    }
  
    // ------------------------
    // Ref 연결
    // ------------------------
    useEffect(()=>{
      if(onUndoRef)  onUndoRef.current = handleUndo;
      if(onRedoRef)  onRedoRef.current = handleRedo;
      if(onHintRef)  onHintRef.current = handleHint;
      if(onNewRef)   onNewRef.current  = handleNew;
      if(onGiveUpRef)onGiveUpRef.current= handleGiveUp;
    }, [
      onUndoRef, onRedoRef, onHintRef, onNewRef, onGiveUpRef,
      handleUndo, handleRedo, handleHint, handleNew
    ]);
  
    // ------------------------
    // Moves 2수씩
    // ------------------------
    function renderMovesPairs(moves){
      const pairs=[];
      for(let i=0;i<moves.length;i+=2){
        const first=moves[i], second=moves[i+1];
        const turnNum= Math.floor(i/2)+1;
        const fTxt=`(${first.row},${first.col})`;
        const sTxt= second? `(${second.row},${second.col})`:"...";
        pairs.push(
          <div className="flex text-xs" key={turnNum}>
            <div className="w-6">{turnNum}.</div>
            <div className="w-16">{fTxt}</div>
            <div className="w-16">{sTxt}</div>
          </div>
        );
      }
      return pairs;
    }
  
    // ------------------------
    // JSX
    // ------------------------
    const aiStone  = (playerColor==="black"? 2:1);
    const userStone= (playerColor==="black"? 1:2);
  
    return (
      <div className="bg-[#3A3A3A] text-white min-h-screen flex flex-col items-center overflow-auto pb-20">
  
        {/* 상단 (AI) */}
        <div className="w-full max-w-4xl px-4 mt-4 flex items-center space-x-3">
          <img
            src={aiAvatar}
            alt="AI"
            className="w-12 h-12 border border-gray-300 object-cover"
          />
          <span className="text-base font-bold">
            {playerColor==="black"? "AI(백)" : "AI(흑)"} <span className="ml-1">🤖</span>
          </span>
        </div>
  
        {/* 오목판 */}
        <div className="w-full max-w-4xl px-4 mt-2 flex justify-center">
          <Goban
            board={board}
            lastMove={lastMove}
            onCellClick={handleCellClick}
            hintMove={hintMove}
          />
        </div>
  
        {/* 하단 (플레이어) */}
        <div className="w-full max-w-4xl px-4 mt-2 flex items-center space-x-3">
          <img
            src={userAvatar}
            alt="user"
            className="w-12 h-12 border border-gray-300 object-cover"
          />
          <span className="text-base font-bold">
            {playerColor==="black"? "나(흑)" : "나(백)"} <span className="ml-1">🇰🇷</span>
          </span>
        </div>
  
        {/* UI 패널 (난이도, 색상 선택) */}
        <div className="mt-4 flex flex-col space-y-2 items-center">
          <div className="space-x-2">
            <label className="text-sm">플레이어 색상: </label>
            <select
              className="text-black px-2 py-1 text-sm"
              value={playerColor}
              onChange={(e)=> setPlayerColor(e.target.value)}
            >
              <option value="black">흑</option>
              <option value="white">백</option>
            </select>
          </div>
  
          <div className="space-x-2">
            <label className="text-sm">AI 난이도: </label>
            <select
              className="text-black px-2 py-1 text-sm"
              value={aiLevel}
              onChange={(e)=> setAiLevel(e.target.value)}
            >
              <option value="kingBeginner">왕초보</option>
              <option value="beginner">초보</option>
              <option value="intermediate">중수</option>
              <option value="expert">고수</option>
            </select>
          </div>
        </div>
  
        {/* 승리/현재 플레이어 */}
        <div className="w-full max-w-4xl mt-3 flex justify-center">
          {winner?(
            <div className="text-red-500 font-bold text-lg">
              승리! {winner===userStone? "플레이어":"AI"}(
                {winner===1?"흑":"백"}
              )
            </div>
          ):(
            <div className="text-sm">
              현재 플레이어: {currentPlayer===userStone? "플레이어":"AI"}(
                {currentPlayer===1?"흑":"백"}
              )
            </div>
          )}
        </div>
  
        {/* Moves List */}
        <div className="w-full max-w-4xl mt-4 px-4">
          <div className="bg-[#2B2B2B] rounded-t p-2 flex items-center">
            <span className="text-sm font-bold">Moves</span>
          </div>
          <div className="bg-[#2B2B2B] px-4 pb-2">
            {movesList.length===0?(
              <div className="text-xs text-gray-300">No moves yet.</div>
            ):(
              <div className="text-white space-y-1">
                {renderMovesPairs(movesList)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  export default forwardRef(AIBody);
  
  // Goban
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
        {/* 갈색선 */}
        {Array.from({length:BOARD_SIZE},(_,i)=>(
          <div key={i}>
            <div
              className="absolute"
              style={{
                top: i*cellGap,
                left:0,
                width: SIZE_PX,
                height:"2px",
                backgroundColor:"#5A3A1B",
              }}
            />
            <div
              className="absolute"
              style={{
                left:i*cellGap,
                top:0,
                width:"2px",
                height:SIZE_PX,
                backgroundColor:"#5A3A1B",
              }}
            />
          </div>
        ))}
  
        {board.map((rowArr, r)=>
          rowArr.map((stone, c)=>{
            const x=c*cellGap;
            const y=r*cellGap;
            const isLast= (lastMove && lastMove.row===r && lastMove.col===c);
  
            return (
              <div
                key={`${r}-${c}`}
                onClick={()=> onCellClick(r,c)}
                className="absolute"
                style={{
                  width: cellGap,
                  height: cellGap,
                  top: y-cellGap/2,
                  left: x-cellGap/2,
                }}
              >
                {/* 돌 */}
                {stone!==0 &&(
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
                      top: cellGap/2-(cellGap*0.5)/2,
                      left: cellGap/2-(cellGap*0.5)/2,
                    }}
                  />
                )}
                {/* Hint */}
                {hintMove && hintMove.row===r && hintMove.col===c && stone===0 && (
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
  
  /* 보조 함수들 */
  function createEmptyBoard(){
    return Array.from({length:BOARD_SIZE},()=> Array(BOARD_SIZE).fill(0));
  }
  
  // 삼삼, 5목 체크
  function isDoubleThree(board, row,col, player){
    let openThreeCount=0;
    const dirs=[[0,1],[1,0],[1,1],[1,-1]];
    for(const [dx,dy] of dirs){
      if(isOpenThree(board, row, col, player, dx,dy)){
        openThreeCount++;
      }
    }
    return openThreeCount>=2;
  }
  
  function isOpenThree(board, row,col, player, dx,dy){
    const c1= countStones(board,row,col,player, dx,dy);
    const c2= countStones(board,row,col,player, -dx,-dy);
    const total= c1+c2-1;
    if(total!==3) return false;
  
    const e1r= row+dx*c1, e1c= col+dy*c1;
    const e2r= row-dx*c2, e2c= col-dy*c2;
    const is1 = isInside(e1r,e1c)? board[e1r][e1c]:-1;
    const is2 = isInside(e2r,e2c)? board[e2r][e2c]:-1;
    return (is1===0 && is2===0);
  }
  
  function checkWinner(board, row,col, player){
    const dirs=[[0,1],[1,0],[1,1],[1,-1]];
    for(const [dx,dy]of dirs){
      const c1= countStones(board,row,col,player,dx,dy);
      const c2= countStones(board,row,col,player,-dx,-dy);
      if(c1+c2-1>=5){
        return player;
      }
    }
    return null;
  }
  
  function countStones(board, row,col, player, dx,dy){
    let r=row, c=col, cnt=0;
    while(isInside(r,c)&& board[r][c]===player){
      cnt++;
      r+=dx; c+=dy;
    }
    return cnt;
  }
  function isInside(r,c){
    return r>=0 && r<BOARD_SIZE && c>=0 && c<BOARD_SIZE;
  }
  