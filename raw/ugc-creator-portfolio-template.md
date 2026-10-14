# "BEHIND THE POST" — 3D Scroll Portfolio for UGC Creators
### A reusable portfolio template you can pitch to UGC creators on Instagram · concept, asset prompts, Claude Code instructions, pitching guide

**The idea in one line:** the site feels like stepping *inside* a creator's feed. You start at a magazine-style cover, then fly through a 3D tunnel of phones playing her videos, watch brand names orbit around her, and flip through her case studies like collectible cards.

**Demo creator:** **Kaira Vale** (hypothetical), UGC creator for beauty, skincare and lifestyle brands, based in India.

**Built as a template:** every creator you sign later just swaps one content file, their photo and their videos. No new design work each time.

---

## Contents
1. What I took from your references, and what's new
2. Why this works for pitching on Instagram
3. Brand, colours, type
4. The scroll story (sections)
5. How it's built (light 3D, fast on phones)
6. PART A — image and video prompts
7. PART B — Claude Code prompt
8. Making it for a real creator
9. How to pitch creators on Instagram
10. Checklist

---

## 1. From your references

| Kept (it works) | Changed (my twist) |
|---|---|
| Giant word with the creator cut out **in front of it** | The letters sit on **different 3D depths** and fly apart as you scroll; she steps forward |
| Circular rotating text ("My work includes") | Becomes a **3D ring of brand names orbiting around her** |
| Phone mockups showing her content | Becomes a **3D tunnel of phones you fly through**, all playing her videos |
| Case study grid | Becomes **collectible creator cards** that fan out and **flip** to show results |
| "Hi, I'm…" intro with a photo | A **polaroid that tilts in 3D** and develops from blank to photo |
| Brand logos row | Invented brand wordmarks only (never real brand logos in a demo) |
| Navy / olive / pink palettes | A fresher Gen-Z palette: ink, cool paper, electric lime, lavender (no cream, no gold) |

---

## 2. Why this works for pitching
- **Creators live on their phones.** You'll send the link in a DM, so it must open fast inside Instagram and look amazing on a phone first.
- **Their videos are the star.** Brands hire creators by watching their content, so the tunnel puts the videos front and centre.
- **It looks expensive but is light.** The 3D is done with the browser's own 3D (no heavy game engine), so it loads quickly even on average phones.
- **It's a product you can resell.** Same template, new content file, so you can deliver a creator's site in a day.

---

## 3. Brand, colours, type

| Name | Hex | Use |
|---|---|---|
| Ink | `#13142A` | dark sections, text |
| Paper | `#F1F2F7` | light sections (cool grey, not cream) |
| Lime | `#D6FF3D` | main accent: buttons, highlights, stickers |
| Lavender | `#B8A6FF` | secondary accent, card backs |
| Tomato | `#FF5436` | tiny pops (badges, "new", live dots) |
| White | `#FFFFFF` | cards |

**Fonts (Google Fonts)**
- **Big Shoulders Display** (900): huge condensed words like KAIRA, CASE STUDY.
- **Instrument Serif** (italic): the friendly handwritten-feel lines ("Hi, I'm *Kaira!*").
- **Inter**: body text and buttons.

**Style details:** sticker-like labels with a slight tilt, thin outline buttons that fill with lime on hover, rounded 24px phone and card corners, a subtle grain on dark sections.

---

## 4. The scroll story

