// src/logic/initialPosition.ts
import { Square } from './engine';

export const initialPosition: Square[][] = [
   [
      { type: 'rook', color: 'black', image: 'black_rook.png', dragImage: 'black_rook.png' },
      { type: 'knight', color: 'black', image: 'black_knight.png', dragImage: 'black_knight.png' },
      { type: 'bishop', color: 'black', image: 'black_bishop.png', dragImage: 'black_bishop.png' },
      { type: 'queen', color: 'black', image: 'black_queen.png', dragImage: 'black_queen.png' },
      { type: 'king', color: 'black', image: 'black_king.png', dragImage: 'black_king.png' },
      { type: 'bishop', color: 'black', image: 'black_bishop2.png', dragImage: 'black_bishop2.png' },
      { type: 'knight', color: 'black', image: 'black_knight2.png', dragImage: 'black_knight2.png' },
      { type: 'rook', color: 'black', image: 'black_rook2.png', dragImage: 'black_rook2.png' }
    ],
    // Row 1 – Black pawns (unique per piece)
    [
      { type: 'pawn', color: 'black', image: 'black_pawn1.png', dragImage: 'black_pawn1.png' },
      { type: 'pawn', color: 'black', image: 'black_pawn2.png', dragImage: 'black_pawn2.png' },
      { type: 'pawn', color: 'black', image: 'black_pawn3.png', dragImage: 'black_pawn3.png' },
      { type: 'pawn', color: 'black', image: 'black_pawn4.png', dragImage: 'black_pawn4.png' },
      { type: 'pawn', color: 'black', image: 'black_pawn5.png', dragImage: 'black_pawn5.png' },
      { type: 'pawn', color: 'black', image: 'black_pawn6.png', dragImage: 'black_pawn6.png' },
      { type: 'pawn', color: 'black', image: 'black_pawn7.png', dragImage: 'black_pawn7.png' },
      { type: 'pawn', color: 'black', image: 'black_pawn8.png', dragImage: 'black_pawn8.png' }
    ],
    // Rows 2–5 – Empty squares
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    // Row 6 – White pawns (unique per piece)
    [
      { type: 'pawn', color: 'white', image: 'white_pawn1.png', dragImage: 'white_pawn1.png' },
      { type: 'pawn', color: 'white', image: 'white_pawn2.png', dragImage: 'white_pawn2.png' },
      { type: 'pawn', color: 'white', image: 'white_pawn3.png', dragImage: 'white_pawn3.png' },
      { type: 'pawn', color: 'white', image: 'white_pawn4.png', dragImage: 'white_pawn4.png' },
      { type: 'pawn', color: 'white', image: 'white_pawn5.png', dragImage: 'white_pawn5.png' },
      { type: 'pawn', color: 'white', image: 'white_pawn6.png', dragImage: 'white_pawn6.png' },
      { type: 'pawn', color: 'white', image: 'white_pawn7.png', dragImage: 'white_pawn7.png' },
      { type: 'pawn', color: 'white', image: 'white_pawn8.png', dragImage: 'white_pawn8.png' }
    ],
    // Row 7 – White major pieces
    [
      { type: 'rook', color: 'white', image: 'white_rook.png', dragImage: 'white_rook.png' },
      { type: 'knight', color: 'white', image: 'white_knight.png', dragImage: 'white_knight.png' },
      { type: 'bishop', color: 'white', image: 'white_bishop.png', dragImage: 'white_bishop.png' },
      { type: 'queen', color: 'white', image: 'white_queen.png', dragImage: 'white_queen.png' },
      { type: 'king', color: 'white', image: 'white_king.png', dragImage: 'white_king.png' },
      { type: 'bishop', color: 'white', image: 'white_bishop2.png', dragImage: 'white_bishop2.png' },
      { type: 'knight', color: 'white', image: 'white_knight2.png', dragImage: 'white_knight2.png' },
      { type: 'rook', color: 'white', image: 'white_rook2.png', dragImage: 'white_rook2.png' }
    ]
]