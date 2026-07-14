/* ── Tiny shared state: the chosen battery pack ───────────────────────
   The configurator writes it; the range calculator reads and reacts.
   No store library — one value, a few listeners. */

export type BatteryWh = 420 | 540 | 630;

let battery: BatteryWh = 540;
const listeners: Array<(b: BatteryWh) => void> = [];

export function getBattery(): BatteryWh {
  return battery;
}

export function setBattery(b: BatteryWh): void {
  if (b === battery) return;
  battery = b;
  for (const fn of listeners) fn(b);
}

export function onBattery(fn: (b: BatteryWh) => void): void {
  listeners.push(fn);
}
