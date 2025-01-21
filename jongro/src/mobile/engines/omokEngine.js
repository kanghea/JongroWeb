////////////////////////////////////////////
// omokEngine.js
// 알파베타 탐색 + 이터레이티브 딥닝 + 트랜스포지션 테이블
// + 기존 (간단) 정석 로직
////////////////////////////////////////////

const BOARD_SIZE = 15;
const MARGIN = 2;  

// -------------------------
// Zobrist 해시용 배열
// -------------------------
const ZOBRIST = [];
let ZOBRIST_INITED = false;

/** Zobrist 초기화: 각 좌표마다 흑/백 해시값 2개씩 생성 */
function initZobrist(){
  for(let r=0; r<BOARD_SIZE; r++){
    ZOBRIST[r] = [];
    for(let c=0; c<BOARD_SIZE; c++){
      ZOBRIST[r][c] = [
        random32(), // 흑(1)에 대한 해시
        random32()  // 백(2)에 대한 해시
      ];
    }
  }
  ZOBRIST_INITED = true;
}
/** 32비트 난수 */
function random32(){
  return (Math.random() * 0x100000000) >>> 0;
}

// -------------------------
// Transposition Table
// -------------------------
let TT = {}; // 해시 → { depth, flag: "EXACT"/"ALPHA"/"BETA", value }
function ttableClear(){
  TT = {};
}

/** 해시 계산 */
function computeHash(board){
  if(!ZOBRIST_INITED){
    initZobrist(); // 혹시 초기화 안됐으면
  }
  let h = 0 >>> 0;
  for(let r=0; r<BOARD_SIZE; r++){
    for(let c=0; c<BOARD_SIZE; c++){
      const st = board[r][c];
      if(st === 1){
        h ^= ZOBRIST[r][c][0];
      } else if(st === 2){
        h ^= ZOBRIST[r][c][1];
      }
    }
  }
  return h >>> 0;
}

// -------------------------
// 난이도 파라미터
// -------------------------
const difficultyParams = {
  kingBeginner: {
    maxDepth: 1,
    offenseWeight: 1.0,
    defenseWeight: 1.0,
    openFour: 5000,
    closedFour: 2500,
    openThree: 1000,
    closedThree: 500,
    stoneScore: 10,
    beamWidth: 12,
    isExpert: false,
    isGrandmaster: false
  },
  beginner: {
    maxDepth: 2,
    offenseWeight: 1.2,
    defenseWeight: 1.3,
    openFour: 6000,
    closedFour: 3000,
    openThree: 1200,
    closedThree: 600,
    stoneScore: 12,
    beamWidth: 12,
    isExpert: false,
    isGrandmaster: false
  },
  intermediate: {
    maxDepth: 3,
    offenseWeight: 1.3,
    defenseWeight: 1.5,
    openFour: 8000,
    closedFour: 4000,
    openThree: 1500,
    closedThree: 700,
    stoneScore: 15,
    beamWidth: 10,
    isExpert: false,
    isGrandmaster: false
  },
  expert: {
    maxDepth: 5,
    offenseWeight: 1.4,
    defenseWeight: 1.6,
    openFour: 12000,
    closedFour: 6000,
    openThree: 2000,
    closedThree: 1200,
    stoneScore: 30,
    beamWidth: 8,
    isExpert: true,
    isGrandmaster: true
  },
  grandmaster: {
    maxDepth: 5,
    offenseWeight: 1.5,
    defenseWeight: 1.7,
    openFour: 12000,
    closedFour: 6000,
    openThree: 2500,
    closedThree: 1200,
    stoneScore: 30,
    beamWidth: 8,
    isExpert: true,
    isGrandmaster: true
  }
};

