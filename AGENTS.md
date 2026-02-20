# AGENTS.md

This file gives coding agents the minimum context needed to work safely and quickly in this repository.

## Project Overview

- App: Ngau calculator web app (React + Vite + Tailwind + Zustand).
- Core game logic lives in `src/lib/gnau.js`.
- Python `main.py` is a reference/CLI implementation of the same rules.
- Python regression tests live in `test_main.py`.
- SEO content pages are standalone HTML files at repo root and are built as separate Vite entries.

## Key Files

- `src/lib/gnau.js`: production scoring/parser logic used by the React app.
- `src/store/useGnauStore.js`: app state and analyze flow.
- `src/App.jsx`: UI, guide-page links, and localization strings.
- `src/components/AdSenseSlot.jsx`: production-only ad slot behavior.
- `index.html`: main app HTML shell + SEO tags.
- `how-to-play-ngau.html`, `ngau-rules-explained.html`, `ngau-3-6-explained.html`, `ngau-example-rounds.html`, `ngau-faq.html`: static SEO pages.
- `public/content-pages.css`: shared styles for static SEO pages.
- `scripts/generate-seo-files.mjs`: generates `public/robots.txt` and `public/sitemap.xml`.
- `vite.config.js`: multi-page input list and `base` handling.
- `.github/workflows/deploy-pages.yml`: GitHub Pages build/deploy workflow.

## Commands

- Install deps: `npm install`
- Dev server: `npm run dev`
- Production build: `npm run build`
- Preview build: `npm run preview`
- Python tests: `python3 -m unittest -q`
- Path smoke test: `npm run build` then inspect `dist/*.html` for `./...` internal URLs

## GitHub Pages Base-Path Rules (Critical)

This site is hosted under a repository path, not the domain root.

- Target hosting shape: `https://<username>.github.io/ngau/`
- Do not assume internal links/assets are served from `/`.
- Use relative links/assets (for example `./site.webmanifest`, `./content-pages.css`, `how-to-play-ngau.html`).
- Keep sibling article links relative (for example `ngau-faq.html`) so they work within the same folder.
- Use `%VITE_SITE_URL%...` for canonical/OG absolute URLs.

When changing links/assets, always validate with `npm run build`, then inspect `dist/*.html` to confirm internal URLs remain relative (`./...` or sibling filenames).

## Change Playbooks

### If rules/scoring/parser logic changes

- Update `src/lib/gnau.js` first.
- Keep Python parity in `main.py` unless explicitly de-scoping Python.
- Run `python3 -m unittest -q`.
- Manually sanity-check representative hands in the UI.

### If adding or renaming SEO content pages

- Add/update the root HTML file.
- Add/update the page in `vite.config.js` `htmlEntries`.
- Add/update sitemap entries in `scripts/generate-seo-files.mjs`.
- Update article navigation links and app guide links in `src/App.jsx` if needed.
- Run `npm run build` and verify all pages are emitted in `dist/`.

### If updating SEO/site metadata

- `public/robots.txt` and `public/sitemap.xml` are generated; do not hand-edit as a final change.
- Update inputs (`VITE_SITE_URL`, page list, metadata in HTML), then regenerate via build.

## Environment Notes

- `VITE_SITE_URL` should be an absolute URL with trailing slash for canonical/sitemap correctness.
- CI sets `VITE_SITE_URL` in `deploy-pages.yml` using the GitHub repo owner/name.
- Vite build base is fixed to `./` so generated asset paths stay relative.
- `VITE_ADSENSE_SLOT_PHASE1` must be a real numeric ad slot ID for ads to render in production.
