# NTA_Captcha_Scraping

Puppeteer and Tesseract pipeline for NTA/JEE captcha harvesting research.

## Why this exists

Captcha implementations on exam portals are a common abuse surface. This code supports
authorized assessments and OCR experiments — not live exam disruption.

## Features

- Headless browser flow with captcha capture
- Password-hash helpers under `src/crypto/`
- Jest tests and TypeScript typecheck in CI

## Install

```bash
git clone https://github.com/HackerX-official/NTA_Captcha_Scraping.git
cd NTA_Captcha_Scraping
npm install
```

## Quick start

```bash
npm run dev
```

## Output

Images and metadata under `results/` (typically gitignored).

## Develop

```bash
npm test
npm run typecheck
npm run format:check
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module layout and extension points.

## Ethics

Use only on systems and content you are **authorized** to test. See
[SECURITY.md](./SECURITY.md).

## License

Licensed under the [HackerX License](./LICENSE). Redistributions must retain copyright,
license text, and [NOTICE](./NOTICE) attribution per the license terms.