| # | Section | The 3D moment |
|---|---|---|
| 0 | Opening | Name letters drop in like stickers; a lime progress line fills |
| 1 | **Cover** | Giant "KAIRA" behind her cut-out photo; on scroll, each letter flies back to a different depth, she scales up slightly, the page tilts into the next scene |
| 2 | **Hi, I'm Kaira** | A polaroid tilts toward your finger/cursor and "develops" from blank to photo; niche chips pop in (Beauty · Skincare · Lifestyle · Food); quick facts (based in, languages, turnaround) |
| 3 | **The Feed Tunnel** (signature) | Pinned. You fly forward through a corridor of floating phones on both sides, each playing one of her videos, labelled by type (Unboxing, Tutorial, Review, Hook, Voiceover). Tap a phone to watch full screen |
| 4 | **Brand Orbit** | Her cut-out in the centre, a tilted 3D ring of brand names orbiting her as you scroll; a counter "24 brands" (demo) |
| 5 | **Case Studies** | A stack of collectible creator cards that fan out on scroll. Tap a card to flip it: front = brand + 4 content thumbnails, back = the brief, what she made, results (demo) |
| 6 | **What I Make** | A rotating circular badge "UGC VIDEOS • PRODUCT PHOTOS • VOICEOVERS •" next to service cards with "from ₹" rates (or "Rates on request", one switch in the content file) |
| 7 | **How We Work** | Sideways scroll of 4 steps: Brief → Script → Shoot → Deliver (in 5–7 days), plus small tool badges (CapCut, Canva, Lightroom as text) |
| 8 | **Let's Talk** | "Let's make content people stop scrolling for." Email, Instagram DM, media kit download, short enquiry form |
| 9 | Footer | Socials + demo disclaimer |

---

## 5. How it's built

**Light 3D, no game engine.** Everything uses the browser's built-in 3D (CSS 3D transforms) driven by GSAP ScrollTrigger:
- The tunnel = real video elements placed in 3D space, with the "camera" moving forward on scroll. Only the 3 phones nearest the viewer play; the rest show a still frame.
- The orbit = brand name cards arranged on a 3D ring that rotates.
- The cards = real 3D flips.

**Why not AI frame sequences like VAELORA?** Every creator has different videos and photos. Frame sequences would have to be re-generated for each client. This approach uses the creator's own content directly, so the template is quick to reuse, and it's much lighter on phones.

**Content in one file** (`content.json`): name, tagline, photo paths, videos, brands, case studies, services, rates, contact links, colours.

---

## 6. PART A — Image and video prompts

Every prompt is complete, with **aspect ratio** and **background** inside it. All people are adults; styling is casual-chic and fully dressed, nothing suggestive.

**Golden rule:** make the **master portrait (K0)** first, then upload it as a reference for every other image or video of Kaira so her face stays the same.

**Wardrobe rule:** the lavender cardigan is her **signature look**, used only for the master portrait and the cover (K0, K1). Every other image and video has a **different outfit** (written into each prompt), so the portfolio looks like many shoots over time, not one. When editing from a reference image, always add "(not the lavender cardigan)" if the tool keeps copying the outfit.

| Image / video | Outfit |
|---|---|
| K0 master, K1 cover | Lavender cardigan, white tee, light jeans (signature) |
| K2 polaroid | Heather-grey sweatshirt, black lounge pants |
| K3 orbit cut-out | Black ribbed top, thin silver chain |
| V1 unboxing | Denim jacket over striped tee |
| V2 tutorial | White waffle robe, lime headband |
| V3 review | Cherry-red oversized shirt |
| V4 hook | Cobalt-blue linen shirt, sunglasses |
| V5 lifestyle | Black blazer, white tee, jeans |
| V6 product | Hands only |

**Brands in the demo are invented:** GLOWRY (skincare), BREW&CO (cold coffee), DEWDROP (sunscreen), LOOM STUDIO (bags). Keep label text big and simple; AI often garbles small text.

### K0. Master portrait
```
Portrait of a fictional Indian woman in her mid-20s, a friendly UGC content creator, with her own distinctive face: heart-shaped face, bright dark-brown eyes, thick straight eyebrows, a few light freckles across her nose, a small gold hoop in one ear. Shoulder-length dark brown hair in a soft wavy lob with curtain bangs. Warm, natural, approachable smile showing a little teeth. Minimal fresh makeup. Wearing an oversized lavender knit cardigan over a white crew-neck t-shirt. Chest-up framing, centred, looking at the camera, bright soft daylight studio lighting, solid plain background color #F1F2F7, photorealistic, sharp focus on face and hair, not resembling any real celebrity, no text, no logos, no watermark, aspect ratio 4:5
```

