# MLC Insurance Astro Conversion

This repo is the Astro conversion of the public-facing MLC Insurance site, while preserving the React/Base44 functionality used by forms and the internal dashboard.

## What was converted

Public routes now live as Astro pages:

- `/`
- `/obamacare`
- `/medicare-advantage`
- `/life-insurance`
- `/dental-vision`
- `/for-brokers`
- `/privacy-policy`
- `/terms-and-conditions`
- `/hipaa-notice`
- `/leads`

Dynamic SEO routes were added:

- `/[state]/`
- `/[state]/[county]/`

These use one shared template so you can scale state/county pages without cloning the whole site.

## What was preserved

- Existing React page components and visual styling
- Existing Base44 lead-creation flow
- Broker application form
- Footer SMS opt-in flow
- Internal leads/admin dashboard route
- Existing `functions/` folder for operational reference

## How it works

Astro provides the route/file structure and SEO-friendly page generation.
React components are mounted inside Astro pages using `client:load` so the original interactive behavior remains intact.

A small shim replaces `react-router-dom`'s `Link` with normal anchor links because Astro owns routing now.

## Setup

1. Install dependencies
   - `npm install`
2. Create `.env` from `.env.example`
3. Run locally
   - `npm run dev`

## Notes

- The public site was converted into Astro routing.
- The dashboard is still a React client page rendered inside Astro at `/leads`.
- You can extend `src/data/seoLocations.js` to publish more state/county landing pages.
- If you want a stricter split later, the admin area can still be moved to a separate subdomain/app.
