// Generates the full bilingual site as static HTML (EN at /, 简体中文 at /zh/).
// Everything is server-rendered so search engines read it without running JavaScript.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { content } from '../content.mjs';
import { pages, slugs } from '../pages.mjs';
import { site } from '../site.config.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const strip = (s) => String(s).replace(/<[^>]+>/g, '');
const wa = (msg = '') => `https://wa.me/${site.whatsapp}${msg ? `?text=${msg}` : ''}`;
const abs = (p) => site.url.replace(/\/$/, '') + p;
const LANGS = ['en', 'zh'];
const L = (lang, p) => (lang === 'zh' ? '/zh' + p : p);
const OTHER = { en: 'zh', zh: 'en' };
const today = new Date().toISOString().slice(0, 10);

const written = []; // {en, zh} path pairs for sitemap
const out = (path, html) => {
  const file = (path === '/' ? '' : path.slice(1)) + 'index.html';
  mkdirSync(dirname(file) === '.' ? '.' : dirname(file), { recursive: true });
  writeFileSync(file, html);
};

// ───────────────────────── shared data accessors ─────────────────────────
const P = (lang) => pages[lang];
const home = (lang) => content[lang];
const D = (lang, slug) => P(lang).detail[slug];
const dPath = (lang, slug) => L(lang, `/${D('en', slug).kind}/${slug}/`);
const relPath = (lang, rel) => L(lang, `/${rel}/`);

