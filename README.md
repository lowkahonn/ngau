# Ngau Web App

Mobile-first web app for Ngau calculation with poker-themed UI.

## Stack

- React + Vite
- Tailwind CSS
- zustand
- Client-side Ngau logic ported from `main.py`

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## AdSense (Phase 1)

- AdSense loader script is included in `index.html` with client `ca-pub-7820179081725825`.
- A single manual ad slot is rendered below the rules section.
- Set `VITE_ADSENSE_SLOT_PHASE1` in `.env` with your real ad unit slot ID (10+ digits). The placeholder value in `.env.example` is intentionally ignored.

## GitHub Pages

1. In GitHub repo settings, set **Pages > Build and deployment > Source** to `GitHub Actions`.
2. Push to `main`.
3. Workflow `.github/workflows/deploy-pages.yml` builds and deploys `dist`.

`vite.config.js` auto-detects repository path in GitHub Actions and sets `base` accordingly.
If you need a custom path, set `VITE_BASE_PATH`.

## SEO setup

- `index.html` includes canonical URL, Open Graph tags, Twitter card tags, and JSON-LD (`WebApplication`).
- `npm run build` runs `npm run seo:generate` first to generate:
  - `public/robots.txt`
  - `public/sitemap.xml`
- `deploy-pages.yml` injects `VITE_SITE_URL` from the GitHub repository URL so canonical and sitemap are correct on Pages.
