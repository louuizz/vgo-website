// Fails if the EN page contains any Chinese, or the ZH page contains English words outside the brand allow-list.
// Checks: visible body text, alt / aria-label, <title>, meta description/keywords/og/twitter text, and schema text fields.
import { readFileSync } from 'node:fs';

function collect(html) {
  const out = [];
  const body = html.slice(html.indexOf('<body'));
  out.push(body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' '));
  for (const m of body.matchAll(/\b(?:alt|aria-label)="([^"]*)"/g)) out.push(m[1]);
  out.push(html.match(/<title>(.*?)<\/title>/)[1]);
  for (const m of html.matchAll(/<meta (?:name|property)="(?:description|keywords|og:title|og:description|twitter:title|twitter:description)" content="([^"]*)"/g)) out.push(m[1]);
  const ld = JSON.parse(html.match(/ld\+json">(.*?)<\/script>/s)[1]);
  const walk = (o) => { if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (['name', 'description', 'text', 'serviceType', 'slogan'].includes(k) && typeof v === 'string') out.push(v); else walk(v); } };
  walk(ld);
  return out.join(' \n ').replace(/&[a-z]+;/g, ' ');
}

import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const allow = /^(V-GO|WhatsApp|PayNow|hello|vgo|transport|com|MY)$/i;
const skip = new Set(['node_modules', 'dist', 'public', 'src', 'scripts', '.git', '.claude']);
const files = [];
(function scan(d) { for (const n of readdirSync(d)) { if (skip.has(n)) continue; const f = join(d, n); if (statSync(f).isDirectory()) scan(f); else if (n === 'index.html') files.push(f); } })('.');

let bad = 0, en = 0, zh = 0;
for (const f of files) {
  const isZh = f.startsWith('zh/') || f === 'zh/index.html';
  const t = collect(readFileSync(f, 'utf8'));
  if (isZh) {
    zh++;
    const lat = (t.replace(/V-GO|WhatsApp|PayNow/g, ' ').match(/[A-Za-z][A-Za-z]*/g) || []).filter((w) => !allow.test(w));
    if (lat.length) { bad++; console.log(`${f}: contains English:`, [...new Set(lat)].join(' ')); }
  } else {
    en++;
    const cjk = t.match(/[\u3400-\u9fff]+/g);
    if (cjk) { bad++; console.log(`${f}: contains Chinese:`, [...new Set(cjk)].join(' ')); }
  }
}
console.log(bad ? 'LANGUAGE CHECK FAILED' : `Language check passed: ${en} English pages are English-only, ${zh} Chinese pages are Chinese-only (brand names V-GO / WhatsApp / PayNow excepted).`);
process.exit(bad ? 1 : 0);
