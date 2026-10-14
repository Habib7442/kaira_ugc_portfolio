import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { env } from './env';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

let lenis: Lenis | null = null;

export function initMotion() {
  if (env.capture) {
    // Time only moves when the recorder calls __captureStep.
    gsap.ticker.remove(gsap.updateRoot);
    gsap.ticker.lagSmoothing(0);
    return;
  }
  if (env.fx && !env.touch) {
    lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis!.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

/** Smooth-scrolls to an element (Lenis on desktop, native elsewhere). */
export function scrollToEl(el: HTMLElement) {
  if (lenis) lenis.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: env.fx ? 'smooth' : 'auto', block: 'start' });
}

export function lockScroll(on: boolean) {
  if (lenis) (on ? lenis.stop() : lenis.start());
  document.documentElement.classList.toggle('is-locked', on);
}

/** In-page links (#work, #contact…) go through the smooth scroller. */
export function initAnchors() {
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href')!.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    scrollToEl(target);
    history.replaceState(null, '', `#${id}`);
    if (id === 'main' || id === 'top') return;
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}

export { gsap, ScrollTrigger };
