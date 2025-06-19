// src/ui/IDConnectScreen.ts

import { MatchManager } from '../config/MatchManager';
import { WebSocketManager } from '../network/WebSocketManager';
import { JoinRequestMessage, StartGameMessage } from '../network/messages';
import { showWaitingForOpponentScreen } from './WaitingForOpponentScreen';
import { showIncomingInviteScreen } from './IncomingInviteScreen';
import { startRemoteGame } from '../logic/remoteGame';

// Mostramos la pantalla de conexión por ID
export function showIDConnectScreen(): void {
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
  title.textContent = 'Conectar con otro jugador';
  wrapper.appendChild(title);

  const localIdDisplay = document.createElement('p');
  localIdDisplay.id = 'local-id-display';
  localIdDisplay.style.fontWeight = 'bold';
  localIdDisplay.textContent = 'Tu ID: esperando...';
  wrapper.appendChild(localIdDisplay);

  // Mostrar el ID si ya lo tenemos
  const currentId = MatchManager.getInstance().getLocalId();
  if (currentId) {
    localIdDisplay.textContent = `Tu ID: ${currentId}`;
  }

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Introduce el ID del oponente';
  input.id = 'opponent-id';
  input.name = 'opponent-id';
  input.style.padding = '10px';
  input.style.fontSize = '16px';
  input.style.width = '250px';
  wrapper.appendChild(input);

  const button = document.createElement('button');
  button.textContent = 'Enviar invitación';
  button.style.padding = '10px 20px';
  button.style.fontSize = '16px';
  button.style.cursor = 'pointer';
  wrapper.appendChild(button);

  const message = document.createElement('p');
  message.style.color = 'red';
  wrapper.appendChild(message);

  button.onclick = () => {
    const opponentId = input.value.trim();
    const localId = MatchManager.getInstance().getLocalId();

    if (!opponentId) {
      message.textContent = 'Por favor, introduce un ID válido.';
      return;
    }

    MatchManager.getInstance().setOpponentId(opponentId);

    const joinRequest: JoinRequestMessage = {
      type: 'join_request',
      fromId: localId,
      toId: opponentId,
    };

    WebSocketManager.getInstance().send(joinRequest);
    showWaitingForOpponentScreen();
  };

  container.appendChild(wrapper);
}

// Escuchar mensajes entrantes si aún no se ha hecho
WebSocketManager.getInstance().on('join_request', (msg) => {
  const joinMsg = msg as JoinRequestMessage;
  showIncomingInviteScreen(joinMsg);
});

WebSocketManager.getInstance().on('start_game', (msg) => {
  const startMsg = msg as StartGameMessage;
  startRemoteGame(startMsg);
});
