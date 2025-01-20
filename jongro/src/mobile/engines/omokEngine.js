// omokEngine.js
// 한층 더 개선된 알파베타 탐색, 수비 가중치 강화

const BOARD_SIZE = 15;

/** 후보 범위: 돌 주변 ±2 (MARGIN=2). 필요 시 상황 따라 증가 가능 */
const MARGIN = 2;

/**
 * 난이도별 파라미터
 * - depth: 알파베타 탐색 깊이
 * - offenseWeight, defenseWeight: 공격/수비 가중치
 * - ...openFour 등 세부 항목에 추가 가중치
 */
const difficultyParams = {
  kingBeginner: {
    depth: 1, 
    offenseWeight: 1.0,
    defenseWeight: 1.0,
    openFour: 5000,   closedFour: 2500, 
    openThree: 1000,  closedThree: 500, 
    stoneScore: 10,
  },
  beginner: {
    depth: 2,
    offenseWeight: 1.2,
    defenseWeight: 1.3,
    openFour: 6000,   closedFour: 3000,
    openThree:1200,   closedThree:600,
    stoneScore: 12,
  },
  intermediate: {
    depth: 3,
    offenseWeight: 1.3,
    defenseWeight: 1.5,
    openFour: 8000,   closedFour:4000,
    openThree:1500,   closedThree:700,
    stoneScore:15,
  },
  expert: {
    depth: 4,
    offenseWeight: 1.4,
    defenseWeight: 1.6,
    openFour:10000,   closedFour:5000,
    openThree:2000,   closedThree:1000,
    stoneScore:20,
  },
};

/**
 * getAiMove:
 *  - AI가 둘 좌표(row,col)를 알파베타 탐색으로 결정
 */
export function getAiMove(board, aiPlayer, difficultyKey) {
  const params = difficultyParams[difficultyKey] || difficultyParams.kingBeginner;
  const { depth } = params;

  let bestScore = -Infinity;
  let bestMove = null;

  // 후보 수 필터링
  const moves = generateCandidateMoves(board);

  for(const [r,c] of moves){
    board[r][c] = aiPlayer;
    const score = alphaBeta(board, depth-1, -Infinity, Infinity, false, aiPlayer, difficultyKey);
    board[r][c] = 0;

    if(score>bestScore){
      bestScore=score;
      bestMove=[r,c];
    }
  }

  if(!bestMove){
    // 후보가 전혀 없으면 중앙으로
    return [Math.floor(BOARD_SIZE/2), Math.floor(BOARD_SIZE/2)];
  }
  return bestMove;
}

/**
 * alphaBeta
 */
function alphaBeta(board, depth, alpha, beta, maximizing, aiPlayer, difficultyKey) {
  if(depth===0 || checkGameOver(board)){
    return evaluateBoard(board, aiPlayer, difficultyKey);
  }

  if(maximizing){
    let value=-Infinity;
    const moves= generateCandidateMoves(board);
    for(const [r,c] of moves){
      board[r][c]= aiPlayer;
      const score= alphaBeta(board, depth-1, alpha,beta, false, aiPlayer, difficultyKey);
      board[r][c]=0;

      value= Math.max(value, score);
      alpha= Math.max(alpha, value);
      if(alpha>=beta) break;
    }
    return value;
  } else {
    let value= Infinity;
    const opponent= aiPlayer===1?2:1;
    const moves= generateCandidateMoves(board);
    for(const [r,c] of moves){
      board[r][c]= opponent;
      const score= alphaBeta(board, depth-1, alpha,beta, true, aiPlayer, difficultyKey);
      board[r][c]=0;

      value= Math.min(value, score);
      beta= Math.min(beta, value);
      if(alpha>=beta) break;
    }
    return value;
  }
}

/**
 * generateCandidateMoves:
 *  - 돌이 놓인 최소/최대 범위를 구해, ±MARGIN 범위만 후보로
 *  - 공격/방어 상 긴급한 수(예: 열4) 감지 시, 범위 넓히는 등 더 고도화 가능
 */
function generateCandidateMoves(board){
  let minR=BOARD_SIZE, maxR=0, minC=BOARD_SIZE, maxC=0;
  let foundStone=false;

  for(let r=0;r<BOARD_SIZE;r++){
    for(let c=0;c<BOARD_SIZE;c++){
      if(board[r][c]!==0){
        foundStone=true;
        if(r<minR) minR=r;
        if(r>maxR) maxR=r;
        if(c<minC) minC=c;
        if(c>maxC) maxC=c;
      }
    }
  }
  if(!foundStone){
    // 돌이 하나도 없으면 중앙 근처 몇 칸
    const mid= Math.floor(BOARD_SIZE/2);
    const ret=[];
    for(let r=mid-1; r<=mid+1; r++){
      for(let c=mid-1; c<=mid+1; c++){
        ret.push([r,c]);
      }
    }
    return ret;
  }
  minR= Math.max(0, minR-MARGIN);
  maxR= Math.min(BOARD_SIZE-1, maxR+MARGIN);
  minC= Math.max(0, minC-MARGIN);
  maxC= Math.min(BOARD_SIZE-1, maxC+MARGIN);

  const moves=[];
  for(let r=minR; r<=maxR;r++){
    for(let c=minC;c<=maxC;c++){
      if(board[r][c]===0){
        moves.push([r,c]);
      }
    }
  }
  return moves;
}

