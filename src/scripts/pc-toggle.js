/** Mobile Pourquoi/Comment toggle: switches which full-width pane is shown and updates the button state. */
export function initPcToggle() {
  const root = document.querySelector('.pc-split');
  if (!root) return;

  const buttons = Array.from(root.querySelectorAll('[data-pc-toggle]'));
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      root.dataset.pcActive = btn.dataset.pcToggle;
      buttons.forEach((b) => {
        const active = b === btn;
        b.dataset.active = active ? 'true' : 'false';
        b.setAttribute('aria-pressed', String(active));
      });
    });
  });
}
