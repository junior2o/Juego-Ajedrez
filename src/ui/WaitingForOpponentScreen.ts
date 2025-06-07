// src/ui/WaitingForOpponentScreen.ts

import { WebSocketManager } from '../network/WebSocketManager';
import { JoinResponseMessage, StartGameMessage } from '../network/messages';
import { MatchManager } from '../config/MatchManager';
import { startRemoteGame } from '../logic/remoteGame';
import { showGameModeSelector } from './GameModeSelector';

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
    showGameModeSelector();
  };
  wrapper.appendChild(cancelButton);

  container.appendChild(wrapper);

  // Manejamos la respuesta del oponente
  WebSocketManager.getInstance().on('join_response', (msg: JoinResponseMessage) => {
    if (msg.accepted) {
      const matchId = `${msg.fromId}-${MatchManager.getInstance().getLocalId()}`;
      MatchManager.getInstance().setMatchId(matchId);

      const startMsg: StartGameMessage = {
        type: 'start_game',
        whiteId: MatchManager.getInstance().getLocalId(), // quien invitó juega con blancas
        blackId: msg.fromId,
      };

      WebSocketManager.getInstance().send(startMsg);
      startRemoteGame(startMsg);
    } else {
      alert('El oponente ha rechazado la invitación.');
      showGameModeSelector();
    }
  });
}
