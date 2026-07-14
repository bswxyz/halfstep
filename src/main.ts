/* ============================================================
   HALFSTEP — interactions
   Progressive enhancement: the page reads fully without JS.
   Signature: the exploded-assembly scroll (src/explode.ts).
   ============================================================ */

import { initTheme } from './theme';
import { initReveals, initCounters } from './reveal';
import { initExplode } from './explode';
import { initConfigurator } from './configurator';
import { initRangeCalc } from './rangecalc';
import { initReserveForm } from './form';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initTheme();
initReveals(reducedMotion);
initCounters(reducedMotion);
initExplode(reducedMotion);
initConfigurator(reducedMotion);
initRangeCalc();
initReserveForm();

/* hero intro — clipped lines rise once everything is wired
   (setTimeout fallback in case rAF is throttled at load) */
const hero = document.querySelector('.hero');
const load = () => hero?.classList.add('loaded');
requestAnimationFrame(load);
setTimeout(load, 400);

/* footer year */
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());
