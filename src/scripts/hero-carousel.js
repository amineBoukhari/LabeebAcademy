const INTERVAL_MS = 4000;

/** Auto-rotating hero arch: 3 crossfading photos, a matching word, and click-to-pick dots. */
export function initHeroCarousel() {
  const root = document.querySelector('[data-hero-carousel]');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('[data-hero-slide]'));
  const word = root.querySelector('[data-hero-word]');
  const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
  if (!slides.length) return;

  const words = slides.map((s) => s.dataset.word || '');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer;

  function show(i) {
    index = i;
    slides.forEach((s, n) => { s.style.opacity = n === i ? '1' : '0'; });
    if (word) word.textContent = words[i];
    dots.forEach((d, n) => {
      d.style.width = n === i ? '28px' : '14px';
      // backgroundColor (not the `background` shorthand) so it doesn't reset the
      // background-clip:content-box the markup relies on for the enlarged tap target.
      d.style.backgroundColor = n === i ? '#2EE6A6' : 'rgba(255,255,255,0.3)';
    });
  }

  function restart() {
    clearInterval(timer);
    if (reduced) return;
    timer = setInterval(() => show((index + 1) % slides.length), INTERVAL_MS);
  }

  dots.forEach((d, n) => d.addEventListener('click', () => { show(n); restart(); }));

  show(0);
  restart();
}
