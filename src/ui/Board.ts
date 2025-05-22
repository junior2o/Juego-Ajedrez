// src/ui/Board.ts

import { AudioManager } from './AudioManager';
import { initialPosition } from '../logic/initialPosition';
import { Engine, Position, Square } from '../logic/engine';

let engine: Engine;
const audioManager = new AudioManager();

export function showBoard(): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  engine = new Engine(initialPosition);

  renderBoard(engine.getBoard());
}

function renderBoard(board: Square[][]): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  const boardDiv = document.createElement('div');
  boardDiv.id = 'chess-board';
  boardDiv.style.display = 'grid';
  boardDiv.style.gridTemplateColumns = 'repeat(8, 1fr)';
  boardDiv.style.width = 'min(90vmin, 90vw)';
  boardDiv.style.height = 'min(90vmin, 90vw)';
  boardDiv.style.margin = 'auto';
  boardDiv.style.border = '4px solid black';

  let from: Position | null = null;

  // Check if king is in check
const whiteInCheck = engine.isInCheck('white');
const blackInCheck = engine.isInCheck('black');


  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      const isLight = (row + col) % 2 === 0;
      square.style.backgroundColor = isLight ? '#f0d9b5' : '#b58863';
      square.style.width = '100%';
      square.style.height = '100%';
      square.style.position = 'relative';

      const piece = board[row][col];
      if (piece) {
        const img = document.createElement('img');
        // Check if this piece is the king and is in check
        const isKingInCheck =
          piece.type === 'king' &&
          ((piece.color === 'white' && whiteInCheck) || (piece.color === 'black' && blackInCheck));

        const imageToShow = isKingInCheck
         ? `${piece.color}_king_check.png`
          : piece.image;

        img.src = `/assets/pieces/${imageToShow}`;
        img.dataset.defaultSrc = piece.image;
        img.dataset.dragSrc = piece.dragImage;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.draggable = false;

        square.draggable = true;

        square.addEventListener('dragstart', () => {
          img.src = `/assets/pieces/${img.dataset.dragSrc}`;
          setTimeout(() => {
            img.style.visibility = 'hidden';
          }, 0);

          from = { row, col };
          audioManager.play('drag');
        });

        square.addEventListener('dragend', () => {
          img.src = `/assets/pieces/${img.dataset.defaultSrc}`;
          img.style.visibility = 'visible';
        });

        square.appendChild(img);
      }

      square.addEventListener('dragover', (e) => e.preventDefault());

      square.addEventListener('drop', () => {
        if (!from) return;
        const to = { row, col };

        const targetPiece = engine.getBoard()[to.row][to.col];
        const isCapture = targetPiece !== null;

        const moved = engine.makeMove(from, to);
        if (moved) {
          if (isCapture) {
            audioManager.play('capture');
          }

          const opponentColor = engine.getCurrentTurn(); // ya cambió turno
          if (engine.isInCheck(opponentColor)) {
            audioManager.play('check');
          }

          renderBoard(engine.getBoard());
        }

        from = null;
      });

      boardDiv.appendChild(square);
    }
  }

  container.appendChild(boardDiv);
}
