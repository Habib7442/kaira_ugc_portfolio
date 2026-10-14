// Pre-renders the whole page from creator.json + media.json at build time.
// Every visible word and media path comes from the content file.
import type { Creator, Manifest } from '../content/types.ts';
import { attr, compact, cutoutImg, cutoutSet, esc, getMedia, icon, money, picture } from './helpers.ts';

export interface Data { creator: Creator; manifest: Manifest }

const BRAND_STYLES = ['sans-black', 'serif', 'display', 'sans-light', 'sans-wide'] as const;
const brandStyle = (c: Creator, name: string) => {
  const i = c.brands.findIndex((b) => b.name.toUpperCase() === name.toUpperCase());
  return c.brands[i]?.style ?? BRAND_STYLES[Math.max(0, i) % BRAND_STYLES.length];
};
const igUrl = (h: string) => `https://www.instagram.com/${encodeURIComponent(h)}/`;

/** Number of phones in the tunnel. Videos repeat to keep the corridor full. */
export function phoneCounts(n: number) {
  const desktop = Math.min(14, Math.max(n, 8, n * 2));
  const mobile = Math.min(desktop, Math.min(10, Math.max(n, 8)));
  return { desktop, mobile };
}

// ---------------------------------------------------------------- head
export function renderHead({ creator: c, manifest: m }: Data): string {
  const title = c.seo?.title ?? `${c.name} · ${c.role ?? 'UGC Creator'}`;
  const desc = c.seo?.description ?? c.tagline;
  const cover = getMedia(m, c.photos.coverCutout, 'cutout');
  const coverM = c.photos.coverCutoutMobile ? getMedia(m, c.photos.coverCutoutMobile, 'cutout') : cover;
  const theme = Object.entries(c.theme ?? {}).map(([k, v]) => `--${k}:${v};`).join('');
  const poster = getMedia(m, c.videos[0].src, 'video').poster;
  const site = c.seo?.siteUrl?.replace(/\/$/, '');
  const letter = esc(c.firstName[0].toUpperCase());
  const favicon = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="${c.theme?.lime ?? '#D6FF3D'}"/><text x="32" y="47" font-family="Arial Black,Arial" font-weight="900" font-size="40" text-anchor="middle" fill="${c.theme?.ink ?? '#13142A'}">${letter}</text></svg>`)}`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Person', name: c.name, jobTitle: c.role ?? 'UGC Creator',
    description: c.tagline, address: { '@type': 'PostalAddress', addressLocality: c.location },
    knowsLanguage: c.languages, email: `mailto:${c.contact.email}`,
    sameAs: c.contact.instagram ? [igUrl(c.contact.instagram)] : undefined,
  };
  return `
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="${esc(c.theme?.paper ?? '#F1F2F7')}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${site ?? ''}${poster}">
<meta name="twitter:card" content="summary_large_image">
${site ? `<link rel="canonical" href="${esc(site)}/">` : ''}
<link rel="icon" href="${favicon}">
<link rel="preload" href="/fonts/big-shoulders-display-latin-900-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" as="image" type="image/webp" imagesrcset="${cutoutSet(coverM)}" imagesizes="90vw" media="(max-width: 767px)" fetchpriority="high">
<link rel="preload" as="image" type="image/webp" imagesrcset="${cutoutSet(cover)}" imagesizes="62vh" media="(min-width: 768px)" fetchpriority="high">
${theme ? `<style>html:root{${theme}}</style>` : ''}
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}

// ---------------------------------------------------------------- body
export function renderBody(d: Data): string {
  return [intro(d), nav(d), '<main id="main">', cover(d), about(d), tunnel(d), orbit(d), cases(d), make(d), processSection(d), contact(d), '</main>', footer(d), player()].join('\n');
}

const letters = (word: string, cls: string) =>
  [...word.toUpperCase()].map((ch, i) => `<span class="${cls}" style="--i:${i}">${esc(ch)}</span>`).join('');

function intro({ creator: c }: Data) {
  return `<div class="intro" aria-hidden="true"><div class="intro__word">${letters(c.firstName, 'intro__letter')}</div><div class="intro__bar"><span></span></div></div>`;
}

function nav({ creator: c }: Data) {
  return `<a class="skip" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"><span></span></div>
