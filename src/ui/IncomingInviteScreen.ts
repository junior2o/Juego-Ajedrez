// src/ui/IncomingInviteScreen.ts
import { JoinRequestMessage, JoinResponseMessage, StartGameMessage } from '../network/messages';
import { MatchManager } from '../config/MatchManager';
import { WebSocketManager } from '../network/WebSocketManager';

export function showIncomingInviteScreen(msg: JoinRequestMessage): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.height = '100vh';
  wrapper.style.gap = '20px';

  const title = document.createElement('h2');
  title.textContent = `Invitación de: ${msg.fromId}`;
  wrapper.appendChild(title);

  const acceptButton = document.createElement('button');
  acceptButton.textContent = 'Aceptar';
  acceptButton.style.padding = '10px 20px';
  acceptButton.style.fontSize = '16px';
  acceptButton.style.cursor = 'pointer';

  const rejectButton = document.createElement('button');
  rejectButton.textContent = 'Rechazar';
  rejectButton.style.padding = '10px 20px';
  rejectButton.style.fontSize = '16px';
  rejectButton.style.cursor = 'pointer';

  acceptButton.onclick = () => {
    const localId = MatchManager.getInstance().getLocalId();
    MatchManager.getInstance().setOpponentId(msg.fromId);

    const response: JoinResponseMessage = {
      type: 'join_response',
      accepted: true,
      fromId: localId,
    };
    WebSocketManager.getInstance().send(response);

    const startGameMessage: StartGameMessage = {
      type: 'start_game',
      whiteId: msg.fromId, // quien invitó juega con blancas
      blackId: localId,
    };
    WebSocketManager.getInstance().send(startGameMessage);
  };

  rejectButton.onclick = () => {
    const response: JoinResponseMessage = {
      type: 'join_response',
      accepted: false,
      fromId: MatchManager.getInstance().getLocalId(),
    };
    WebSocketManager.getInstance().send(response);

    container.innerHTML = '<p>Has rechazado la invitación.</p>';
  };

  wrapper.appendChild(acceptButton);
  wrapper.appendChild(rejectButton);
  container.appendChild(wrapper);
}