// ───────────────────────── icons + pictures ─────────────────────────
const IC = {
  car: '<path d="M5 16l1.5-5.2A2 2 0 0 1 8.4 9.3h7.2a2 2 0 0 1 1.9 1.5L19 16"/><rect x="3" y="16" width="18" height="4" rx="1.5"/><path d="M7 18h.01M17 18h.01"/>',
  route: '<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a3 3 0 0 0 0-6h-4a3 3 0 0 1 0-6h6"/>',
  plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  briefcase: '<rect x="4" y="7" width="16" height="13" rx="2"/><path d="M9 7V4h6v3M9 11v5M15 11v5"/>',
  tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
  chat: '<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.3A8 8 0 1 1 21 12z"/>',
  sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17v4M17 19h4"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  seat: '<path d="M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3"/><path d="M3 14a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v4H3z"/><path d="M6 18v2M18 18v2"/>',
  snow: '<path d="M12 2v20M4.9 7l14.2 10M19.1 7 4.9 17M9 4l3 2 3-2M9 20l3-2 3 2"/>',
  battery: '<rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2M10 9l-2 3h4l-2 3"/>',
  drop: '<path d="M12 2.7c4 4.3 6 7.3 6 10.3a6 6 0 0 1-12 0c0-3 2-6 6-10.3z"/>',
};
const ic = (n) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]}</svg>`;
const SVC_IC = ['route', 'calendar', 'plane', 'pin'];
const ROUTE_IC = ['car', 'car', 'plane', 'plane', 'pin', 'route'];
const STEP_IC = ['chat', 'tag', 'car'];
const WHY_IC = ['tag', 'car', 'shield', 'chat', 'sparkles', 'clock'];
const SPEC_IC = ['users', 'briefcase', 'sparkles', 'shield'];
const FEAT_IC = ['seat', 'snow', 'sparkles', 'battery', 'drop', 'briefcase'];
const PIC = { mpv: ['hero-mpv', [800, 1600], 1600, 1075, 'hero'], interior: ['interior', [800, 1600], 1600, 900, 'interior'], chauffeur: ['chauffeur', [800, 1600], 1600, 967, 'chauffeur'], banner: ['hero-bg', [1000, 1600], 1600, 640, 'heroBanner'] };
const pic = (lang, key, sizes) => {
  const [n, ws, w, h, alt] = PIC[key];
  return `<img src="/${n}-${ws[ws.length - 1]}.webp" srcset="${ws.map((x) => `/${n}-${x}.webp ${x}w`).join(', ')}" sizes="${sizes}" alt="${esc(home(lang).img[alt])}" width="${w}" height="${h}" loading="lazy">`;
};
const IMG_FOR = { 'cross-border-transfer': 'mpv', 'day-charter': 'interior', 'airport-transfer': 'chauffeur', 'long-distance': 'banner', 'singapore-to-johor-bahru': 'mpv', 'johor-bahru-to-singapore': 'banner', 'changi-airport-to-johor-bahru': 'chauffeur', 'senai-airport-to-singapore': 'interior' };
const INLINE_FOR = { 'cross-border-transfer': 'interior', 'day-charter': 'mpv', 'airport-transfer': 'banner', 'long-distance': 'mpv', 'singapore-to-johor-bahru': 'interior', 'johor-bahru-to-singapore': 'chauffeur', 'changi-airport-to-johor-bahru': 'mpv', 'senai-airport-to-singapore': 'banner' };
const specsHtml = (c) => c.fleet.specs.map((x, i) => `<div><dt>${ic(SPEC_IC[i])}${x.k}</dt><dd>${x.v}</dd></div>`).join('');

// ───────────────────────── schema ─────────────────────────
function business(lang) {
  const c = home(lang);
  const sameAs = Object.values(site.social).filter(Boolean);
  return {
    '@type': ['TravelAgency', 'LocalBusiness'],
    '@id': abs('/#business'),
    name: site.name,
    legalName: c.schema.company,
    url: abs(L(lang, '/')),
    image: abs(c.ogImage),
    logo: abs('/logo.png'),
    description: c.schema.desc,
    telephone: site.phoneDisplay,
    ...(site.email ? { email: site.email } : {}),
    priceRange: '$$$',
    slogan: c.hero.eyebrow,
    knowsLanguage: ['en', 'zh', 'ms'],
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: [
      { '@type': 'City', name: c.schema.areas[0] },
      { '@type': 'AdministrativeArea', name: c.schema.areas[1] },
      { '@type': 'Country', name: c.schema.areas[2] },
    ],
    openingHoursSpecification: { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
    contactPoint: { '@type': 'ContactPoint', contactType: 'reservations', telephone: site.phoneDisplay, availableLanguage: ['English', 'Chinese', 'Malay'] },
    ...(sameAs.length ? { sameAs } : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: c.schema.serviceName,
      itemListElement: slugs.services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: D(lang, s).nm, description: D(lang, s).lead } })),
    },
  };
}
const faqNode = (lang, path, items) => ({
  '@type': 'FAQPage',
  '@id': abs(path + '#faq'),
  mainEntity: items.map((i) => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
});
const crumbNode = (crumbs) => ({
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.n, item: abs(c.u) })),
});
function graph(lang, nodes) {
  const web = { '@type': 'WebSite', '@id': abs('/#website'), url: abs('/'), name: site.name, inLanguage: ['en', 'zh-Hans'], publisher: { '@id': abs('/#business') } };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [business(lang), web, ...nodes] });
}

// ───────────────────────── layout ─────────────────────────
function header(lang, path) {
  const c = home(lang), p = P(lang), n = p.nav;
  const cur = (href) => (path === href ? ' aria-current="page"' : '');
  const sub = (kind) => slugs[kind].map((s) => `<a href="${dPath(lang, s)}"${cur(dPath(lang, s))}>${D(lang, s).short}</a>`).join('');
  const links = `
    <li class="has-sub"><a href="${L(lang, '/services/')}"${cur(L(lang, '/services/'))}>${n.services}</a><div class="sub">${sub('services')}</div></li>
    <li><a href="${L(lang, '/fleet/')}"${cur(L(lang, '/fleet/'))}>${n.fleet}</a></li>
    <li class="has-sub"><a href="${L(lang, '/routes/')}"${cur(L(lang, '/routes/'))}>${n.routes}</a><div class="sub">${sub('routes')}</div></li>
    <li><a href="${L(lang, '/about/')}"${cur(L(lang, '/about/'))}>${n.about}</a></li>
    <li><a href="${L(lang, '/faq/')}"${cur(L(lang, '/faq/'))}>${n.faq}</a></li>
    <li><a href="${L(lang, '/contact/')}"${cur(L(lang, '/contact/'))}>${n.contact}</a></li>`;
  const mob = `
    <a href="${L(lang, '/')}">${p.ui.home}</a>
    <a href="${L(lang, '/services/')}">${n.services}</a>${slugs.services.map((s) => `<a class="m-sub" href="${dPath(lang, s)}">${D(lang, s).short}</a>`).join('')}
    <a href="${L(lang, '/fleet/')}">${n.fleet}</a>
    <a href="${L(lang, '/routes/')}">${n.routes}</a>${slugs.routes.map((s) => `<a class="m-sub" href="${dPath(lang, s)}">${D(lang, s).short}</a>`).join('')}
    <a href="${L(lang, '/about/')}">${n.about}</a>
    <a href="${L(lang, '/faq/')}">${n.faq}</a>
    <a href="${L(lang, '/contact/')}">${n.contact}</a>`;
  return { c, html: `
<header class="nav" id="nav">
  <a class="brand" href="${L(lang, '/')}" aria-label="V-GO"><img src="/logo-sm.png" alt="${c.aria.logoAlt}" width="44" height="44"><span>V-GO</span></a>
  <nav class="dnav" aria-label="${c.aria.primary}"><ul>${links}</ul></nav>
  <div class="nav-r">
    <a class="lang" href="${'@@ALT@@'}" hreflang="${OTHER[lang] === 'zh' ? 'zh-Hans' : 'en'}" lang="${OTHER[lang] === 'zh' ? 'zh-Hans' : 'en'}">${c.nav.switchLabel}</a>
    <a class="btn btn-gold magnetic" href="${L(lang, '/contact/')}"><span>${n.book}</span></a>
    <button class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="mnav" aria-label="${p.ui.menu}"><i></i><i></i></button>
  </div>
</header>
<div class="mnav" id="mnav" aria-label="${c.aria.primary}"><div class="mnav-in">${mob}<a class="btn btn-gold" href="${wa()}" rel="noopener"><span>${p.ui.whatsapp}</span></a></div></div>` };
}

function footer(lang) {
  const c = home(lang), p = P(lang);
  const li = (href, t) => `<li><a href="${href}">${t}</a></li>`;
  return `
