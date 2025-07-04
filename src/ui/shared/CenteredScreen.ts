/**
 * Crea una pantalla centrada con contenido principal y botones inferiores.
 * Aplica la misma estructura que GameModeSelector.
 *
 * @param content - El contenedor principal (títulos, formularios, etc.)
 * @param buttons - (opcional) Contenedor de botones inferiores
 * @returns El elemento HTML completo de la pantalla
 */
export function createCenteredScreen(content: HTMLElement, buttons?: HTMLElement): HTMLDivElement {
  const menuScreen = document.createElement('div');
  menuScreen.id = 'menu-screen';

  // Centrado animado del contenido principal
  content.style.position = 'absolute';
  content.style.top = '50%';
  content.style.left = '50%';
  content.style.transform = 'translate(-50%, -60%)';
  content.style.opacity = '0';
  content.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

  setTimeout(() => {
    content.style.opacity = '1';
    content.style.transform = 'translate(-50%, -50%)';
  }, 50);

  menuScreen.appendChild(content);

  if (buttons) {
    menuScreen.appendChild(buttons);
  }

  return menuScreen;
}
