const BADGE = 'color:#fff;background:#111;padding:4px 8px;border-radius:6px;font-weight:700;';
const BADGE_ACCENT = 'color:#111;background:#badeca;padding:4px 8px;border-radius:6px;font-weight:700;';

export function logStatus(status: string): void {
  console.log('%cSite Modules%c ' + status, BADGE, BADGE_ACCENT);
}

export function runModule(name: string, init: () => void): void {
  try {
    init();
    console.log(`✅ ${name}`);
  } catch (error) {
    // A failure in one feature must not prevent the remaining modules from starting.
    console.error(`❌ ${name} failed`, error);
  }
}

export function onReady(init: () => void): void {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
}
