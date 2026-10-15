import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

document.documentElement.classList.add('js');
gsap.registerPlugin(ScrollTrigger);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const has = (s) => !!$(s);

/* ── Smooth scroll ─────────────────────── */
let lenis;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id.length > 1 && $(id);
    if (!el) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(el, { offset: -60, duration: 1.4 }) : el.scrollIntoView({ behavior: 'smooth' });
  })
);

/* ── Mobile menu ───────────────────────── */
const menuBtn = $('#menu-btn');
const setMenu = (open) => {
  document.body.classList.toggle('menu-open', open);
  menuBtn?.setAttribute('aria-expanded', String(open));
  open ? lenis?.stop() : lenis?.start();
};
menuBtn?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
$$('#mnav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));
matchMedia('(min-width: 1081px)').addEventListener('change', (m) => m.matches && setMenu(false));

/* ── Split headings into words (keeps text crawlable & accessible) ── */
$$('.split').forEach((h) => {
  const label = h.textContent.trim();
  h.setAttribute('aria-label', label);
  const cjk = /[一-鿿]/.test(label);
  const parts = cjk ? [...label] : label.split(/\s+/);
  h.innerHTML = parts.map((p) => `<span class="w" aria-hidden="true"><span>${p}</span></span>`).join(cjk ? '' : ' ');
});

/* ── Intro (home plays the loader once per session; inner pages just reveal) ── */
let started = false;
function intro() {
  if (started) return;
  started = true;
  $('.loader')?.remove();
  if (reduce) return;
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.from('.nav', { yPercent: -100, duration: 1 }, 0);
  if (has('.hero .line-in')) tl.fromTo('.hero .line-in', { yPercent: 115 }, { yPercent: 0, duration: 1.4, stagger: 0.12 }, 0.05);
  if (has('.reveal-up')) tl.to('.reveal-up', { opacity: 1, y: 0, duration: 1.1, stagger: 0.1 }, 0.35);
  if (has('.hero-banner img')) tl.from('.hero-banner img', { scale: 1.12, opacity: 0, duration: 2, ease: 'power3.out' }, 0.5);
  if (has('.hero-glow')) tl.from('.hero-glow', { scale: 0.6, opacity: 0, duration: 2.2 }, 0);
}

const loader = $('.loader');
let seen = false;
try { seen = sessionStorage.getItem('vgo-seen') === '1'; sessionStorage.setItem('vgo-seen', '1'); } catch {}
if (loader && !reduce && !seen) {
  const bar = $('.loader-bar i', loader);
  gsap.timeline({ onComplete: () => gsap.to(loader, { yPercent: -100, duration: 0.9, ease: 'expo.inOut', onComplete: intro }) })
    .to(bar, { scaleX: 1, duration: 0.8, ease: 'power2.inOut' })
    .from($('img', loader), { scale: 0.7, opacity: 0, duration: 0.6, ease: 'back.out(2)' }, 0);
} else intro();
// Failsafe: never let the loader block content (throttled tabs, slow devices)
setTimeout(intro, 4000);

if (!reduce) {
  /* Section heading word reveals */
  gsap.set('.split .w>span', { y: 0, yPercent: 105 }); // y:0 overrides the CSS pre-hide offset GSAP parsed from the computed matrix
  $$('.split').forEach((h) => {
    gsap.to($$('.w>span', h), { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.045, scrollTrigger: { trigger: h, start: 'top 88%' } });
  });

  /* Soft fades */
  gsap.utils.toArray('.fade, .step, .why-item, .route, .areas-grid>div, .specs, .rel-card, .big-card, .compare li, .feat-grid li, .prose-sec, .side-card, .more-band').forEach((el) =>
    gsap.from(el, { opacity: 0, y: 36, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } })
  );

  /* Pinned horizontal services (home) */
  ScrollTrigger.matchMedia({
    '(min-width: 901px)': () => {
      const track = $('.h-track');
      if (!track) return;
      const dist = () => track.scrollWidth - innerWidth + 40;
      gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.h-scroll', start: 'top 18%', end: () => '+=' + dist(), pin: '.services', scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
    },
  });

  /* Road line draws on scroll */
  const path = $('.road-path');
  if (path) {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.routes', start: 'top 80%', end: 'top 10%', scrub: true } });
  }

  /* Photo curtain reveal + parallax */
  gsap.utils.toArray('.img-mask').forEach((m) => {
    gsap.from(m, { clipPath: 'inset(12% 8% 12% 8% round 40px)', duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: m, start: 'top 85%' } });
    gsap.fromTo($('img', m), { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: m, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  if (has('.hero-banner img')) gsap.to('.hero-banner img', { yPercent: 6, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.hero-banner', start: 'top bottom', end: 'bottom top', scrub: true } });
  if (has('.cta')) gsap.fromTo('.cta-sun', { yPercent: 25 }, { yPercent: -5, ease: 'none', scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom bottom', scrub: true } });
}

/* ── Nav solid/hide on scroll ──────────── */
const nav = $('#nav');
let last = 0;
const onScroll = () => {
  const y = scrollY;
  nav.classList.toggle('solid', y > 40);
  nav.classList.toggle('hide', y > last && y > 500 && !document.body.classList.contains('menu-open'));
  last = y;
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── Magnetic buttons ─────────────────── */
if (fine && !reduce) {
  $$('.magnetic').forEach((b) => {
    const mx = gsap.quickTo(b, 'x', { duration: 0.4, ease: 'power3' });
    const my = gsap.quickTo(b, 'y', { duration: 0.4, ease: 'power3' });
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      mx((e.clientX - r.left - r.width / 2) * 0.25);
      my((e.clientY - r.top - r.height / 2) * 0.35);
    });
    b.addEventListener('pointerleave', () => { mx(0); my(0); });
  });
}

/* ── Quote form → WhatsApp (+ prefill route from ?route=) ── */
const form = $('#quote');
if (form) {
  const wanted = new URLSearchParams(location.search).get('route');
  const sel = form.elements.route;
  if (wanted && sel) {
    let opt = [...sel.options].find((o) => o.value === wanted || o.textContent === wanted);
    if (!opt) { opt = new Option(wanted, wanted); sel.add(opt, 0); }
    sel.value = opt.value;
  }
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    let msg = form.dataset.tpl;
    for (const k of ['name', 'route', 'date', 'pax', 'from', 'to', 'note']) {
      msg = msg.replace(`{${k}}`, encodeURIComponent((d[k] || '-').toString()));
    }
    const base = form.dataset.wa.split('?')[0];
    window.open(`${base}?text=${msg}`, '_blank', 'noopener');
  });
}

addEventListener('load', () => ScrollTrigger.refresh());
