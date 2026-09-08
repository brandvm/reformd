interface Window {
  Webflow?: { env?: (mode: string) => boolean };
  gsap?: {
    ticker: {
      add: (callback: (seconds: number) => void) => void;
      lagSmoothing: (threshold: number) => void;
    };
  };
  ScrollTrigger?: { update: () => void };
}
