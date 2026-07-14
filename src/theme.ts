/* ── Theme toggle ──────────────────────────────────────────────────────
   Light (bone) is default. The inline <head> bootstrap already applied
   any stored preference before first paint; this wires the button. */

const STORAGE_KEY = 'halfstep-theme';
const THEME_COLOR: Record<string, string> = { light: '#ece7dd', dark: '#17181a' };

export function initTheme(): void {
  const root = document.documentElement;
  const btn = document.getElementById('themeBtn');
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!btn) return;

  const sync = () => {
    const dark = root.dataset.theme === 'dark';
    btn.setAttribute('aria-pressed', String(dark));
    btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    meta?.setAttribute('content', THEME_COLOR[dark ? 'dark' : 'light']);
  };

  sync();
  btn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(STORAGE_KEY, root.dataset.theme);
    } catch {
      /* private mode — theme just won't persist */
    }
    sync();
  });
}
