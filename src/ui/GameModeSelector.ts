// src/ui/GameModeSelector.ts

import { showAILevelSelector } from './AILevelSelector';
import { showIDConnectScreen } from './IDConnectScreen';
import { resetRemoteGame } from '../logic/remoteGame';

export type GameMode = 'ai' | 'id' | 'random';

export function showGameModeSelector(): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '20px';
  wrapper.style.padding = '40px';

  const title = document.createElement('h2');
  title.textContent = 'Choose Game Mode';
  wrapper.appendChild(title);

  const modes: { label: string; value: GameMode }[] = [
    { label: 'Play vs AI', value: 'ai' },
    { label: 'Play with Friend (ID)', value: 'id' },
    { label: 'Random Opponent', value: 'random' },
  ];

  for (const { label, value } of modes) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.padding = '12px 24px';
    btn.style.fontSize = '1.1rem';
    btn.style.cursor = 'pointer';
    btn.style.width = '260px';

    btn.addEventListener('click', () => {
      resetRemoteGame(); // Reinicia el juego remoto antes de cambiar de modo
  if (value === 'ai') {
    showAILevelSelector();
  } else if (value === 'id') {
    showIDConnectScreen(); //pantalla para conexión por ID
  } else {
    alert('Random match coming soon.');
  }
});
    wrapper.appendChild(btn);
  }

  container.appendChild(wrapper);
}
