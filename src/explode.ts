/* ── Signature flourish: the exploded-assembly scroll ─────────────────
   A sticky stage pins the service diagram while the section scrolls
   ~3.4 viewports. Progress maps to three phases:

     0 ─── .40      parts fly out, staggered (easeOut)
     .40 ─ .60      hold — the labelled exploded diagram
     .60 ─ 1        parts fly home, reverse stagger

   Each part is an SVG <g>; we translate/rotate it in user units and
   drag its callout's leader line along with it. Reduced motion never
   binds any of this: CSS shows the assembled bike with static labels,
   and the callout lines in the markup already point at the assembled
   anchors. */

interface PartDef {
  id: string;
  dx: number; // exploded offset, viewBox units
  dy: number;
  rot: number; // small mechanical tilt, degrees
  delay: number; // stagger, 0..0.35 of the explode phase
  ax: number; // assembled callout anchor
  ay: number;
}

const PARTS: PartDef[] = [
  { id: 'fw', dx: 130, dy: 55, rot: 14, delay: 0.0, ax: 716, ay: 310 },
  { id: 'rw', dx: -100, dy: 55, rot: -14, delay: 0.07, ax: 212, ay: 312 },
  { id: 'saddle', dx: -52, dy: -120, rot: -6, delay: 0.14, ax: 352, ay: 164 },
  { id: 'battery', dx: 90, dy: -150, rot: 8, delay: 0.21, ax: 612, ay: 300 },
  { id: 'motor', dx: 8, dy: 140, rot: -10, delay: 0.28, ax: 486, ay: 432 },
  { id: 'frame', dx: 0, dy: -18, rot: 0, delay: 0.34, ax: 433, ay: 330 },
];

const STAGGER_SPAN = 0.35;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export function initExplode(reducedMotion: boolean): void {
  const scroller = document.getElementById('explodeScroll');
  const svg = document.getElementById('bikeExplode');
  if (!scroller || !svg) return;

  const phaseNode = document.getElementById('explodePhase');
  const fillNode = document.getElementById('explodeFill');
  const belt = svg.querySelector<SVGPathElement>('.bk-belt');
  const shadows = svg.querySelector<SVGGElement>('.bk-shadows');

  interface Wired {
    def: PartDef;
    node: SVGGElement;
    callout: SVGGElement | null;
    line: SVGLineElement | null;
  }
  const wired: Wired[] = [];
  for (const def of PARTS) {
    const node = svg.querySelector<SVGGElement>(`[data-part="${def.id}"]`);
    if (!node) continue;
    const callout = svg.querySelector<SVGGElement>(`.callout[data-for="${def.id}"]`);
    wired.push({ def, node, callout, line: callout?.querySelector('.c-line') ?? null });
  }

  if (reducedMotion) return; // CSS already shows assembled bike + static labels

  let active = true;
  let lastPhase = '';

  const setPhase = (label: string) => {
    if (label !== lastPhase && phaseNode) {
      phaseNode.textContent = label;
      lastPhase = label;
    }
  };

  /* Called straight from the scroll event — the work is six transforms
     and a handful of attributes, comfortably under a frame budget, and
     it keeps working even when rAF is throttled. */
  const render = () => {
    if (!active) return;
    const vh = window.innerHeight;
    const rect = scroller.getBoundingClientRect();
    const total = rect.height - vh;
    if (total <= 0) return;
    const p = clamp(-rect.top / total, 0, 1);

    // global explode amount 0→1→0 across the three phases
    let eRaw: number;
    if (p < 0.4) eRaw = easeInOutCubic(p / 0.4);
    else if (p < 0.6) eRaw = 1;
    else eRaw = 1 - easeInOutCubic((p - 0.6) / 0.4);

    for (const w of wired) {
      const { def } = w;
      // staggered per-part progress: early parts leave first, return last
      const local = clamp((eRaw * (1 + STAGGER_SPAN) - def.delay) / 1, 0, 1);
      const e = easeOutCubic(local);
      w.node.style.transform = `translate(${def.dx * e}px, ${def.dy * e}px) rotate(${def.rot * e}deg)`;
      if (w.callout) {
        w.callout.style.opacity = String(clamp((e - 0.5) / 0.35, 0, 1));
      }
      if (w.line) {
        w.line.setAttribute('x2', (def.ax + def.dx * e).toFixed(1));
        w.line.setAttribute('y2', (def.ay + def.dy * e).toFixed(1));
      }
      const dot = w.callout?.querySelector('.c-dot');
      if (dot) {
        dot.setAttribute('cx', (def.ax + def.dx * e).toFixed(1));
        dot.setAttribute('cy', (def.ay + def.dy * e).toFixed(1));
      }
    }

    if (belt) belt.style.opacity = (1 - eRaw).toFixed(2);
    if (shadows) shadows.style.opacity = (1 - eRaw).toFixed(2);
    if (fillNode) fillNode.style.width = (p * 100).toFixed(1) + '%';

    if (p < 0.02) setPhase('assembled');
    else if (p < 0.4) setPhase('coming apart');
    else if (p < 0.6) setPhase('exploded');
    else if (p < 0.98) setPhase('reassembling');
    else setPhase('assembled');
  };

  // skip all work while the section is off-screen
  const io = new IntersectionObserver(
    (entries) => {
      active = entries[0].isIntersecting;
      if (active) render();
    },
    { threshold: 0 },
  );
  io.observe(scroller);

  addEventListener('scroll', render, { passive: true });
  addEventListener('resize', render);
  render();
}
