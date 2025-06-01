import { Engine, Position } from './engine';
import { AIDifficulty } from '../types/AIDifficulty';

// Evaluación mejorada: material + movilidad + factor aleatorio
function evaluateBoard(board: any[][], aiColor: string, engine?: Engine): number {
   if (engine) {
    const current = engine.getCurrentTurn();
    // Si el rival no tiene movimientos y está en jaque: mate a favor
    if (!engine.hasAnyLegalMove(current) && engine.isInCheck(current)) {
      // Si el turno es del rival, mate a favor de la IA
      return current !== aiColor ? 10000 : -10000;
    }
    // Si el rival no tiene movimientos y NO está en jaque: tablas
    if (!engine.hasAnyLegalMove(current) && !engine.isInCheck(current)) {
      return 0;
    }
  }
  const pieceValues: Record<string, number> = {
    pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 100
  };
  let score = 0;
  for (const row of board) {
    for (const piece of row) {
      if (piece) {
        const value = pieceValues[piece.type];
        score += piece.color === aiColor ? value : -value;
      }
    }
  }
  // Movilidad (si tienes acceso al engine)
  if (engine) {
    const myMoves = getAllLegalMoves(engine).length;
    // Cambia el turno para contar los del rival
    const originalTurn = engine.getCurrentTurn();
    (engine as any).currentTurn = originalTurn === 'white' ? 'black' : 'white';
    const oppMoves = getAllLegalMoves(engine).length;
    (engine as any).currentTurn = originalTurn; // restaurar turno
    score += 0.1 * (myMoves - oppMoves);
  }
  // Pequeño factor aleatorio para evitar ciclos exactos
  score += Math.random() * 0.01;
  return score;
}

// Obtiene todos los movimientos legales para el turno actual
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

// Minimax puro
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
      if (evalScore > maxEval) maxEval = evalScore;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const cloned = engine.clone();
      cloned.makeMove(move.from, move.to);
      const evalScore = minimax(cloned, depth - 1, true, aiColor);
      if (evalScore < minEval) minEval = evalScore;
    }
    return minEval;
  }
}

// Minimax con poda alfa-beta
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

export function playAIMove(engine: Engine, level: AIDifficulty): { from: Position; to: Position } | null {
  const board = engine.getBoard();
  const aiColor = engine.getCurrentTurn();
  const legalMoves: { from: Position; to: Position; capture: boolean }[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === aiColor) {
        const from: Position = { row, col };
        const moves = engine.getLegalMoves(from);
        for (const to of moves) {
          const target = board[to.row][to.col];
          legalMoves.push({ from, to, capture: !!target });
        }
      }
    }
  }

  if (legalMoves.length === 0) {
    return null; // No legal moves → checkmate or stalemate
  }

  let bestMoves: typeof legalMoves = [];
  let bestScore = -Infinity;

  if (level === 'easy') {
    const captures = legalMoves.filter(m => m.capture);
    bestMoves = captures.length > 0
      ? [captures[Math.floor(Math.random() * captures.length)]]
      : [legalMoves[Math.floor(Math.random() * legalMoves.length)]];
  } else if (level === 'medium') {
    // Minimax profundidad 3
    for (const move of legalMoves) {
      const cloned = engine.clone();
      cloned.makeMove(move.from, move.to);
      const score = minimax(cloned, 2, false, aiColor);
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }
  } else if (level === 'hard') {
    // Alfa-beta profundidad 3
    for (const move of legalMoves) {
      const cloned = engine.clone();
      cloned.makeMove(move.from, move.to);
      const score = alphabeta(cloned, 2, -Infinity, Infinity, false, aiColor);
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }
  } else {
    bestMoves = [legalMoves[Math.floor(Math.random() * legalMoves.length)]];
  }

  // Desempate aleatorio entre los mejores movimientos
  const selectedMove = bestMoves[Math.floor(Math.random() * bestMoves.length)];

  const moved = engine.makeMove(selectedMove.from, selectedMove.to);
  return moved ? { from: selectedMove.from, to: selectedMove.to } : null;
}