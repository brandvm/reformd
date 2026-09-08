import Lenis from 'lenis';

let controller: Lenis | null = null;

export function getSmoothScroll(): Lenis | null {
  return controller;
}

/** Bundle the same Lenis version used by the existing Webflow footer. */
export function initSmoothScroll(): void {
  if (controller || window.Webflow?.env?.('editor')) return;

  controller = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    syncTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });
  const lenis = controller;
  if (window.ScrollTrigger) {
    lenis.on('scroll', () => window.ScrollTrigger?.update());
  }

  if (window.gsap?.ticker) {
    window.gsap.ticker.add((seconds) => lenis.raf(seconds * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    // Navigation and the modal also work on pages without Webflow's GSAP integration.
    const frame = (milliseconds: number) => {
      lenis.raf(milliseconds);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
}
