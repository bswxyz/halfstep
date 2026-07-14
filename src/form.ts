/* ── Reserve form (demo) ──────────────────────────────────────────────
   Validates, confirms in place, sends nothing. The fine print and the
   README both say so. */

export function initReserveForm(): void {
  const form = document.getElementById('reserveForm') as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector<HTMLInputElement>('#rName');
    const email = form.querySelector<HTMLInputElement>('#rEmail');
    const size = form.querySelector<HTMLSelectElement>('#rSize');
    if (name && !name.checkValidity()) {
      name.reportValidity();
      return;
    }
    if (email && !email.checkValidity()) {
      email.reportValidity();
      return;
    }
    const chosen = size?.value ?? 'M';
    form.innerHTML =
      `<div class="res-done"><strong>Slot held — batch 07.</strong>` +
      `<span class="mono">size ${chosen} · demo only, nothing was sent. a real shop would email you within the hour.</span></div>`;
  });
}