### K1. Cover cut-out (transparent background)
**Desktop**
```
Same woman as the reference image, same face and hair. Full body from head to knees, standing relaxed in a casual-chic pose, one hand holding a smartphone up as if checking her latest video, the other hand in her pocket, slight smile at the camera, wearing the oversized lavender cardigan, white t-shirt and light wide-leg jeans with white sneakers, bright even studio light with crisp clean edges around her hair and body, isolated cut-out with transparent background, no floor, no shadow, fashion photography, photorealistic, no text, no logos, no watermark, aspect ratio 4:5
```
**Mobile**
```
Same woman as the reference image, same face, hair and outfit. Upper body to mid-thigh, centred, holding a smartphone near her chin with a playful smile at the camera, vertical composition with space above her head, bright even studio light with crisp clean edges around her hair and body, isolated cut-out with transparent background, no floor, no shadow, fashion photography, photorealistic, no text, no logos, no watermark, aspect ratio 9:16
```
Check the hair edges up close. If your tool draws a fake grey-and-white checkerboard instead of real transparency, regenerate in a tool that supports transparent PNGs (for example ChatGPT image generation).

### K2. Polaroid photo ("Hi, I'm Kaira")
```
Same woman as the reference image, same face and hair. Wearing an oversized heather-grey sweatshirt and black lounge pants (not the lavender cardigan). Candid laughing moment sitting cross-legged on a bed with a ring light and a phone on a small tripod in front of her, filming a video, cosy bright bedroom with plants and soft daylight, lifestyle photography, photorealistic, natural indoor scene, no text, no logos, no watermark, aspect ratio 1:1
```

### K3. Orbit cut-out (transparent background, centre of the brand orbit)
```
Same woman as the reference image, same face and hair, wearing a fitted black ribbed crew-neck top and a thin silver chain necklace (not the lavender cardigan). Waist-up, holding a small white skincare bottle up next to her cheek with a big friendly smile, facing the camera, bright even studio light with crisp clean edges around her hair and body, isolated cut-out with transparent background, no floor, no shadow, photorealistic, no text, no logos, no watermark, aspect ratio 4:5
```

### V1–V6. UGC videos for the tunnel (all 9:16)
Make each **start image** first (upload K0 as reference), then animate it (5–8s). These look like real phone-shot UGC: natural light, handheld feel.

**V1 — Unboxing (GLOWRY)**
Start image:
```
Same woman as the reference image, same face and hair, wearing a light-wash denim jacket over a navy-and-white striped t-shirt. Sitting at a bright table opening a mint-green box revealing a skincare set of three bottles with large simple white labels reading "GLOWRY", excited expression, natural window light, vertical phone-video framing, natural indoor scene, photorealistic, no other text, aspect ratio 9:16
```
Video:
```
She lifts the lid, takes out a bottle and shows it to the camera with an excited smile. Natural handheld phone UGC feel, labels stay readable, no cuts, no added text. Aspect ratio 9:16.
```

**V2 — Skincare tutorial (GLOWRY serum)**
Start image:
```
Same woman as the reference image, same face, hair pulled back with a lime-green headband, wearing a soft white waffle bathrobe. Bathroom mirror selfie-style framing, holding a small dropper bottle with a large simple "GLOWRY" label, a drop on her fingertips about to be applied to her cheek, bright soft light, vertical phone-video framing, natural indoor scene, photorealistic, no other text, aspect ratio 9:16
```
Video:
```
She gently pats the serum onto her cheek, then smiles at the camera and shows the glowy skin. Natural handheld UGC feel, no cuts, no added text. Aspect ratio 9:16.
```

**V3 — Product review (BREW&CO cold coffee)**
Start image:
```
Same woman as the reference image, same face and hair, wearing an oversized cherry-red button-up shirt. Sitting in a sunny café, holding a can of cold coffee with a large simple "BREW&CO" label toward the camera, mid-sentence with a playful raised eyebrow, vertical phone-video framing, natural indoor scene, photorealistic, no other text, aspect ratio 9:16
```
Video:
```
She takes a sip, pauses, then gives an enthusiastic thumbs up and points at the can. Natural handheld UGC feel, label stays readable, no cuts, no added text. Aspect ratio 9:16.
```