<header class="nav">
  <a class="nav__name" href="#top">${esc(c.firstName)}</a>
  <a class="btn btn--lime btn--sm nav__cta" href="#contact">Work with me</a>
</header>`;
}

function cover({ creator: c, manifest: m }: Data) {
  const desk = getMedia(m, c.photos.coverCutout, 'cutout');
  const mob = c.photos.coverCutoutMobile ? getMedia(m, c.photos.coverCutoutMobile, 'cutout') : desk;
  const word = c.firstName.toUpperCase();
  const tags = c.niches.slice(0, 2);
  return `<section class="cover" id="top" aria-labelledby="cover-title" style="--chars:${word.length}">
  <div class="cover__sticky">
    <div class="cover__scene">
      <div class="cover__bg" aria-hidden="true"><span class="cover__disc"></span><span class="cover__ring"></span></div>
      <p class="cover__meta"><span>${esc(c.name)}</span><span>${esc(c.year ?? new Date().getFullYear())}</span><span>${esc(c.role ?? 'UGC Creator')}</span></p>
      <h1 class="cover__name" id="cover-title"><span class="sr-only">${esc(c.name)}, ${esc(c.role ?? 'UGC creator')}</span><span class="cover__letters" aria-hidden="true">${letters(word, 'cover__letter')}</span></h1>
      <div class="cover__figure">
        <picture>
          <source media="(max-width: 767px)" srcset="${cutoutSet(mob)}" sizes="90vw" width="${mob.width}" height="${mob.height}">
          ${cutoutImg(desk, { alt: `${c.name}, ${c.role ?? "UGC creator"}`, sizes: '62vh', lazy: false, priority: true })}
        </picture>
      </div>
      ${tags.map((t, i) => `<span class="sticker sticker--${i ? 'lavender' : 'lime'} cover__tag cover__tag--${i + 1}" aria-hidden="true">${esc(t)}</span>`).join('')}
      <div class="cover__bottom">
        <p class="cover__tagline">${esc(c.tagline)}</p>
        <div class="cover__ctas">
          <a class="btn" href="#work">See my work</a>
          <a class="btn btn--lime" href="#contact">Work with me</a>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function about({ creator: c, manifest: m }: Data) {
  const pol = getMedia(m, c.photos.polaroid, 'image');
  const s = c.stats;
  const stats = [
    s.followers != null && { n: s.followers, label: 'Followers' },
    s.avgViews != null && { n: s.avgViews, label: 'Avg. views' },
    s.brands != null && { n: s.brands, label: 'Brands' },
  ].filter(Boolean) as { n: number; label: string }[];
  return `<section class="about" id="about" aria-labelledby="about-title">
  <div class="wrap about__grid">
    <div class="about__photo">
      <figure class="polaroid">
        <div class="polaroid__img">
          ${picture(pol, { alt: `${c.firstName} filming a video at home`, sizes: '(min-width: 768px) 420px, 78vw' })}
          <span class="polaroid__blank" aria-hidden="true"></span>
        </div>
        <figcaption>${esc(c.firstName.toLowerCase())}, on a shoot day ✶</figcaption>
      </figure>
    </div>
    <div class="about__text">
      <h2 class="about__hi" id="about-title">Hi, I'm <em>${esc(c.firstName)}!</em></h2>
      <p class="about__bio">${c.bio.map(esc).join('<br>')}</p>
      <ul class="chips" aria-label="Niches">${c.niches.map((n, i) => `<li class="sticker sticker--${i % 2 ? 'lavender' : 'lime'}" style="--r:${[-4, 3, -2, 5, -3, 2][i % 6]}deg">${esc(n)}</li>`).join('')}</ul>
      <dl class="facts">
        <div><dt>Based in</dt><dd>${esc(c.location)}</dd></div>
        <div><dt>Languages</dt><dd>${c.languages.map(esc).join(', ')}</dd></div>
        <div><dt>Turnaround</dt><dd>${esc(c.turnaround)}</dd></div>
      </dl>
      ${stats.length ? `<div class="stats">
        <ul class="stats__list">${stats.map((x) => `<li class="stat"><span class="stat__num" data-count="${x.n}">${compact(x.n)}</span><span class="stat__label">${x.label}</span></li>`).join('')}</ul>
        ${s.demo ? '<span class="sticker sticker--small sticker--dot">Demo figures</span>' : ''}
      </div>` : ''}
    </div>
  </div>
</section>`;
}

