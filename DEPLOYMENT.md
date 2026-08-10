# QR Magic — Deployment Guide

Live URL: **https://vishnuskandha.github.io/QR_magic/**

This project is deployed to GitHub Pages from the `gh-pages` branch of the
`QR_magic` repository.

## Deploy

```sh
npm run deploy:qr
```

This runs the production build and pushes the `build/` folder to the
`gh-pages` branch of `https://github.com/vishnuskandha/QR_magic.git`.

Plain `npm run deploy` does the same against the default `origin` remote.

After a successful deploy, GitHub Pages takes 1–2 minutes to publish.

## Prerequisites

- The `homepage` field in `package.json` must match the Pages URL
  (`https://vishnuskandha.github.io/QR_magic`) — CRA uses it as the
  asset base path.
- GitHub Pages must be enabled in **Settings → Pages** with source set to
  **Deploy from a branch → `gh-pages`**.

## Troubleshooting

### Blank page after deployment
- Check the browser console for errors.
- Verify `homepage` in `package.json` matches the Pages URL exactly.

### 404 on GitHub Pages after deployment
- Wait 1–2 minutes for GitHub to publish.
- Confirm Settings → Pages points at the `gh-pages` branch.

### Assets not loading (404 on `/static/...`)
- The `homepage` field is wrong or missing. Rebuild and redeploy after
  fixing it.

## Build output

```
build/
├── static/
│   ├── css/
│   └── js/
└── index.html
```

The production build is a fully static bundle — it can be hosted on any
static host (Netlify Drop, Vercel, S3, Cloudflare Pages, …) by uploading
the contents of `build/`.

---

Made with passion by Vishnu Skandha | QR Magic