// -------------------------
// 메인 함수: getAiMove
// -------------------------
export function getAiMove(board, aiPlayer, difficultyKey){
  // Zobrist init
  if(!ZOBRIST_INITED){
    initZobrist();
  }
  // TT clear
  ttableClear();

  const params = difficultyParams[difficultyKey] || difficultyParams.kingBeginner;

  // 1) 즉시승리
  const myWins = findImmediateWinMoves(board, aiPlayer);
  if(myWins.length > 0){
    return myWins[0]; // [row, col]
  }

  // 2) 즉시방어
  const opp = (aiPlayer===1? 2: 1);
  const oppWins = findImmediateWinMoves(board, opp);
  if(oppWins.length > 0){
    return oppWins[0]; // [row, col]
  }

  // 3) Iterative Deepening
  let bestMove = [Math.floor(BOARD_SIZE/2), Math.floor(BOARD_SIZE/2)]; // fallback
  for(let depth=1; depth<= params.maxDepth; depth++){
    const [mv, score] = alphaBetaRoot(board, depth, aiPlayer, difficultyKey);
    if(mv) bestMove = mv;
    // (여기에서 시간제한 체크 등 가능)
  }
  return bestMove;
}

/** alphaBetaRoot: depth 최상위 루프 */
function alphaBetaRoot(board, depth, aiPlayer, difficultyKey){
  let bestScore = -Infinity;
  let bestMove = null;

  // candidate moves
  let moves = generateCandidateMoves(board);
  // move ordering
  moves = moves.map(([r,c])=>{
    board[r][c] = aiPlayer;
    const sc = evaluateBoardPlus(board, aiPlayer, difficultyKey);
    board[r][c] = 0;
    return { r,c, sc };
  });
  moves.sort((a,b)=> b.sc - a.sc);

  const { beamWidth } = difficultyParams[difficultyKey] || {};
  if(moves.length> beamWidth){
    moves = moves.slice(0, beamWidth);
  }

  let alpha = -Infinity;
  let beta = +Infinity;
  for(const mv of moves){
    board[mv.r][mv.c] = aiPlayer;
    const val = alphaBeta(board, depth-1, alpha, beta, false, aiPlayer, difficultyKey);
    board[mv.r][mv.c] = 0;

    if(val> bestScore){
      bestScore = val;
      bestMove = [mv.r, mv.c];
    }
    alpha = Math.max(alpha, val);
    if(alpha>=beta) break;
  }

  return [bestMove, bestScore];
}

/** alphaBeta (with TT) */
function alphaBeta(board, depth, alpha, beta, maximizing, aiPlayer, difficultyKey){
  if(depth===0 || checkGameOver(board)){
    return evaluateBoardPlus(board, aiPlayer, difficultyKey);
  }

  const hash= computeHash(board);
  const ttEntry= TT[hash];
  if(ttEntry && ttEntry.depth>= depth){
    // TT hit
    if(ttEntry.flag==="EXACT") return ttEntry.value;
    if(ttEntry.flag==="ALPHA" && ttEntry.value> alpha) alpha= ttEntry.value;
    if(ttEntry.flag==="BETA" && ttEntry.value< beta)  beta= ttEntry.value;
    if(alpha>=beta) return ttEntry.value;
  }

  const params= difficultyParams[difficultyKey] || {};
  const { beamWidth } = params;

  if(maximizing){
    let value= -Infinity;
    let moves= generateCandidateMoves(board);

    // order desc
    moves = moves.map(([r,c])=>{
      board[r][c] = aiPlayer;
      const sc= evaluateBoardPlus(board, aiPlayer, difficultyKey);
      board[r][c] = 0;
      return {r,c, sc};
    });
    moves.sort((a,b)=> b.sc - a.sc);
    if(moves.length> beamWidth){
      moves= moves.slice(0, beamWidth);
    }

    for(const mv of moves){
      board[mv.r][mv.c]= aiPlayer;
      const score= alphaBeta(board, depth-1, alpha,beta, false, aiPlayer, difficultyKey);
      board[mv.r][mv.c]= 0;

      value= Math.max(value, score);
      alpha= Math.max(alpha, value);
      if(alpha>=beta) break;
    }

    let flag="EXACT";
    if(value<= alpha) flag="ALPHA";
    if(value>= beta)  flag="BETA";
    TT[hash]= { depth, flag, value };

    return value;
  } else {
    let value= +Infinity;
    const opp= (aiPlayer===1?2:1);

    let moves= generateCandidateMoves(board);
    // order asc
    moves= moves.map(([r,c])=>{
      board[r][c]= opp;
      const sc= evaluateBoardPlus(board, aiPlayer, difficultyKey);
      board[r][c]=0;
      return {r,c, sc};
    });
    moves.sort((a,b)=> a.sc - b.sc);
    if(moves.length> beamWidth){
      moves= moves.slice(0, beamWidth);
    }

    for(const mv of moves){
      board[mv.r][mv.c]= opp;
      const score= alphaBeta(board, depth-1, alpha,beta, true, aiPlayer, difficultyKey);
      board[mv.r][mv.c]= 0;

      value= Math.min(value, score);
      beta= Math.min(beta, value);
      if(alpha>=beta) break;
    }

    let flag="EXACT";
    if(value<= alpha) flag="ALPHA";
    if(value>= beta)  flag="BETA";
    TT[hash]= { depth, flag, value };

    return value;
  }
}

