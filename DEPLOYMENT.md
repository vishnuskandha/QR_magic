# QR Magic — Deployment Guide

Live URL: **https://vishnuskandha.github.io/QR_magic/**

This project is deployed to GitHub Pages **via GitHub Actions**: pushing to
`main` triggers a workflow (`.github/workflows/pages.yml`) that builds the
app and publishes the result with `actions/deploy-pages`.

## Deploy

Pushing to `main` deploys automatically — no manual step required.

To deploy manually (fallback, publishes the `build/` folder to the
`gh-pages` branch):

```sh
npm run deploy:qr
```

This pushes to `https://github.com/vishnuskandha/QR_magic.git` (plain
`npm run deploy` uses the default `origin` remote). Note: branch pushes
to `gh-pages` only take effect if GitHub Pages is configured to publish
from that branch; the repo currently uses workflow-based Pages, so the
Actions workflow is the supported path.

You can also trigger a deployment manually from
**Actions → Deploy to GitHub Pages → Run workflow**.

After a successful deploy, GitHub Pages takes 1–2 minutes to publish.

## Prerequisites

- The `homepage` field in `package.json` must match the Pages URL
  (`https://vishnuskandha.github.io/QR_magic`) — CRA uses it as the
  asset base path.
- GitHub Pages must be enabled in **Settings → Pages** with source set to
  **GitHub Actions**.
- The `github-pages` environment must have no required reviewers (or the
  deployment waits for approval).

## Troubleshooting

### Blank page after deployment
- Check the browser console for errors.
- Verify `homepage` in `package.json` matches the Pages URL exactly.
- Confirm the Actions run finished: **Actions → Deploy to GitHub Pages**.

### 404 on GitHub Pages after deployment
- Wait 1–2 minutes for GitHub to publish.
- Confirm the workflow's `deploy` job ran successfully and Settings →
  Pages points at **GitHub Actions**.

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
