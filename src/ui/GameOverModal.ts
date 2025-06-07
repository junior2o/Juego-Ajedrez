// src/ui/GameOverModal.ts
declare global {
  interface Window {
    playerColor: 'white' | 'black';
  }
}

export function showGameOverModal(
  message: string,
  onRepeatGame: () => void,
  onReturnToMenu: () => void
): void {
  const container = document.getElementById('app')!;

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';
  overlay.style.animation = 'fadeIn 0.5s ease';

  let background = 'linear-gradient(to bottom right, rgba(0,0,0,0.8), rgba(30,30,30,0.9))';
  if (message.toLowerCase().includes('white')) {
    background = 'linear-gradient(to bottom right, rgba(255,255,255,0.8), rgba(200,200,200,0.9))';
  } else if (message.toLowerCase().includes('black')) {
    background = 'linear-gradient(to bottom right, rgba(0,0,0,0.8), rgba(20,20,20,0.95))';
  } else {
    background = 'linear-gradient(to bottom right, rgba(100,100,100,0.8), rgba(60,60,60,0.9))';
  }
  overlay.style.background = background;

  const box = document.createElement('div');
  box.style.backgroundColor = '#fff';
  box.style.padding = '40px';
  box.style.borderRadius = '15px';
  box.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.1)';
  box.style.textAlign = 'center';
  box.style.animation = 'popUp 0.5s ease';
  box.style.maxWidth = '90%';
  box.style.minWidth = '300px';

  const logo = document.createElement('img');
  logo.src = '/logo.png';
  logo.alt = 'Game Logo';
  logo.style.width = '80px';
  logo.style.marginBottom = '20px';

  const winnerIcon = document.createElement('div');
  winnerIcon.style.fontSize = '3rem';
  winnerIcon.style.marginBottom = '10px';
  let resultSound = new Audio();
  let playerMessage = message;

  if (message.toLowerCase().includes('white')) {
    winnerIcon.textContent = '♔';
    winnerIcon.style.color = '#ddd';
    playerMessage = window.playerColor === 'white' ? 'You Won!' : 'You Lost!';
    resultSound = new Audio(window.playerColor === 'white' ? '/assets/sounds/victory.mp3' : '/assets/sounds/defeat.mp3');
  } else if (message.toLowerCase().includes('black')) {
    winnerIcon.textContent = '♚';
    winnerIcon.style.color = '#222';
    playerMessage = window.playerColor === 'black' ? 'You Won!' : 'You Lost!';
    resultSound = new Audio(window.playerColor === 'black' ? '/assets/sounds/victory.mp3' : '/assets/sounds/defeat.mp3');
  } else if (message.toLowerCase().includes('desconect')) {
    winnerIcon.textContent = '❌';
    winnerIcon.style.color = '#e74c3c';
    playerMessage = 'Your opponent disconnected.';
    resultSound = new Audio('/assets/sounds/defeat.mp3');
  } else {
    winnerIcon.textContent = '🤝';
    winnerIcon.style.color = '#888';
    playerMessage = 'Draw!';
    resultSound = new Audio('/assets/sounds/draw.mp3');
  }

  resultSound.play().catch(console.error);

  const msg = document.createElement('h2');
  msg.textContent = playerMessage;
  msg.style.margin = '0';
  msg.style.fontSize = '2rem';
  msg.style.color = '#333';

  const buttonContainer = document.createElement('div');
  buttonContainer.style.marginTop = '25px';
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.gap = '15px';
  buttonContainer.style.flexWrap = 'wrap';

  const repeatButton = document.createElement('button');
  repeatButton.textContent = 'Play Again';
  repeatButton.style.padding = '12px 25px';
  repeatButton.style.fontSize = '1rem';
  repeatButton.style.cursor = 'pointer';
  repeatButton.style.backgroundColor = '#444';
  repeatButton.style.color = 'white';
  repeatButton.style.border = 'none';
  repeatButton.style.borderRadius = '8px';
  repeatButton.style.transition = 'background-color 0.3s';
  repeatButton.tabIndex = 0;
  repeatButton.onmouseenter = () => (repeatButton.style.backgroundColor = '#666');
  repeatButton.onmouseleave = () => (repeatButton.style.backgroundColor = '#444');
  repeatButton.onclick = () => {
    overlay.remove();
    onRepeatGame();
  };

  const menuButton = document.createElement('button');
  menuButton.textContent = 'Main Menu';
  menuButton.style.padding = '12px 25px';
  menuButton.style.fontSize = '1rem';
  menuButton.style.cursor = 'pointer';
  menuButton.style.backgroundColor = '#222';
  menuButton.style.color = 'white';
  menuButton.style.border = 'none';
  menuButton.style.borderRadius = '8px';
  menuButton.style.transition = 'background-color 0.3s';
  menuButton.tabIndex = 0;
  menuButton.onmouseenter = () => (menuButton.style.backgroundColor = '#444');
  menuButton.onmouseleave = () => (menuButton.style.backgroundColor = '#222');
  menuButton.onclick = () => {
    overlay.remove();
    onReturnToMenu();
  };

  // Añadir solo si no existe ya el estilo
  if (!document.getElementById('gameover-modal-style')) {
    const style = document.createElement('style');
    style.id = 'gameover-modal-style';
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes popUp {
        0% { transform: scale(0.6); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  buttonContainer.appendChild(repeatButton);
  buttonContainer.appendChild(menuButton);
  box.appendChild(logo);
  box.appendChild(winnerIcon);
  box.appendChild(msg);
  box.appendChild(buttonContainer);
  overlay.appendChild(box);
  container.appendChild(overlay);

  // Permitir cerrar con Escape
  const escListener = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      onReturnToMenu();
      window.removeEventListener('keydown', escListener);
    }
  };
  window.addEventListener('keydown', escListener);
}