/** evaluateBoardPlus: 평가 + (난이도별) 추가 보너스 */
function evaluateBoardPlus(board, aiPlayer, difficultyKey){
  const base= evaluateBoard(board, aiPlayer, difficultyKey);
  const params= difficultyParams[difficultyKey]||{};
  if(params.isExpert){
    // 정석/주형 감지
    let bonus= detectAdvancedOpeningPattern(board, aiPlayer, params.isGrandmaster);
    return base+ bonus;
  }
  return base;
}

// -------------------------
// 기본 로직들
// -------------------------
function checkGameOver(board){
  if(hasFiveInARow(board)) return true;
  // 전체 빈칸 없는 경우 -> 무승부
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
      const st= board[r][c];
      if(st!==0){
        for(const [dx,dy] of dirs){
          const c1= countStonesDir(board,r,c,st,dx,dy);
          const c2= countStonesDir(board,r,c,st,-dx,-dy);
          if(c1+c2-1>=5) return true;
        }
      }
    }
  }
  return false;
}
function countStonesDir(board, r,c, player, dx,dy){
  let count=0;
  while(isInside(r,c) && board[r][c]===player){
    count++;
    r+= dx; c+= dy;
  }
  return count;
}
function isInside(r,c){
  return (r>=0 && r<BOARD_SIZE && c>=0 && c<BOARD_SIZE);
}
function findImmediateWinMoves(board, player){
  const moves=[];
  for(let r=0;r<BOARD_SIZE;r++){
    for(let c=0;c<BOARD_SIZE;c++){
      if(board[r][c]===0){
        board[r][c]= player;
        if(isFiveInARow(board, r,c, player)){
          moves.push([r,c]);
        }
        board[r][c]=0;
      }
    }
  }
  return moves;
}

/** generateCandidateMoves:
 *  - 돌 주위 MARGIN=2 범위만 후보
 *  - (삼삼/사사 금수 생략 or 별도)
 */
function generateCandidateMoves(board){
  let minR=BOARD_SIZE, maxR=0, minC=BOARD_SIZE, maxC=0;
  let hasStone=false;

  for(let r=0;r<BOARD_SIZE;r++){
    for(let c=0;c<BOARD_SIZE;c++){
      if(board[r][c]!==0){
        hasStone= true;
        if(r<minR) minR=r;
        if(r>maxR) maxR=r;
        if(c<minC) minC=c;
        if(c>maxC) maxC=c;
      }
    }
  }
  // 첫 수(돌이 하나도 없으면) -> 중앙 근처
  if(!hasStone){
    const mid= Math.floor(BOARD_SIZE/2);
    const ret=[];
    for(let rr=mid-1; rr<=mid+1; rr++){
      for(let cc=mid-1; cc<=mid+1; cc++){
        ret.push([rr,cc]);
      }
    }
    return ret;
  }

  // 주위 MARGIN=2 범위
  minR= Math.max(0, minR - MARGIN);
  maxR= Math.min(BOARD_SIZE-1, maxR + MARGIN);
  minC= Math.max(0, minC - MARGIN);
  maxC= Math.min(BOARD_SIZE-1, maxC + MARGIN);

  const moves=[];
  for(let rr=minR; rr<=maxR; rr++){
    for(let cc=minC; cc<=maxC; cc++){
      if(board[rr][cc]===0){
        moves.push([rr,cc]);
      }
    }
  }
  return moves;
}

