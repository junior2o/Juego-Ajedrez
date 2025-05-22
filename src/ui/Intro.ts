export async function showIntro(onFinish: () => void): Promise<void> {
  const container = document.getElementById('app')!;
  container.innerHTML = `
    <div id="intro-logo" style="
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: white;
    ">
      <img src="/logo.png" id="logo" style="width: 0%; transition: width 2s ease;" />
      <button id="startBtn" style="
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 1.2rem;
        cursor: pointer;
      ">Start</button>
    </div>
  `;

  const logo = document.getElementById('logo') as HTMLImageElement;
  const button = document.getElementById('startBtn') as HTMLButtonElement;

  button.addEventListener('click', () => {
    const audio = new Audio('/assets/sounds/intro.mp3');
    audio.play().catch(console.error);

    // Animar el logo
    requestAnimationFrame(() => {
      logo.style.width = '40%';
    });

    // Después de la animación, continuar
    setTimeout(() => {
      onFinish();
    }, 2500);
  });
}
