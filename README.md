# QR Magic

A fast, offline-first QR code generator built with React — for URLs, plain
text, and contact cards (vCard).

Live at **[vishnuskandha.github.io/QR_magic](https://vishnuskandha.github.io/QR_magic/)**.

## Features

- **No CDN, fully offline** — QR encoding is bundled (`qrcode.react`), so
  generation works even with no network
- **Three content types** — URL, plain text, and vCard contact cards
- **Error-correction levels** — L / M / Q / H selector with recovery-rate
  labels (higher = more scannable, less data)
- **High-res export** — download QR as 1024×1024 PNG
- **Copy data** to clipboard in one click
- **Live byte counter** — warns when content exceeds the QR payload limit
  for the selected level
- Keyboard-accessible tabs (`←`/`→` to switch), labeled inputs, visible
  focus states, and full `prefers-reduced-motion` support
- OLED-dark neon design system (JetBrains Mono + IBM Plex Sans), static
  background effects (no 60 fps canvas loops), lazy-loaded below-fold
  profile section

## Getting Started

1. Install dependencies:

   ```sh
   npm install
   ```

2. Start the development server:

   ```sh
   npm start
   ```

3. Build for production:

   ```sh
   npm run build
   ```

## Deploying

GitHub Pages deployment is covered in [DEPLOYMENT.md](DEPLOYMENT.md).

## Tech

- React 18 (Create React App)
- `qrcode.react` — QR encoding/rendering
- `lucide-react` — icons

## License

MIT
