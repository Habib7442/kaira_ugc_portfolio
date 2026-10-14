import { gsap, ScrollTrigger } from '../lib/motion';
import { $, $$, env, MQ, SCRUB } from '../lib/env';
import { onCaptureStep, seekVideo } from '../lib/capture';
import { openPlayer } from './player';

const NEAREST = 3;

export function initTunnel() {
  const section = $('.tunnel');
  if (!section) return;
  const stage = $('.tunnel__stage', section)!;
  const intro = $('.tunnel__intro', section)!;
  const allPhones = $$<HTMLButtonElement>('button.phone', section);
  const final = $('.phone--final', section);

  allPhones.forEach((p) => p.addEventListener('click', () => openPlayer({ id: p.dataset.video!, origin: p })));

  if (!env.fx3d) return; // grid fallback: posters only, tap to play

  const playing = new Set<HTMLButtonElement>();
  const videoOf = (p: HTMLElement) => $<HTMLVideoElement>('.phone__video', p)!;
  const load = (p: HTMLElement) => {
    const v = videoOf(p);
    if (!v.src) { v.preload = 'auto'; v.src = v.dataset.src!; }
    return v;
  };
  const play = (p: HTMLButtonElement) => {
    const v = load(p);
    if (env.capture) { p.classList.add('is-playing'); return; }
    v.addEventListener('playing', () => p.classList.add('is-playing'), { once: true });
    v.play().catch(() => { /* autoplay blocked: poster stays */ });
  };
  const stop = (p: HTMLButtonElement) => videoOf(p).pause();
  const setPlaying = (next: HTMLButtonElement[]) => {
    playing.forEach((p) => { if (!next.includes(p)) { stop(p); playing.delete(p); } });
    next.forEach((p) => { if (!playing.has(p)) { playing.add(p); play(p); } });
  };
  let inView = false;
  const pauseAll = () => playing.forEach(stop);
  const resumeAll = () => { if (inView && !document.hidden && !env.capture) playing.forEach((p) => videoOf(p).play().catch(() => {})); };
  document.addEventListener('visibilitychange', () => (document.hidden ? pauseAll() : resumeAll()));

  // In capture mode videos are paused and seeked to the frame time instead of playing.
  onCaptureStep((t) => Promise.all([...playing].map((p) => seekVideo(load(p), t))).then(() => {}));

  const mm = gsap.matchMedia();
  mm.add({ desktop: MQ.desktop, mobile: MQ.mobile }, (ctx) => {
    const { mobile } = ctx.conditions as { mobile: boolean };
    const phones = allPhones.filter((p) => getComputedStyle(p).display !== 'none');
    const gap = mobile ? 400 : 560;
    const angle = mobile ? 14 : 25;
    const startZ = mobile ? 650 : 900;
    const P = mobile ? 700 : 900;
    const zs = phones.map((_, i) => -startZ - i * gap);
    const finalZ = -startZ - phones.length * gap - gap * 0.3;
    const finalStop = mobile ? 60 : 200;
    const camEnd = finalStop - finalZ;
    const far = -gap * 5.5;
    let W = stage.clientWidth;
    let H = stage.clientHeight;
    const state = { cam: 0 };

    // Preload the first three loops just before the tunnel arrives.
    ScrollTrigger.create({ trigger: section, start: 'top 150%', once: true, onEnter: () => phones.slice(0, NEAREST).forEach(load) });

    const render = () => {
      const cam = state.cam;
      // While the title is showing, phones stay dim behind it.
      const io = Math.max(0, 1 - cam / (gap * 0.9));
      const dim = 1 - io * 0.65;
      const X = mobile ? W * 0.31 : Math.min(W * 0.29, 520);
      const candidates: { p: HTMLButtonElement; ez: number }[] = [];
      phones.forEach((p, i) => {
        const ez = zs[i] + cam;
        const side = i % 2 ? 1 : -1;
        let o = 1;
        if (ez < far) o = 0;
        else if (ez < far + gap) o = (ez - far) / gap;
        const n0 = P * 0.2, n1 = P * 0.62;
        if (ez > n0) o *= Math.max(0, 1 - (ez - n0) / (n1 - n0));
        o *= dim;
        const y = (i % 3 - 1) * H * 0.035;
        p.style.transform = `translate3d(${(side * X).toFixed(1)}px, ${y.toFixed(1)}px, ${ez.toFixed(1)}px) rotateY(${-side * angle}deg)`;
        p.style.opacity = o.toFixed(3);
        p.style.visibility = o < 0.02 ? 'hidden' : 'visible';
        if (o > 0.3) candidates.push({ p, ez });
      });
      if (final) {
        const ez = finalZ + cam;
        const o = ez < far ? 0 : Math.min(1, (ez - far) / gap);
        final.style.transform = `translate3d(0, 0, ${ez.toFixed(1)}px)`;
        final.style.opacity = o.toFixed(3);
        final.style.visibility = o < 0.02 ? 'hidden' : 'visible';
      }
      intro.style.opacity = io.toFixed(3);
      intro.style.transform = `translateY(-50%) scale(${(1 + cam / 2500).toFixed(4)})`;
      intro.style.visibility = io < 0.02 ? 'hidden' : 'visible';
      if (inView) setPlaying(candidates.sort((a, b) => b.ez - a.ez).slice(0, NEAREST).map((c) => c.p));
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section, start: 'top top', end: 'bottom bottom', scrub: SCRUB, toggleClass: 'is-active',
        onToggle: (self) => { inView = self.isActive; if (!inView) { pauseAll(); setPlaying([]); } else render(); },
        onRefresh: () => { W = stage.clientWidth; H = stage.clientHeight; render(); },
      },
      onUpdate: render,
    });
    tl.to(state, { cam: camEnd, duration: 0.88, ease: 'none' }).to({}, { duration: 0.12 });
    render();

    return () => {
      tl.kill();
      setPlaying([]);
      [...phones, final].forEach((p) => p && (p.style.cssText = ''));
      intro.style.cssText = '';
    };
  });
}
