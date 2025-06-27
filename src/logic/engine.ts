// ../logic/engine.ts

export type Position = {
  row: number;
  col: number;
};

export type Square = {
  id: string; // identificador único
  type: string;
  color: 'white' | 'black';
  image: string;
  dragImage: string;
} | null;

// Generador de ids únicos para promociones (si no usas crypto.randomUUID)
let pieceIdCounter = 1000;
function getUniqueId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `piece_${pieceIdCounter++}`;
}

function deepCloneBoard(board: Square[][]): Square[][] {
  return board.map(row => row.map(piece => piece ? { ...piece } : null));
}

export class Engine {
  private board: Square[][];
  private currentTurn: 'white' | 'black';
  private hasMoved: { [key: string]: boolean } = {};
  private enPassantTarget: Position | null = null;
  private moveHistory: { from: Position; to: Position }[] = [];

  constructor(initialPosition: Square[][]) {
    this.board = deepCloneBoard(initialPosition);
    this.currentTurn = 'white';
  }

  clone(): Engine {
    const clone = new Engine(deepCloneBoard(this.board));
    clone.currentTurn = this.currentTurn;
    clone.hasMoved = { ...this.hasMoved };
    clone.enPassantTarget = this.enPassantTarget ? { ...this.enPassantTarget } : null;
    clone.moveHistory = [...this.moveHistory];
    return clone;
  }

