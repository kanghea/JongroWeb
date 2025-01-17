import React, {
    useState,
    useImperativeHandle,
    forwardRef,
    useCallback,
  } from "react";
  
  const BOARD_SIZE = 15;
  
  function Body(_, ref) {
    // -----------------------------------------
    // 1) 상태 & 히스토리(Undo/Redo) & Moves List
    // -----------------------------------------
    const [history, setHistory] = useState([
      {
        board: createEmptyBoard(),
        currentPlayer: 1, // 1: 흑돌, 2: 백돌
        winner: null,
        lastMove: null,
      },
    ]);
    const [stepIndex, setStepIndex] = useState(0);
  
    // 각 수(row,col) 기록
    const [movesList, setMovesList] = useState([]);
  
    const currentState = history[stepIndex];
    const { board, currentPlayer, winner, lastMove } = currentState;
  
    // -----------------------------------------
    // 2) 착수 함수
    // -----------------------------------------
    const handleCellClick = (row, col) => {
      // 승자 있으면 무시
      if (winner) return;
      // 이미 돌이 있으면 무시
      if (board[row][col] !== 0) return;
  
      // 새 보드 복사 후 돌 놓기
      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = currentPlayer;
  
      // 삼삼 금수 체크
      if (isDoubleThree(newBoard, row, col, currentPlayer)) {
        alert("삼삼 금수입니다! (해당 수는 둘 수 없습니다.)");
        return;
      }
  
      // 승리 체크
      const newWinner = checkWinner(newBoard, row, col, currentPlayer);
  
      const newLastMove = { row, col };
      const newState = {
        board: newBoard,
        currentPlayer: newWinner ? currentPlayer : currentPlayer === 1 ? 2 : 1,
        winner: newWinner,
        lastMove: newLastMove,
      };
  
      // 히스토리 업데이트 (Undo 후 새 수 두면 그 뒤 기록은 버림)
      const updatedHistory = history.slice(0, stepIndex + 1);
      setHistory([...updatedHistory, newState]);
      setStepIndex(updatedHistory.length);
  
      // 착수 기록
      const moveNum = movesList.length + 1;
      const newMove = {
        moveNum,
        player: currentPlayer,
        row,
        col,
      };
      setMovesList([...movesList, newMove]);
    };
  
    // -----------------------------------------
    // 3) Undo / Redo
    // -----------------------------------------
    const handleUndo = useCallback(() => {
      if (stepIndex > 0) {
        setStepIndex(stepIndex - 1);
        // movesList도 같이 롤백
        setMovesList((prev) => prev.slice(0, prev.length - 1));
      }
    }, [stepIndex]);
  
    const handleRedo = useCallback(() => {
      if (stepIndex < history.length - 1) {
        const nextIndex = stepIndex + 1;
        const undoneState = history[nextIndex];
  
        setStepIndex(nextIndex);
  
        // Redo 시 undoneState.lastMove를 moveList에 다시 추가
        if (undoneState && undoneState.lastMove) {
          const moveNum = movesList.length + 1;
          const { row, col } = undoneState.lastMove;
  
          // undoneState.currentPlayer는 이미 수가 진행된 상태이므로
          // 돌을 놓은 쪽은 반대
          const player = undoneState.currentPlayer === 1 ? 2 : 1;
          setMovesList((prev) => [...prev, { moveNum, player, row, col }]);
        }
      }
    }, [stepIndex, history, movesList]);
  
    // 외부(Main)에서 Undo/Redo 호출할 수 있도록
    useImperativeHandle(ref, () => ({
      handleUndo,
      handleRedo,
    }));
  
    // -----------------------------------------
    // 4) 렌더링
    // -----------------------------------------
    return (
      <div
        className="
          pt-12            /* Header 높이만큼 위 공간 */
          bg-[#3A3A3A]
          text-white
          min-h-screen
          overflow-auto
          pb-20            /* 아래쪽 여백(버튼 등과 겹치지 않도록) */
        "
      >
        {/* 현재 플레이어 / 승자 표시 */}
        <div className="mt-2 ml-4 text-left flex justify-center">
          {winner ? (
            <div className="text-red-500 font-bold text-lg">
              승리! {winner === 1 ? "흑돌(1)" : "백돌(2)"}
            </div>
          ) : (
            <div className="text-sm mb-1">
              현재 플레이어: {currentPlayer === 1 ? "흑돌(1)" : "백돌(2)"}
            </div>
          )}
        </div>
  
        {/* Nora(상대) 정보 - 왼쪽 정렬 */}
        <div className="flex items-center ml-4 mb-2">
          <img
            src="./images/player1.png"
            alt="Nora avatar"
            className="w-12 h-12 border border-gray-300 object-cover"
          />
          <div className="flex flex-col ml-2">
            <span className="text-sm font-bold">
              Nora (2200) <span className="ml-1">🇳🇴</span>
            </span>
          </div>
        </div>
  
        {/* 오목판 + 크기 크게 + 칸 테두리 제거 */}
        <div className="ml-4">
          <div
            className="inline-block"
            style={{ width: "600px", height: "600px" }} // 보드 크기 조절
          >
            {/* 전체를 flex-wrap으로 칸 배치 */}
            <div className="w-full h-full flex flex-wrap">
              {board.map((rowArr, rowIndex) =>
                rowArr.map((cell, colIndex) => {
                  // 칸 배경색 (체스닷컴처럼 두 색)
                  const isDark = (rowIndex + colIndex) % 2 === 0;
                  const bgColor = isDark ? "#769656" : "#EEEED2";
  
                  // 마지막 둔 돌 표시(노란 테두리)
                  let outline = "";
                  if (
                    lastMove &&
                    lastMove.row === rowIndex &&
                    lastMove.col === colIndex
                  ) {
                    outline = "outline outline-2 outline-[#F6F668]";
                  }
  
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      style={{
                        backgroundColor: bgColor,
                        width: "calc(100% / 15)", // 15칸
                        height: "calc(100% / 15)",
                      }}
                      className={`
                        float-left
                        flex items-center justify-center 
                        cursor-pointer
                        ${outline}
                      `}
                    >
                      {/* 돌 표시 (흑/백) */}
                      {cell === 1 && (
                        <div className="w-4 h-4 bg-black rounded-full"></div>
                      )}
                      {cell === 2 && (
                        <div className="w-4 h-4 bg-white rounded-full border border-gray-500"></div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
  
        {/* Nora 말풍선 - 보드 아래, "시작포지션" 위에 표시 */}
        <div className="mt-6 ml-4 flex items-start">
          <img
            src="/images/player1.png"
            alt="Nora avatar"
            className="w-10 h-10 border border-gray-300 object-cover"
          />
          <div className="bg-[#2B2B2B] rounded-md p-2 ml-2 max-w-md">
            <p className="text-sm mb-1">안녕하세요. 한판 어떠세요?</p>
            <p className="text-sm">이 말풍선은 자유롭게 수정 가능합니다.</p>
          </div>
        </div>
  
        {/* 시작 포지션(수 기록) */}
        <div className="mt-4 ml-4 mr-4">
          <div className="bg-[#2B2B2B] rounded p-2">
            <h3 className="text-sm font-bold mb-2">시작 포지션</h3>
            {movesList.length === 0 ? (
              <div className="text-xs text-gray-300">No moves yet.</div>
            ) : (
              <ul className="text-xs space-y-1">
                {movesList.map((move) => (
                  <li key={move.moveNum}>
                    {move.moveNum}. {move.player === 1 ? "흑돌" : "백돌"} → (
                    {move.row}, {move.col})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
  
        {/* 내 정보 (좌측) */}
        <div className="flex items-center ml-4 mt-6">
          <img
            src="/images/player2.png"
            alt="My avatar"
            className="w-12 h-12 border border-gray-300 object-cover"
          />
          <div className="flex flex-col ml-2">
            <span className="text-sm font-bold">
              kanghaeda (466) <span className="ml-1">🇰🇷</span>
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  export default forwardRef(Body);
  
  //
  // 삼삼 체크, 승리 체크, 보조 함수들
  //
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
    // 간단한 "열린3" 판별: 연속 3 + 양끝이 열려있으면 1개
    const count1 = countStones(board, row, col, player, dx, dy);
    const count2 = countStones(board, row, col, player, -dx, -dy);
    const total = count1 + count2 - 1;
    if (total !== 3) return false;
  
    const e1r = row + dx * count1;
    const e1c = col + dy * count1;
    const e2r = row - dx * count2;
    const e2c = col - dy * count2;
  
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
  