// -------------------------
// evaluateBoard
// -------------------------
function evaluateBoard(board, aiPlayer, difficultyKey){
  const params= difficultyParams[difficultyKey]||difficultyParams.kingBeginner;
  const { stoneScore, openFour, closedFour, openThree, closedThree,
          offenseWeight, defenseWeight } = params;

  const opp= (aiPlayer===1? 2: 1);
  let aiCount=0, oppCount=0;

  for(let r=0;r<BOARD_SIZE;r++){
    for(let c=0;c<BOARD_SIZE;c++){
      if(board[r][c]=== aiPlayer) aiCount++;
      else if(board[r][c]=== opp) oppCount++;
    }
  }
  let aiVal= aiCount* stoneScore;
  let oppVal= oppCount* stoneScore;

  const aiPat= analyzePatterns(board, aiPlayer);
  aiVal += aiPat.open4*openFour + aiPat.closed4*closedFour
         + aiPat.open3*openThree + aiPat.closed3*closedThree;

  const oppPat= analyzePatterns(board, opp);
  oppVal += oppPat.open4*openFour + oppPat.closed4*closedFour
          + oppPat.open3*openThree + oppPat.closed3*closedThree;

  const score= (aiVal*offenseWeight) - (oppVal*defenseWeight);
  return score;
}

/** analyzePatterns:
 *  - open3/closed3/open4/closed4
 */
function analyzePatterns(board, player){
  let open3=0, closed3=0, open4=0, closed4=0;
  const dirs=[[0,1],[1,0],[1,1],[1,-1]];

  for(let r=0;r<BOARD_SIZE;r++){
    for(let c=0;c<BOARD_SIZE;c++){
      if(board[r][c]=== player){
        for(const [dx,dy] of dirs){
          const len= countStonesDir(board,r,c,player, dx,dy);
          if(len>=5) continue; // 이미 5목이면 여기선 추가 점수 X

          // 양끝
          const e1r= r + dx*len, e1c= c + dy*len;
          const e2r= r - dx,    e2c= c - dy;

          if(len===4){
            const side= getSides(board, e1r,e1c, e2r,e2c);
            const emptyCount= side.filter(v=>v===0).length;
            if(emptyCount===2) open4++;
            else if(emptyCount===1) closed4++;
          } else if(len===3){
            const side= getSides(board, e1r,e1c, e2r,e2c);
            const emptyCount= side.filter(v=>v===0).length;
            if(emptyCount===2) open3++;
            else if(emptyCount===1) closed3++;
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
function isFiveInARow(board, row, col, player) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for(const [dx, dy] of dirs){
    const c1 = countStonesDir(board, row, col, player, dx, dy);
    const c2 = countStonesDir(board, row, col, player, -dx, -dy);
    if(c1 + c2 -1 >= 5){
      return true;
    }
  }
  return false;
}

// -------------------------
// detectAdvancedOpeningPattern
// -------------------------
function detectAdvancedOpeningPattern(board, aiPlayer, isGM){
  // 여기서 26/28/우산/장형 등 추가 계산 가능
  // 예시는 0 리턴
  return 0;
}

// -------------------------
// helpers
// -------------------------


////////////////////////////////////////////////////
// 이 파일에서 export:
// getAiMove(...)
////////////////////////////////////////////////////
