/* ── Spec configurator ────────────────────────────────────────────────
   Three decisions: size, battery, paint. Battery drives price, weight,
   charge time and the Eco range headline; paint repaints every diagram
   on the page by flipping data-paint on <html>. */

import { setBattery, type BatteryWh } from './state';

interface PackSpec {
  price: number;
  weightKg: number;
  chargeH: number;
  ecoKm: number;
}

const PACKS: Record<BatteryWh, PackSpec> = {
  420: { price: 2790, weightKg: 14.5, chargeH: 3.2, ecoKm: 60 },
  540: { price: 2990, weightKg: 14.9, chargeH: 4.0, ecoKm: 77 },
  630: { price: 3230, weightKg: 15.4, chargeH: 4.6, ecoKm: 90 },
};

const PAINT_NAMES: Record<string, string> = {
  graphite: 'Graphite',
  bone: 'Bone',
  moss: 'Moss',
};

const euro = (n: number) => '€' + n.toLocaleString('en-IE');

export function initConfigurator(reducedMotion: boolean): void {
  const form = document.getElementById('cfgForm') as HTMLFormElement | null;
  const sumName = document.getElementById('sumName');
  const sumRange = document.getElementById('sumRange');
  const sumWeight = document.getElementById('sumWeight');
  const sumCharge = document.getElementById('sumCharge');
  const sumPrice = document.getElementById('sumPrice');
  if (!form || !sumName || !sumRange || !sumWeight || !sumCharge || !sumPrice) return;

  let shownPrice = PACKS[540].price;
  let priceRaf = 0;
  let priceTimer = 0;

  /* The count-up mutates text every frame for ~450 ms — far too chatty for a
     live region. Split the price into a visual-only animated span (aria-hidden)
     and a visually-hidden span that AT reads, updated once per change. */
  const priceVisual = document.createElement('span');
  priceVisual.setAttribute('aria-hidden', 'true');
  priceVisual.textContent = sumPrice.textContent;
  const priceSpoken = document.createElement('span');
  priceSpoken.className = 'sr-only';
  priceSpoken.textContent = sumPrice.textContent;
  sumPrice.textContent = '';
  sumPrice.append(priceVisual, priceSpoken);

  const animatePrice = (to: number) => {
    cancelAnimationFrame(priceRaf);
    clearTimeout(priceTimer);
    if (priceSpoken.textContent !== euro(to)) priceSpoken.textContent = euro(to);
    if (reducedMotion || to === shownPrice) {
      shownPrice = to;
      priceVisual.textContent = euro(to);
      return;
    }
    const from = shownPrice;
    const start = performance.now();
    const dur = 450;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      shownPrice = Math.round(from + (to - from) * eased);
      priceVisual.textContent = euro(shownPrice);
      if (p < 1) priceRaf = requestAnimationFrame(tick);
    };
    priceRaf = requestAnimationFrame(tick);
    // insurance: land on the final price even if rAF gets throttled
    priceTimer = window.setTimeout(() => {
      shownPrice = to;
      priceVisual.textContent = euro(to);
    }, dur + 150);
  };

  const read = (name: string, fallback: string): string => {
    const data = new FormData(form);
    const v = data.get(name);
    return typeof v === 'string' ? v : fallback;
  };

  const apply = () => {
    const size = read('size', 'M');
    const wh = parseInt(read('battery', '540'), 10) as BatteryWh;
    const paint = read('paint', 'graphite');
    const spec = PACKS[wh] ?? PACKS[540];

    document.documentElement.dataset.paint = paint;
    setBattery(wh);

    sumName.textContent = `One · ${size} · ${PAINT_NAMES[paint] ?? paint} · ${wh} Wh`;
    sumRange.textContent = `up to ${spec.ecoKm} km`;
    sumWeight.textContent = `${spec.weightKg.toFixed(1)} kg`;
    sumCharge.textContent = `${spec.chargeH.toFixed(1)} h`;
    animatePrice(spec.price);
  };

  form.addEventListener('change', apply);
  form.addEventListener('submit', (e) => e.preventDefault());
  apply();
}
