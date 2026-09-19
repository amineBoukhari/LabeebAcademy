/** Green laser trail + smoke halo. Pointer devices only, respects reduced motion. */
export function initCursorFx() {
  if (window.__labeebCursorFx) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;
  window.__labeebCursorFx = true;

  const ACC = '#2EE6A6';
  const trail = document.createElement('div');
  trail.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:60;opacity:0;transition:opacity 450ms ease;mix-blend-mode:screen';
  const smoke = document.createElement('div');
  smoke.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:59;mix-blend-mode:screen';
  document.body.append(trail, smoke);

  const halo = document.createElement('div');
  halo.style.cssText =
    'position:absolute;width:520px;height:520px;border-radius:999px;filter:blur(26px);transform:translate(-50%,-50%);' +
    'opacity:0;transition:opacity 400ms ease;background:radial-gradient(circle,rgba(46,230,166,0.30) 0%,rgba(46,230,166,0.10) 42%,transparent 70%)';
  smoke.appendChild(halo);

  const N = 26;
  const segs = Array.from({ length: N }, () => {
    const d = document.createElement('div');
    d.style.cssText =
      `position:absolute;left:0;top:0;height:2px;border-radius:2px;transform-origin:0 50%;will-change:transform,opacity;background:${ACC}`;
    trail.appendChild(d);
    return d;
  });

  let x = -200, y = -200, sx = -200, sy = -200, on = false, moveAt = 0, lastPuff = 0, parked = false;
  let pts = [];

  const puff = (px, py) => {
    const size = 90 + Math.random() * 150;
    const p = document.createElement('div');
    p.style.cssText =
      `position:absolute;left:${px}px;top:${py}px;width:${size}px;height:${size}px;border-radius:999px;filter:blur(14px);` +
      'transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(46,230,166,0.26),transparent 68%);' +
      'opacity:1;transition:opacity 1400ms ease-out,transform 1400ms ease-out';
    smoke.appendChild(p);
    requestAnimationFrame(() => {
      p.style.opacity = '0';
      p.style.transform = 'translate(-50%,-50%) scale(1.7)';
    });
    setTimeout(() => p.remove(), 1500);
  };

  document.addEventListener(
    'mousemove',
    (e) => {
      x = e.clientX; y = e.clientY; moveAt = Date.now();
      halo.style.left = `${x}px`;
      halo.style.top = `${y}px`;
      halo.style.opacity = '1';
      if (Date.now() - lastPuff > 90) { lastPuff = Date.now(); puff(x, y); }
      if (!on) { on = true; sx = x; sy = y; pts = []; trail.style.opacity = '1'; }
    },
    { passive: true }
  );

  document.addEventListener('mouseleave', () => {
    on = false;
    trail.style.opacity = '0';
    halo.style.opacity = '0';
  });

  const tick = () => {
    if (!on || Date.now() - moveAt > 500) {
      if (!parked) { parked = true; segs.forEach((s) => (s.style.opacity = '0')); halo.style.opacity = '0'; }
      return requestAnimationFrame(tick);
    }
    parked = false;
    sx += (x - sx) * 0.34;
    sy += (y - sy) * 0.34;
    pts.unshift({ x: sx, y: sy });
    if (pts.length > N + 1) pts.length = N + 1;

    for (let i = 0; i < N; i++) {
      const a = pts[i], b = pts[i + 1], sg = segs[i];
      if (!a || !b) { sg.style.opacity = '0'; continue; }
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      const k = 1 - i / N;
      sg.style.width = `${len + 1.5}px`;
      sg.style.height = `${Math.max(0.6, 2.6 * k)}px`;
      sg.style.opacity = (0.9 * k * k).toFixed(3);
      sg.style.boxShadow = `0 0 ${(10 * k).toFixed(1)}px rgba(46,230,166,${(0.7 * k).toFixed(2)})`;
      sg.style.transform = `translate(${a.x}px,${a.y - Math.max(0.3, 1.3 * k)}px) rotate(${Math.atan2(dy, dx)}rad)`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
