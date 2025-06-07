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

function preloadAllPieceImages(): void {
  const basePieces = ['rook','rook2', 'knight', 'knight2', 'bishop', 'bishop2', 'queen', 'king'];
  const pawnVariants = Array.from({ length: 8 }, (_, i) => `pawn${i + 1}`);
  const pieces = [...basePieces, ...pawnVariants];
  const colors = ['white', 'black'];
  const suffixes = ['', '_drag', '_check'];

  let preloadContainer = document.getElementById('preload-pieces');
  if (!preloadContainer) {
    preloadContainer = document.createElement('div');
    preloadContainer.id = 'preload-pieces';
    preloadContainer.style.position = 'absolute';
    preloadContainer.style.top = '-9999px';
    preloadContainer.style.left = '-9999px';
    document.body.appendChild(preloadContainer);
  }

  for (const color of colors) {
    for (const piece of pieces) {
      for (const suffix of suffixes) {
        if (suffix === '_check' && piece !== 'king') continue;

        const file = `${color}_${piece}${suffix}.png`;
        // Evita duplicados
        if (!document.getElementById(file)) {
          const img = new Image();
          img.id = file;
          img.src = `/assets/pieces/${file}`;
          img.style.width = '1px';
          img.style.height = '1px';
          img.onload = () => console.log(`Imagen precargada: ${file}`);
          img.onerror = () => console.warn(`No se pudo cargar: ${file}`);
          preloadContainer.appendChild(img);
        }
      }
    }
  }
}

preloadAllPieceImages();

export function showBoard(): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  // Crear el contenedor del tablero si no existe
  let boardHolder = document.getElementById('board-holder');
  if (!boardHolder) {
    boardHolder = document.createElement('div');
    boardHolder.id = 'board-holder';
    container.appendChild(boardHolder);
  }

  // Precargar imágenes
  preloadAllPieceImages();

  // Inicializar lógica
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


export function renderBoard(board: Square[][]): void {
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
        img.dataset.dragSrc = piece.dragImage || piece.image;
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
          
        });

        square.addEventListener('dragend', () => {
          img.src = `/assets/pieces/${img.dataset.defaultSrc}`;
          img.style.visibility = 'visible';
          audioManager.play('drag');
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

  const prevBoard = engine.getBoard().map(row => row.map(piece => piece ? { ...piece } : null));
  const move = playAIMove(engine, config.aiLevel);
  if (!move) {
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

  const boardDiv = document.getElementById('chess-board');
  // --- Simula drag y animación visual del movimiento de la IA ---
  if (boardDiv) {
    const fromIndex = move.from.row * 8 + move.from.col;
    const toIndex = move.to.row * 8 + move.to.col;
    const fromDiv = boardDiv.children[fromIndex] as HTMLElement;
    const toDiv = boardDiv.children[toIndex] as HTMLElement;
    const img = fromDiv?.querySelector('img');

    if (img && toDiv) {
      // Cambia a imagen drag y reproduce sonido drag
      if (img.dataset.dragSrc) {
        img.src = `/assets/pieces/${img.dataset.dragSrc}`;
      }
      audioManager.play('drag');

      // Espera un poco y luego anima el movimiento
      setTimeout(() => {
        // Obtén la posición absoluta de origen y destino
        const fromRect = img.getBoundingClientRect();
        const toRect = toDiv.getBoundingClientRect();

        // Crea una imagen flotante para animar
        const floatingImg = img.cloneNode(true) as HTMLImageElement;
        floatingImg.style.position = 'fixed';
        floatingImg.style.left = `${fromRect.left}px`;
        floatingImg.style.top = `${fromRect.top}px`;
        floatingImg.style.width = `${fromRect.width}px`;
        floatingImg.style.height = `${fromRect.height}px`;
        floatingImg.style.pointerEvents = 'none';
        floatingImg.style.transition = 'left 0.4s linear, top 0.4s linear, opacity 0.1s';

        document.body.appendChild(floatingImg);

        // Oculta la imagen original durante la animación
        img.style.visibility = 'hidden';

        // Fuerza el reflow y mueve la imagen flotante
        setTimeout(() => {
          floatingImg.style.left = `${toRect.left}px`;
          floatingImg.style.top = `${toRect.top}px`;
        }, 10);

        // Después de la animación, elimina la imagen flotante y muestra la real
   setTimeout(() => {
  floatingImg.style.opacity = '0';
  setTimeout(() => {
    document.body.removeChild(floatingImg);
    // Restaura la imagen normal
    if (img.dataset.defaultSrc) {
      img.src = `/assets/pieces/${img.dataset.defaultSrc}`;
    }
    img.style.visibility = 'visible';

    // Detecta si hay captura ANTES de mover
    const capturedPiece = prevBoard[move.to.row][move.to.col];
    const wasCapture = capturedPiece !== null;

    // Ejecuta el movimiento real
    engine.makeMove(move.from, move.to);

    // Sonido correcto
    if (wasCapture) {
      audioManager.play('capture');
    } else {
      audioManager.play('move');
    }

    const currentTurn = engine.getCurrentTurn();
    const iaColor = currentTurn === 'white' ? 'black' : 'white';

    timerManager.addIncrement(iaColor);
    timerManager.startTurn(currentTurn);

    if (engine.isInCheck(currentTurn)) {
      audioManager.play('check');
    }

    renderBoard(engine.getBoard());
    isPlayerTurn = true;

  }, 100);
}, 410);
      }, 200); // Espera inicial antes de animar (puedes ajustar)
      return; // Salir para no ejecutar el movimiento dos veces
    }
  }

  // Si no hay animación, ejecuta el movimiento real como antes
  engine.makeMove(move.from, move.to);

  const newBoard = engine.getBoard();
  const capturedPiece = prevBoard[move.to.row][move.to.col];
  const wasCapture = capturedPiece !== null && capturedPiece.color !== engine.getCurrentTurn();

  if (wasCapture) {
    audioManager.play('capture');
  } else {
    audioManager.play('move');
  }

  const currentTurn = engine.getCurrentTurn();
  const iaColor = currentTurn === 'white' ? 'black' : 'white';

  timerManager.addIncrement(iaColor);
  timerManager.startTurn(currentTurn);

  if (engine.isInCheck(currentTurn)) {
    audioManager.play('check');
  }

  renderBoard(engine.getBoard());
  isPlayerTurn = true;
}