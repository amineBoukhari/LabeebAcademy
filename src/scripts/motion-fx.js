import { animate, inView, scroll } from 'motion';

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scroll reveals: [data-reveal] with optional data-delay (ms) and data-reveal="media". */
export function initReveals() {
  const nodes = document.querySelectorAll('[data-reveal]');
  if (!nodes.length) return;

  if (reduced) {
    nodes.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
    return;
  }

  nodes.forEach((el) => {
    const media = el.dataset.reveal === 'media';
    el.style.opacity = '0';
    el.style.transform = media ? 'translateY(38px) scale(0.99)' : 'translateY(28px)';
    if (media) el.style.clipPath = 'inset(12% 0 12% 0)';
    el.style.willChange = 'opacity, transform';
  });

  inView(
    nodes,
    (entry) => {
      const el = entry.target;
      const delay = Number(el.dataset.delay || 0) / 1000;
      animate(
        el,
        media(el)
          ? { opacity: 1, transform: 'translateY(0px) scale(1)', clipPath: 'inset(0% 0 0% 0)' }
          : { opacity: 1, transform: 'translateY(0px)' },
        { duration: 1.1, delay, easing: [0.22, 1, 0.36, 1] }
      );
      return false; // fire once
    },
    { margin: '0px 0px -10% 0px', amount: 0.15 }
  );

  function media(el) { return el.dataset.reveal === 'media'; }
}

/** Slow parallax inside fixed frames: [data-parallax]. */
export function initParallax() {
  if (reduced) return;
  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const amount = Number(el.dataset.parallax || 24);
    scroll(animate(el, { transform: [`translateY(${amount}px) scale(1.04)`, `translateY(-${amount}px) scale(1.04)`] }), {
      target: el.parentElement ?? el,
      offset: ['start end', 'end start']
    });
  });
}

/** Travel hero: the plane flies up and the copy lifts out over the first screen. */
export function initPlaneHero() {
  const hero = document.querySelector('[data-plane-hero]');
  if (!hero) return;
  const plane = hero.querySelector('[data-plane]');
  const copy = hero.querySelector('[data-plane-copy]');
  const sea = hero.querySelector('[data-plane-sea]');

  if (reduced) return;

  if (plane) {
    scroll(
      animate(plane, {
        transform: [
          'translate(-50%, -50%) translateY(34vh) scale(0.92)',
          'translate(-50%, -50%) translateY(-86vh) scale(1.1)'
        ],
        opacity: [1, 1, 0.15]
      }),
      { target: hero, offset: ['start start', 'end start'] }
    );
  }
  if (sea) {
    scroll(animate(sea, { transform: ['translateY(-4%) scale(1.12)', 'translateY(6%) scale(1.02)'] }), {
      target: hero,
      offset: ['start start', 'end start']
    });
  }
  if (copy) {
    scroll(animate(copy, { transform: ['translateY(0px)', 'translateY(-46px)'], opacity: [1, 1, 0] }), {
      target: hero,
      offset: ['start start', 'end start']
    });
  }
}

export function initMotion() {
  initReveals();
  initParallax();
  initPlaneHero();
}
