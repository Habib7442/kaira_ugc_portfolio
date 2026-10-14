#!/bin/sh
# Lighthouse mobile run: sh scripts/qa/lh.sh <url> <name>
CHROME_PATH="${CHROME:-C:/Program Files/Google/Chrome/Application/chrome.exe}" npx lighthouse "$1" --quiet --chrome-flags="--headless=new" --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=".lighthouse/$2.json" >/dev/null 2>&1
node -e "
const r=require('./.lighthouse/$2.json');
console.log(Object.entries(r.categories).map(([k,c])=>k+' '+Math.round(c.score*100)).join(' | '));
console.log(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map(a=>a.replace(/-/g,' ')+': '+r.audits[a].displayValue).join(' | '));
const l=r.audits['largest-contentful-paint-element']; if(l&&l.details) console.log('LCP el:', JSON.stringify(l.details.items?.[0]?.items?.[0]?.node?.snippet||'').slice(0,160));
"
