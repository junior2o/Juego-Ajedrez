import { Engine } from './engine';
import { MatchManager } from '../config/MatchManager';
import { GameMessage, MoveMessage, StartGameMessage } from '../network/messages';
import { WebSocketManager } from '../network/WebSocketManager';
import { renderBoard, animateRemoteMove } from '../ui/Board';
import { showGameOverModal } from '../ui/GameOverModal';
import { showGameModeSelector} from '../ui/GameModeSelector';
import { gameConfigManager } from '../config/GameConfigManager';
import { initialPosition } from './initialPosition';
import { timerManager, TimerManager, setTimerManager } from '../logic/TimerManager';
import { renderTimers } from '../ui/renderTimers';

let engine: Engine;
let isMyTurn = false;
let remoteGameStarted = false;

export function startRemoteGame(startData: StartGameMessage): void {
  console.log('[RemoteGame] startRemoteGame ejecutado', startData);
  if (remoteGameStarted) {
    console.warn('[RemoteGame] La partida remota ya ha sido iniciada.');
    return;
  } 
  remoteGameStarted = true;

  // Limpia el contenido de #app antes de mostrar el tablero
  const app = document.getElementById('app');
  const boardHolder = document.createElement('div');
  boardHolder.id = 'board-holder';
  if (app) {
    app.innerHTML = '';
    // Vuelve a crear el contenedor del tablero
    app.appendChild(boardHolder);
  }

  // Espera a que el ID local esté asignado
  const myId = MatchManager.getInstance().getLocalId();
  if (!myId) {
    console.error('[RemoteGame] ERROR: El ID local no está asignado antes de iniciar la partida.');
    return;
  }
  const myColor = startData.whiteId === myId ? 'white' : 'black';

  // Log de depuración para colores e IDs
  console.log(`[RemoteGame] Mi ID: ${myId}, White: ${startData.whiteId}, Black: ${startData.blackId}, Mi color: ${myColor}`);

  console.log('[RemoteGame] Inicializando engine');
  engine = new Engine(initialPosition);
  gameConfigManager.setConfig({ mode: 'online', playerColor: myColor });

  isMyTurn = myColor === 'white';
  setTimerManager(new TimerManager('classic', (loser) => {
    const config = gameConfigManager.getConfig();
    const playerColor = config.playerColor;
    const resultMessage = loser === playerColor ? '¡Has perdido por tiempo!' : '¡Has ganado por tiempo!';
    showGameOverModal(resultMessage, () => showGameModeSelector(), () => showGameModeSelector());
  }));

  timerManager.reset();
  if (isMyTurn) {
    timerManager.startTurn(myColor);
  }

  renderTimers(boardHolder, timerManager);

  console.log('[Board] renderBoard llamado', engine);
  renderBoard(engine, engine.getBoard());
}

export function handleRemoteMove(message: MoveMessage): void {
  console.log('[RemoteGame] handleRemoteMove', message);
  const config = gameConfigManager.getConfig();
  if (message.playerId === MatchManager.getInstance().getLocalId()) return;

  animateRemoteMove(engine, message.from, message.to, () => {
   isMyTurn = true; // <-- Habilita tu turno después de la animación
  });
}

export function sendMove(from: { row: number; col: number }, to: { row: number; col: number }): void {
  const message: MoveMessage = {
    type: 'move',
    from,
    to,
    playerId: MatchManager.getInstance().getLocalId(),
  };
  WebSocketManager.getInstance().send(message);
  isMyTurn = false;
}

export function getRemoteEngine(): Engine {
  return engine;
}

export function canMove(): boolean {
  return isMyTurn;
}

export function resetRemoteGame(): void {
  remoteGameStarted = false;
}
