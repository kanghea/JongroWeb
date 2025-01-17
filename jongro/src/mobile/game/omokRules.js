// src/mobile/game/omokRules.js
export const BOARD_SIZE = 15;

export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

export function isDoubleThree(board, row, col, player) {
  // 이전에 Body.js에서 사용한 삼삼 체크 로직을 여기에 옮겨서 구현
  // (간단화한 예시로 작성)
  let openThreeCount = 0;
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dx, dy] of directions) {
    if (isOpenThree(board, row, col, player, dx, dy)) {
      openThreeCount++;
    }
  }
  return openThreeCount >= 2;
}

function isOpenThree(board, row, col, player, dx, dy) {
  const count1 = countStones(board, row, col, player, dx, dy);
  const count2 = countStones(board, row, col, player, -dx, -dy);
  const totalCount = count1 + count2 - 1;
  if (totalCount !== 3) return false;
  const next1Row = row + dx * count1;
  const next1Col = col + dy * count1;
  const next2Row = row - dx * count2;
  const next2Col = col - dy * count2;
  const isOpen1 = isInsideBoard(next1Row, next1Col) && board[next1Row][next1Col] === 0;
  const isOpen2 = isInsideBoard(next2Row, next2Col) && board[next2Row][next2Col] === 0;
  return isOpen1 && isOpen2;
}

function countStones(board, row, col, player, dx, dy) {
  let r = row;
  let c = col;
  let count = 0;
  while (isInsideBoard(r, c) && board[r][c] === player) {
    count++;
    r += dx;
    c += dy;
  }
  return count;
}

function isInsideBoard(r, c) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

export function checkWinner(board, row, col, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];

  for (const [dx, dy] of directions) {
    const count1 = countStones(board, row, col, player, dx, dy);
    const count2 = countStones(board, row, col, player, -dx, -dy);
    const total = count1 + count2 - 1;
    if (total >= 5) {
      return player;
    }
  }
  return null;
}