<footer class="footer">
  <div class="wrap foot-grid">
    <div><a class="brand" href="${L(lang, '/')}"><img src="/logo-sm.png" alt="${c.aria.logoAlt}" width="44" height="44" loading="lazy"><span>V-GO</span></a><p>${c.footer.blurb}</p></div>
    <div><h4>${p.ui.services}</h4><ul>${slugs.services.map((s) => li(dPath(lang, s), D(lang, s).short)).join('')}</ul></div>
    <div><h4>${p.ui.routes}</h4><ul>${slugs.routes.map((s) => li(dPath(lang, s), D(lang, s).short)).join('')}</ul></div>
    <div><h4>${p.ui.company}</h4><ul>${li(L(lang, '/fleet/'), p.nav.fleet)}${li(L(lang, '/about/'), p.nav.about)}${li(L(lang, '/faq/'), p.nav.faq)}${li(L(lang, '/contact/'), p.nav.contact)}${li(L(lang, '/privacy/'), P(lang).privacy.h1)}${li(L(lang, '/terms/'), P(lang).terms.h1)}</ul></div>
    <div><h4>${c.aria.contact}</h4><ul><li>${ic('chat')}<a href="${wa()}" rel="noopener">WhatsApp</a></li>${site.email ? `<li>${ic('mail')}<a href="mailto:${site.email}">${site.email}</a></li>` : ''}<li>${ic('phone')}${site.phoneDisplay}</li></ul></div>
  </div>
  <div class="wrap foot-bot"><span>© ${new Date().getFullYear()} ${c.schema.company}. ${c.footer.rights}</span><span>${c.footer.licence}</span></div>
</footer>
<a class="wa-float" href="${wa()}" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 32 32" width="28" height="28" fill="#fff" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.1 19.7L3 29l6.5-1.7A13 13 0 1 0 16 3Zm0 23.7c-2 0-3.9-.6-5.5-1.6l-.4-.2-3.8 1 1-3.7-.3-.4A10.7 10.7 0 1 1 16 26.700Zm5.9-8c-.3-.2-1.900-.9-2.200-1-.3-.1-.5-.2-.7.2l-1 1.200c-.2.200-.4.200-.7.100-1.900-.9-3.100-1.700-4.300-3.800-.3-.6.300-.5.900-1.700.1-.2 0-.4 0-.5l-1-2.300c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.100-.9.400-.3.300-1.200 1.200-1.200 2.900s1.300 3.400 1.400 3.600c.2.200 2.500 3.800 6 5.300 2.200.9 3 1 4.100.8.700-.1 1.900-.8 2.200-1.500.3-.8.300-1.400.2-1.500-.1-.2-.3-.2-.6-.4Z"/></svg></a>`;
}

function layout(lang, { path, title, desc, keywords, ogImage, nodes = [], body, preload = '', isHome = false }) {
  const c = home(lang);
  const altPath = L(OTHER[lang], path.replace(/^\/zh/, '') || '/');
  const enPath = lang === 'en' ? path : altPath, zhPath = lang === 'zh' ? path : altPath;
  const canon = abs(path);
  const og = abs(ogImage || c.ogImage);
  const h = header(lang, path);
  written.push({ lang, path, enPath, zhPath });
  return `<!doctype html>
<html lang="${c.htmlLang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
${keywords ? `<meta name="keywords" content="${esc(keywords)}">\n` : ''}<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="theme-color" content="#06173a">
<meta name="geo.region" content="MY-01">
<meta name="geo.placename" content="Johor Bahru">
<link rel="canonical" href="${canon}">
<link rel="alternate" hreflang="en" href="${abs(enPath)}">
<link rel="alternate" hreflang="zh-Hans" href="${abs(zhPath)}">
<link rel="alternate" hreflang="x-default" href="${abs(enPath)}">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canon}">
<meta property="og:image" content="${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${c.ogLocale}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${og}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${preload}<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
<script type="application/ld+json">${graph(lang, nodes)}</script>
<script type="module" src="/src/main.js"></script>
</head>
<body class="${c.lang}${isHome ? ' is-home' : ''}">
<a class="skip" href="#main">${c.skip}</a>
${isHome ? `<div class="loader" aria-hidden="true"><img src="/logo-sm.png" alt="" width="96" height="96"><span class="loader-bar"><i></i></span></div>` : ''}
<div class="cursor" aria-hidden="true"></div>
${h.html.replace('@@ALT@@', altPath)}
<main id="main">
${body}
</main>
${footer(lang)}
</body>
</html>
`;
}

// ───────────────────────── components ─────────────────────────
const crumbsHtml = (lang, crumbs) =>
  `<nav class="crumbs" aria-label="${P(lang).ui.breadcrumb}"><ol>${crumbs.map((c, i) => (i < crumbs.length - 1 ? `<li><a href="${c.u}">${c.n}</a></li>` : `<li aria-current="page">${c.n}</li>`)).join('')}</ol></nav>`;

