import { TimerManager } from '../logic/TimerManager';

function formatTime(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export function renderTimers(container: HTMLElement, timer: TimerManager): void {
  const blackTimer = document.createElement('div');
  blackTimer.id = 'black-timer';
  blackTimer.className = 'timer-box';

  const whiteTimer = document.createElement('div');
  whiteTimer.id = 'white-timer';
  whiteTimer.className = 'timer-box';

  // Añade estilos solo una vez
  if (!document.getElementById('timers-style')) {
    const style = document.createElement('style');
    style.id = 'timers-style';
    style.textContent = `
      .timer-box {
        position: fixed;
        right: 10px;
        width: auto;
        min-width: 100px;
        max-width: 160px;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-family: monospace;
        font-size: 1.3rem;
        padding: 10px 14px;
        border-radius: 8px;
        text-align: right;
        z-index: 1000;
        pointer-events: none;
        box-shadow: 0 0 8px rgba(0,0,0,0.4);
        user-select: none;
      }

      #black-timer {
        top: 10px;
      }

      #white-timer {
        bottom: 10px;
      }

      #board-holder {
        margin-top: 80px;
        margin-bottom: 80px;
      }

      @media (max-width: 500px) {
        .timer-box {
          font-size: 1rem;
          padding: 8px 10px;
          min-width: 80px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Agrega al DOM principal (fuera del tablero)
  document.body.appendChild(blackTimer);
  document.body.appendChild(whiteTimer);

  function update() {
    blackTimer.textContent = formatTime(timer.getTime('black'));
    whiteTimer.textContent = formatTime(timer.getTime('white'));
    requestAnimationFrame(update);
  }

  update();
}
