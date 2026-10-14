# Behind the Post

A 3D scroll portfolio template for UGC creators. It's built mobile-first, so it works when opened from an Instagram DM.
Demo creator: **Kaira Vale** (fictional). Built with Vite, vanilla TypeScript, GSAP and Lenis. The 3D is plain CSS (no WebGL).

All creator content lives in one file: `src/content/creator.json`. Photos and videos go in `raw/`.

## Run

```bash
npm install
npm run dev            # http://localhost:5173
npm run dev:test       # same site with the second test creator (src/content/test-creator.json)
```

You need Node 20+ and, for `npm run assets`, **ffmpeg** on your PATH.

## Commands

| Command | What it does |
|---|---|
| `npm run assets` | Turns `raw/` into web media in `public/media/` and writes `src/content/media.json`. Only changed files are rebuilt (`-- --force` rebuilds everything). Previews of the cut-outs go to `.assets-debug/`. |
| `npm run check-content` | Checks `creator.json` and explains any problem in plain words. |
| `npm run media-kit` | Makes `public/media-kit.pdf` from `creator.json` (needs Chrome or Edge). |
| `npm run build` | Check content → type-check → build to `dist/` → print the first-screen size report (budget 450 KB). |
| `npm run preview` | Serves `dist/` locally. |

Test switches (add them to the URL): `?capture=1` (recording mode, see `docs/CAPTURE.md`), `?motion=reduce` (reduced-motion layout), `?lite=1` (low-power layout: the tunnel becomes a grid), `?intro=0` (skip the opening).

## Deploy (Netlify)

`netlify.toml` is included, with build `npm run build`, publish `dist` and cache headers.

1. Push the repo to GitHub, then in Netlify choose **Add new site → Import from Git**. Or drag the `dist/` folder onto app.netlify.com/drop.
2. Commit `public/media/` and `src/content/media.json`. Netlify has no ffmpeg, so it can't regenerate media and only runs the Vite build.

## More docs

- `docs/PLAN.md`: structure, data flow and how each section works
- `docs/NEW-CREATOR.md`: make a site for a new creator in under 2 hours
- `docs/CAPTURE.md`: record the showcase reel
- `scripts/qa/`: screenshot, interaction and Lighthouse helpers used for QA
