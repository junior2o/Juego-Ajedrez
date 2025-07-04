import { MatchManager } from '../config/MatchManager';
import { WebSocketManager } from '../network/WebSocketManager';
import { JoinRequestMessage } from '../network/messages';
import { showWaitingForOpponentScreen } from './WaitingForOpponentScreen';
import { createGameModeButtons } from './shared/MenuButtons';
import { createCenteredScreen } from './shared/CenteredScreen';
import { showModal } from './shared/Modal';

export function showIDConnectScreen(): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  const playerId = MatchManager.getInstance().getLocalId() || '(esperando ID...)';

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.gap = '20px';

  const title = document.createElement('h2');
  title.textContent = 'Conectar con otro jugador';
  title.style.fontSize = '1.8rem';
  wrapper.appendChild(title);

  const idWrapper = document.createElement('div');
  idWrapper.style.display = 'flex';
  idWrapper.style.justifyContent = 'center';
  idWrapper.style.alignItems = 'center';
  idWrapper.style.gap = '0.75rem';
  idWrapper.style.background = 'rgba(0, 0, 0, 0.5)';
  idWrapper.style.padding = '1rem 2rem';
  idWrapper.style.borderRadius = '12px';
  idWrapper.style.minWidth = '400px';

  const userIcon = document.createElement('img');
  userIcon.src = '/assets/img/userID.png';
  userIcon.alt = 'user icon';
  userIcon.style.width = '60px';
  userIcon.style.height = '60px';

  const idLabel = document.createElement('div');
  idLabel.className = 'player-id';
  idLabel.innerHTML = `<strong>${playerId}</strong>`;
  idLabel.style.fontSize = '1.8rem';
  idLabel.style.color = 'white';
  idLabel.style.whiteSpace = 'nowrap';
  idLabel.style.display = 'flex';
  idLabel.style.alignItems = 'center';
  idLabel.style.gap = '0.5rem';

  const copyBtn = document.createElement('img');
  copyBtn.src = '/assets/img/copy.png';
  copyBtn.alt = 'Copiar ID';
  copyBtn.style.width = '60px';
  copyBtn.style.height = '60px';
  copyBtn.style.cursor = 'pointer';
  copyBtn.title = 'Copiar ID';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(playerId).then(() => {
      copyBtn.src = '/assets/img/check.png';
      setTimeout(() => copyBtn.src = '/assets/img/copy.png', 1500);
    });
  });

  idWrapper.appendChild(userIcon);
  idWrapper.appendChild(idLabel);
  idWrapper.appendChild(copyBtn);
  wrapper.appendChild(idWrapper);

  const inputGroup = document.createElement('div');
  inputGroup.style.display = 'flex';
  inputGroup.style.alignItems = 'center';
  inputGroup.style.justifyContent = 'center';
  inputGroup.style.gap = '10px';
  inputGroup.style.minWidth = '350px';

  const pasteBtn = document.createElement('img');
  pasteBtn.src = '/assets/img/paste.png';
  pasteBtn.alt = 'Pegar ID';
  pasteBtn.title = 'Pegar ID desde el portapapeles';
  pasteBtn.style.width = '60px';
  pasteBtn.style.height = '60px';
  pasteBtn.style.cursor = 'pointer';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Introduce el ID del oponente';
  input.id = 'opponent-id';
  input.name = 'opponent-id';
  input.style.padding = '10px';
  input.style.fontSize = '18px';
  input.style.width = '100%';
  input.style.borderRadius = '8px';
  input.style.border = '1px solid #ccc';
  input.style.textAlign = 'center';
  input.style.flex = '1';

  pasteBtn.addEventListener('click', () => {
    navigator.clipboard.readText().then(text => {
      input.value = text;
    });
  });

  inputGroup.appendChild(pasteBtn);
  inputGroup.appendChild(input);
  wrapper.appendChild(inputGroup);

  const button = document.createElement('button');
  button.textContent = 'Enviar invitación';
  button.className = 'menu-btn';
  button.style.width = '350px';
  wrapper.appendChild(button);

  const message = document.createElement('p');
  message.style.color = 'red';
  wrapper.appendChild(message);

  button.onclick = () => {
    const opponentId = input.value.trim();
    const localId = MatchManager.getInstance().getLocalId();

    const isValidId = /^Player\d{6}$/.test(opponentId);

    if (!isValidId) {
  showModal('Introduce un ID válido como Player123456', '⚠️ Formato incorrecto', {
    confirmText: 'Aceptar',
    onConfirm: () => {
      input.value = '';
    },
  });

  // Estilizamos ese modal puntualmente
  setTimeout(() => {
    const modal = document.getElementById('custom-modal');
    if (modal) {
      const msg = modal.querySelector('p');
      const title = modal.querySelector('h3');
      if (title) title.style.fontSize = '1.6rem';
      if (msg) msg.style.fontSize = '1.2rem';
    }
  }, 10);

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

  const screen = createCenteredScreen(wrapper, createGameModeButtons(['id']));
  container.appendChild(screen);
}
