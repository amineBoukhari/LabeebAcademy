import { animate, inView } from 'motion';

/**
 * "Six façons d'avancer" roadmap: a neon curve links the center of each service
 * photo to the next, and each segment draws itself in — together with that
 * step's waypoint dot — at the exact moment its card scrolls into view, using
 * the same inView trigger as the card's own reveal. That's what sells the
 * "roadmap" read: the road extends as you travel down the page, in step with
 * the content, instead of just sitting there fully drawn.
 *
 * The line draw uses a plain CSS transition on stroke-dashoffset rather than
 * Motion One's animate(): Motion One's WAAPI path doesn't reliably drive that
 * property on a freshly created SVG <path> (it "completes" instantly with no
 * visible interpolation), while a CSS transition handles it correctly.
 */
export function initRoadmap() {
  const root = document.querySelector('[data-roadmap]');
  if (!root) return;

  const svg = root.querySelector('[data-roadmap-svg]');
  const dots = Array.from(root.querySelectorAll('[data-roadmap-dot]'));
  const articles = Array.from(root.querySelectorAll(':scope > article'));
  if (!svg || dots.length < 2) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mq = window.matchMedia('(min-width: 640px)');
  const revealed = new Set();
  let armed = false;

  // two chained bends per link: the first bulges away from the image the line
  // is leaving, the second bulges away from the image it's arriving at — so
  // the curve always swings toward the open/text side and never doubles back
  // over a photo (which is what made some segments look right and others cut
  // off awkwardly when the bulge direction was picked blindly).
  function roadPath(a, b, containerWidth, aOnLeft) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const amp = Math.max(80, containerWidth * 0.24);
    const dirs = aOnLeft ? [1, -1] : [-1, 1];
    const waves = dirs.length;
    let d = `M ${a.x},${a.y}`;
    for (let i = 1; i <= waves; i++) {
      const t0 = (i - 1) / waves;
      const t1 = i / waves;
      const y0 = a.y + dy * t0;
      const y1 = a.y + dy * t1;
      const xBase0 = a.x + dx * t0;
      const xBase1 = a.x + dx * t1;
      const dir = dirs[i - 1];
      const cx1 = xBase0 + dir * amp;
      const cy1 = y0 + (y1 - y0) * 0.35;
      const cx2 = xBase1 + dir * amp;
      const cy2 = y0 + (y1 - y0) * 0.65;
      d += ` C ${cx1},${cy1} ${cx2},${cy2} ${xBase1},${y1}`;
    }
    return d;
  }

  function positionPaths() {
    const rootRect = root.getBoundingClientRect();
    const points = dots.map((dot) => {
      const r = dot.getBoundingClientRect();
      return { x: r.left + r.width / 2 - rootRect.left, y: r.top + r.height / 2 - rootRect.top };
    });
    svg.setAttribute('viewBox', `0 0 ${rootRect.width} ${rootRect.height}`);

    let paths = Array.from(svg.querySelectorAll('path'));
    if (!paths.length) {
      for (let i = 0; i < points.length - 1; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke', '#2EE6A6');
        path.setAttribute('stroke-width', '1.75');
        path.setAttribute('stroke-opacity', '0.18');
        path.setAttribute('fill', 'none');
        path.style.filter =
          'drop-shadow(0 0 4px rgba(46,230,166,0.9)) drop-shadow(0 0 14px rgba(46,230,166,0.55)) drop-shadow(0 0 34px rgba(46,230,166,0.3))';
        svg.appendChild(path);
        paths.push(path);
      }
    }

    points.slice(0, -1).forEach((a, i) => {
      const b = points[i + 1];
      const aOnLeft = i % 2 === 0; // matches the photo column alternation
      paths[i].setAttribute('d', roadPath(a, b, rootRect.width, aOnLeft));
      if (!reduced && !revealed.has(i)) {
        const len = paths[i].getTotalLength();
        paths[i].style.transition = 'none';
        paths[i].style.strokeDasharray = `${len}`;
        paths[i].style.strokeDashoffset = `${len}`;
      }
    });

    return paths;
  }

  function armReveal(paths) {
    if (armed || reduced) return;
    armed = true;

    dots.forEach((dot, i) => {
      if (i === 0) return; // the first waypoint is the road's start, visible immediately
      dot.style.opacity = '0';
      dot.style.transform = 'translate(-50%, -50%) scale(0.3)';
    });

    inView(
      articles.slice(1),
      (entry) => {
        const idx = articles.indexOf(entry.target);
        const path = paths[idx - 1];
        const dot = dots[idx];

        if (path && !revealed.has(idx - 1)) {
          revealed.add(idx - 1);
          // force the "fully hidden" state to be committed before enabling the
          // transition, otherwise the browser can coalesce it away.
          path.getBoundingClientRect();
          path.style.transition = 'stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)';
          requestAnimationFrame(() => {
            path.style.strokeDashoffset = '0';
          });
        }
        if (dot) {
          animate(
            dot,
            { opacity: 1, transform: ['translate(-50%, -50%) scale(0.3)', 'translate(-50%, -50%) scale(1)'] },
            { duration: 0.7, easing: [0.22, 1, 0.36, 1] }
          );
        }
        return false; // fire once, same as the card's own reveal
      },
      { margin: '0px 0px -10% 0px', amount: 0.15 }
    );
  }

  function update() {
    if (!mq.matches) {
      svg.innerHTML = '';
      armed = false;
      revealed.clear();
      return;
    }
    const paths = positionPaths();
    armReveal(paths);
  }

  update();
  window.addEventListener('resize', update);
  mq.addEventListener('change', update);
  window.addEventListener('load', update);
  setTimeout(update, 300);
}
