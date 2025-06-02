import {
  bishopEvalBlack,
  bishopEvalWhite,
  evalQueen,
  kingEvalBlack,
  kingEvalWhite,
  knightEval,
  pawnEvalBlack,
  pawnEvalWhite,
  rookEvalBlack,
  rookEvalWhite,
} from "./pieceEvaluations";

export const getPieceValue = function (piece, x: number, y: number): number {
  if (piece === null) {
    return 0;
  }
  const getAbsoluteValue = function (
    piece,
    isWhite: boolean,
    x: number,
    y: number
  ) {
    if (piece.type === "p") {
      return 10 + (isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x]);
    } else if (piece.type === "r") {
      return 50 + (isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x]);
    } else if (piece.type === "n") {
      return 30 + knightEval[y][x];
    } else if (piece.type === "b") {
      return 30 + (isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x]);
    } else if (piece.type === "q") {
      return 90 + evalQueen[y][x];
    } else if (piece.type === "k") {
      return 900 + (isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x]);
    }
    throw new Error("Unknown piece type: " + piece.type);
  };

  const absoluteValue = getAbsoluteValue(piece, piece.color === "w", x, y);
  return piece.color === "w" ? absoluteValue : -absoluteValue;
};

export const evaluateBoard = function (board) {
  let totalEvaluation = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      totalEvaluation = totalEvaluation + getPieceValue(board[i][j], i, j);
    }
  }
  return totalEvaluation;
};

export const minimax = function (
  depth: number,
  game: any,
  alpha: number,
  beta: number,
  isMaximisingPlayer: boolean,
  startDate: Date
) {
  const time = new Date().getTime();
  if (depth === 0 || time - startDate.getTime() > depth * 1000) {
    return -evaluateBoard(game.board());
  }

  const newGameMoves = game.moves();

  if (isMaximisingPlayer) {
    let bestMove = -9999;
    for (let i = 0; i < newGameMoves.length; i++) {
      game.move(newGameMoves[i]);
      bestMove = Math.max(
        bestMove,
        minimax(depth - 1, game, alpha, beta, false, startDate)
      );
      game.undo();
      alpha = Math.max(alpha, bestMove);
      if (beta <= alpha) {
        break;
      }
    }
    return bestMove;
  } else {
    let bestMove = 9999;
    for (let i = 0; i < newGameMoves.length; i++) {
      game.move(newGameMoves[i]);
      bestMove = Math.min(
        bestMove,
        minimax(depth - 1, game, alpha, beta, true, startDate)
      );
      game.undo();
      beta = Math.min(beta, bestMove);
      if (beta <= alpha) {
        break;
      }
    }
    return bestMove;
  }
};

export const minimaxRoot = function (
  depth: number,
  game: any,
  isMaximisingPlayer: boolean,
  startDate: Date
) {
  const newGameMoves = game.moves();
  let bestMove = isMaximisingPlayer ? -9999 : 9999;
  let bestMoveFound;
  console.log(newGameMoves);

  for (let i = 0; i < newGameMoves.length; i++) {
    const newGameMove = newGameMoves[i];
    game.move(newGameMove);
    const value = minimax(
      depth - 1,
      game,
      -10000,
      10000,
      !isMaximisingPlayer,
      startDate
    );
    game.undo();
    if (isMaximisingPlayer && value > bestMove) {
      bestMove = value;
      bestMoveFound = newGameMove;
    } else if (!isMaximisingPlayer && value < bestMove) {
      bestMove = value;
      bestMoveFound = newGameMove;
    }
  }
  return bestMoveFound;
};