function tunnel({ creator: c, manifest: m }: Data) {
  const { desktop, mobile } = phoneCounts(c.videos.length);
  const phones = Array.from({ length: desktop }, (_, i) => {
    const v = c.videos[i % c.videos.length];
    const media = getMedia(m, v.src, 'video');
    const poster = v.poster ? getMedia(m, v.poster, 'image').webp[0].src : media.posterSm;
    const cls = ['phone', i >= mobile && 'phone--desk', i >= c.videos.length && 'phone--dup'].filter(Boolean).join(' ');
    return `<button ${attr({ class: cls, type: 'button', 'data-video': v.id, 'data-i': i, 'aria-label': `Play ${v.type} video for ${v.brand}`, tabindex: i >= c.videos.length ? -1 : undefined })}>
      <span class="phone__screen">
        <img class="phone__poster" src="${poster}" width="360" height="640" alt="" loading="lazy" decoding="async">
        <video class="phone__video" muted playsinline loop preload="none" disablepictureinpicture data-src="${media.preview}" aria-hidden="true"></video>
      </span>
      <span class="phone__notch" aria-hidden="true"></span>
      <span class="sticker sticker--small phone__label" style="--r:${i % 2 ? 3 : -3}deg">${esc(v.type)} · ${esc(v.brand)}</span>
    </button>`;
  }).join('\n');
  const finalPoster = getMedia(m, c.videos[0].src, 'video').posterSm;
  const more = c.contact.instagram
    ? `<a class="phone phone--final" href="${igUrl(c.contact.instagram)}" target="_blank" rel="noopener">
        <span class="phone__screen"><img class="phone__poster" src="${finalPoster}" width="360" height="640" alt="" loading="lazy" decoding="async"><span class="phone__more">More on Instagram <span aria-hidden="true">→</span><small>@${esc(c.contact.instagram)}</small></span></span>
        <span class="phone__notch" aria-hidden="true"></span>
      </a>`
    : '';
  return `<section class="tunnel ink" id="work" aria-labelledby="work-title" style="--phones:${desktop};--phones-m:${mobile}">
  <div class="tunnel__sticky">
    <div class="tunnel__intro">
      <h2 class="display tunnel__title" id="work-title">My work, up close</h2>
      <p class="tunnel__hint"><span class="sticker sticker--lime">Tap any video</span></p>
    </div>
    <div class="tunnel__stage">
${phones}
      ${more}
    </div>
  </div>
</section>`;
}

