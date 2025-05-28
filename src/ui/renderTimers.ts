// src/ui/renderTimers.ts

import { TimerManager } from '../logic/TimerManager';
function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export function renderTimers(container: HTMLElement, timer: TimerManager): void {
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.id = 'timers-wrapper';

  const blackTimer = document.createElement('div');
  blackTimer.id = 'black-timer';

  const boardHolder = document.createElement('div');
  boardHolder.id = 'board-holder';

  const whiteTimer = document.createElement('div');
  whiteTimer.id = 'white-timer';

  wrapper.appendChild(blackTimer); // IA timer on top
  wrapper.appendChild(boardHolder);
  wrapper.appendChild(whiteTimer); // Human timer on bottom

  container.appendChild(wrapper);

  function update() {
    if (typeof timer.getTime === 'function') {
      blackTimer.textContent = formatTime(timer.getTime('black'));
      whiteTimer.textContent = formatTime(timer.getTime('white'));

    }

    if (typeof timer.getActiveColor === 'function') {
      blackTimer.classList.toggle('active', timer.getActiveColor() === 'black');
      whiteTimer.classList.toggle('active', timer.getActiveColor() === 'white');
    }

    requestAnimationFrame(update);
  }

  update();
}
