import { WebSocketManager } from './WebSocketManager';
import {
  JoinRequestMessage,
  StartGameMessage,
  JoinResponseMessage,
  OpponentDisconnectedMessage, 
} from './messages';
import { showIncomingInviteScreen } from '../ui/IncomingInviteScreen';
import { startRemoteGame } from '../logic/remoteGame';
import { showGameModeSelector } from '../ui/GameModeSelector';

let listenersInitialized = false;

export function initWebSocketListeners(): void {
  if (listenersInitialized) return;
  listenersInitialized = true;

  WebSocketManager.getInstance().on('join_request', (msg) => {
    showIncomingInviteScreen(msg as JoinRequestMessage);
  });

  WebSocketManager.getInstance().on('start_game', (msg) => {
    startRemoteGame(msg as StartGameMessage);
  });

  WebSocketManager.getInstance().on('join_response', (msg) => {
    const response = msg as JoinResponseMessage;
    if (!response.accepted) {
      alert('El jugador rechazó la invitación o ya está en partida.');
      showGameModeSelector();
    }
    // Si fue aceptado, no hacemos nada porque el flujo seguirá con start_game
  });

  WebSocketManager.getInstance().on('opponent_disconnected', (msg) => {
    alert('Tu oponente se ha desconectado.');
    showGameModeSelector();
  });
}