function pageHead(lang, crumbs, { h1, lead, kicker = '', actions = true, quote = '', img = '' }) {
  const p = P(lang);
  return `<section class="page-head">
  <div class="ph-sun" aria-hidden="true"></div>
  <div class="wrap ph-in${img ? ' has-img' : ''}">
    <div class="ph-text">
    ${crumbsHtml(lang, crumbs)}
    ${kicker ? `<p class="kicker reveal-up">${kicker}</p>` : ''}
    <h1 class="reveal-up">${h1}</h1>
    <p class="lead-l reveal-up">${lead}</p>
    ${actions ? `<div class="ph-cta reveal-up"><a class="btn btn-gold magnetic" href="${L(lang, '/contact/')}${quote ? `?route=${encodeURIComponent(quote)}` : ''}"><span>${p.ui.getQuote}</span></a><a class="btn btn-light magnetic" href="${wa()}" rel="noopener"><span>${p.ui.whatsapp}</span></a></div>` : ''}
    </div>
    ${img ? `<div class="ph-img"><div class="img-mask">${pic(lang, img, '(max-width: 1000px) 1px, 40vw')}</div></div>` : ''}
  </div>
</section>`;
}

function ctaBand(lang) {
  const p = P(lang);
  return `<section class="cta dark" aria-label="${esc(p.ui.ctaH)}">
  <img class="cta-bg" src="/hero-bg-1600.webp" alt="" width="1600" height="640" loading="lazy">
  <div class="cta-sun"></div>
  <div class="wrap cta-in">
    <h2 class="split">${p.ui.ctaH}</h2>
    <p>${p.ui.ctaP}</p>
    <div class="cta-btns"><a class="btn btn-gold btn-lg magnetic" href="${L(lang, '/contact/')}"><span>${p.ui.getQuote}</span></a><a class="btn btn-light btn-lg magnetic" href="${wa()}" rel="noopener"><span>${p.ui.whatsapp}</span></a></div>
  </div>
</section>`;
}

const faqList = (items) => `<div class="faq-list">${items.map((i) => `<details><summary><h3>${i.q}</h3><i></i></summary><p>${i.a}</p></details>`).join('')}</div>`;
const sectionsHtml = (secs) => secs.map((s) => `<section class="prose-sec"><h2>${s.h2}</h2>${(s.p || []).map((t) => `<p>${t}</p>`).join('')}${s.list ? `<ul class="ticks">${s.list.map((x) => `<li>${x}</li>`).join('')}</ul>` : ''}</section>`).join('');
const imgTag = (name, alt, sizes, w, h, lazy = true) => `<img src="/${name}-1600.webp" srcset="/${name}-800.webp 800w, /${name}-1600.webp 1600w" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'}>`;

