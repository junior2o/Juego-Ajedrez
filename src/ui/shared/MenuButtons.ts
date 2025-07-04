import { showAILevelSelector } from '../AILevelSelector';
import { showIDConnectScreen } from '../IDConnectScreen';
import { WebSocketManager } from '../../network/WebSocketManager';
import { MatchManager } from '../../config/MatchManager';

export type GameMode = 'ai' | 'id' | 'random';

export function createGameModeButtons(exclude: GameMode[] = []): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'menu-buttons';
  container.style.display = 'flex';
  container.style.flexDirection = 'row';
  container.style.justifyContent = 'center';

  const modes: { label: string; value: GameMode; action: () => void }[] = [
    {
      label: 'Jugar contra la IA',
      value: 'ai',
      action: () => showAILevelSelector()
    },
    {
      label: 'Jugar con un amigo',
      value: 'id',
      action: () => showIDConnectScreen()
    },
    {
      label: 'Jugar en línea',
      value: 'random',
      action: () => {
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
    }
  ];

  for (const { label, value, action } of modes) {
    if (exclude.includes(value)) continue;

    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.textContent = label;
    btn.addEventListener('click', action);
    container.appendChild(btn);
  }

  return container;
}
