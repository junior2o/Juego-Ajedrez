// ../network/initWebSocketListeners.ts

import { WebSocketManager } from './WebSocketManager';
import {
  JoinRequestMessage,
  StartGameMessage,
  JoinResponseMessage,
  OpponentDisconnectedMessage,
  InitMessage,
  MoveMessage,
} from './messages';
import { showIncomingInviteScreen } from '../ui/IncomingInviteScreen';
import { startRemoteGame, handleRemoteMove } from '../logic/remoteGame';
import { showGameModeSelector } from '../ui/GameModeSelector';
import { MatchManager } from '../config/MatchManager';

console.log('[Client] initWebSocketListeners ejecutado');

let listenersInitialized = false;

export function initWebSocketListeners(): void {
  console.log('[Client] initWebSocketListeners ejecutado');
  if (listenersInitialized) return;
  listenersInitialized = true;

  const wsManager = WebSocketManager.getInstance();

  wsManager.on('join_request', (msg) => {
    console.log('[Listener] join_request recibido', msg);
    showIncomingInviteScreen(msg as JoinRequestMessage);
  });

  wsManager.on('start_game', (msg) => {
    console.log('[Listener] start_game recibido', msg);
    startRemoteGame(msg as StartGameMessage);
  });

  wsManager.on('join_response', (msg) => {
    const response = msg as JoinResponseMessage;
    if (!response.accepted) {
      alert('El jugador rechazó la invitación o ya está en partida.');
      showGameModeSelector();
    }
  });

 wsManager.on('opponent_disconnected', (msg) => {
  if ('playerId' in msg) {
    const discMsg = msg as OpponentDisconnectedMessage;
    alert('Tu oponente se ha desconectado.');
    showGameModeSelector();
  }
});


  // Listener para recibir el ID final desde el servidor
  wsManager.on('init', (msg) => {
  const initMsg = msg as InitMessage;

  if (initMsg.id !== 'esperando') {
    localStorage.setItem('playerId', initMsg.id);
    MatchManager.getInstance().setLocalId(initMsg.id);
    console.log('[Client] Received ID from server and stored:', initMsg.id);

    // Mostrar el menú principal solo cuando ya tenemos el ID
    showGameModeSelector();
  } else {
    console.warn('[Client] ID "esperando" no se guarda en localStorage');
  }
});


  // Listener para movimientos remotos
  wsManager.on('move', (msg) => {
    handleRemoteMove(msg as MoveMessage);
  });
}