**V4 — Hook / outdoor (DEWDROP sunscreen)**
Start image:
```
Same woman as the reference image, same face and hair, wearing a cobalt-blue linen shirt with rolled-up sleeves and sunglasses pushed up on her head. Outdoors on a sunny rooftop, squeezing a small white tube with a large simple "DEWDROP" label onto the back of her hand, squinting playfully at the sun, vertical phone-video framing, natural outdoor scene, photorealistic, no other text, aspect ratio 9:16
```
Video:
```
She rubs the sunscreen into her hand and face, then flips her sunglasses down and grins at the camera. Natural handheld UGC feel, no cuts, no added text. Aspect ratio 9:16.
```

**V5 — Lifestyle / outfit (LOOM STUDIO bag)**
Start image:
```
Same woman as the reference image, same face and hair, wearing a tailored black blazer over a white t-shirt with straight-leg jeans. Standing in front of a full-length mirror holding a soft tan leather tote bag with a small embossed "LOOM STUDIO" tag, phone in her other hand filming the mirror, bright bedroom light, vertical phone-video framing, natural indoor scene, photorealistic, no other text, aspect ratio 9:16
```
Video:
```
She swings the tote onto her shoulder, turns side to side to show it in the mirror and smiles. Natural handheld UGC feel, no cuts, no added text. Aspect ratio 9:16.
```

**V6 — Voiceover-style product shot (GLOWRY)**
Start image:
```
Close-up top-down shot of a hand placing a GLOWRY skincare bottle with a large simple label onto a pastel-lavender tiled surface among small green leaves and water droplets, bright soft daylight, vertical framing, natural scene, photorealistic, no other text, aspect ratio 9:16
```
Video:
```
The hand sets the bottle down, water droplets sparkle, and the camera slowly pushes in toward the label. Smooth satisfying product-video feel, no cuts, no added text. Aspect ratio 9:16.
```

### C1–C3. Case study images (product shots for card fronts)
**GLOWRY flat lay**
```
Top-down flat lay of a skincare set of three bottles with large simple white "GLOWRY" labels on mint-green and white packaging, arranged with small leaves and water droplets, bright soft daylight, solid plain background color #F1F2F7, product photography, photorealistic, no other text, no watermark, aspect ratio 1:1
```
**BREW&CO**
```
A cold coffee can with a large simple "BREW&CO" label on a sunny café table next to a glass of iced coffee, condensation droplets, bright natural light, product photography, photorealistic, natural indoor scene, no other text, no watermark, aspect ratio 1:1
```
**DEWDROP**
```
A small white sunscreen tube with a large simple "DEWDROP" label lying on a beach towel next to sunglasses, bright summer sunlight, product photography, photorealistic, natural outdoor scene, no other text, no watermark, aspect ratio 1:1
```
(For case-study thumbnails, also use frames from V1–V6; Claude Code can grab them automatically.)

### File names
```
raw/creator/master.jpg, cover-cutout.png, cover-cutout-mobile.png, polaroid.jpg, orbit-cutout.png
raw/videos/v1-unboxing.mp4, v2-tutorial.mp4, v3-review.mp4, v4-hook.mp4, v5-lifestyle.mp4, v6-product.mp4
raw/cases/glowry.jpg, brewco.jpg, dewdrop.jpg
```

---

## 7. PART B — Claude Code prompt (paste everything below)

