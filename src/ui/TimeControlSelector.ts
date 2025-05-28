// src/ui/TimeControlSelector.ts

export type TimeControl = 'no-time' | 'blitz' | 'rapid' | 'classic';

export function showTimeControlSelector(
  gameType: 'ai' | 'id' | 'random',
  onSelect: (control: TimeControl) => void
): void {
  const container = document.getElementById('app')!;
  container.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'center';
  wrapper.style.gap = '20px';
  wrapper.style.padding = '40px';

  const title = document.createElement('h2');
  title.textContent = 'Select time control';
  wrapper.appendChild(title);

  // Available options
  const options: { label: string; value: TimeControl; show: boolean }[] = [
    { label: 'No Time Limit', value: 'no-time', show: gameType !== 'random' },
    { label: 'Blitz (3 + 2)', value: 'blitz', show: true },
    { label: 'Rapid (10 + 5)', value: 'rapid', show: true },
    { label: 'Classic (15 min)', value: 'classic', show: true },
  ];

  for (const opt of options) {
    if (!opt.show) continue;

    const btn = document.createElement('button');
    btn.textContent = opt.label;
    btn.style.padding = '12px 24px';
    btn.style.fontSize = '1.1rem';
    btn.style.cursor = 'pointer';
    btn.style.width = '220px';

    btn.addEventListener('click', () => onSelect(opt.value));
    wrapper.appendChild(btn);
  }

  if (gameType !== 'random') {
    const note = document.createElement('p');
    note.textContent = '⚠️ Use No Time Limit only with someone you trust.';
    note.style.fontSize = '0.9rem';
    note.style.color = '#aa0000';
    wrapper.appendChild(note);
  }

  container.appendChild(wrapper);
}
