# V-GO website

Premium MPV charter, 包车服务 and 接送服务 in Johor Bahru ⇄ Singapore. Static, bilingual (EN `/` and 中文 `/zh/`), built with Vite + GSAP + Lenis.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/ — upload to Hostinger public_html
```

## Site map (34 pages = 17 × EN + 简体中文)
`/` Home · `/services/` + 4 service pages · `/fleet/` · `/routes/` + 4 route pages · `/about/` · `/faq/` · `/contact/` · `/privacy/` · `/terms/` — Chinese versions under `/zh/`.

Where to edit:
- `content.mjs` — homepage copy, hero, FAQ, image alt text
- `pages.mjs` — every inner page (services, routes, fleet, about, faq, contact, privacy, terms) in both languages
- `site.config.mjs` — domain, WhatsApp, email, licence numbers
- `npm run dev/build` regenerates all HTML, `sitemap.xml` and `robots.txt`; `npm run build` also runs `check-lang` (fails if English leaks into a Chinese page or vice versa)
- Photos: replace `Hero Image.png`, `MPV Car.png`, `car interior.png`, `Escort.png` then run `npm run assets`

## Before launch (TODO)
1. `site.config.mjs`: real domain (or set `SITE_URL=https://yourdomain.com` when building), WhatsApp number, email, company name, **licence numbers**, social URLs.
2. Confirm every claim in `content.mjs` / `pages.mjs` is true for V-GO: licensed + insured, 6-passenger Alphard/Vellfire, "stay in the car", payment methods, cancellation window. Edit or delete what isn't.
3. Replace the logo-only imagery with real photos of your vehicles (WebP, with descriptive `alt`).
4. Add pricing (even "from SGD/RM …") — competitors that show prices convert better and rank for "price/cost" queries.
5. Submit `sitemap.xml` in Google Search Console + Bing Webmaster; create and verify a **Google Business Profile** (Johor Bahru, service area: Singapore) — the biggest local-SEO lever.
6. Run PageSpeed Insights and the Rich Results Test (FAQPage, LocalBusiness) after deploy.

## Competitor research (top 5 direct rivals, Oct 2026)

| Site | Angle | Weaknesses we exploit |
|---|---|---|
| taxitojb.sg | "Licensed private car from Singapore to JB", S$110+ | Seat counts inconsistent (Innova 7 vs 4; Staria 10 vs 9); no licence number shown; no meta description found |
| sgjbtaxis.com | "Most trusted", S$190 Alphard one-way | Empty reviews, counters at 0, no JB→SG pricing, mixed domains |
| sgmytrips.com | Multi-route price table | Bot-wall on fetch; templated pages |
| sgprivatecar.com | 60+ MPVs, Google reviews | Price mismatches (FAQ vs table), thin airport pages, cross-links to a sister domain |
| johorbahruprivatecar.com | "From SGD 90" | Bot-wall on fetch; inconsistent vehicle descriptions |

**Shared gaps = our openings:** all are Singapore-side, English-only, SG→JB only, with templated copy. None targets Chinese queries (包车, 新山接送), JB-origin searches, day charter intent, or shows verifiable licence IDs. Our homepage targets:

- Primary: *Johor Bahru Singapore private transfer / MPV charter / Alphard charter*
- Secondary: *Senai & Changi airport transfer, JB day charter, Legoland/Desaru/Melaka transfers*
- Chinese: *新山包车, 新加坡包车, 新山到新加坡接送, 阿尔法包车, 机场接送*
- Question intent (FAQ, 10 Q&As with FAQPage schema): price, stay-in-car, duration, licensing, payment, advance booking.

**Caveat:** several rivals advertise a "May 2026 licensing scheme" for cross-border operators. I couldn't verify that against an official source — check current LTA/APAD rules and add your real licence numbers to the site; it's the strongest trust signal in this niche.

## Design reference
Awwwards-style: cinematic scroll (Lenis), masked word-reveal headings, pinned horizontal services rail, road line that draws on scroll, parallax sunrise, magnetic buttons, custom cursor. Palette extracted from the logo (navy, gold, sky blue, sunrise orange). Respects `prefers-reduced-motion`; all content is server-rendered HTML so it's fully crawlable.

## Legal pages
`/privacy/` and `/terms/` are sensible starting drafts, not legal advice — have a lawyer review them (governing law is set to Malaysia; change it in `pages.mjs` if wrong).
