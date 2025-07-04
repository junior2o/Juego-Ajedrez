import { MatchManager } from '../config/MatchManager';
import { createGameModeButtons } from './shared/MenuButtons';
import { createCenteredScreen } from './shared/CenteredScreen';

export type GameMode = 'ai' | 'id' | 'random';

export function showGameModeSelector(): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  const playerId = MatchManager.getInstance().getLocalId() || '(esperando ID...)';

  const idWrapper = document.createElement('div');
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

  const screen = createCenteredScreen(idWrapper, createGameModeButtons());
  container.appendChild(screen);
}
