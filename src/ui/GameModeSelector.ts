// src/ui/GameModeSelector.ts

import { showAILevelSelector } from './AILevelSelector';
import { showIDConnectScreen } from './IDConnectScreen';
import { resetRemoteGame } from '../logic/remoteGame';
import { WebSocketManager } from '../network/WebSocketManager';
import { MatchManager } from '../config/MatchManager';

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

  // Mostrar el ID del jugador
  const playerId = MatchManager.getInstance().getLocalId() || '(esperando ID...)';
  const idLabel = document.createElement('div');
  idLabel.style.fontSize = '1.1rem';
  idLabel.style.marginBottom = '10px';
  idLabel.style.background = '#f5f5f5';
  idLabel.style.padding = '8px 16px';
  idLabel.style.borderRadius = '8px';
  idLabel.style.userSelect = 'all';
  idLabel.textContent = `Tu ID: ${playerId}`;
  wrapper.appendChild(idLabel);

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
        showIDConnectScreen(); // pantalla para conexión por ID
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

    wrapper.appendChild(btn);
  }

  container.appendChild(wrapper);
}