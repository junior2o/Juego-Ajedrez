//src/ui/Board.ts
import { audioManager } from './AudioManager';
import { initialPosition } from '../logic/initialPosition';
import { Engine, Position, Square } from '../logic/engine';
import { renderTimers } from './renderTimers';
import { timerManager, TimeControl } from '../logic/TimerManager';
import { playAIMove } from '../logic/ai';
import { showGameOverModal } from './GameOverModal';
import { showGameModeSelector } from './GameModeSelector';
import { gameConfigManager } from '../config/GameConfigManager';
import { canMove, sendMove, getRemoteEngine } from '../logic/remoteGame';
import '../styles/board.css';

let isPlayerTurn = true;
let selectedFrom: Position | null = null;
let selectedCellElement: HTMLElement | null = null;
let lastMove: { from: Position; to: Position } | null = null;
let showLegalMoves = true;

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

document.addEventListener('click', function unlockAudioOnce() {
  console.log('[AUDIO] Desbloqueando sonido con primer click');
  document.removeEventListener('click', unlockAudioOnce);
}, { once: true });

export function showBoard(): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  let boardHolder = document.getElementById('board-holder');
  if (!boardHolder) {
    boardHolder = document.createElement('div');
    boardHolder.id = 'board-holder';
    container.appendChild(boardHolder);
  }

  preloadAllPieceImages();

  const config = gameConfigManager.getConfig();
  let engine: Engine;
  if (config.mode === 'online') {
    engine = getRemoteEngine(); 
  } else {
    engine = new Engine(initialPosition); 
  }

  renderTimers(container, timerManager);
  renderBoard(engine, engine.getBoard());

  isPlayerTurn = config.mode !== 'ai' || config.playerColor === 'white';
  timerManager.startTurn(engine.getCurrentTurn());

  if (config.mode === 'ai' && config.playerColor === 'black') {
    setTimeout(() => triggerAIMove(engine), 500);
  }
}


export function animateRemoteMove(
  engine: Engine,
  from: { row: number; col: number },
  to: { row: number; col: number },
  callback?: () => void
): void {
  const prevBoard = engine.getBoard().map(row => row.map(p => p ? { ...p } : null));
  const boardDiv = document.getElementById('chess-board');
  console.log('[animateRemoteMove] Animando movimiento remoto', from, to);
  if (!boardDiv) {
    console.warn('[animateRemoteMove] No se encontró el tablero.');
    return;
  }

  const fromIndex = from.row * 8 + from.col;
  const toIndex = to.row * 8 + to.col;
  const fromDiv = boardDiv.children[fromIndex] as HTMLElement;
  const toDiv = boardDiv.children[toIndex] as HTMLElement;
  const img = fromDiv?.querySelector('img');

  if (img && toDiv) {
    console.log('[animateRemoteMove] Imagen encontrada para animar:', img.src);
    const dragSrc = img.dataset.dragSrc || img.dataset.defaultSrc;

    if (dragSrc) {
      img.src = `/assets/pieces/${dragSrc}`;
    }

    // Crear imagen flotante
    const fromRect = img.getBoundingClientRect();
    const toRect = toDiv.getBoundingClientRect();
    const floatingImg = img.cloneNode(true) as HTMLImageElement;
    floatingImg.style.position = 'fixed';
    floatingImg.style.left = `${fromRect.left}px`;
    floatingImg.style.top = `${fromRect.top}px`;
    floatingImg.style.width = `${fromRect.width}px`;
    floatingImg.style.height = `${fromRect.height}px`;
    floatingImg.style.pointerEvents = 'none';
    floatingImg.style.transition = 'left 0.4s linear, top 0.4s linear, opacity 0.1s';

    document.body.appendChild(floatingImg);
    img.style.visibility = 'hidden';

    // Mover la imagen flotante
    setTimeout(() => {
      floatingImg.style.left = `${toRect.left}px`;
      floatingImg.style.top = `${toRect.top}px`;
    }, 10);

    setTimeout(() => {
      floatingImg.style.opacity = '0';

      setTimeout(() => {
        document.body.removeChild(floatingImg);
        img.style.visibility = 'visible';
        img.src = `/assets/pieces/${img.dataset.defaultSrc}`;

        // Captura detectada antes de mover
        const captured = prevBoard[to.row][to.col];
        const wasCapture = captured !== null;

        engine.makeMove(from, to);
        lastMove = { from, to }; // <-- Guarda el último movimiento

        if (wasCapture) {
          audioManager.play('capture');
        } else {
          audioManager.play('move');
        }

        const currentTurn = engine.getCurrentTurn();
        const config = gameConfigManager.getConfig();
        timerManager.addIncrement(currentTurn === 'white' ? 'black' : 'white');
        timerManager.startTurn(currentTurn);

        renderBoard(engine, engine.getBoard());

        if (engine.isInCheck(currentTurn)) {
          audioManager.play('check');
        }

        if (callback) callback();

      }, 100);
    }, 1000);
  } else {
    console.warn('[animateRemoteMove] No se pudo encontrar la imagen para animar el movimiento.');
    // Si no se puede animar, aplicar movimiento directamente
    const captured = engine.getBoard()[to.row][to.col];
    const wasCapture = captured !== null;
    engine.makeMove(from, to);
    lastMove = { from, to }; // <-- Guarda el último movimiento

    audioManager.play(wasCapture ? 'capture' : 'move');

    const currentTurn = engine.getCurrentTurn();
    timerManager.addIncrement(currentTurn === 'white' ? 'black' : 'white');
    timerManager.startTurn(currentTurn);

    renderBoard(engine, engine.getBoard());

    if (engine.isInCheck(currentTurn)) {
      audioManager.play('check');
    }

    if (callback) callback();
  }
}

