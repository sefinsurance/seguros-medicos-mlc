# Repo Audit Summary

## Public pages audited

- `Home.jsx`
- `Obamacare.jsx`
- `MedicareAdvantage.jsx`
- `LifeInsurance.jsx`
- `DentalVision.jsx`
- `ForBrokers.jsx`
- `PrivacyPolicy.jsx`
- `TermsAndConditions.jsx`
- `HipaaNotice.jsx`

## Interactive components preserved

- `components/home/*`
- `components/quote/*`
- `components/medicare/*`

## Operational/admin areas preserved

- `Leads.jsx`
- `components/admin/*`
- `components/ui/*`
- `lib/*`
- `api/base44Client.js`
- `functions/*`

## Astro route mapping

| Original React page | Astro route |
|---|---|
| Home | `/` |
| Obamacare | `/obamacare` |
| MedicareAdvantage | `/medicare-advantage` |
| LifeInsurance | `/life-insurance` |
| DentalVision | `/dental-vision` |
| ForBrokers | `/for-brokers` |
| PrivacyPolicy | `/privacy-policy` |
| TermsAndConditions | `/terms-and-conditions` |
| HipaaNotice | `/hipaa-notice` |
| Leads | `/leads` |

## SEO layer added

- `src/pages/[state]/index.astro`
- `src/pages/[state]/[county]/index.astro`
- `src/data/seoLocations.js`
- `src/components/LocationLandingPage.jsx`

## Routing adaptation

Because Astro owns the route tree, `react-router-dom` links were replaced at build time via a shim that renders standard anchors.
