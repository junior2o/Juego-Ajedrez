import { AudioManager } from './AudioManager';
import { initialPosition } from '../logic/initialPosition';
import { Engine, Position, Square } from '../logic/engine';
import { renderTimers } from './renderTimers';
import { TimerManager, TimeControl } from '../logic/TimerManager';
import { playAIMove } from '../logic/ai';
import { showGameOverModal } from './GameOverModal';
import { showGameModeSelector } from './GameModeSelector';
import { gameConfigManager } from '../config/GameConfigManager';

let engine: Engine;
const audioManager = new AudioManager();
let timerManager: TimerManager;
let timeControl: TimeControl = 'classic';
let isPlayerTurn = true;

export function showBoard(): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  engine = new Engine(initialPosition);
  timerManager = new TimerManager(timeControl, (loser) => {
    const config = gameConfigManager.getConfig();
    const playerColor = config.playerColor;
    const resultMessage = loser === playerColor ? 'You Lost (Time Out)' : 'You Won (Opponent Timed Out)';

    showGameOverModal(resultMessage, () => showBoard(), () => showGameModeSelector());
  });

  renderTimers(container, timerManager);
  renderBoard(engine.getBoard());

  const config = gameConfigManager.getConfig();
  isPlayerTurn = config.mode !== 'ai' || config.playerColor === 'white';

  timerManager.startTurn(engine.getCurrentTurn());

  if (config.mode === 'ai' && config.playerColor === 'black') {
    setTimeout(() => triggerAIMove(), 500);
  }
}

function renderBoard(board: Square[][]): void {
  const boardDiv = document.createElement('div');
  boardDiv.id = 'chess-board';
  boardDiv.style.display = 'grid';
  boardDiv.style.gridTemplateColumns = 'repeat(8, 1fr)';
  boardDiv.style.width = 'min(90vmin, 90vw)';
  boardDiv.style.height = 'min(90vmin, 90vw)';
  boardDiv.style.margin = 'auto';
  boardDiv.style.border = '4px solid black';

  const boardHolder = document.getElementById('board-holder')!;
  boardHolder.innerHTML = '';
  boardHolder.appendChild(boardDiv);

  let from: Position | null = null;

  const whiteInCheck = engine.isInCheck('white');
  const blackInCheck = engine.isInCheck('black');
  const config = gameConfigManager.getConfig();

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      const isLight = (row + col) % 2 === 0;
      square.style.backgroundColor = isLight ? '#c2b280' : '#6f4e37';
      square.style.width = '100%';
      square.style.height = '100%';
      square.style.position = 'relative';

      const piece = board[row][col];
      if (piece) {
        const img = document.createElement('img');
        const isKingInCheck =
          piece.type === 'king' &&
          ((piece.color === 'white' && whiteInCheck) ||
            (piece.color === 'black' && blackInCheck));

        if (isKingInCheck) {
          square.classList.add('in-check');
        }

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

        square.addEventListener('dragstart', (e) => {
          const piece = engine.getBoard()[row][col];
          if (!isPlayerTurn || !piece || piece.color !== config.playerColor) {
            e.preventDefault();
            return;
          }

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
  if (!from || !isPlayerTurn) return;
  const to = { row, col };

  const targetPiece = engine.getBoard()[to.row][to.col];
  const isCapture = targetPiece !== null;

  const moved = engine.makeMove(from, to);
  if (moved) {
    isPlayerTurn = false;

    if (isCapture) {
      audioManager.play('capture');
    }

    const previousTurn = engine.getCurrentTurn() === 'white' ? 'black' : 'white';
    timerManager.addIncrement(previousTurn);
    timerManager.startTurn(engine.getCurrentTurn());

    if (engine.isInCheck(engine.getCurrentTurn())) {
      audioManager.play('check');
    }

    renderBoard(engine.getBoard());

    const current = engine.getCurrentTurn();
    if (!engine.hasAnyLegalMove(current)) {
      const playerColor = config.playerColor;
      const playerLost = engine.isInCheck(current) && current === playerColor;
      const playerWon = engine.isInCheck(current) && current !== playerColor;
      const isStalemate = !engine.isInCheck(current);

      let resultMessage = '';
      if (playerLost) {
        resultMessage = '¡Has perdido! (Jaque mate)';
      } else if (playerWon) {
        resultMessage = '¡Has ganado! (Jaque mate)';
      } else if (isStalemate) {
        resultMessage = 'Tablas (ahogado)';
      }

      showGameOverModal(resultMessage, () => showBoard(), () => showGameModeSelector());
      return;
    }

    if (config.mode === 'ai' && engine.getCurrentTurn() !== config.playerColor) {
      setTimeout(() => triggerAIMove(), 1000);
    } else {
      isPlayerTurn = true;
    }
  }

  from = null;
});

      boardDiv.appendChild(square);
    }
  }
}

function triggerAIMove(): void {
  const config = gameConfigManager.getConfig();

  if (!config.aiLevel) {
    console.error('AI difficulty level is not set.');
    showGameOverModal('AI configuration error. Returning to main menu.', () => {
      showGameModeSelector();
    }, () => {
      showGameModeSelector();
    });
    return;
  }

  const moved = playAIMove(engine, config.aiLevel);
  if (!moved) {
    const color = engine.getCurrentTurn();
    const playerColor = config.playerColor;
    const playerLost = engine.isInCheck(color) && color === playerColor;
    const playerWon = engine.isInCheck(color) && color !== playerColor;
    const isStalemate = !engine.isInCheck(color);

    

    let resultMessage = '';
    if (playerLost) {
      resultMessage = '¡Has perdido! (Jaque mate)';
    } else if (playerWon) {
      resultMessage = '¡Has ganado! (Jaque mate)';
    } else if (isStalemate) {
      resultMessage = 'Tablas (ahogado)';
    }

    showGameOverModal(resultMessage, () => showBoard(), () => showGameModeSelector());
    return;
  }

  // Calcula el turno anterior (el que acaba de mover la IA)
  const previousTurn = engine.getCurrentTurn() === 'white' ? 'black' : 'white';
  timerManager.addIncrement(previousTurn);
  timerManager.startTurn(engine.getCurrentTurn());

  if (engine.isInCheck(engine.getCurrentTurn())) {
    audioManager.play('check');
  }

  renderBoard(engine.getBoard());
  isPlayerTurn = true;
}