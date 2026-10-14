# New creator site in under 2 hours

## 1. Collect from the creator (send this list in one message)

- [ ] **Cover photo**: standing, plain background, head to knees, about 1500 px tall or more. A transparent PNG is best.
- [ ] Optional **phone-shaped cover photo** (9:16, waist up). Without it, the cover photo is used on phones too.
- [ ] **Orbit photo**: waist up, holding a product, plain background.
- [ ] **Polaroid photo**: casual and square-ish (for example, filming at home).
- [ ] **6–12 vertical videos** (9:16), their best UGC. Ask which ones may keep sound.
- [ ] For each video: **type** (Unboxing, Tutorial, Review, Hook, Lifestyle, Product or Voiceover), **brand**, and a one-line caption.
- [ ] **Brands** they're allowed to show.
- [ ] **2–3 case studies**: brand, the brief, what they made, any results the brand shared, and a product photo.
- [ ] Bio (2 short lines), city, languages, niches and turnaround time.
- [ ] Follower count, average views and number of brands.
- [ ] Services and "from" prices, or "rates on request". Add-ons.
- [ ] Email, Instagram handle, optional WhatsApp, and a media kit PDF (or use `npm run media-kit`).
- [ ] Domain name, if they have one.

## 2. Put the files in `raw/` (≈15 min)

```
raw/creator/cover-cutout.png          ← name must contain "cutout"
raw/creator/cover-cutout-mobile.png   (optional)
raw/creator/orbit-cutout.png
raw/creator/polaroid.jpg
raw/video/<anything>.mp4
raw/cases/<brand>.jpg
```

First delete the demo files you're replacing. If a cut-out still has a background, the asset script tries **rembg** (`pip install "rembg[cli]"`, Python 3.10–3.12). If rembg isn't set up, remove the background in any tool and export a transparent PNG.

## 3. Process media (≈10 min, mostly waiting)

```bash
npm run assets
```

Open `.assets-debug/*-preview.png` and check the hair edges over both dark and light backgrounds. Read the size report: every video should be under 2 MB and every preview loop under 400 KB. The script lowers quality automatically to hit those limits.

## 4. Edit `src/content/creator.json` (≈45 min)

Replace every field. Paths are relative to `raw/`. Key switches:

- `"demo": false` removes the demo disclaimer. Also set `stats.demo: false` once the figures are real.
- `"showPrices": false` shows "Rates on request" on every service.
- `"theme"` sets the brand colours. Ink text must stay readable on `lime`, `paper` and `lavender`; the checker enforces this.
- `"audio": true` on a video keeps its sound and shows an Unmute button in the player.
- `"firstName"` is the big cover word. Keep it to 8 letters or fewer, or use a nickname.
- `"seo.siteUrl"` sets the final domain (used for the canonical link and the share image).

Then:

```bash
npm run check-content   # fix anything it lists
npm run media-kit       # optional
npm run dev             # check on your phone: open the "Network" URL on the same Wi-Fi
```

Check on a phone: the cover name doesn't hide behind the face, the tunnel plays, orbit pills pass behind them, cards flip, the player opens and closes, and the form opens an email.

## 5. Deploy (≈15 min)

```bash
npm run build
```

Push to a new GitHub repo and import it in Netlify, or drag `dist/` onto app.netlify.com/drop.

## 6. Connect their domain (≈10 min + DNS wait)

In Netlify, go to **Domain management → Add a domain** and enter the domain. At the registrar, either point the nameservers to Netlify, or add an `A` record to `75.2.60.5` and a `CNAME` for `www` pointing to `<site>.netlify.app`. HTTPS is set up automatically.

Last check: send the link to yourself in an Instagram DM and open it there.