```
Build "Behind the Post": a 3D scroll portfolio TEMPLATE for UGC creators. Demo creator: Kaira Vale (fictional), beauty/skincare/lifestyle UGC creator in India. The site will be sent to creators and brands as a link in Instagram DMs, so it must be mobile-first and load fast inside Instagram's in-app browser. It must be easy to reuse: all creator content comes from one content file. It's a concept demo and must say so in the footer.

Stack: Vite + vanilla TypeScript (no UI framework), GSAP 3.13+ (ScrollTrigger, SplitText, Flip), Lenis (desktop only). 3D is done with CSS 3D transforms (perspective, translateZ, rotateY) — NO WebGL/Three.js. Deploy: Netlify static.

## 0. Before coding
Read the whole prompt, write docs/PLAN.md (structure, sections, data flow, build order), then build section by section, checking each in the browser on desktop and a 390px mobile viewport.

## 1. Content file (src/content/creator.json) — the heart of the template
name, firstName, handle, tagline, location, languages[], niches[], turnaround, stats (followers, avg views, brands — mark "demo": true), photos (master, coverCutout, coverCutoutMobile, polaroid, orbitCutout), videos[] (id, src, poster, type: Unboxing/Tutorial/Review/Hook/Lifestyle/Product, brand, caption), brands[] (invented names: GLOWRY, BREW&CO, DEWDROP, LOOM STUDIO, + 6 more invented), caseStudies[] (brand, image, thumbnails from videos, brief, whatIMade, results — demo), services[] (name, includes, fromPrice), showPrices (true/false → "Rates on request"), process steps, tools[], contact (email, instagram, whatsapp optional, mediaKitUrl), theme colours. Also a JSON schema and a validator script (npm run check-content) with friendly error messages.
Every section reads only from this file. Changing creators = replacing this file + the /raw media.

## 2. Assets (npm run assets)
- Cut-outs: if PNGs still have a background, remove it with rembg and refine the alpha edge; export WebP with alpha (1000/1800 px tall). Write a debug preview over ink and paper backgrounds.
- Videos: H.264 + WebM, 720×1280, muted (no audio track), under 2 MB each; a poster JPG (first good frame) and a tiny 360×640 preview loop under 400 KB for the tunnel. Also extract 4 thumbnail frames per video for case-study cards.
- Images: AVIF + WebP at 480/960/1600.
- Print a size report. First screen total (HTML, CSS, JS, fonts, cover cut-out) under 450 KB.

## 3. Design system
Colours: --ink #13142A, --paper #F1F2F7, --lime #D6FF3D (primary accent), --lavender #B8A6FF, --tomato #FF5436 (tiny pops only), --white #FFFFFF. Theme colours overridable from creator.json. No cream/beige and no gold.
Fonts: Big Shoulders Display 900 (huge condensed words), Instrument Serif italic (friendly lines), Inter (UI/body). font-display: swap, preload the display font. Fluid sizes with clamp(); cover name up to clamp(7rem, 30vw, 32rem).
Style: sticker labels (small rounded tags, slight rotation, lime or lavender fill), outline pill buttons that fill with lime on hover/press, 24px rounded cards and phones, subtle grain only on ink sections. Light, playful, confident.

## 4. Sections

0) Opening (max 1.2s, skip if returning): ink screen, the first name drops in letter by letter like stickers, a lime line fills, then slides up to reveal the cover.

1) COVER (pinned ~160vh desktop / ~120vh mobile)
- Top row: name · year · "UGC Creator" (small, Inter).
- Giant first name in ink (Big Shoulders) centred, with the creator cut-out IN FRONT of it (bottom-anchored), so she stands in front of her name. Each letter is its own element with a different translateZ.
- Scroll: letters fly back to different depths and fade (staggered), she scales 1 → 1.12 and moves up slightly, the whole scene tilts (rotateX 0 → 12°) and dissolves into section 2.
- Bottom: tagline in Instrument Serif and two buttons: "See my work" (scroll to tunnel) and "Work with me" (scroll to contact).
- Desktop: subtle mouse parallax on name, cut-out and background.

2) HI, I'M <firstName>
- Large "Hi, I'm Kaira!" in Instrument Serif italic.
- A polaroid card (white frame, slight rotation) that tilts in 3D toward the cursor on desktop (gyroscope tilt on mobile only if permission isn't needed; otherwise gentle auto-sway). When it enters view the photo "develops" (from a blank light grey square to the photo via opacity/blur/saturation over 1.2s).
- Bio (2 short lines from content), niche chips that pop in as stickers, 3 quick facts (Based in, Languages, Turnaround) and stats with rolling counters labelled "Demo figures" when demo is true.

3) THE FEED TUNNEL (signature, pinned ~300vh desktop / ~220vh mobile)
- A 3D corridor: phones (rounded 9:16 cards with a thin ink bezel and notch) placed along the left and right walls at increasing depths (translateZ), slightly angled toward the centre (rotateY ±25°). Scroll moves the "camera" forward (translate the whole corridor toward the viewer), so phones stream past on both sides.
- Each phone shows a sticker label with its type and brand.
- Only the 3 phones closest to the viewer play their preview loops (muted, playsinline, loop); others show posters. Swap smoothly as you move.
- Section title at the start: "My work, up close" with a hint "Tap any video".
- Tap/click a phone: Flip transition to a full-screen vertical player (full clip, muted by default with an unmute button, caption, type, brand), swipe/arrow for next/previous, Esc/close returns to the same phone.
- At the end of the tunnel, a final centred phone holds with the text "More on Instagram →".
- Mobile: fewer phones (8–10), smaller angles; page scroll must never be trapped. Reduced motion or low-power devices: a simple 2-column grid of phones instead.

4) BRAND ORBIT (pinned ~180vh)
- Centre: orbit cut-out (she holds a product).
- Brand names as small rounded wordmark pills (styled text, varied weights/cases) arranged on a 3D ring around her (ring tilted rotateX 70°, each pill counter-rotated to face the viewer). Scroll rotates the ring; pills behind her are dimmer and smaller, and are hidden behind her using z-order (front half of the ring renders in front of the cut-out, back half behind).
- Counter: "<n> brands" with a small "demo" tag when demo is true.

5) CASE STUDIES
- A stack of collectible creator cards (2:3 ratio, lavender backs, white fronts). On scroll they fan out from a stack into a row (desktop) or a swipeable carousel (mobile).
- Card front: brand wordmark, case image, 4 small video thumbnails, deliverable tags (Video · Reel · Photos).
- Tap to flip (3D rotateY 180°): back shows the brief, what she made, results (with "Demo results" label), and a "Watch the videos" link that opens the player filtered to that brand.

6) WHAT I MAKE
- A circular badge with rotating text ("UGC VIDEOS • PRODUCT PHOTOS • VOICEOVERS • ") built with SVG textPath, rotating slowly and speeding up while scrolling.
- Service cards: name, what's included, "from ₹" price or "Rates on request" (from showPrices). Add-ons: usage rights, raw footage, extra hooks, rush delivery.

7) HOW WE WORK: sideways scroll (pinned on desktop, native swipe with scroll-snap on mobile) of 4 steps: Brief → Script → Shoot → Deliver, each with a big number, one line and a small icon. Tool badges as text pills.

8) LET'S TALK
- Big headline: "Let's make content people stop scrolling for."
- Buttons: Email (mailto with subject "UGC collaboration"), Instagram DM (ig.me link from handle), optional WhatsApp, "Download media kit" (mediaKitUrl).
- Short enquiry form for brands: brand name, website/Instagram, product, deliverables, budget range, timeline, message → opens a pre-filled email (no backend), plus "Copy message" fallback.

9) FOOTER: handle, socials, and "Concept demo. Kaira Vale and the brands shown are fictional; images, videos and figures are illustrative." (shown only when demo mode is on in creator.json).

## 5. Navigation
Minimal sticky top bar: first name left, a "Work with me" lime pill right. Mobile: same, no burger menu needed. A thin lime scroll-progress line at the very top.

## 6. Performance (top priority — this is opened inside Instagram)
- First screen visible in under 2 seconds on a mid-range phone on 4G. Lazy-load everything below the cover.
- Videos: preload="none" except the 3 nearest in the tunnel; pause everything off-screen or when the tab is hidden; never autoplay sound.
- Only animate transform and opacity; use will-change only while a section is active. Avoid backdrop-filter on mobile.
- Test inside an in-app browser size (390×844) with 4G throttling; Lighthouse mobile Performance 85+, Accessibility 95+, SEO 95+.
- No horizontal overflow at any width (fix causes; overflow-x: clip on body as a safety net).
- prefers-reduced-motion: no pins, tunnel becomes a grid, orbit becomes a static wrap of pills, cards don't fan (simple list), no rotating badge.

## 7. Accessibility
Semantic sections with headings, alt text, video captions in the player, keyboard navigation for the player, cards (Enter flips) and form, visible focus rings, colour contrast AA (lime is used as a background with ink text, never as small text on paper).

## 8. Capture mode (?capture=1)
Disable Lenis; remove gsap.updateRoot from the ticker and set lagSmoothing(0); scrubs true; no CSS transitions; videos paused and seeked by time; skip the opening. Expose window.__captureReady, window.__captureStep(scrollY, t) and window.__captureSections, so I can record a perfectly smooth showcase reel with my Puppeteer + Remotion pipeline.

## 9. Docs (plain and short)
- README.md: run, build, deploy.
- docs/NEW-CREATOR.md: step-by-step to make a site for a new creator in under 2 hours — what to collect from them, where to put files, edit creator.json, run npm run assets and npm run check-content, deploy, connect their domain.
- docs/CAPTURE.md: recording the showcase reel.

## 10. Quality check
- Full scroll on 390px mobile and 1440/1920 desktop: cover letters never cover her face, the tunnel streams smoothly, orbit pills pass correctly in front of and behind her, cards flip, player works.
- Swap in a second test creator.json (different name, 4 videos only, prices hidden) and confirm everything still works and looks good.
- No console errors. Report Lighthouse scores and anything you couldn't do.
```