export function renderBoard(engine: Engine, board: Square[][]): void {
  if (!engine) {
    console.error('Engine is not initialized. Call showBoard() first.');
    return;
  }

  let boardHolder = document.getElementById('board-holder');
  if (!boardHolder) {
    const container = document.getElementById('app');
    if (!container) {
      console.error('No se encontró el contenedor #app');
      return;
    }
    boardHolder = document.createElement('div');
    boardHolder.id = 'board-holder';
    container.appendChild(boardHolder);
  }

  const boardDiv = document.createElement('div');
  boardDiv.id = 'chess-board';
  boardDiv.style.display = 'grid';
  boardDiv.style.gridTemplateColumns = 'repeat(8, 1fr)';
  boardDiv.style.width = 'min(90vmin, 90vw)';
  boardDiv.style.height = 'min(90vmin, 90vw)';
  boardDiv.style.margin = 'auto';
  boardDiv.style.border = '4px solid black';

  boardHolder.innerHTML = '';
  boardHolder.appendChild(boardDiv);

  const whiteInCheck = engine.isInCheck('white');
  const blackInCheck = engine.isInCheck('black');
  const config = gameConfigManager.getConfig();

  let legalMoves: Position[] = [];
  if (showLegalMoves && selectedFrom) {
    legalMoves = engine.getLegalMoves(selectedFrom);
  }
  
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      const isLight = (row + col) % 2 === 0;
      square.style.backgroundColor = isLight ? '#c2b280' : '#6f4e37';
      square.style.width = '100%';
      square.style.height = '100%';
      square.style.position = 'relative';

      if (row === 7) {
        const fileLabel = document.createElement('span');
        fileLabel.textContent = letters[col];
        fileLabel.className = 'cell-label file-label';
        square.appendChild(fileLabel);
      }

      if (col === 0) {
        const rankLabel = document.createElement('span');
        rankLabel.textContent = `${8 - row}`;
        rankLabel.className = 'cell-label rank-label';
        square.appendChild(rankLabel);
      }


      const piece = board[row][col];
      if (piece) {
        const img = document.createElement('img');
        const isKingInCheck = piece.type === 'king' &&
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
        img.dataset.dragSrc = isKingInCheck ? `${piece.color}_king_check.png` : (piece.dragImage || piece.image);
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.draggable = false;
        img.style.zIndex = '10';

        square.appendChild(img);

        // Agrega el punto de movimiento legal si aplica
        if (legalMoves.some(p => p.row === row && p.col === col)) {
          const dot = document.createElement('div');
          dot.className = 'legal-move-dot';
          square.appendChild(dot);
        }
      }

      if (
        showLegalMoves &&
        selectedFrom &&
        legalMoves.some(pos => pos.row === row && pos.col === col)
      ) {
        const dot = document.createElement('div');
        dot.className = 'legal-move-dot';
        square.appendChild(dot);
      }

      // --- Resalta el último movimiento ---
      if (
        lastMove &&
        (
          (row === lastMove.from.row && col === lastMove.from.col) ||
          (row === lastMove.to.row && col === lastMove.to.col)
        )
      ) {
        square.classList.add('last-move-cell');
      }

      // --- EVENTO CLICK ---
      square.addEventListener('click', () => {
        if (!isPlayerTurn || (config.mode === 'online' && !canMove())) {
          return;
        }

        const clicked = { row, col };
        const clickedPiece = board[row][col];

        // Si se hace clic sobre una pieza del propio color (o no hay selección previa)
        if (!selectedFrom || (clickedPiece && clickedPiece.color === config.playerColor)) {
          if (selectedCellElement) {
            selectedCellElement.classList.remove('selected-cell');
          }

          if (clickedPiece && clickedPiece.color === config.playerColor) {
            selectedFrom = clicked;
            selectedCellElement = null; // Se va a buscar de nuevo tras renderizar
            renderBoard(engine, engine.getBoard());

            // Después de renderizar, vuelve a marcar la celda seleccionada
            const boardDiv = document.getElementById('chess-board');
            if (boardDiv) {
              const index = clicked.row * 8 + clicked.col;
              const cell = boardDiv.children[index] as HTMLElement;
              if (cell) {
                cell.classList.add('selected-cell');
                selectedCellElement = cell;
              }
            }
            return;
          }
        }

        if (selectedFrom) {
          const moveFrom = selectedFrom;
          const isCapture = board[clicked.row][clicked.col] !== null;
          const moved = engine.makeMove(moveFrom, clicked);

          if (moved) {
            selectedFrom = null;
            if (selectedCellElement) selectedCellElement.classList.remove('selected-cell');
            selectedCellElement = null;
            isPlayerTurn = false;
            timerManager.addIncrement(config.playerColor);
            timerManager.startTurn(engine.getCurrentTurn());

            // --- Animación visual del movimiento del usuario ---
            const boardDiv = document.getElementById('chess-board');
            if (boardDiv) {
              const fromIndex = moveFrom.row * 8 + moveFrom.col;
              const toIndex = clicked.row * 8 + clicked.col;
              const fromDiv = boardDiv.children[fromIndex] as HTMLElement;
              const toDiv = boardDiv.children[toIndex] as HTMLElement;
              const img = fromDiv?.querySelector('img');

              if (img && toDiv) {
                // Cambia a imagen drag y reproduce sonido drag
                if (img.dataset.dragSrc) {
                  img.src = `/assets/pieces/${img.dataset.dragSrc}`;
                }
                //audioManager.play('drag');

                setTimeout(() => {
                  const fromRect = img.getBoundingClientRect();
                  const toRect = toDiv.getBoundingClientRect();

                  const floatingImg = img.cloneNode(true) as HTMLImageElement;
                  floatingImg.style.position = 'fixed';
                  floatingImg.style.left = `${fromRect.left}px`;
                  floatingImg.style.top = `${fromRect.top}px`;
                  floatingImg.style.width = `${fromRect.width}px`;
                  floatingImg.style.height = `${fromRect.height}px`;
                  floatingImg.style.pointerEvents = 'none';
                  floatingImg.style.transition = 'left 0.4s linear, top 0.4s linear, opacity 0.1s';

                  document.body.appendChild(floatingImg);
                  img.style.visibility = 'hidden';

                  setTimeout(() => {
                    floatingImg.style.left = `${toRect.left}px`;
                    floatingImg.style.top = `${toRect.top}px`;
                  }, 10);

                  setTimeout(() => {
                    floatingImg.style.opacity = '0';
                    setTimeout(() => {
                      document.body.removeChild(floatingImg);
                      if (img.dataset.defaultSrc) {
                        img.src = `/assets/pieces/${img.dataset.defaultSrc}`;
                      }
                      img.style.visibility = 'visible';

                      // Ejecuta el movimiento real (ya lo hiciste antes, así que solo sonido)
                      if (isCapture) {
                        audioManager.play('capture');
                      } else {
                        audioManager.play('move');
                      }
                      lastMove = { from: moveFrom, to: clicked }; // Guarda el último movimiento
                      renderBoard(engine, engine.getBoard());
                      const current = engine.getCurrentTurn();
                      if (engine.isInCheck(current)) audioManager.play('check');

                      if (config.mode === 'online') sendMove(moveFrom, clicked);
                      if (config.mode === 'ai' && engine.getCurrentTurn() !== config.playerColor) {
                        setTimeout(() => triggerAIMove(engine), 1000);
                      } else {
                        isPlayerTurn = true;
                      }
                    }, 100);
                  }, 510);
                }, 200);
                return; // Salir para no ejecutar el movimiento dos veces
              }
            }

            // Si no hay animación, ejecuta el movimiento real como antes
            if (isCapture) {
              audioManager.play('capture');
            } else {
              audioManager.play('move');
            }
            lastMove = { from: moveFrom, to: clicked }; // Guarda el último movimiento
            renderBoard(engine, engine.getBoard());
            if (config.mode === 'online') sendMove(moveFrom, clicked);
            if (config.mode === 'ai' && engine.getCurrentTurn() !== config.playerColor) {
              setTimeout(() => triggerAIMove(engine), 1000);
            } else {
              isPlayerTurn = true;
            }
          } else {
            audioManager.play('error');
            selectedFrom = null;
            if (selectedCellElement) selectedCellElement.classList.remove('selected-cell');
            selectedCellElement = null;
            renderBoard(engine, engine.getBoard());
          }
        }
      });

      boardDiv.appendChild(square);
    }
  }
} // <-- CIERRE 
// --- Mueve la IA ---
function triggerAIMove(engine: Engine): void {
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
    const playerLost: boolean = engine.isInCheck(color) && color === playerColor;
    const playerWon: boolean = engine.isInCheck(color) && color !== playerColor;
    const isStalemate: boolean = !engine.isInCheck(color);

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

  if (move.checkmate) {
    const winnerColor = engine.getCurrentTurn() === 'white' ? 'black' : 'white';
    const resultMessage = winnerColor === config.playerColor
      ? '¡Has ganado! (Jaque mate)'
      : '¡Has perdido! (Jaque mate)';

    setTimeout(() => {
      showGameOverModal(resultMessage, () => showBoard(), () => showGameModeSelector());
    }, 300);
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
            const wasCapture: boolean = capturedPiece !== null;

            // Ejecuta el movimiento real
            engine.makeMove(move.from, move.to);
            lastMove = { from: move.from, to: move.to }; // Guarda el último movimiento 
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
            renderBoard(engine, engine.getBoard());

            if (engine.isInCheck(currentTurn)) {
              audioManager.play('check');
            }

            isPlayerTurn = true;

          }, 100);
        }, 410);
      }, 200); // Espera inicial antes de animar (puedes ajustar)
      return; // Salir para no ejecutar el movimiento dos veces
    }
  }

  // Si no hay animación, ejecuta el movimiento real como antes
  engine.makeMove(move.from, move.to);
  lastMove = { from: move.from, to: move.to }; // Guarda el último movimiento

  const newBoard = engine.getBoard();
  const capturedPiece = prevBoard[move.to.row][move.to.col];
  const wasCapture: boolean = capturedPiece !== null && capturedPiece.color !== engine.getCurrentTurn();

  if (wasCapture) {
    audioManager.play('capture');
  } else {
    audioManager.play('move');
  }

  const currentTurn = engine.getCurrentTurn();
  const iaColor = currentTurn === 'white' ? 'black' : 'white';

  timerManager.addIncrement(iaColor);
  timerManager.startTurn(currentTurn);

  renderBoard(engine, engine.getBoard());
  if (engine.isInCheck(currentTurn)) {
    audioManager.play('check');
  }

  console.log('AI move executed:', move);
  isPlayerTurn = true;
}