// ───────────────────────── pages ─────────────────────────
function homePage(lang) {
  const c = home(lang), p = P(lang);
  const svcSlugs = slugs.services;
  const routeLinks = [...slugs.routes, 'long-distance', 'long-distance'];
  const faq5 = c.faq.items.slice(0, 5);
  const body = `
<section class="hero" id="top">
  <div class="hero-glow" aria-hidden="true"></div>
  <div class="wrap hero-top">
    <div>
      <p class="eyebrow reveal-up">${c.hero.eyebrow}</p>
      <h1 class="hero-h1">
        <span class="line"><span class="line-in">${c.hero.h1a}</span></span>
        <span class="line"><span class="line-in">${c.hero.h1b}</span></span>
        <span class="line"><span class="line-in grad">${c.hero.h1c}</span></span>
      </h1>
    </div>
    <div class="hero-side">
      <p class="lead-l reveal-up">${c.hero.lead}</p>
      <div class="hero-cta reveal-up">
        <a class="btn btn-gold magnetic" href="${L(lang, '/contact/')}"><span>${c.hero.cta1}</span></a>
        <a class="btn btn-light magnetic" href="${L(lang, '/services/')}"><span>${c.hero.cta2}</span></a>
      </div>
      <ul class="chips reveal-up">${c.hero.chips.map((x) => `<li>${x}</li>`).join('')}</ul>
    </div>
  </div>
  <figure class="hero-banner">
    <img src="/hero-bg-2400.webp" srcset="/hero-bg-1000.webp 1000w, /hero-bg-1600.webp 1600w, /hero-bg-2400.webp 2400w" sizes="100vw" alt="${esc(c.img.heroBanner)}" width="2400" height="960" fetchpriority="high">
  </figure>
</section>

<div class="marquee" aria-hidden="true"><div class="marquee-track">${[...c.marquee, ...c.marquee].map((x) => `<span>${x}</span><b>✦</b>`).join('')}</div></div>

<section class="intro dark" id="intro">
  <div class="wrap grid-intro">
    <div class="intro-text"><p class="kicker">${c.intro.kicker}</p><h2 class="split">${c.intro.h2}</h2><p class="fade">${c.intro.p1}</p><p class="fade">${c.intro.p2}</p></div>
    <figure class="intro-fig"><div class="img-mask">${pic(lang, 'mpv', '(max-width: 900px) 92vw, 44vw')}</div></figure>
  </div>
</section>

<section class="services dark" id="services" aria-labelledby="services-h">
  <div class="wrap"><p class="kicker">${c.services.kicker}</p><h2 id="services-h" class="split">${c.services.h2}</h2></div>
  <div class="h-scroll"><div class="h-track">
    ${c.services.items.map((s, i) => `<article class="card"><span class="card-n">${s.n}</span><span class="ic-badge">${ic(SVC_IC[i])}</span><span class="card-tag">${s.tag}</span><h3>${s.h3}</h3><p>${s.p}</p><a class="card-link" href="${dPath(lang, svcSlugs[i])}">${p.ui.learnMore} →</a></article>`).join('')}
  </div></div>
  <div class="wrap center-btn"><a class="btn btn-light magnetic" href="${L(lang, '/services/')}"><span>${p.ui.seeServices}</span></a></div>
</section>

<section class="fleet" id="fleet" aria-labelledby="fleet-h">
  <div class="wrap grid-fleet">
    <figure class="fleet-visual"><div class="fleet-sun"></div><div class="img-mask">${imgTag('interior', c.img.interior, '(max-width: 900px) 92vw, 46vw', 1600, 900)}</div></figure>
    <div>
      <p class="kicker">${c.fleet.kicker}</p>
      <h2 id="fleet-h" class="split">${c.fleet.h2}</h2>
      <p class="fade">${c.fleet.p}</p>
      <dl class="specs">${specsHtml(c)}</dl>
      <a class="btn btn-navy magnetic" href="${L(lang, '/fleet/')}"><span>${p.ui.seeFleet}</span></a>
    </div>
  </div>
</section>

<section class="routes dark" id="routes" aria-labelledby="routes-h">
  <svg class="road" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true"><path class="road-path" d="M0 120 C 220 10 380 170 600 80 S 980 20 1200 70" fill="none" stroke="url(#rg)" stroke-width="3" stroke-linecap="round" stroke-dasharray="1"/><defs><linearGradient id="rg"><stop offset="0" stop-color="#3bb8f5"/><stop offset="1" stop-color="#d4a94f"/></linearGradient></defs></svg>
  <div class="wrap">
    <p class="kicker">${c.routes.kicker}</p><h2 id="routes-h" class="split">${c.routes.h2}</h2>
    <p class="fade lead2">${c.routes.p}</p>
    <ul class="route-list">
      ${c.routes.items.map((r, i) => `<li class="route"><a href="${dPath(lang, routeLinks[i])}"><span class="ic-badge sm">${ic(ROUTE_IC[i])}</span><div class="route-ft"><span>${r.from}</span><em>⇄</em><span>${r.to}</span></div><div class="route-t">${r.t}</div><p>${r.d}</p></a></li>`).join('')}
    </ul>
    <div class="center-btn"><a class="btn btn-light magnetic" href="${L(lang, '/routes/')}"><span>${p.ui.seeRoutes}</span></a></div>
  </div>
</section>

<section class="how" id="how" aria-labelledby="how-h">
  <div class="wrap grid-how">
    <figure class="how-photo"><div class="img-mask">${imgTag('chauffeur', c.img.chauffeur, '(max-width: 900px) 92vw, 44vw', 1600, 967)}</div><figcaption class="chip-float">${c.img.chauffeurChip}</figcaption></figure>
    <div>
      <p class="kicker">${c.how.kicker}</p><h2 id="how-h" class="split">${c.how.h2}</h2>
      <ol class="steps">${c.how.steps.map((s, i) => `<li class="step"><span class="step-n">${s.n}</span><div><h3>${s.h3}</h3><p>${s.p}</p></div><span class="step-ic">${ic(STEP_IC[i])}</span></li>`).join('')}</ol>
    </div>
  </div>
</section>

<section class="why dark" id="why" aria-labelledby="why-h">
  <div class="wrap">
    <p class="kicker">${c.why.kicker}</p><h2 id="why-h" class="split">${c.why.h2}</h2>
    <div class="why-grid">${c.why.items.map((w, i) => `<article class="why-item"><span class="ic-badge">${ic(WHY_IC[i])}</span><h3>${w.h3}</h3><p>${w.p}</p></article>`).join('')}</div>
  </div>
</section>

<section class="faq" id="faq" aria-labelledby="faq-h">
  <div class="wrap faq-wrap">
    <div><p class="kicker">${c.faq.kicker}</p><h2 id="faq-h" class="split">${c.faq.h2}</h2><a class="btn btn-ghost magnetic" href="${L(lang, '/faq/')}"><span>${p.ui.seeFaq}</span></a></div>
    ${faqList(faq5)}
  </div>
</section>
${ctaBand(lang)}`;
  const path = L(lang, '/');
  return layout(lang, {
    path, title: c.title, desc: c.description, keywords: c.keywords, isHome: true,
    preload: `<link rel="preload" as="image" href="/hero-bg-1600.webp" type="image/webp" imagesrcset="/hero-bg-1000.webp 1000w, /hero-bg-1600.webp 1600w, /hero-bg-2400.webp 2400w" imagesizes="100vw">\n`,
    nodes: [
      { '@type': 'Service', '@id': abs(path + '#service'), name: c.schema.serviceName, serviceType: c.schema.serviceType, description: c.schema.desc, provider: { '@id': abs('/#business') }, areaServed: [c.schema.areas[0], c.schema.areas[2]] },
      faqNode(lang, path, faq5),
      crumbNode([{ n: site.name, u: path }]),
    ],
    body,
  });
}

