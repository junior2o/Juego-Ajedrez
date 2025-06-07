// src/ui/WaitingForOpponentScreen.ts

import { WebSocketManager } from '../network/WebSocketManager';
import { JoinResponseMessage, StartGameMessage } from '../network/messages';
import { MatchManager } from '../config/MatchManager';
import { startRemoteGame } from '../logic/remoteGame';
import { showGameModeSelector } from './GameModeSelector';

let joinResponseHandler: ((msg: JoinResponseMessage) => void) | null = null;

export function showWaitingForOpponentScreen(): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.height = '100vh';
  wrapper.style.gap = '20px';

  const message = document.createElement('p');
  message.textContent = 'Esperando a que el oponente acepte la invitación...';
  wrapper.appendChild(message);

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancelar';
  cancelButton.style.padding = '10px 20px';
  cancelButton.style.fontSize = '16px';
  cancelButton.style.cursor = 'pointer';
  cancelButton.onclick = () => {
    WebSocketManager.getInstance().send({
      type: 'error',
      message: 'Invitación cancelada por el remitente.',
    });
    // Limpia el listener al cancelar
    if (joinResponseHandler) {
      WebSocketManager.getInstance().off?.('join_response', joinResponseHandler);
      joinResponseHandler = null;
    }
    showGameModeSelector();
  };
  wrapper.appendChild(cancelButton);

  container.appendChild(wrapper);

  // Limpia el listener anterior si existe
  if (joinResponseHandler) {
    WebSocketManager.getInstance().off?.('join_response', joinResponseHandler);
  }

  joinResponseHandler = (msg: JoinResponseMessage) => {
    if (msg.accepted) {
      const matchId = `${msg.fromId}-${MatchManager.getInstance().getLocalId()}`;
      MatchManager.getInstance().setMatchId(matchId);

      const startMsg: StartGameMessage = {
        type: 'start_game',
        whiteId: MatchManager.getInstance().getLocalId(), // quien invitó juega con blancas
        blackId: msg.fromId,
      };

      // Asigna el color del jugador
      window.playerColor = 'white';

      WebSocketManager.getInstance().send(startMsg);
      startRemoteGame(startMsg);
    } else {
      alert('El oponente ha rechazado la invitación.');
      showGameModeSelector();
    }
    // Limpia el listener después de usarlo
    if (joinResponseHandler) {
      WebSocketManager.getInstance().off?.('join_response', joinResponseHandler);
      joinResponseHandler = null;
    }
  };

  WebSocketManager.getInstance().on('join_response', joinResponseHandler as any);
}