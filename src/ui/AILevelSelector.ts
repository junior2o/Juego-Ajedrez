import { gameConfigManager } from '../config/GameConfigManager';
import { AIDifficulty } from '../types/AIDifficulty';
import { showBoard } from './Board';

export function showAILevelSelector(): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.gap = '20px';
  wrapper.style.padding = '40px';

  const title = document.createElement('h2');
  title.textContent = 'Select AI Difficulty';
  wrapper.appendChild(title);

  const levels: { label: string; value: AIDifficulty }[] = [
    { label: '🟢 Easy', value: 'easy' },
    { label: '🟡 Medium', value: 'medium' },
    { label: '🔴 Hard', value: 'hard' },
  ];

  let selectedDifficulty: AIDifficulty = 'easy';

  for (const { label, value } of levels) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.padding = '12px 24px';
    btn.style.fontSize = '1.1rem';
    btn.style.cursor = 'pointer';
    btn.style.width = '220px';

    btn.addEventListener('click', () => {
      selectedDifficulty = value;
      showWhoStarts();
    });

    wrapper.appendChild(btn);
  }

  container.appendChild(wrapper);

  function showWhoStarts(): void {
    wrapper.innerHTML = ''; // Limpia sólo este contenedor

    const startTitle = document.createElement('h2');
    startTitle.textContent = 'Who Starts?';
    wrapper.appendChild(startTitle);

    const playerBtn = document.createElement('button');
    playerBtn.textContent = 'You Start';
    styleButton(playerBtn);

    const aiBtn = document.createElement('button');
    aiBtn.textContent = 'AI Starts';
    styleButton(aiBtn);

    playerBtn.addEventListener('click', () => {
      disableButtons();
      gameConfigManager.setConfig({
        mode: 'ai',
        playerColor: 'white',
        aiLevel: selectedDifficulty
      });
      showBoard();
    });

    aiBtn.addEventListener('click', () => {
      disableButtons();
      gameConfigManager.setConfig({
        mode: 'ai',
        playerColor: 'black',
        aiLevel: selectedDifficulty
      });
      showBoard();
    });

    wrapper.appendChild(playerBtn);
    wrapper.appendChild(aiBtn);
  }

  function styleButton(btn: HTMLButtonElement) {
    btn.style.padding = '12px 24px';
    btn.style.fontSize = '1.1rem';
    btn.style.cursor = 'pointer';
    btn.style.width = '220px';
  }

  function disableButtons() {
    const buttons = wrapper.querySelectorAll('button');
    buttons.forEach(btn => (btn.disabled = true));
  }
}
