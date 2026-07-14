/* ── Scroll reveals + animated counters ───────────────────────────────
   Progressive: hidden initial states are gated behind the .js class,
   and reduced-motion visitors get instant, final content. */

export function initReveals(reducedMotion: boolean): void {
  const nodes = document.querySelectorAll<HTMLElement>('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    nodes.forEach((n) => n.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('is-in');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.16, rootMargin: '0px 0px -6% 0px' },
  );
  nodes.forEach((n) => io.observe(n));
}

export function initCounters(reducedMotion: boolean): void {
  const nodes = document.querySelectorAll<HTMLElement>('.c-num');
  const finish = (n: HTMLElement) => {
    const to = parseFloat(n.dataset.to || '0');
    const dec = parseInt(n.dataset.decimals || '0', 10);
    n.textContent = to.toFixed(dec);
  };
  // markup ships the final values — no-JS and reduced-motion read them as-is
  if (reducedMotion || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const n = e.target as HTMLElement;
        io.unobserve(n);
        const to = parseFloat(n.dataset.to || '0');
        const dec = parseInt(n.dataset.decimals || '0', 10);
        const dur = 1200;
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          n.textContent = (to * eased).toFixed(dec);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        // insurance: land on the final value even if rAF gets throttled
        setTimeout(() => finish(n), dur + 250);
      }
    },
    { threshold: 0.6 },
  );
  nodes.forEach((n) => {
    // zero out only now that we know the count-up will actually run
    const dec = parseInt(n.dataset.decimals || '0', 10);
    n.textContent = (0).toFixed(dec);
    io.observe(n);
  });
}
