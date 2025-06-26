// src/logic/ai.ts

import { Engine, Position } from './engine';
import { AIDifficulty } from '../types/AIDifficulty';

const openingBook: Record<string, { from: Position; to: Position }[][]> = {
  white: [
    [
      { from: { row: 6, col: 4 }, to: { row: 4, col: 4 } }, // e4
      { from: { row: 7, col: 6 }, to: { row: 5, col: 5 } }, // Nf3
    ],
    [
      { from: { row: 6, col: 3 }, to: { row: 4, col: 3 } }, // d4
      { from: { row: 7, col: 1 }, to: { row: 5, col: 2 } }, // Nc3
    ]
  ],
  black: [
    [
      { from: { row: 1, col: 4 }, to: { row: 3, col: 4 } }, // e5
      { from: { row: 0, col: 6 }, to: { row: 2, col: 5 } }, // Nf6
    ],
    [
      { from: { row: 1, col: 3 }, to: { row: 3, col: 3 } }, // d5
      { from: { row: 0, col: 1 }, to: { row: 2, col: 2 } }, // Nc6
    ]
  ]
};

function evaluateBoard(board: any[][], aiColor: string, engine?: Engine): number {
  if (engine) {
    const current = engine.getCurrentTurn();
    if (!engine.hasAnyLegalMove(current) && engine.isInCheck(current)) {
      return current !== aiColor ? 10000 : -10000;
    }
    if (!engine.hasAnyLegalMove(current) && !engine.isInCheck(current)) {
      return 0;
    }
  }
  const pieceValues: Record<string, number> = {
    pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100
  };
  let score = 0;
  let pieceCount = 0;
  let enemyKingPos: Position | null = null;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = pieceValues[piece.type];
        score += piece.color === aiColor ? value : -value;
        pieceCount++;
        if (piece.type === 'king' && piece.color !== aiColor) {
          enemyKingPos = { row, col };
        }
      }
    }
  }
  if (engine) {
    const myMoves = getAllLegalMoves(engine).length;
    const originalTurn = engine.getCurrentTurn();
    (engine as any).currentTurn = originalTurn === 'white' ? 'black' : 'white';
    const oppMoves = getAllLegalMoves(engine).length;
    (engine as any).currentTurn = originalTurn;
    score += 0.1 * (myMoves - oppMoves);
  }
  if (pieceCount <= 5 && enemyKingPos) {
    const corners = [
      { row: 0, col: 0 }, { row: 0, col: 7 }, { row: 7, col: 0 }, { row: 7, col: 7 }
    ];
    const minDist = Math.min(...corners.map(c => Math.abs(c.row - enemyKingPos!.row) + Math.abs(c.col - enemyKingPos!.col)));
    score += (14 - minDist) * 0.5;
  }
  score += Math.random() * 0.01;
  return score;
}

function getAllLegalMoves(engine: Engine): { from: Position; to: Position }[] {
  const board = engine.getBoard();
  const color = engine.getCurrentTurn();
  const moves: { from: Position; to: Position }[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const from = { row, col };
        for (const to of engine.getLegalMoves(from)) {
          moves.push({ from, to });
        }
      }
    }
  }
  return moves;
}

function minimax(engine: Engine, depth: number, maximizing: boolean, aiColor: string): number {
  if (depth === 0 || getAllLegalMoves(engine).length === 0) {
    return evaluateBoard(engine.getBoard(), aiColor, engine);
  }
  const moves = getAllLegalMoves(engine);
  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const cloned = engine.clone();
      cloned.makeMove(move.from, move.to);
      const evalScore = minimax(cloned, depth - 1, false, aiColor);
      maxEval = Math.max(maxEval, evalScore);
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const cloned = engine.clone();
      cloned.makeMove(move.from, move.to);
      const evalScore = minimax(cloned, depth - 1, true, aiColor);
      minEval = Math.min(minEval, evalScore);
    }
    return minEval;
  }
}

function alphabeta(engine: Engine, depth: number, alpha: number, beta: number, maximizing: boolean, aiColor: string): number {
  if (depth === 0 || getAllLegalMoves(engine).length === 0) {
    return evaluateBoard(engine.getBoard(), aiColor, engine);
  }
  const moves = getAllLegalMoves(engine);
  if (maximizing) {
    let value = -Infinity;
    for (const move of moves) {
      const cloned = engine.clone();
      cloned.makeMove(move.from, move.to);
      value = Math.max(value, alphabeta(cloned, depth - 1, alpha, beta, false, aiColor));
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  } else {
    let value = Infinity;
    for (const move of moves) {
      const cloned = engine.clone();
      cloned.makeMove(move.from, move.to);
      value = Math.min(value, alphabeta(cloned, depth - 1, alpha, beta, true, aiColor));
      beta = Math.min(beta, value);
      if (beta <= alpha) break;
    }
    return value;
  }
}

export function playAIMove(engine: Engine, level: AIDifficulty): { from: Position; to: Position; capture: boolean; checkmate?: boolean } | null {
  const board = engine.getBoard();
  const aiColor = engine.getCurrentTurn();
  const legalMoves: { from: Position; to: Position; capture: boolean }[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === aiColor) {
        const from: Position = { row, col };
        for (const to of engine.getLegalMoves(from)) {
          const target = board[to.row][to.col];
          legalMoves.push({ from, to, capture: !!target });
        }
      }
    }
  }

  if (legalMoves.length === 0) return null;

  const turnNumber = (engine as any).getMoveHistory?.().length ?? 0;
  if (level !== 'easy' && turnNumber < 4) {
    const possibleOpenings = openingBook[aiColor];
    const opening = possibleOpenings[Math.floor(Math.random() * possibleOpenings.length)];
    const move = opening[turnNumber / 2];
    if (move && engine.getLegalMoves(move.from).some(m => m.row === move.to.row && m.col === move.to.col)) {
      const moved = engine.makeMove(move.from, move.to);
      const target = board[move.to.row][move.to.col];
      return moved ? {
        from: move.from,
        to: move.to,
        capture: !!target
      } : null;
    }
  }

  for (const move of legalMoves) {
    const cloned = engine.clone();
    cloned.makeMove(move.from, move.to);
    const enemyTurn = cloned.getCurrentTurn();
    if (!cloned.hasAnyLegalMove(enemyTurn) && cloned.isInCheck(enemyTurn)) {
      const moved = engine.makeMove(move.from, move.to);
      return moved ? {
        from: move.from,
        to: move.to,
        capture: move.capture,
        checkmate: true
      } : null;
    }
  }

  let bestMoves: typeof legalMoves = [];
  let bestScore = -Infinity;

  if (level === 'easy') {
    const captures = legalMoves.filter(m => m.capture);
    bestMoves = captures.length > 0 ? [captures[Math.floor(Math.random() * captures.length)]] : [legalMoves[Math.floor(Math.random() * legalMoves.length)]];
  } else {
    const depth = level === 'medium' ? 1 : 2;
    for (const move of legalMoves) {
      const cloned = engine.clone();
      cloned.makeMove(move.from, move.to);
      const score = level === 'medium'
        ? minimax(cloned, depth - 1, false, aiColor)
        : alphabeta(cloned, depth - 1, -Infinity, Infinity, false, aiColor);
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }
  }

  const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];
  const moved = engine.makeMove(selectedMove.from, selectedMove.to);
  const opponent = engine.getCurrentTurn();
  const isMate = !engine.hasAnyLegalMove(opponent) && engine.isInCheck(opponent);

  return moved ? {
    from: selectedMove.from,
    to: selectedMove.to,
    capture: selectedMove.capture,
    checkmate: isMate
  } : null;
}
