let initialized = false;

/** Toggle all three existing navigation wrappers at five percent of viewport height. */
export function initNavShrink(): void {
  const targets = document.querySelectorAll('.g-nav-w, .s-g-nav, .sw-g-nav');
  if (initialized || !targets.length) return;
  initialized = true;

  let threshold = window.innerHeight * 0.05;
  const update = () => {
    const shrink = window.scrollY >= threshold;
    targets.forEach((element) => element.classList.toggle('is-shrunk', shrink));
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', () => {
    threshold = window.innerHeight * 0.05;
    update();
  }, { passive: true });
}
