export function showModal(
  message: string,
  title: string = 'Aviso',
  options: {
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    iconSrc?: string; // ✅ añadir aquí
  } = {}
): void {
  const existing = document.getElementById('custom-modal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'custom-modal';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';

  const modal = document.createElement('div');
  modal.style.background = 'white';
  modal.style.padding = '2.5rem';
  modal.style.borderRadius = '16px';
  modal.style.textAlign = 'center';
  modal.style.width = 'min(90vw, 420px)';
  modal.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';
  modal.style.fontFamily = 'Segoe UI, sans-serif';

  const modalTitle = document.createElement('h3');
  modalTitle.textContent = title;
  modalTitle.style.marginBottom = '1.5rem';
  modal.appendChild(modalTitle);

  const modalMsg = document.createElement('p');
  modalMsg.textContent = message;
  modalMsg.style.marginBottom = '2rem';
  modal.appendChild(modalMsg);

  const buttonGroup = document.createElement('div');
  buttonGroup.style.display = 'flex';
  buttonGroup.style.justifyContent = 'center';
  buttonGroup.style.gap = '1rem';

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = options.confirmText || 'Aceptar';
  confirmBtn.className = 'menu-btn';
  confirmBtn.style.width = '140px';
  confirmBtn.onclick = () => {
    overlay.remove();
    if (options.onConfirm) options.onConfirm();
  };
  buttonGroup.appendChild(confirmBtn);

  if (options.cancelText) {
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = options.cancelText;
    cancelBtn.className = 'menu-btn';
    cancelBtn.style.width = '140px';
    cancelBtn.onclick = () => {
      overlay.remove();
      if (options.onCancel) options.onCancel();
    };
    buttonGroup.appendChild(cancelBtn);
  }

  modal.appendChild(buttonGroup);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
