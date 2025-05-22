export function showGameModeSelector(onSelect: (mode: 'ai' | 'id' | 'random') => void): void {
  const container = document.getElementById('app')!;
  container.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: white;
      gap: 20px;
    ">
      <h1 style="font-size: 2rem;">Select Game Mode</h1>
      <button id="vsAI" style="padding: 10px 20px;">Play vs AI</button>
      <button id="vsID" style="padding: 10px 20px;">Play vs Player by ID</button>
      <button id="vsRandom" style="padding: 10px 20px;">Play vs Random Player</button>
    </div>
  `;

  document.getElementById('vsAI')?.addEventListener('click', () => onSelect('ai'));
  document.getElementById('vsID')?.addEventListener('click', () => onSelect('id'));
  document.getElementById('vsRandom')?.addEventListener('click', () => onSelect('random'));
}
