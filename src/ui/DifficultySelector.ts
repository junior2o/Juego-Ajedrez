// src/ui/DifficultySelector.ts

export function showDifficultySelector(onSelect: (level: 'beginner' | 'intermediate' | 'advanced') => void): void {
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
      <h1 style="font-size: 2rem;">Select AI Difficulty</h1>
      <button id="btn-beginner" style="padding: 10px 20px;">Beginner</button>
      <button id="btn-intermediate" style="padding: 10px 20px;">Intermediate</button>
      <button id="btn-advanced" style="padding: 10px 20px;">Advanced</button>
    </div>
  `;

  document.getElementById('btn-beginner')?.addEventListener('click', () => onSelect('beginner'));
  document.getElementById('btn-intermediate')?.addEventListener('click', () => onSelect('intermediate'));
  document.getElementById('btn-advanced')?.addEventListener('click', () => onSelect('advanced'));
}
