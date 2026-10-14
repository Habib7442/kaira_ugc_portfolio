import { videos, type ClientVideo } from 'virtual:content';
import { gsap } from '../lib/motion';
import { lockScroll } from '../lib/motion';
import { $, env } from '../lib/env';

interface OpenOpts { id?: string; brand?: string; origin?: HTMLElement | null }

let root: HTMLElement;
let frame: HTMLElement;
let video: HTMLVideoElement;
let list: ClientVideo[] = videos;
let index = 0;
let origin: HTMLElement | null = null;
let isOpen = false;

const outside = () => ['main', '.nav', '.footer', '.skip'].map((s) => $(s)).filter(Boolean) as HTMLElement[];

export function initPlayer() {
  root = $('.player')!;
  if (!root) return;
  frame = $('.player__frame', root)!;
  video = $<HTMLVideoElement>('.player__video', root)!;
  $('.player__close', root)!.addEventListener('click', closePlayer);
  $('.player__backdrop', root)!.addEventListener('click', closePlayer);
  $('.player__prev', root)!.addEventListener('click', () => step(-1));
  $('.player__next', root)!.addEventListener('click', () => step(1));
  const mute = $<HTMLButtonElement>('.player__mute', root)!;
  mute.addEventListener('click', () => {
    video.muted = !video.muted;
    mute.setAttribute('aria-pressed', String(!video.muted));
    mute.querySelector('span')!.textContent = video.muted ? 'Unmute' : 'Mute';
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePlayer();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') trapFocus(e);
  });

  // Swipe: left/right for next/previous, down to close.
  let sx = 0, sy = 0, tracking = false;
  frame.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; tracking = true; });
  frame.addEventListener('pointerup', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 90) closePlayer();
    else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) (video.paused ? video.play().catch(() => {}) : video.pause());
  });
  frame.addEventListener('pointercancel', () => (tracking = false));
}

function trapFocus(e: KeyboardEvent) {
  const f = [...root.querySelectorAll<HTMLElement>('button:not([hidden]):not([disabled])')];
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function load(i: number) {
  index = i;
  const v = list[i];
  video.pause();
  video.innerHTML = `<source src="${v.webm}" type="video/webm"><source src="${v.mp4}" type="video/mp4">`;
  video.poster = v.poster;
  video.muted = true;
  video.load();
  video.play().catch(() => {});
  $('.player__type', root)!.textContent = v.type;
  $('.player__brand', root)!.textContent = v.brand;
  $('.player__caption', root)!.textContent = v.caption;
  $('.player__count', root)!.textContent = list.length > 1 ? `${i + 1} of ${list.length}` : '';
  const mute = $<HTMLButtonElement>('.player__mute', root)!;
  mute.hidden = !v.hasAudio;
  mute.setAttribute('aria-pressed', 'false');
  mute.querySelector('span')!.textContent = 'Unmute';
  $<HTMLButtonElement>('.player__prev', root)!.disabled = list.length < 2;
  $<HTMLButtonElement>('.player__next', root)!.disabled = list.length < 2;
}

function step(d: number) {
  if (list.length < 2) return;
  const next = (index + d + list.length) % list.length;
  if (!env.fx) return load(next);
  gsap.timeline()
    .to(frame, { xPercent: -d * 12, opacity: 0, duration: 0.18, ease: 'power2.in' })
    .add(() => load(next))
    .fromTo(frame, { xPercent: d * 12 }, { xPercent: 0, opacity: 1, duration: 0.3, ease: 'power3.out' });
}

/** FLIP from a rect: put the frame where `el` is, then animate it home. */
function fromRect(el: HTMLElement, reverse = false, onComplete?: () => void) {
  const target = el.querySelector<HTMLElement>('.phone__screen') ?? el;
  const a = target.getBoundingClientRect();
  gsap.set(frame, { x: 0, y: 0, scaleX: 1, scaleY: 1, xPercent: 0 });
  const b = frame.getBoundingClientRect();
  const visible = a.width > 4 && a.bottom > 0 && a.top < innerHeight;
  const there = visible
    ? { x: a.left - b.left, y: a.top - b.top, scaleX: a.width / b.width, scaleY: a.height / b.height, borderRadius: 18 }
    : { y: 60, scaleX: 0.9, scaleY: 0.9, x: b.width * 0.05, opacity: 0 };
  const home = { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, borderRadius: 24 };
  const backdrop = $('.player__backdrop', root)!;
  if (reverse) {
    gsap.to(backdrop, { opacity: 0, duration: 0.4 });
    gsap.fromTo(frame, home, { ...there, duration: 0.45, ease: 'power3.inOut', onComplete });
  } else {
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.35 });
    gsap.fromTo(frame, there, { ...home, duration: 0.55, ease: 'power3.inOut', onComplete });
  }
}

export function openPlayer({ id, brand, origin: from }: OpenOpts) {
  if (!root || isOpen) return;
  list = brand ? videos.filter((v) => v.brand.toUpperCase() === brand.toUpperCase()) : videos;
  if (!list.length) list = videos;
  const i = Math.max(0, list.findIndex((v) => v.id === id));
  origin = from ?? null;
  isOpen = true;
  load(i);
  root.hidden = false;
  outside().forEach((el) => (el.inert = true));
  lockScroll(true);
  if (env.fx && origin) fromRect(origin);
  $<HTMLButtonElement>('.player__close', root)!.focus({ preventScroll: true });
}

export function closePlayer() {
  if (!isOpen) return;
  isOpen = false;
  video.pause();
  const done = () => {
    root.hidden = true;
    video.removeAttribute('src');
    video.innerHTML = '';
    video.load();
    gsap.set(frame, { clearProps: 'all' });
  };
  outside().forEach((el) => (el.inert = false));
  lockScroll(false);
  if (env.fx && origin) fromRect(origin, true, done);
  else done();
  origin?.focus({ preventScroll: true });
}
