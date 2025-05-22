// src/logic/engine.ts

export type Position = { row: number; col: number };

export type PieceData = {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
  image: string;
  dragImage: string;
};

export type Square = PieceData | null;

export class Engine {
  private board: Square[][];
  private currentTurn: 'white' | 'black' = 'white';

  constructor(initialBoard: Square[][]) {
    this.board = initialBoard;
  }

 getCurrentTurn(): 'white' | 'black' {
  return this.currentTurn;
}


  getPiece(position: Position): PieceData | null {
    return this.board[position.row][position.col];
  }

  getLegalMoves(from: Position): Position[] {
    const piece = this.getPiece(from);
    if (!piece || piece.color !== this.currentTurn) return [];

    const moves: Position[] = [];

    const directions: Record<string, Position[]> = {
      rook: [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 }
      ],
      bishop: [
        { row: -1, col: -1 },
        { row: -1, col: 1 },
        { row: 1, col: -1 },
        { row: 1, col: 1 }
      ],
      queen: [
        { row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 },
        { row: -1, col: -1 }, { row: -1, col: 1 }, { row: 1, col: -1 }, { row: 1, col: 1 }
      ],
      king: [
        { row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 },
        { row: -1, col: -1 }, { row: -1, col: 1 }, { row: 1, col: -1 }, { row: 1, col: 1 }
      ],
      knight: [
        { row: -2, col: -1 }, { row: -2, col: 1 },
        { row: -1, col: -2 }, { row: -1, col: 2 },
        { row: 1, col: -2 }, { row: 1, col: 2 },
        { row: 2, col: -1 }, { row: 2, col: 1 }
      ]
    };

    const isInside = (row: number, col: number) =>
      row >= 0 && row < 8 && col >= 0 && col < 8;

    const pushMove = (r: number, c: number) => {
      const target = this.board[r][c];
      if (!target || target.color !== piece.color) moves.push({ row: r, col: c });
    };

    const { row, col } = from;

    if (piece.type === 'pawn') {
      const dir = piece.color === 'white' ? -1 : 1;
      const startRow = piece.color === 'white' ? 6 : 1;

      // forward
      if (isInside(row + dir, col) && !this.board[row + dir][col]) {
        moves.push({ row: row + dir, col });
        if (row === startRow && !this.board[row + 2 * dir][col]) {
          moves.push({ row: row + 2 * dir, col });
        }
      }

      // capture diagonals
      for (const dc of [-1, 1]) {
        const nr = row + dir;
        const nc = col + dc;
        if (isInside(nr, nc)) {
          const target = this.board[nr][nc];
          if (target && target.color !== piece.color) {
            moves.push({ row: nr, col: nc });
          }
        }
      }
    }

    if (piece.type === 'rook' || piece.type === 'bishop' || piece.type === 'queen') {
      const dirs = directions[piece.type === 'queen' ? 'queen' : piece.type];
      for (const d of dirs) {
        let r = row + d.row;
        let c = col + d.col;
        while (isInside(r, c)) {
          const target = this.board[r][c];
          if (!target) {
            moves.push({ row: r, col: c });
          } else {
            if (target.color !== piece.color) moves.push({ row: r, col: c });
            break;
          }
          r += d.row;
          c += d.col;
        }
      }
    }

    if (piece.type === 'knight' || piece.type === 'king') {
      for (const d of directions[piece.type]) {
        const r = row + d.row;
        const c = col + d.col;
        if (isInside(r, c)) pushMove(r, c);
      }

      // TODO: castling for king
    }

    // Filter out moves that would put king in check
    return moves; // Por ahora sin validación de jaque
  }

  makeMove(from: Position, to: Position): boolean {
    const legalMoves = this.getLegalMoves(from);
    const isLegal = legalMoves.some(m => m.row === to.row && m.col === to.col);
    if (!isLegal) return false;

    const piece = this.getPiece(from);
    if (!piece) return false;

    this.board[to.row][to.col] = piece;
    this.board[from.row][from.col] = null;

    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
    return true;
  }

  getBoard(): Square[][] {
    return this.board;
  }
  isInCheck(color: 'white' | 'black'): boolean {
  const opponent = color === 'white' ? 'black' : 'white';
  const kingPosition = this.findKing(color);
  if (!kingPosition) return false;

  // Simula que el rival mueve todas sus piezas. Si alguna puede capturar al rey → jaque
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = this.board[row][col];
      if (piece && piece.color === opponent) {
        const moves = this.getLegalMoves({ row, col });
        if (moves.some(m => m.row === kingPosition.row && m.col === kingPosition.col)) {
          return true;
        }
      }
    }
  }

  return false;
}

private findKing(color: 'white' | 'black'): Position | null {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = this.board[row][col];
      if (piece?.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
}

}
