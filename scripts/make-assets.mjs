// Builds web-ready assets from V-GO.png: transparent logo, favicons, OG image.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

mkdirSync('public', { recursive: true });
const src = sharp('V-GO.png').ensureAlpha();
const { data, info } = await src.raw().toBuffer({ resolveWithObject: true });

// Soft white -> alpha: pixels near white become transparent, edges fade smoothly.
const out = Buffer.from(data);
for (let i = 0; i < out.length; i += 4) {
  const min = Math.min(out[i], out[i + 1], out[i + 2]);
  if (min > 244) out[i + 3] = 0;
  else if (min > 215) out[i + 3] = Math.round(((244 - min) / 29) * 255);
}
const raw = { raw: { width: info.width, height: info.height, channels: 4 } };
const trimmed = await sharp(out, raw).trim().png().toBuffer();

await sharp(trimmed).resize({ width: 900 }).webp({ quality: 90 }).toFile('public/logo.webp');
await sharp(trimmed).resize({ width: 900 }).png().toFile('public/logo.png');
await sharp(trimmed).resize({ width: 160 }).png().toFile('public/logo-sm.png');

// Favicons: logo on white rounded square
const icon = async (size, file, pad = 0.12) => {
  const inner = Math.round(size * (1 - pad * 2));
  const fg = await sharp(trimmed).resize(inner, inner, { fit: 'contain', background: '#0000' }).toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: '#ffffff' } })
    .composite([{ input: fg, gravity: 'center' }]).png().toFile(file);
};
await icon(32, 'public/favicon-32.png', 0.04);
await icon(180, 'public/apple-touch-icon.png');
await icon(192, 'public/icon-192.png');
await icon(512, 'public/icon-512.png');

// Photos → responsive WebP (originals stay in the project root, untouched)
const photos = { 'hero-mpv': 'MPV Car.png', interior: 'car interior.png', chauffeur: 'Escort.png' };
// Panoramic hero banner (wider sizes)
for (const w of [1000, 1600, 2400]) {
  await sharp('Hero Image.png').resize({ width: w }).webp({ quality: 80 }).toFile(`public/hero-bg-${w}.webp`);
}
for (const [name, file] of Object.entries(photos)) {
  for (const w of [800, 1600]) {
    await sharp(file).resize({ width: w }).webp({ quality: 80 }).toFile(`public/${name}-${w}.webp`);
  }
}

// OG images 1200x630 per language: MPV photo + navy gradient + title + logo badge
const W = 1200, H = 630;
const photo = await sharp('Hero Image.png').resize(W, H, { fit: 'cover', position: 'centre' }).toBuffer();
const badge = await sharp(trimmed).resize({ height: 150 }).toBuffer();
const font = 'PingFang SC, Hiragino Sans GB, Helvetica, Arial';
const og = {
  'og-image.jpg': ['Premium MPV Charter', 'Johor Bahru ⇄ Singapore', 'Alphard · Vellfire · Airport · Day charter'],
  'og-image-zh.jpg': ['新山 ⇄ 新加坡', '高端商务车包车与接送', '阿尔法 · 威尔法 · 机场接送 · 一日包车'],
};
for (const [file, [l1, l2, l3]] of Object.entries(og)) {
  const overlay = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#06173a" stop-opacity=".96"/><stop offset=".55" stop-color="#06173a" stop-opacity=".6"/><stop offset="1" stop-color="#06173a" stop-opacity="0"/></linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<text x="64" y="270" font-family="${font}" font-weight="700" font-size="56" fill="#fff">${l1}</text>
<text x="64" y="340" font-family="${font}" font-weight="700" font-size="56" fill="#fff">${l2}</text>
<text x="64" y="400" font-family="${font}" font-size="28" fill="#f2c46b">${l3}</text>
</svg>`);
  await sharp(photo).composite([
    { input: overlay },
    { input: await sharp({ create: { width: 190, height: 170, channels: 4, background: '#ffffff' } }).png().toBuffer(), left: 64, top: 60 },
    { input: badge, left: 74, top: 70 },
  ]).jpeg({ quality: 86 }).toFile('public/' + file);
}
console.log('assets done', info.width, info.height);