/**
 * checkGameOver
 */
function checkGameOver(board){
  if(hasFiveInARow(board)) return true;
  // 더이상 빈칸 없으면 종료
  for(let r=0;r<BOARD_SIZE;r++){
    for(let c=0;c<BOARD_SIZE;c++){
      if(board[r][c]===0) return false;
    }
  }
  return true;
}

function hasFiveInARow(board){
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];
  for(let r=0;r<BOARD_SIZE;r++){
    for(let c=0;c<BOARD_SIZE;c++){
      const st=board[r][c];
      if(st!==0){
        for(const [dx,dy] of dirs){
          const c1= countStones(board, r,c, st, dx,dy);
          const c2= countStones(board, r,c, st, -dx,-dy);
          if(c1+c2-1>=5){
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * evaluateBoard:
 *  - 공격/수비 가중치 모두 반영
 */
function evaluateBoard(board, aiPlayer, difficultyKey){
  const params= difficultyParams[difficultyKey]||difficultyParams.kingBeginner;
  const { stoneScore, openFour, closedFour, openThree, closedThree, offenseWeight, defenseWeight } = params;

  const opponent= aiPlayer===1?2:1;

  // 1) 돌 개수 기반 기본 점수
  let aiCount=0, oppCount=0;
  for(let r=0;r<BOARD_SIZE;r++){
    for(let c=0;c<BOARD_SIZE;c++){
      if(board[r][c]=== aiPlayer) aiCount++;
      else if(board[r][c]===opponent) oppCount++;
    }
  }
  let aiVal= aiCount*stoneScore, oppVal= oppCount*stoneScore;

  // 2) 공격 패턴 점수
  const aiPatterns = analyzePatterns(board, aiPlayer);
  aiVal += aiPatterns.open4*openFour + aiPatterns.closed4*closedFour + aiPatterns.open3*openThree + aiPatterns.closed3*closedThree;

  // 3) 상대 패턴 점수 (수비 가중치)
  // 상대가 open4를 만들면, AI 입장에선 엄청 위험 → 음수
  const oppPatterns= analyzePatterns(board, opponent);
  oppVal += oppPatterns.open4*openFour + oppPatterns.closed4*closedFour + oppPatterns.open3*openThree + oppPatterns.closed3*closedThree;

  // offenseWeight는 aiVal 곱, defenseWeight는 oppVal에 곱(위험)
  const finalScore= (aiVal* offenseWeight) - (oppVal* defenseWeight);
  return finalScore;
}

/**
 * analyzePatterns:
 *  - (open3, closed3, open4, closed4) 카운트
 */
function analyzePatterns(board, player){
  let open3=0, closed3=0, open4=0, closed4=0;
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];

  for(let r=0;r<BOARD_SIZE;r++){
    for(let c=0;c<BOARD_SIZE;c++){
      if(board[r][c]===player){
        for(const [dx,dy] of dirs){
          const len= countStones(board,r,c,player,dx,dy);
          if(len>=5) continue; // 이미 5목은 다른곳에서 체크

          // 양끝
          const e1r=r+dx*len, e1c=c+dy*len;
          const e2r=r-dx, e2c=c-dy;

          // 4연속
          if(len===4){
            const sideVals= getSides(board, e1r,e1c, e2r,e2c);
            const emptyCount= sideVals.filter(v=>v===0).length;
            if(emptyCount===2){
              open4++;
            } else if(emptyCount===1){
              closed4++;
            }
          }
          // 3연속
          else if(len===3){
            const sideVals= getSides(board, e1r,e1c, e2r,e2c);
            const emptyCount= sideVals.filter(v=>v===0).length;
            if(emptyCount===2){
              open3++;
            } else if(emptyCount===1){
              closed3++;
            }
          }
        }
      }
    }
  }
  return { open3, closed3, open4, closed4 };
}

function getSides(board, r1,c1, r2,c2){
  let s1=-1, s2=-1;
  if(isInside(r1,c1)) s1= board[r1][c1];
  if(isInside(r2,c2)) s2= board[r2][c2];
  return [s1,s2];
}

/** 특정 방향 연속 개수 */
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