function detailPage(lang, slug) {
  const p = P(lang), d = D(lang, slug), c = home(lang);
  const path = dPath(lang, slug);
  const parent = { n: d.kind === 'services' ? p.nav.services : p.nav.routes, u: L(lang, `/${d.kind}/`) };
  const crumbs = [{ n: p.ui.home, u: L(lang, '/') }, parent, { n: d.short, u: path }];
  const quote = d.kind === 'routes' ? d.value : d.short;
  const rel = d.related.map((r) => { const s = r.split('/')[1]; return `<a class="rel-card" href="${relPath(lang, r)}"><span class="ic-badge sm">${ic(D(lang, s).kind === 'services' ? 'car' : 'route')}</span><span class="rel-k">${D(lang, s).kind === 'services' ? p.ui.services : p.ui.routes}</span><strong>${D(lang, s).short}</strong><em>${p.ui.learnMore} →</em></a>`; }).join('');
  const body = `
${pageHead(lang, crumbs, { h1: d.h1, lead: d.lead, kicker: d.kind === 'services' ? p.ui.services : p.ui.routes, quote, img: IMG_FOR[slug] })}
<section class="detail">
  <div class="wrap grid-detail">
    <article class="prose">${sectionsHtml([d.sections[0]])}<figure class="prose-fig"><div class="img-mask">${pic(lang, INLINE_FOR[slug], '(max-width: 900px) 92vw, 60vw')}</div></figure>${sectionsHtml(d.sections.slice(1))}</article>
    <aside class="aside">
      <div class="side-card"><h2>${p.ui.quickFacts}</h2><dl class="facts">${d.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl></div>
      <div class="side-card side-dark"><h2>${p.ui.bookThis}</h2><p>${p.ui.bookThisP}</p><a class="btn btn-gold" href="${L(lang, '/contact/')}?route=${encodeURIComponent(quote)}"><span>${p.ui.getQuote}</span></a><a class="btn btn-light" href="${wa()}" rel="noopener"><span>${p.ui.whatsapp}</span></a><small>${p.ui.reply}</small></div>
    </aside>
  </div>
</section>
<section class="faq alt-bg" aria-labelledby="faq-h"><div class="wrap faq-wrap"><div><p class="kicker">${home(lang).faq.kicker}</p><h2 id="faq-h" class="split">${p.ui.faqH}</h2></div>${faqList(d.faq)}</div></section>
<section class="related"><div class="wrap"><h2>${p.ui.related}</h2><div class="rel-grid">${rel}</div></div></section>
${ctaBand(lang)}`;
  return layout(lang, {
    path, title: d.title, desc: d.desc, body,
    nodes: [
      { '@type': 'Service', '@id': abs(path + '#service'), name: d.nm, serviceType: d.nm, description: d.desc, url: abs(path), provider: { '@id': abs('/#business') }, areaServed: [c.schema.areas[0], c.schema.areas[2]] },
      faqNode(lang, path, d.faq),
      crumbNode(crumbs.map((x) => ({ n: x.n, u: x.u }))),
    ],
  });
}

function servicesIndex(lang) {
  const p = P(lang), x = p.servicesIndex, path = L(lang, '/services/');
  const crumbs = [{ n: p.ui.home, u: L(lang, '/') }, { n: p.nav.services, u: path }];
  const cards = slugs.services.map((s, i) => { const d = D(lang, s); return `<article class="big-card"><div class="img-mask">${pic(lang, IMG_FOR[s], '(max-width: 800px) 92vw, 44vw')}</div><div class="bc-top"><span class="card-n">${String(i + 1).padStart(2, '0')}</span><span class="ic-badge">${ic(SVC_IC[i])}</span></div><span class="card-tag">${d.tag}</span><h2>${d.nm}</h2><p>${d.lead}</p><a class="btn btn-navy magnetic" href="${dPath(lang, s)}"><span>${p.ui.learnMore}</span></a></article>`; }).join('');
  const body = `
${pageHead(lang, crumbs, { h1: x.h1, lead: x.lead })}
<section class="listing"><div class="wrap"><div class="big-grid">${cards}</div></div></section>
<section class="how alt-bg"><div class="wrap"><h2>${x.compareH}</h2><ul class="compare">${x.compare.map(([a, b]) => `<li><span>${a}</span><em>→</em><strong>${b}</strong></li>`).join('')}</ul></div></section>
${ctaBand(lang)}`;
  return layout(lang, { path, title: x.title, desc: x.desc, body, nodes: [crumbNode(crumbs)] });
}

function routesIndex(lang) {
  const p = P(lang), x = p.routesIndex, c = home(lang), path = L(lang, '/routes/');
  const crumbs = [{ n: p.ui.home, u: L(lang, '/') }, { n: p.nav.routes, u: path }];
  const cards = slugs.routes.map((s, i) => { const d = D(lang, s); return `<li class="route"><a href="${dPath(lang, s)}"><span class="ic-badge sm">${ic(ROUTE_IC[i])}</span><div class="route-ft"><span>${d.from}</span><em>⇄</em><span>${d.to}</span></div><div class="route-t">${d.t}</div><p>${d.d}</p></a></li>`; }).join('');
  const body = `
${pageHead(lang, crumbs, { h1: x.h1, lead: x.lead })}
<section class="listing dark-sec"><div class="wrap"><ul class="route-list">${cards}</ul></div></section>
<section class="areas"><div class="wrap">
  <h2>${c.areas.h2}</h2>
  <div class="areas-grid">
    <div><h3>${c.areas.johor.h3}</h3><ul>${c.areas.johor.list.map((t) => `<li>${t}</li>`).join('')}</ul></div>
    <div><h3>${c.areas.sg.h3}</h3><ul>${c.areas.sg.list.map((t) => `<li>${t}</li>`).join('')}</ul></div>
  </div>
  <div class="more-band"><div><h3>${x.moreH}</h3><p>${x.moreP}</p></div><a class="btn btn-navy magnetic" href="${dPath(lang, 'long-distance')}"><span>${p.ui.learnMore}</span></a></div>
</div></section>
${ctaBand(lang)}`;
  return layout(lang, { path, title: x.title, desc: x.desc, body, nodes: [crumbNode(crumbs)] });
}

