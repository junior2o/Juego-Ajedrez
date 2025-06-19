import { WebSocketManager } from './WebSocketManager';
import {
  JoinRequestMessage,
  StartGameMessage,
  JoinResponseMessage,
  OpponentDisconnectedMessage,
  InitMessage, 
} from './messages';
import { showIncomingInviteScreen } from '../ui/IncomingInviteScreen';
import { startRemoteGame, handleRemoteMove } from '../logic/remoteGame'; 
import { showGameModeSelector } from '../ui/GameModeSelector';
import { MatchManager } from '../config/MatchManager';
import { MoveMessage } from './messages';

console.log('[Client] initWebSocketListeners ejecutado');

let listenersInitialized = false;

export function initWebSocketListeners(): void {
  console.log('[Client] initWebSocketListeners ejecutado');
  if (listenersInitialized) return;
  listenersInitialized = true;

  WebSocketManager.getInstance().on('join_request', (msg) => {
    console.log('[Listener] join_request recibido', msg);
    showIncomingInviteScreen(msg as JoinRequestMessage);
  });

  WebSocketManager.getInstance().on('start_game', (msg) => {
    console.log('[Listener] start_game recibido', msg);
    startRemoteGame(msg as StartGameMessage);
  });

  WebSocketManager.getInstance().on('join_response', (msg) => {
    const response = msg as JoinResponseMessage;
    if (!response.accepted) {
      alert('El jugador rechazó la invitación o ya está en partida.');
      showGameModeSelector();
    }
  });

  WebSocketManager.getInstance().on('opponent_disconnected', (msg) => {
    alert('Tu oponente se ha desconectado.');
    showGameModeSelector();
  });

  // Listener para recibir el ID del servidor
  WebSocketManager.getInstance().on('init', (msg) => {
    const initMsg = msg as InitMessage;
    MatchManager.getInstance().setLocalId(initMsg.id);
    console.log('[Client] Received ID from server:', initMsg.id);
  });

  // Listener para movimientos remotos
 WebSocketManager.getInstance().on('move', (msg) => {
  handleRemoteMove(msg as MoveMessage);
});

}