---

## 8. Making it for a real creator

Collect from the creator:
1. **One photo on a plain background** (for the cut-out), plus a casual photo for the polaroid.
2. **6–12 of their best vertical videos** (UGC, unboxings, tutorials).
3. **Brands they've worked with**, only the ones they're allowed to show.
4. **2–3 case studies:** the brief, what they made, any results the brand shared.
5. **Services and rates** (or "rates on request"), **email, Instagram, media kit**.

Then: replace the files, edit `creator.json`, run the asset script, deploy, connect their domain. About a day of work.

**What to charge (to decide yourself):** a one-time setup fee, plus a small monthly fee for hosting and adding new videos every month. Creators keep adding content, so the monthly part is easy to justify.

---

## 9. How to pitch creators on Instagram

**Who to target:** UGC creators with 2k–50k followers who mention "UGC creator" in their bio and use Linktree, Canva PDFs or Google Drive folders as their portfolio. They feel the pain most.

**Don't build a site with their photos or videos before they agree.** Using someone's content without permission puts them off and can cause problems. Instead:
1. Post your **demo reel** first (recorded with capture mode): cover → tunnel → orbit → card flip.
2. DM them **the demo link** with a short, personal message.

**Example DM (plain and short):**
> Hi [name]! Love your [specific video] for [brand], the hook was so good 🙌 I build portfolio websites for UGC creators, so brands can see your best videos in one place instead of a PDF. Here's a demo I made: [link]. Want me to make one like this with your content? Happy to show you how it'd look.

**Follow-up after 3–4 days** if no reply: one line plus a 10-second screen recording of the tunnel on a phone.

**Reel for your own page (to boost):** 15–20s, phone screen recording: cover letters flying back → flying through the phone tunnel → brands orbiting → flipping a card. Caption: "UGC creators: brands decide in seconds. A PDF won't stop them. This will. DM me 'PORTFOLIO'."

---

## 10. Checklist
- [ ] Kaira looks the same in every image and video
- [ ] Cut-outs have clean hair edges
- [ ] Loads fast inside Instagram (send the link to yourself in a DM and open it)
- [ ] Tunnel smooth on a mid-range phone; only nearby videos play
- [ ] Orbit pills go behind and in front of her correctly
- [ ] Cards flip; player works with swipe and keyboard
- [ ] All brands invented; stats and results marked as demo; disclaimer in footer
- [ ] Second test creator file works (template really reusable)
- [ ] Showcase reel recorded
