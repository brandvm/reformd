import { getSmoothScroll } from './smooth-scroll';

export function initWaitlistModal(): void {
  const dialog = document.querySelector<HTMLDialogElement>('#waitlist-modal');
  if (!dialog || typeof dialog.showModal !== 'function' || dialog.dataset.waitlistReady) return;
  const modal = dialog;
  modal.dataset.waitlistReady = 'true';
  const triggers = [...document.querySelectorAll<HTMLElement>('[data-waitlist-open]')];
  const formBlock = modal.querySelector('.w-form');
  const heading = modal.querySelector('h2');
  let opener: HTMLElement | null = null;
  let previousOverflow: { html: string; body: string } | null = null;
  let smoothScroll: ReturnType<typeof getSmoothScroll> = null;
  let resumeSmoothScroll = false;
  let backdropPointerDown = false;

  // Component instances can share authored IDs. Keep modal fields and ARIA references unique.
  if (formBlock) {
    const idMap = new Map();
    formBlock.querySelectorAll('[id]').forEach(element => {
      const oldId = element.id;
      const newId = 'waitlist-modal-' + oldId;
      idMap.set(oldId, newId);
      element.id = newId;
    });
    formBlock.querySelectorAll('[for], [aria-labelledby], [aria-describedby], [aria-controls]').forEach(element => {
      ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls'].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        element.setAttribute(attribute, element.getAttribute(attribute)!.split(/\s+/).map(id => idMap.get(id) || id).join(' '));
      });
    });
    formBlock.querySelectorAll<HTMLInputElement>('input:not([type="hidden"]):not([type="submit"])').forEach(input => {
      if (!input.labels?.length && !input.hasAttribute('aria-label') && !input.hasAttribute('aria-labelledby')) {
        input.setAttribute('aria-label', input.getAttribute('placeholder') || input.name);
      }
    });
  }
  if (heading) {
    heading.id = 'waitlist-modal-title';
    heading.tabIndex = -1;
    modal.setAttribute('aria-labelledby', heading.id);
    modal.removeAttribute('aria-label');
  }
  function setExpanded(expanded: boolean) {
    triggers.forEach(trigger => trigger.setAttribute('aria-expanded', String(expanded)));
  }
  function openModal(trigger: HTMLElement) {
    if (modal.open) return;
    opener = trigger;
    previousOverflow = {
      html: document.documentElement.style.overflow,
      body: document.body.style.overflow
    };
    smoothScroll = getSmoothScroll();
    resumeSmoothScroll = Boolean(smoothScroll && !smoothScroll.isStopped);
    if (resumeSmoothScroll) smoothScroll?.stop();
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    modal.showModal();
    setExpanded(true);
    (heading || modal.querySelector<HTMLButtonElement>('[data-waitlist-close]')!).focus({ preventScroll: true });
  }
  function closeModal() {
    if (modal.open) modal.close();
  }
  // Capture only the modal trigger, before the site's generic anchor handlers.
  document.addEventListener('click', event => {
    const trigger = event.target instanceof Element
      ? event.target.closest<HTMLElement>('[data-waitlist-open]')
      : null;
    if (!trigger) return;
    event.preventDefault();
    event.stopPropagation();
    openModal(trigger);
  }, true);
  triggers.forEach(trigger => {
    trigger.addEventListener('keydown', event => {
      if (event.key === ' ') {
        event.preventDefault();
        openModal(trigger);
      }
    });
  });
  modal.querySelector('[data-waitlist-close]')?.addEventListener('click', closeModal);
  modal.addEventListener('cancel', event => {
    event.preventDefault();
    closeModal();
  });
  function isOutside(event: MouseEvent) {
    const rect = modal.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  }
  modal.addEventListener('pointerdown', event => {
    backdropPointerDown = event.target === modal && isOutside(event);
  });
  modal.addEventListener('click', event => {
    if (backdropPointerDown && event.target === modal && isOutside(event)) closeModal();
    backdropPointerDown = false;
  });
  modal.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...modal.querySelectorAll<HTMLElement>('button, a[href], input:not([type="hidden"]), select, textarea, [tabindex]')]
      .filter(element => !element.matches(':disabled') && element.tabIndex >= 0 && element.getClientRects().length &&
        getComputedStyle(element).visibility !== 'hidden');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  });
  modal.addEventListener('close', () => {
    if (previousOverflow) {
      document.documentElement.style.overflow = previousOverflow.html;
      document.body.style.overflow = previousOverflow.body;
      previousOverflow = null;
    }
    if (resumeSmoothScroll) smoothScroll?.start();
    resumeSmoothScroll = false;
    setExpanded(false);
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
  });
}
