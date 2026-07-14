/* ── Range calculator ─────────────────────────────────────────────────
   range = pack Wh / (mode Wh-per-km × weight factor × terrain factor)
   The pack follows the configurator's battery choice live. */

import { getBattery, onBattery } from './state';

const SCALE_MAX_KM = 120;
const COMMUTE_KM_PER_DAY = 14;

export function initRangeCalc(): void {
  const form = document.getElementById('rangeForm') as HTMLFormElement | null;
  const weightIn = document.getElementById('weightIn') as HTMLInputElement | null;
  const weightOut = document.getElementById('weightOut');
  const battNode = document.getElementById('rangeBatt');
  const kmNode = document.getElementById('rangeKm');
  const fillNode = document.getElementById('rangeFill');
  const daysNode = document.getElementById('rangeDays');
  if (!form || !weightIn || !weightOut || !battNode || !kmNode || !fillNode || !daysNode) return;

  const read = (name: string, fallback: number): number => {
    const data = new FormData(form);
    const v = data.get(name);
    const n = typeof v === 'string' ? parseFloat(v) : NaN;
    return Number.isFinite(n) ? n : fallback;
  };

  const compute = () => {
    const wh = getBattery();
    const whPerKm = read('mode', 10);
    const terrain = read('terrain', 1);
    const weight = parseFloat(weightIn.value) || 75;
    const weightFactor = 1 + ((weight - 75) / 75) * 0.25;

    const km = wh / (whPerKm * weightFactor * terrain);
    const days = km / COMMUTE_KM_PER_DAY;

    battNode.textContent = `${wh} Wh pack`;
    kmNode.textContent = String(Math.round(km));
    fillNode.style.width = Math.min(100, (km / SCALE_MAX_KM) * 100).toFixed(1) + '%';
    daysNode.textContent = days.toFixed(1);
    weightOut.textContent = `${Math.round(weight)} kg`;
  };

  form.addEventListener('input', compute);
  form.addEventListener('submit', (e) => e.preventDefault());
  onBattery(compute);
  compute();
}
