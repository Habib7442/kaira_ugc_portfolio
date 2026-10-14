import puppeteer from 'puppeteer-core';
const [url, w, h] = process.argv.slice(2);
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const p = await b.newPage();
await p.setViewport({ width: +w, height: +h, isMobile: +w < 768, hasTouch: +w < 768 });
await p.goto(url, { waitUntil: 'networkidle2' });
await new Promise(r => setTimeout(r, 1500));
console.log(await p.evaluate(() => {
  const W = document.documentElement.clientWidth, out = [];
  const clipped = (el) => { for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) { const s = getComputedStyle(e); if (s.overflowX !== 'visible') return true; } return false; };
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if ((r.right > W + 1 || r.left < -1) && r.width > 0 && !clipped(el)) out.push(`${el.tagName}.${el.className} L${r.left|0} R${r.right|0}`);
  }
  return `scrollWidth ${document.documentElement.scrollWidth} vs ${W}\n` + out.slice(0, 20).join('\n');
}));
await b.close();
