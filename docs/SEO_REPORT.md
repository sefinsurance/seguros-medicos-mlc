# SEO Optimization Report — obamacarelocal.com

_Point-in-time report of the SEO work completed in the 2026-06-01 session. "Live"
= merged & deployed; "Pending" = in open PRs awaiting review/merge._

## ✅ Live now (PRs #9 + #10, merged & deployed)

### Crawlability & indexing
- **XML sitemap now generated** — added `@astrojs/sitemap`; build emits
  `/sitemap-index.xml` + `/sitemap-0.xml`. `robots.txt` already pointed there but
  no sitemap was being produced. Google now has a full map of all 220+ pages.

### Metadata (every page)
- **Open Graph + Twitter cards + self-referential canonical** added to the shared
  `BaseLayout` — fixed ~13 pages (home, /obamacare, /medicare-advantage,
  /dental-vision, /life-insurance, /for-brokers, /News/*) that previously had none.
- **Homepage `<title>` + meta description** rewritten ("Health Insurance in
  Florida | ACA, Medicare, Dental & Life") with phone CTA.
- **FL-localized, keyword-rich titles + descriptions** on all 5 service pages
  (were generic) — include "Florida", product keywords, and a call-to-action.

### Structured data (schema.org JSON-LD)
- **LocalBusiness / InsuranceAgency NAP** — name, real Hialeah address
  (1840 W 49th St, Ste 517c, FL 33012), phone, opening hours, priceRange,
  availableLanguage — on every page (SiteShell + BaseLayout).
- **FAQPage** on `/en/faq` + `/es/faq` (FAQ rich-result eligible).
- **BlogPosting** on News articles (author, dates, image, language); hero image
  feeds the OG preview.
- **BreadcrumbList** on all product pages (ACA, Medicare, Dental, Life, Compare,
  Losing-Medicaid) in EN + ES.

### Content & images
- `about.astro` — replaced stock Lorem ipsum with real bilingual MLC copy.
- Image SEO — descriptive `alt` + `width`/`height` (CLS) + lazy-load on the News
  listing, News article hero, and blog hero images.

### Local-SEO data consistency
- CRM `agency_profile` address set to the real Hialeah address + fixed a website
  typo, so the CRM, the website schema, and the GBP all carry matching NAP.

## 🟡 Pending (in open PRs)

### PR #12 — homepage → Astro
- **hreflang** (en / es / x-default) + self-canonical on the homepage.
- **Core Web Vitals:** removed full-page React hydration → faster LCP/INP (a
  ranking factor); bilingual now uses distinct `/en` and `/es` URLs.

### PR #13 — service pages → Astro
- **Google Business Profile linked** in the LocalBusiness `sameAs` (ties site ↔ GBP).
- **Core Web Vitals:** Obamacare/Dental/Life now ship near-zero JS.

## 📌 Biggest remaining ranking levers (not code)
1. **Google Business Profile** — claimed & filled (hours, photos, services,
   reviews); the #1 local-pack driver. Now linked from the site schema.
2. **Content cadence** — regular bilingual ACA/Medicare/SEP articles.
3. **Backlinks** + **Google Search Console** monitoring.
