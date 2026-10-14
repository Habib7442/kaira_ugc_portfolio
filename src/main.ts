import './styles/base.css';
import './styles/components.css';
import './styles/cover.css';
import './styles/about.css';
import './styles/tunnel.css';
import './styles/orbit.css';
import './styles/sections.css';

import { initAnchors, initMotion, ScrollTrigger } from './lib/motion';
import { initCapture } from './lib/capture';
import { env } from './lib/env';
import { initCover, initIntro } from './sections/cover';
import { initAbout } from './sections/about';
import { initTunnel } from './sections/tunnel';
import { initPlayer } from './sections/player';
import { initOrbit } from './sections/orbit';
import { initCases } from './sections/cases';
import { initContact, initHeadlines, initMake, initNav, initProcess } from './sections/misc';

initMotion();
initAnchors();
initIntro();
initNav();
initCover();

// Everything below the cover is set up when the browser is idle, so the first screen paints sooner.
function initRest() {
  initPlayer();
  initAbout();
  initTunnel();
  initOrbit();
  initCases();
  initMake();
  initProcess();
  initContact();
  // Text splitting and final measurements wait for the web fonts.
  document.fonts.ready.then(() => {
    initHeadlines();
    ScrollTrigger.refresh();
    initCapture();
  });
}
const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200));
if (env.capture) initRest();
else idle(initRest, { timeout: 1500 });
