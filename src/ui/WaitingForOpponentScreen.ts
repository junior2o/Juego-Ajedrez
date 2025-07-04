// src/ui/WaitingForOpponentScreen.ts

import { WebSocketManager } from '../network/WebSocketManager';
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
  message.style.fontSize = '1.2rem';
  message.style.color = 'white';
  wrapper.appendChild(message);

  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancelar';
  cancelButton.className = 'menu-btn';
  cancelButton.style.width = '260px';
  cancelButton.onclick = () => {
    WebSocketManager.getInstance().send({
      type: 'error',
      message: 'Invitación cancelada por el remitente.',
    });

    showGameModeSelector();
  };
  wrapper.appendChild(cancelButton);

  container.appendChild(wrapper);
}
