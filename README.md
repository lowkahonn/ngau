# Gnau / NiuNiu Web App

Mobile-first web app for Gnau/NiuNiu calculation with poker-themed UI.

## Stack

- React + Vite
- Tailwind CSS
- zustand
- Client-side Gnau/NiuNiu logic ported from `main.py`

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

## GitHub Pages

1. In GitHub repo settings, set **Pages > Build and deployment > Source** to `GitHub Actions`.
2. Push to `main`.
3. Workflow `.github/workflows/deploy-pages.yml` builds and deploys `dist`.

`vite.config.js` auto-detects repository path in GitHub Actions and sets `base` accordingly.
If you need a custom path, set `VITE_BASE_PATH`.