  isInCheck(color: 'white' | 'black'): boolean {
    let king: Position | null = null;
    // Busca la posición del rey del color dado
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece?.type === 'king' && piece.color === color) {
          king = { row: r, col: c };
          break;
        }
      }
      if (king) break;
    }
    if (!king) return false;

    // Busca si alguna pieza enemiga puede atacar al rey
    const enemyColor = color === 'white' ? 'black' : 'white';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === enemyColor) {
          const moves = this.getRawMoves({ row: r, col: c }, true);
          if (moves.some(pos => pos.row === king!.row && pos.col === king!.col)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getBoard(): Square[][] {
    return deepCloneBoard(this.board);
  }

  getCurrentTurn(): 'white' | 'black' {
    return this.currentTurn;
  }

  getMoveHistory(): { from: Position; to: Position }[] {
    return [...this.moveHistory];
  }

  makeMove(from: Position, to: Position): boolean {
    const piece = this.board[from.row][from.col];
    if (!piece) return false;

    const legalMoves = this.getLegalMoves(from);
    const isLegal = legalMoves.some(pos => pos.row === to.row && pos.col === to.col);
    if (!isLegal) return false;

    this.applyMove(from, to);
    return true;
  }

  applyMove(from: Position, to: Position): void {
    const piece = this.board[from.row][from.col]!;

    this.hasMoved[piece.id] = true;

    this.moveHistory.push({ from: { ...from }, to: { ...to } });

    if (piece.type === 'pawn' && this.enPassantTarget && to.row === this.enPassantTarget.row && to.col === this.enPassantTarget.col) {
      const dir = piece.color === 'white' ? 1 : -1;
      this.board[to.row + dir][to.col] = null;
    }

    // Enroque: mueve la torre
    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      const row = from.row;
      if (to.col === 6) {
        this.board[row][5] = this.board[row][7];
        this.board[row][7] = null;
      } else if (to.col === 2) {
        this.board[row][3] = this.board[row][0];
        this.board[row][0] = null;
      }
    }

    this.board[to.row][to.col] = piece;
    this.board[from.row][from.col] = null;
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';

    if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
      this.enPassantTarget = { row: (from.row + to.row) / 2, col: from.col };
    } else {
      this.enPassantTarget = null;
    }

    const lastRow = piece.color === 'white' ? 0 : 7;
    if (piece.type === 'pawn' && to.row === lastRow) {
      this.board[to.row][to.col] = {
        id: getUniqueId(),
        type: 'queen',
        color: piece.color,
        image: `${piece.color}_queen.png`,
        dragImage: `${piece.color}_queen_drag.png`
      };
    }
  }

  getLegalMoves(from: Position): Position[] {
    const piece = this.board[from.row][from.col];
    if (!piece) return [];
    const color = piece.color;
    const moves: Position[] = [];

    const add = (r: number, c: number) => {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = this.board[r][c];
        if (!target || target.color !== color) {
          moves.push({ row: r, col: c });
        }
      }
    };

    if (piece.type === 'pawn') {
      const dir = color === 'white' ? -1 : 1;
      const startRow = color === 'white' ? 6 : 1;
      const one = from.row + dir;
      const two = from.row + dir * 2;

      if (this.board[one]?.[from.col] === null) {
        moves.push({ row: one, col: from.col });
        if (from.row === startRow && this.board[two]?.[from.col] === null) {
          moves.push({ row: two, col: from.col });
        }
      }

      for (const dc of [-1, 1]) {
        const col = from.col + dc;
        const row = from.row + dir;
        if (col >= 0 && col < 8) {
          const target = this.board[row]?.[col];
          if (target && target.color !== color) moves.push({ row, col });
          if (this.enPassantTarget?.row === row && this.enPassantTarget.col === col) {
            moves.push({ row, col });
          }
        }
      }
    }

    if (piece.type === 'knight') {
      [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]].forEach(([dr, dc]) => add(from.row + dr, from.col + dc));
    }

    const bishopDirs: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    const rookDirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const queenDirs: [number, number][] = [...bishopDirs, ...rookDirs];

    const directions: [number, number][] = [];
    if (piece.type === 'bishop') directions.push(...bishopDirs);
    if (piece.type === 'rook') directions.push(...rookDirs);
    if (piece.type === 'queen') directions.push(...queenDirs);

    for (const [dr, dc] of directions) {
      let r = from.row + dr, c = from.col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        const target = this.board[r][c];
        if (!target) {
          moves.push({ row: r, col: c });
        } else {
          if (target.color !== color) moves.push({ row: r, col: c });
          break;
        }
        r += dr;
        c += dc;
      }
    }

    if (piece.type === 'king') {
      for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
        add(from.row + dr, from.col + dc);
      }

      // --- ENROQUE ---
      // Solo si el rey no se ha movido y no está en jaque
      if (!this.hasMoved[piece.id] && !this.isInCheck(color)) {
        const row = from.row;
        // Enroque corto (rey lado rey)
        const rookShort = this.board[row][7];
        if (
          rookShort &&
          rookShort.type === 'rook' &&
          rookShort.color === color &&
          !this.hasMoved[rookShort.id] &&
          this.board[row][5] === null &&
          this.board[row][6] === null
        ) {
          // Verifica que las casillas que atraviesa el rey no estén atacadas
          const squaresSafe = !this.isAttacked({ row, col: 5 }, color) && !this.isAttacked({ row, col: 6 }, color);
          if (squaresSafe) {
            moves.push({ row, col: 6 });
          }
        }
        // Enroque largo (rey lado dama)
        const rookLong = this.board[row][0];
        if (
          rookLong &&
          rookLong.type === 'rook' &&
          rookLong.color === color &&
          !this.hasMoved[rookLong.id] &&
          this.board[row][1] === null &&
          this.board[row][2] === null &&
          this.board[row][3] === null
        ) {
          const squaresSafe = !this.isAttacked({ row, col: 2 }, color) && !this.isAttacked({ row, col: 3 }, color);
          if (squaresSafe) {
            moves.push({ row, col: 2 });
          }
        }
      }
    }

    return moves.filter(to => {
      const clone = this.clone();
      clone.applyMove(from, to);
      return !clone.isInCheck(color);
    });
  }

  hasAnyLegalMove(color: 'white' | 'black'): boolean {
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row][col];
        if (piece?.color === color) {
          if (this.getLegalMoves({ row, col }).length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private getRawMoves(from: Position, forAttack = false): Position[] {
    const piece = this.board[from.row][from.col];
    if (!piece) return [];
    const color = piece.color;
    const moves: Position[] = [];

    const add = (r: number, c: number) => {
      if (r >= 0 && r < 8 && c >= 0 && c < 8) {
        moves.push({ row: r, col: c });
      }
    };

    if (piece.type === 'pawn') {
      const dir = color === 'white' ? -1 : 1;
      const startRow = color === 'white' ? 6 : 1;
      const one = from.row + dir;
      const two = from.row + dir * 2;

      if (!forAttack) {
        if (this.board[one]?.[from.col] === null) {
          moves.push({ row: one, col: from.col });
          if (from.row === startRow && this.board[two]?.[from.col] === null) {
            moves.push({ row: two, col: from.col });
          }
        }
      }

      for (const dc of [-1, 1]) {
        const col = from.col + dc;
        const row = from.row + dir;
        if (col >= 0 && col < 8 && row >= 0 && row < 8) {
          moves.push({ row, col });
        }
      }
    }

    if (piece.type === 'knight') {
      [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]].forEach(([dr, dc]) => add(from.row + dr, from.col + dc));
    }

    const bishopDirs: [number, number][] = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    const rookDirs: [number, number][] = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    const queenDirs: [number, number][] = [...bishopDirs, ...rookDirs];

    const directions: [number, number][] = [];
    if (piece.type === 'bishop') directions.push(...bishopDirs);
    if (piece.type === 'rook') directions.push(...rookDirs);
    if (piece.type === 'queen') directions.push(...queenDirs);

    for (const [dr, dc] of directions) {
      let r = from.row + dr, c = from.col + dc;
      while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        add(r, c);
        if (this.board[r][c]) break;
        r += dr;
        c += dc;
      }
    }

    if (piece.type === 'king') {
      for (const [dr, dc] of [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]) {
        add(from.row + dr, from.col + dc);
      }
    }

    return moves;
  }

  // --- Añadido para enroque ---
  private isAttacked(pos: Position, color: 'white' | 'black'): boolean {
    const enemyColor = color === 'white' ? 'black' : 'white';
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = this.board[r][c];
        if (piece && piece.color === enemyColor) {
          const moves = this.getRawMoves({ row: r, col: c }, true);
          if (moves.some(m => m.row === pos.row && m.col === pos.col)) {
            return true;
          }
        }
      }
    }
    return false;
  }
}