function fleetPage(lang) {
  const p = P(lang), x = p.fleet, c = home(lang), path = L(lang, '/fleet/');
  const crumbs = [{ n: p.ui.home, u: L(lang, '/') }, { n: p.nav.fleet, u: path }];
  const faq = [c.faq.items[3], p.faqPage.extra[2]];
  const body = `
${pageHead(lang, crumbs, { h1: x.h1, lead: x.lead })}
<section class="fleet"><div class="wrap grid-fleet">
  <figure class="fleet-visual"><div class="fleet-sun"></div><div class="img-mask wide">${imgTag('hero-mpv', c.img.hero, '(max-width: 900px) 92vw, 46vw', 1600, 1075)}</div></figure>
  <div><p class="kicker">${x.vehicleH}</p><h2 class="split">${x.vehicleH}</h2><p class="fade">${x.vehicleP}</p>
    <dl class="specs">${specsHtml(c)}</dl>
    <p class="small">${c.fleet.note}</p></div>
</div></section>
<section class="why dark"><div class="wrap"><h2 class="split">${x.featuresH}</h2><ul class="feat-grid">${x.features.map((f, i) => `<li><span class="ic-badge">${ic(FEAT_IC[i])}</span>${f}</li>`).join('')}</ul></div></section>
<section class="gallery"><div class="wrap"><h2>${x.galleryH}</h2><div class="gal-grid">
  <figure><div class="img-mask">${imgTag('interior', c.img.interior, '(max-width: 900px) 92vw, 46vw', 1600, 900)}</div></figure>
  <figure><div class="img-mask">${imgTag('chauffeur', c.img.chauffeur, '(max-width: 900px) 92vw, 46vw', 1600, 967)}</div></figure>
</div></div></section>
<section class="areas"><div class="wrap"><div class="more-band"><div><h3>${x.moreH}</h3><p>${x.moreP}</p><p class="small"><strong>${x.noteH}:</strong> ${x.note}</p></div><a class="btn btn-navy magnetic" href="${L(lang, '/contact/')}"><span>${p.ui.getQuote}</span></a></div></div></section>
<section class="faq alt-bg" aria-labelledby="faq-h"><div class="wrap faq-wrap"><div><p class="kicker">${c.faq.kicker}</p><h2 id="faq-h" class="split">${p.ui.faqH}</h2></div>${faqList(faq)}</div></section>
${ctaBand(lang)}`;
  return layout(lang, { path, title: x.title, desc: x.desc, body, ogImage: c.ogImage, nodes: [faqNode(lang, path, faq), crumbNode(crumbs)] });
}

function aboutPage(lang) {
  const p = P(lang), x = p.about, c = home(lang), path = L(lang, '/about/');
  const crumbs = [{ n: p.ui.home, u: L(lang, '/') }, { n: p.nav.about, u: path }];
  const lic = site.licences.malaysia || site.licences.singapore
    ? `<section class="prose-sec"><h2>${x.licH}</h2><dl class="facts">${site.licences.malaysia ? `<div><dt>${x.licMy}</dt><dd>${site.licences.malaysia}</dd></div>` : ''}${site.licences.singapore ? `<div><dt>${x.licSg}</dt><dd>${site.licences.singapore}</dd></div>` : ''}</dl></section>` : '';
  const body = `
${pageHead(lang, crumbs, { h1: x.h1, lead: x.lead, actions: false })}
<section class="detail"><div class="wrap grid-detail">
  <article class="prose">${sectionsHtml(x.sections)}${lic}</article>
  <aside class="aside"><div class="img-mask tall">${imgTag('chauffeur', c.img.chauffeur, '(max-width: 900px) 92vw, 34vw', 1600, 967)}</div><div class="img-mask">${pic(lang, 'mpv', '(max-width: 900px) 92vw, 34vw')}</div></aside>
</div></section>
${ctaBand(lang)}`;
  return layout(lang, { path, title: x.title.trim(), desc: x.desc, body, nodes: [crumbNode(crumbs)] });
}

function faqPage(lang) {
  const p = P(lang), x = p.faqPage, c = home(lang), path = L(lang, '/faq/');
  const crumbs = [{ n: p.ui.home, u: L(lang, '/') }, { n: p.nav.faq, u: path }];
  const items = [...c.faq.items, ...x.extra];
  const body = `
${pageHead(lang, crumbs, { h1: x.h1, lead: x.lead, actions: false })}
<section class="faq"><div class="wrap"><div class="faq-one">${faqList(items)}</div></div></section>
${ctaBand(lang)}`;
  return layout(lang, { path, title: x.title, desc: x.desc, body, nodes: [faqNode(lang, path, items), crumbNode(crumbs)] });
}

