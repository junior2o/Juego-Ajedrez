// src/ui/IdInput.ts

// src/ui/IdInput.ts

function generatePlayerId(): string {
  const existingId = localStorage.getItem('playerId');
  if (existingId) return existingId;

  const newId = Math.random().toString(36).substring(2, 8).toUpperCase(); // e.g., "A1B2C3"
  localStorage.setItem('playerId', newId);
  return newId;
}

export function showIdInput(onSubmit: (ownId: string, opponentId: string) => void): void {
  const ownId = generatePlayerId();

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
      <h1 style="font-size: 2rem;">Play vs Player by ID</h1>
      <p>Your Player ID:</p>
      <div style="
        padding: 10px 20px;
        background-color: #f0f0f0;
        font-weight: bold;
        border-radius: 4px;
      ">${ownId}</div>
      <input id="opponent-id" type="text" placeholder="Enter opponent ID" style="padding: 10px; font-size: 1rem; width: 200px;" />
      <button id="submit-id" style="padding: 10px 20px;">Invite Player</button>
    </div>
  `;

  document.getElementById('submit-id')?.addEventListener('click', () => {
    const input = document.getElementById('opponent-id') as HTMLInputElement;
    const opponentId = input.value.trim().toUpperCase();
    if (opponentId && opponentId !== ownId) {
      onSubmit(ownId, opponentId);
    } else {
      alert('Please enter a valid opponent ID (not your own).');
    }
  });
}

