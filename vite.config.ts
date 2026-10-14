import fs from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { renderBody, renderHead } from './src/render/page.ts';
import type { Creator, Manifest } from './src/content/types.ts';

const creatorFile = path.resolve(process.env.CREATOR || 'src/content/creator.json');
const manifestFile = path.resolve('src/content/media.json');

function load() {
  const creator = JSON.parse(fs.readFileSync(creatorFile, 'utf8')) as Creator;
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8')) as Manifest;
  return { creator, manifest };
}

/** Pre-renders the page from the content file and exposes the bits the browser needs as `virtual:content`. */
function content(): Plugin {
  const VIRTUAL = '\0virtual:content';
  return {
    name: 'btp-content',
    resolveId: (id) => (id === 'virtual:content' ? VIRTUAL : undefined),
    load(id) {
      if (id !== VIRTUAL) return;
      const { creator: c, manifest: m } = load();
      const videos = c.videos.map((v) => {
        const e = m[v.src];
        if (e?.kind !== 'video') throw new Error(`Video ${v.src} missing from media.json`);
        return { id: v.id, type: v.type, brand: v.brand, caption: v.caption, mp4: e.mp4, webm: e.webm, poster: e.poster, hasAudio: e.hasAudio, duration: e.duration };
      });
      return `export const firstName = ${JSON.stringify(c.firstName)};
export const demo = ${JSON.stringify(c.demo)};
export const videos = ${JSON.stringify(videos)};`;
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const data = load();
        return html.replace('<!--head-->', renderHead(data)).replace('<!--body-->', renderBody(data));
      },
    },
    configureServer(server) {
      server.watcher.add([creatorFile, manifestFile]);
      server.watcher.on('change', (f) => {
        const p = path.resolve(f);
        if (p === creatorFile || p === manifestFile || p.includes(`${path.sep}render${path.sep}`)) server.restart();
      });
    },
  };
}

export default defineConfig({
  plugins: [content()],
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    modulePreload: { polyfill: false },
  },
  server: { host: true },
});