function orbit({ creator: c, manifest: m }: Data) {
  const fig = getMedia(m, c.photos.orbitCutout, 'cutout');
  const n = c.stats.brands ?? c.brands.length;
  return `<section class="orbit" id="brands" aria-labelledby="brands-title">
  <div class="orbit__sticky">
    <div class="orbit__head">
      <p class="serif-line">I've made content for</p>
      <h2 class="display orbit__title" id="brands-title"><span class="orbit__count" data-count="${n}">${n}</span> brands</h2>
      ${c.stats.demo ? '<span class="sticker sticker--small sticker--dot">demo</span>' : ''}
    </div>
    <div class="orbit__stage">
      <div class="orbit__figure">${cutoutImg(fig, { alt: `${c.firstName} holding a product`, sizes: '(min-width: 768px) 46vh, 70vw' })}</div>
      <ul class="orbit__ring" aria-label="Brands">
        ${c.brands.map((b, i) => `<li class="brand-pill brand--${b.style ?? BRAND_STYLES[i % BRAND_STYLES.length]}">${esc(b.name)}</li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>`;
}

function cases({ creator: c, manifest: m }: Data) {
  if (!c.caseStudies.length) return '';
  const cards = c.caseStudies.map((cs, i) => {
    const img = getMedia(m, cs.image, 'image');
    const vids = cs.videoIds.map((id) => c.videos.find((v) => v.id === id)!).filter(Boolean);
    const thumbs = Array.from({ length: 4 }, (_, k) => {
      const v = vids[k % vids.length];
      const t = getMedia(m, v.src, 'video').thumbs;
      return t[(Math.floor(k / vids.length) + k) % t.length];
    });
    const style = brandStyle(c, cs.brand);
    const n = String(i + 1).padStart(2, '0');
    return `<article class="card" style="--i:${i}" data-brand="${esc(cs.brand)}" aria-labelledby="case-${i}">
    <div class="card__inner">
      <div class="card__face card__front">
        <header class="card__head"><h3 class="card__brand brand--${style}" id="case-${i}">${esc(cs.brand)}</h3><span class="card__no">${n}</span></header>
        ${picture(img, { alt: `${cs.brand} product shot`, sizes: '(min-width: 768px) 300px, 70vw', cls: 'card__img' })}
        <ul class="card__thumbs" aria-label="Video stills">${thumbs.map((t) => `<li><img src="${t}" width="240" height="426" alt="" loading="lazy" decoding="async"></li>`).join('')}</ul>
        <ul class="card__tags">${(cs.deliverables ?? ['Video']).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        <button class="card__flip" type="button" aria-expanded="false" aria-controls="case-back-${i}"><span class="sr-only">Show the ${esc(cs.brand)} case study</span><span class="card__flip-hint" aria-hidden="true">${icon('flip')} Tap to flip</span></button>
      </div>
      <div class="card__face card__back" id="case-back-${i}" inert>
        <p class="card__back-title">${esc(cs.brand)} <span>${n}</span></p>
        <dl class="card__dl">
          <dt>The brief</dt><dd>${esc(cs.brief)}</dd>
          <dt>What I made</dt><dd>${esc(cs.whatIMade)}</dd>
        </dl>
        <div class="card__results">
          ${c.demo ? '<span class="sticker sticker--small sticker--lime">Demo results</span>' : '<span class="label">Results</span>'}
          <ul>${cs.results.map((r) => `<li><strong>${esc(r.value)}</strong> ${esc(r.label)}</li>`).join('')}</ul>
        </div>
        <div class="card__actions">
          <button class="btn btn--lime btn--sm card__watch" type="button" data-brand="${esc(cs.brand)}">Watch the videos</button>
          <button class="icon-btn card__unflip" type="button" aria-label="Flip the card back">${icon('flip')}</button>
        </div>
      </div>
    </div>
  </article>`;
  }).join('\n');
  return `<section class="cases ink" id="cases" aria-labelledby="cases-title">
  <div class="wrap cases__head">
    <h2 class="display" id="cases-title">Case studies</h2>
    <p class="serif-line">Real briefs, real content. Tap a card to flip it.</p>
  </div>
  <div class="cases__deck" style="--n:${c.caseStudies.length}">
${cards}
  </div>
</section>`;
}

function make({ creator: c }: Data) {
  const price = (p?: number) => (c.showPrices && p != null ? `<span class="price__from">from</span> ${money(p, c.currency)}` : 'Rates on request');
  const text = (c.badgeText ?? 'UGC VIDEOS • PRODUCT PHOTOS • VOICEOVERS • ').toUpperCase();
  return `<section class="make" id="services" aria-labelledby="make-title">
  <div class="wrap make__grid">
    <div class="make__badge">
      <svg class="badge" viewBox="0 0 200 200" role="img" aria-label="${esc(text.replace(/•/g, ',').replace(/,\s*$/, ''))}">
        <defs><path id="badge-path" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0"/></defs>
        <circle cx="100" cy="100" r="98" class="badge__bg"/>
        <g class="badge__spin"><text class="badge__text"><textPath href="#badge-path" textLength="500" lengthAdjust="spacing">${esc(text)}</textPath></text></g>
        <circle cx="100" cy="100" r="42" class="badge__core"/>
        <text x="100" y="112" text-anchor="middle" class="badge__star" aria-hidden="true">✶</text>
      </svg>
    </div>
    <div class="make__content">
      <h2 class="display" id="make-title">What I make</h2>
      <ul class="services">
        ${c.services.map((s) => `<li class="service">
          <h3 class="service__name">${esc(s.name)}</h3>
          <ul class="service__list">${s.includes.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <p class="service__price">${price(s.fromPrice)}</p>
        </li>`).join('\n        ')}
      </ul>
      ${c.addOns?.length ? `<div class="addons"><h3 class="label">Add-ons</h3><ul class="pills">${c.addOns.map((a) => `<li class="pill">${esc(a.name)}${c.showPrices && a.fromPrice != null ? ` <span class="pill__price">+${money(a.fromPrice, c.currency)}</span>` : ''}</li>`).join('')}</ul></div>` : ''}
    </div>
  </div>
</section>`;
}

function processSection({ creator: c }: Data) {
  return `<section class="process" id="process" aria-labelledby="process-title">
  <div class="process__sticky">
    <div class="wrap process__head">
      <h2 class="display" id="process-title">How we work</h2>
      <p class="serif-line">From brief to ready-to-post in ${esc(c.turnaround)}.</p>
    </div>
    <div class="process__viewport">
      <ol class="process__track">
        ${c.process.map((s, i) => `<li class="step">
          <span class="step__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
          <span class="step__icon">${icon(s.icon ?? 'brief')}</span>
          <h3 class="step__title">${esc(s.title)}</h3>
          <p class="step__line">${esc(s.line)}</p>
          ${i < c.process.length - 1 ? `<span class="step__arrow" aria-hidden="true">${icon('arrow')}</span>` : ''}
        </li>`).join('\n        ')}
      </ol>
    </div>
    ${c.tools.length ? `<div class="wrap tools"><h3 class="label">Tools I use</h3><ul class="pills">${c.tools.map((t) => `<li class="pill">${esc(t)}</li>`).join('')}</ul></div>` : ''}
  </div>
</section>`;
}

function contact({ creator: c }: Data) {
  const k = c.contact;
  const cur = c.currency ?? '₹';
  const budgets = cur === '₹'
    ? ['Under ₹10k', '₹10k–25k', '₹25k–50k', '₹50k+', 'Not sure yet']
    : [`Under ${cur}500`, `${cur}500–1.5k`, `${cur}1.5k–3k`, `${cur}3k+`, 'Not sure yet'];
  const deliverables = ['UGC video', 'Reel', 'Product photos', 'Voiceover', 'Usage rights'];
  const mail = `mailto:${k.email}?subject=${encodeURIComponent('UGC collaboration')}`;
  const wa = k.whatsapp ? `https://wa.me/${k.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${c.firstName}! I'd love to talk about a UGC collaboration.`)}` : '';
  return `<section class="contact ink" id="contact" aria-labelledby="contact-title">
  <div class="wrap">
    <h2 class="contact__title" id="contact-title">Let's make content people <em>stop scrolling</em> for.</h2>
    <div class="contact__actions">
      <a class="btn btn--lime btn--lg" href="${esc(mail)}">${icon('mail')} Email me</a>
      ${k.instagram ? `<a class="btn btn--light btn--lg" href="https://ig.me/m/${esc(k.instagram)}" target="_blank" rel="noopener">${icon('instagram')} Instagram DM</a>` : ''}
      ${wa ? `<a class="btn btn--light btn--lg" href="${esc(wa)}" target="_blank" rel="noopener">${icon('whatsapp')} WhatsApp</a>` : ''}
      ${k.mediaKitUrl ? `<a class="btn btn--light btn--lg" href="${esc(k.mediaKitUrl)}" download>${icon('download')} Download media kit</a>` : ''}
    </div>
    <form class="enquiry" novalidate data-email="${esc(k.email)}" aria-labelledby="enquiry-title">
      <div class="enquiry__head"><h3 id="enquiry-title">Brand enquiry</h3><p>Fill this in and it opens a ready-to-send email. No sign-up, nothing stored.</p></div>
      <div class="field"><label for="f-brand">Brand name <span aria-hidden="true">*</span></label><input id="f-brand" name="brand" required autocomplete="organization"></div>
      <div class="field"><label for="f-site">Website or Instagram</label><input id="f-site" name="site" autocomplete="url" inputmode="url"></div>
      <div class="field"><label for="f-product">Product</label><input id="f-product" name="product"></div>
      <fieldset class="field field--full"><legend>Deliverables</legend><div class="checks">${deliverables.map((d, i) => `<label class="check"><input type="checkbox" name="deliverables" value="${esc(d)}"${i === 0 ? ' checked' : ''}><span>${esc(d)}</span></label>`).join('')}</div></fieldset>
      <div class="field"><label for="f-budget">Budget range</label><select id="f-budget" name="budget">${budgets.map((b) => `<option>${esc(b)}</option>`).join('')}</select></div>
      <div class="field"><label for="f-time">Timeline</label><select id="f-time" name="timeline"><option>This week</option><option selected>In 2–3 weeks</option><option>Next month</option><option>Flexible</option></select></div>
      <div class="field field--full"><label for="f-msg">Message</label><textarea id="f-msg" name="message" rows="4" placeholder="Tell me about the campaign, audience and must-says."></textarea></div>
      <div class="enquiry__actions field--full">
        <button class="btn btn--lime" type="submit">Send via email</button>
        <button class="btn btn--light enquiry__copy" type="button">Copy message</button>
      </div>
      <p class="enquiry__status field--full" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>`;
}

function footer({ creator: c }: Data) {
  const k = c.contact;
  const links = [
    k.instagram && `<a href="${igUrl(k.instagram)}" target="_blank" rel="noopener">Instagram</a>`,
    k.tiktok && `<a href="${esc(k.tiktok)}" target="_blank" rel="noopener">TikTok</a>`,
    k.youtube && `<a href="${esc(k.youtube)}" target="_blank" rel="noopener">YouTube</a>`,
    `<a href="mailto:${esc(k.email)}">Email</a>`,
  ].filter(Boolean).join('');
  return `<footer class="footer ink">
  <div class="wrap footer__row">
    <p class="footer__handle">@${esc(c.handle)}</p>
    <nav class="footer__links" aria-label="Social links">${links}</nav>
    <a class="footer__top" href="#top">Back to top ↑</a>
  </div>
  ${c.demo ? `<p class="wrap footer__demo">Concept demo. ${esc(c.name)} and the brands shown are fictional; images, videos and figures are illustrative.</p>` : ''}
  <p class="wrap footer__copy">© ${esc(c.year ?? new Date().getFullYear())} ${esc(c.name)}</p>
</footer>`;
}

function player() {
  return `<div class="player" role="dialog" aria-modal="true" aria-labelledby="player-title" hidden>
  <div class="player__backdrop"></div>
  <div class="player__frame">
    <video class="player__video" playsinline muted loop preload="metadata" disablepictureinpicture></video>
    <div class="player__meta">
      <p class="player__tags"><span class="sticker sticker--lime sticker--small player__type"></span> <span class="sticker sticker--light sticker--small player__brand"></span></p>
      <h2 class="player__caption" id="player-title"></h2>
      <p class="player__count" aria-live="polite"></p>
    </div>
  </div>
  <button class="icon-btn player__close" type="button" aria-label="Close video">${icon('close')}</button>
  <button class="icon-btn player__prev" type="button" aria-label="Previous video">${icon('left')}</button>
  <button class="icon-btn player__next" type="button" aria-label="Next video">${icon('right')}</button>
  <button class="btn btn--sm btn--light player__mute" type="button" aria-pressed="false" hidden>${icon('sound')} <span>Unmute</span></button>
</div>`;
}