function contactPage(lang) {
  const p = P(lang), x = p.contact, c = home(lang), f = c.book.f, path = L(lang, '/contact/');
  const crumbs = [{ n: p.ui.home, u: L(lang, '/') }, { n: p.nav.contact, u: path }];
  const body = `
${pageHead(lang, crumbs, { h1: x.h1, lead: x.lead, actions: false })}
<section class="book dark contact-sec" id="book"><div class="wrap grid-book">
  <div>
    <div class="side-card side-dark flat"><h2>${p.ui.contact || c.aria.contact}</h2>
      <dl class="facts"><div><dt>${ic('chat')}WhatsApp</dt><dd><a href="${wa()}" rel="noopener">${site.phoneDisplay}</a></dd></div>${site.email ? `<div><dt>${ic('mail')}${p.ui.email}</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd></div>` : ''}<div><dt>${ic('clock')}${p.ui.hours}</dt><dd>${p.ui.hoursV}</dd></div></dl>
    </div>
    <div class="img-mask contact-img">${pic(lang, 'chauffeur', '(max-width: 900px) 92vw, 44vw')}</div>
    <h3 class="cov-h">${p.ui.coverage}</h3>
    <ul class="chips light">${[...c.areas.johor.list, ...c.areas.sg.list].map((t) => `<li>${t}</li>`).join('')}</ul>
  </div>
  <form class="form" id="quote" data-wa="${wa()}" data-tpl="${esc(c.book.msgTpl)}" novalidate>
    <label><span>${f.name}</span><input name="name" autocomplete="name"></label>
    <label><span>${f.route}</span><select name="route">${f.optionsRoute.map((o) => `<option>${o}</option>`).join('')}</select></label>
    <div class="row2"><label><span>${f.date}</span><input name="date" type="date"></label><label><span>${f.pax}</span><input name="pax" type="number" min="1" max="12" value="2"></label></div>
    <label><span>${f.from}</span><input name="from"></label>
    <label><span>${f.to}</span><input name="to"></label>
    <label><span>${f.note}</span><textarea name="note" rows="3"></textarea></label>
    <button class="btn btn-gold magnetic" type="submit"><span>${f.send}</span></button>
  </form>
</div></section>`;
  return layout(lang, { path, title: x.title, desc: x.desc, body, nodes: [crumbNode(crumbs)] });
}

function textPage(lang, key) {
  const p = P(lang), x = p[key], path = L(lang, `/${key}/`);
  const crumbs = [{ n: p.ui.home, u: L(lang, '/') }, { n: x.h1, u: path }];
  const body = `
${pageHead(lang, crumbs, { h1: x.h1, lead: x.lead, actions: false })}
<section class="detail"><div class="wrap"><article class="prose narrow">${sectionsHtml(x.sections)}</article></div></section>`;
  return layout(lang, { path, title: x.title, desc: x.desc, body, nodes: [crumbNode(crumbs)] });
}

// ───────────────────────── build ─────────────────────────
for (const lang of LANGS) {
  const pagesOut = [
    [L(lang, '/'), homePage(lang)],
    [L(lang, '/services/'), servicesIndex(lang)],
    [L(lang, '/routes/'), routesIndex(lang)],
    [L(lang, '/fleet/'), fleetPage(lang)],
    [L(lang, '/about/'), aboutPage(lang)],
    [L(lang, '/faq/'), faqPage(lang)],
    [L(lang, '/contact/'), contactPage(lang)],
    [L(lang, '/privacy/'), textPage(lang, 'privacy')],
    [L(lang, '/terms/'), textPage(lang, 'terms')],
    ...[...slugs.services, ...slugs.routes].map((s) => [dPath(lang, s), detailPage(lang, s)]),
  ];
  for (const [path, html] of pagesOut) out(path, html);
}

// robots / sitemap / manifest
const pairs = [...new Map(written.filter((w) => w.lang === 'en').map((w) => [w.enPath, w])).values()];
const urlEntry = (path, w) => `  <url><loc>${abs(path)}</loc><lastmod>${today}</lastmod><changefreq>${path.length <= 4 ? 'weekly' : 'monthly'}</changefreq><priority>${path === '/' ? '1.0' : /privacy|terms/.test(path) ? '0.3' : '0.8'}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${abs(w.enPath)}"/><xhtml:link rel="alternate" hreflang="zh-Hans" href="${abs(w.zhPath)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${abs(w.enPath)}"/></url>`;
const entries = pairs.flatMap((w) => [urlEntry(w.enPath, w), urlEntry(w.zhPath, w)]);
writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${abs('/sitemap.xml')}\n`);
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`);
writeFileSync('public/site.webmanifest', JSON.stringify({ name: 'V-GO Premium Transport', short_name: 'V-GO', start_url: '/', display: 'standalone', background_color: '#06173a', theme_color: '#06173a', icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 2));
console.log(`pages built: ${written.length} pages`);
