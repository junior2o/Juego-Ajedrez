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
import { showModal } from '../ui/shared/Modal';

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
      let text = 'No se pudo conectar con el jugador.';
      let title = '⛔ Error';
      let icon = '/assets/img/warning.png';

      switch (response.reason) {
        case 'not_found':
          text = 'El ID introducido no existe o el jugador no está conectado.';
          title = '❌ ID no encontrado';
          icon = '/assets/img/warning.png';
          break;
        case 'in_game':
          text = 'El jugador ya está en una partida.';
          title = '🎮 Jugador ocupado';
          icon = '/assets/img/busy.png';
          break;
        case 'rejected':
          text = 'El jugador ha rechazado tu invitación.';
          title = '🙅 Invitación rechazada';
          icon = '/assets/img/rejected.png';
          break;
      }

      showModal(text, title, {
        confirmText: 'Aceptar',
        iconSrc: icon,
        onConfirm: () => {
          showGameModeSelector();
        }
      });
    }
  });

  wsManager.on('opponent_disconnected', (msg) => {
    if ('playerId' in msg) {
      const discMsg = msg as OpponentDisconnectedMessage;
      showModal(
        'Tu oponente se ha desconectado.',
        '🔌 Desconexión',
        {
          confirmText: 'Aceptar',
          iconSrc: '/assets/img/warning.png',
          onConfirm: () => showGameModeSelector()
        }
      );
    }
  });

  wsManager.on('init', (msg) => {
    const initMsg = msg as InitMessage;

    if (initMsg.id !== 'esperando') {
      localStorage.setItem('playerId', initMsg.id);
      MatchManager.getInstance().setLocalId(initMsg.id);
      console.log('[Client] Received ID from server and stored:', initMsg.id);
      showGameModeSelector();
    } else {
      console.warn('[Client] ID "esperando" no se guarda en localStorage');
    }
  });

  wsManager.on('move', (msg) => {
    handleRemoteMove(msg as MoveMessage);
  });
}
