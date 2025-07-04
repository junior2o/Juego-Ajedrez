import { gameConfigManager } from '../config/GameConfigManager';
import { AIDifficulty } from '../types/AIDifficulty';
import { showBoard } from './Board';
import { createGameModeButtons } from './shared/MenuButtons';
import { createCenteredScreen } from './shared/CenteredScreen';

export function showAILevelSelector(): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.gap = '20px';

  const title = document.createElement('h2');
  title.textContent = 'Selecciona la dificultad de la IA';
  wrapper.appendChild(title);

  const levels: { label: string; value: AIDifficulty }[] = [
    { label: '🟢 Fácil', value: 'easy' },
    { label: '🟡 Media', value: 'medium' },
    { label: '🔴 Difícil', value: 'hard' },
  ];

  let selectedDifficulty: AIDifficulty = 'easy';

  for (const { label, value } of levels) {
    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.textContent = label;
    btn.style.width = '260px';
    btn.addEventListener('click', () => {
      selectedDifficulty = value;
      showWhoStarts();
    });
    wrapper.appendChild(btn);
  }

  function showWhoStarts(): void {
    wrapper.innerHTML = '';

    const startTitle = document.createElement('h2');
    startTitle.textContent = '¿Quién empieza?';
    wrapper.appendChild(startTitle);

    const playerBtn = document.createElement('button');
    playerBtn.textContent = 'Empiezas tú';
    styleButton(playerBtn);

    const aiBtn = document.createElement('button');
    aiBtn.textContent = 'Empieza la IA';
    styleButton(aiBtn);

    playerBtn.addEventListener('click', () => {
      disableButtons();
      gameConfigManager.setConfig({
        mode: 'ai',
        playerColor: 'white',
        aiLevel: selectedDifficulty,
      });
      showBoard();
    });

    aiBtn.addEventListener('click', () => {
      disableButtons();
      gameConfigManager.setConfig({
        mode: 'ai',
        playerColor: 'black',
        aiLevel: selectedDifficulty,
      });
      showBoard();
    });

    wrapper.appendChild(playerBtn);
    wrapper.appendChild(aiBtn);
  }

  function styleButton(btn: HTMLButtonElement) {
    btn.className = 'menu-btn';
    btn.style.width = '260px';
  }

  function disableButtons() {
    const buttons = wrapper.querySelectorAll('button');
    buttons.forEach(btn => (btn.disabled = true));
  }

  const screen = createCenteredScreen(wrapper, createGameModeButtons(['ai']));
  container.appendChild(screen);
}
