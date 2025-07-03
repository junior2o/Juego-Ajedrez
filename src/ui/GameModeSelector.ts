import { showAILevelSelector } from './AILevelSelector';
import { showIDConnectScreen } from './IDConnectScreen';
import { resetRemoteGame } from '../logic/remoteGame';
import { WebSocketManager } from '../network/WebSocketManager';
import { MatchManager } from '../config/MatchManager';

export type GameMode = 'ai' | 'id' | 'random';

export function showGameModeSelector(): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  // Pantalla del menú principal
  const menuScreen = document.createElement('div');
  menuScreen.id = 'menu-screen';

  // Indicador de ID centrado con imagen y botón de copia personalizado
  const playerId = MatchManager.getInstance().getLocalId() || '(esperando ID...)';

  const idWrapper = document.createElement('div');
  idWrapper.style.position = 'absolute';
  idWrapper.style.top = '50%';
  idWrapper.style.left = '50%';
  idWrapper.style.transform = 'translate(-50%, -60%)';
  idWrapper.style.opacity = '0';
  idWrapper.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  idWrapper.style.display = 'flex';
  idWrapper.style.justifyContent = 'center';
  idWrapper.style.alignItems = 'center';
  idWrapper.style.gap = '0.75rem';
  idWrapper.style.background = 'rgba(0, 0, 0, 0.5)';
  idWrapper.style.padding = '1rem 2rem';
  idWrapper.style.borderRadius = '12px';

  const userIcon = document.createElement('img');
  userIcon.src = '/assets/img/userID.png';
  userIcon.alt = 'user icon';
  userIcon.style.width = '60px';
  userIcon.style.height = '60px';

  const idLabel = document.createElement('div');
  idLabel.className = 'player-id';
  idLabel.innerHTML = `<strong>${playerId}</strong>`;
  idLabel.style.fontSize = '1.6rem';
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
  menuScreen.appendChild(idWrapper);

  setTimeout(() => {
    idWrapper.style.opacity = '1';
    idWrapper.style.transform = 'translate(-50%, -50%)';
  }, 50);

  // Contenedor de botones abajo del todo
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'menu-buttons';
  buttonsContainer.style.flexDirection = 'row';
  buttonsContainer.style.justifyContent = 'center';

  const modes: { label: string; value: GameMode }[] = [
    { label: 'Jugar contra la IA', value: 'ai' },
    { label: 'Jugar con un amigo', value: 'id' },
    { label: 'Jugar en línea', value: 'random' },
  ];

  for (const { label, value } of modes) {
    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.textContent = label;
    btn.addEventListener('click', () => {
      resetRemoteGame();
      if (value === 'ai') {
        showAILevelSelector();
      } else if (value === 'id') {
        showIDConnectScreen();
      } else if (value === 'random') {
        const playerId = MatchManager.getInstance().getLocalId();
        if (!playerId || playerId === 'esperando') {
          alert('Esperando asignación de ID por el servidor. Intenta de nuevo en unos segundos.');
          return;
        }
        WebSocketManager.getInstance().send({
          type: 'find_random_opponent',
          id: playerId,
        });
        alert('Buscando oponente aleatorio...');
      }
    });
    buttonsContainer.appendChild(btn);
  }

  menuScreen.appendChild(buttonsContainer);
  container.appendChild(menuScreen);
}
