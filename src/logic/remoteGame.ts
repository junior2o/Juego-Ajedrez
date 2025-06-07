// src/logic/remoteGame.ts

import { Engine } from './engine';
import { MatchManager } from '../config/MatchManager';
import { GameMessage, MoveMessage, StartGameMessage } from '../network/messages';
import { WebSocketManager } from '../network/WebSocketManager';
import { renderBoard } from '../ui/Board';
import { showGameOverModal } from '../ui/GameOverModal';
import { showGameModeSelector} from '../ui/GameModeSelector';
import { timerManager } from '../logic/TimerManager';
import { gameConfigManager } from '../config/GameConfigManager';
import { initialPosition } from './initialPosition';

let engine: Engine;
let isMyTurn = false;

export function startRemoteGame(startData: StartGameMessage): void {
  const myId = MatchManager.getInstance().getLocalId();
  const myColor = startData.whiteId === myId ? 'white' : 'black';
  const opponentColor = myColor === 'white' ? 'black' : 'white';

  engine = new Engine(initialPosition);
  gameConfigManager.setConfig({ mode: 'online', playerColor: myColor });

  isMyTurn = myColor === 'white';

  timerManager.reset();
  timerManager.startTurn(myColor);

  renderBoard(engine.getBoard());
}

export function handleRemoteMove(message: MoveMessage): void {
  const config = gameConfigManager.getConfig();
  if (message.playerId === MatchManager.getInstance().getLocalId()) return;

  const success = engine.makeMove(message.from, message.to);
  if (success) {
    renderBoard(engine.getBoard());
    timerManager.addIncrement(config.playerColor === 'white' ? 'black' : 'white');
    timerManager.startTurn(config.playerColor);
    isMyTurn = true;
  }
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
