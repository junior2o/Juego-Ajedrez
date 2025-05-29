import { Engine, Position } from './engine';
import { AIDifficulty } from '../types/AIDifficulty';

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

  let selectedMove;

  if (level === 'easy') {
    const captures = legalMoves.filter(m => m.capture);
    selectedMove = captures.length > 0
      ? captures[Math.floor(Math.random() * captures.length)]
      : legalMoves[Math.floor(Math.random() * legalMoves.length)];
  } else if (level === 'medium') {
    legalMoves.sort((a, b) => Number(b.capture) - Number(a.capture));
    selectedMove = legalMoves[Math.floor(Math.random() * Math.min(3, legalMoves.length))];
  } else if (level === 'hard') {
    legalMoves.sort((a, b) => {
      const aValue = (a.capture ? 10 : 0) + (aiColor === 'white' ? -a.from.row : a.from.row);
      const bValue = (b.capture ? 10 : 0) + (aiColor === 'white' ? -b.from.row : b.from.row);
      return bValue - aValue;
    });
    selectedMove = legalMoves[0];
  } else {
    selectedMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const moved = engine.makeMove(selectedMove.from, selectedMove.to);
  return moved ? { from: selectedMove.from, to: selectedMove.to } : null;
}
