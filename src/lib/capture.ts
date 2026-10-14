// ?capture=1 — deterministic frame stepping for the Puppeteer + Remotion showcase reel.
import { gsap, ScrollTrigger } from './motion';
import { $$, env } from './env';

type Hook = (t: number) => Promise<void> | void;
const hooks: Hook[] = [];

/** Sections register work that must finish before a frame is "ready" (e.g. seeking videos). */
export const onCaptureStep = (fn: Hook) => { if (env.capture) hooks.push(fn); };

export interface CaptureSection { id: string; start: number; end: number; pinned: boolean }

declare global {
  interface Window {
    __captureReady?: boolean;
    __captureStep?: (scrollY: number, t: number) => Promise<void>;
    __captureSections?: CaptureSection[];
  }
}

/** Frames to wait after each step; raise with ?settle=N if a fast machine still shows soft tiles. */
const settleFrames = Number(new URLSearchParams(location.search).get('settle')) || 4;
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** Seeks a video to a time and resolves once that frame is decoded. */
export function seekVideo(v: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    const go = () => {
      const d = v.duration || 1;
      const target = Math.max(0, (t % d) - 0.001);
      if (Math.abs(v.currentTime - target) < 0.01) return resolve();
      const done = () => { v.removeEventListener('seeked', done); resolve(); };
      v.addEventListener('seeked', done);
      v.currentTime = target;
      setTimeout(done, 1500);
    };
    if (v.readyState >= 1) go();
    else {
      v.addEventListener('loadedmetadata', go, { once: true });
      if (v.preload === 'none') v.preload = 'auto';
      if (v.networkState === HTMLMediaElement.NETWORK_EMPTY) v.load();
      setTimeout(resolve, 3000);
    }
  });
}

function measureSections(): CaptureSection[] {
  return $$<HTMLElement>('main > section, footer').map((s) => {
    const top = s.getBoundingClientRect().top + window.scrollY;
    return { id: s.id || s.tagName.toLowerCase(), start: Math.round(top), end: Math.round(top + s.offsetHeight), pinned: !!s.querySelector('[class$="__sticky"]') && s.offsetHeight > window.innerHeight * 1.05 };
  });
}

export async function initCapture() {
  if (!env.capture) return;
  window.__captureReady = false;
  window.__captureStep = async (scrollY: number, t: number) => {
    window.scrollTo(0, scrollY);
    await frame(); // let the scroll event land so ScrollTrigger reads the new position
    ScrollTrigger.update();
    gsap.updateRoot(t);
    await Promise.all(hooks.map((h) => h(t)));
    // Give the compositor time to finish full-resolution raster after a scroll jump.
    for (let i = 0; i < settleFrames; i++) await frame();
  };
  // Every image loads up-front so no frame ever shows a half-loaded picture.
  const imgs = $$<HTMLImageElement>('img');
  imgs.forEach((img) => (img.loading = 'eager'));
  await document.fonts.ready;
  await Promise.all(imgs.map((img) => img.decode().catch(() => null)));
  ScrollTrigger.refresh();
  window.__captureSections = measureSections();
  ScrollTrigger.addEventListener('refresh', () => { window.__captureSections = measureSections(); });
  window.__captureReady = true;
}
