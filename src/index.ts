import { initSmoothScroll } from './modules/smooth-scroll';
import { initNavShrink } from './modules/nav-shrink';
import { initWaitlistModal } from './modules/waitlist-modal';
import { logStatus, onReady, runModule } from './utils';

logStatus('boot');

onReady(() => {
  try {
    runModule('SmoothScroll', initSmoothScroll);
    runModule('NavShrink', initNavShrink);
    runModule('WaitlistModal', initWaitlistModal);
    logStatus('ready');
  } finally {
    // Always release the pre-paint lock, even when a feature fails to initialize.
    document.documentElement.classList.remove('is-loading');
  }
});
