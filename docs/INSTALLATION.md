# Installation guide

## Requirements

- Google Chrome or Chromium-based browser (Manifest V3)
- Node.js 18+
- npm 9+

## Load the extension (most important)

Chrome can only load a folder that contains a built `manifest.json`.

In this project that file is **generated** into `dist/` — it is **not** in the repo root and **not** in a raw GitHub ZIP download.

```bash
npm install
npm run build
```

Then:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Choose the **`dist/`** directory inside the project

### Wrong vs right folder

| Path | Result |
| --- | --- |
| `~/Downloads/InkMind-main` (or repo root) | ❌ `Manifest file is missing or unreadable` |
| `~/Downloads/InkMind-main/dist` after `npm run build` | ✅ Extension loads |

## Develop locally

1. Clone or unzip the repository.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development build (writes/updates `dist/`):

   ```bash
   npm run dev
   ```

4. Load **`dist/`** as an unpacked extension (steps above).
5. Pin KnowledgeOS from the extensions menu.

## Production build / zip

```bash
npm run build
npm run pack
```

- `npm run build` → `dist/`
- `npm run pack` → `knowledge-os-extension.zip` (contents of `dist/`)

You can load `dist/` unpacked, or distribute the zip. If you unzip a packed build, load the unzipped folder that contains `manifest.json` at its root.

## First-run tips

1. Open any article and select text — the floating toolbar appears.
2. Press `Ctrl+Shift+S` (macOS: `⌘+Shift+S`) to open the side panel.
3. Open a `.pdf` URL, then use the popup action **Open PDF in KnowledgeOS** (or the page context menu) for full PDF highlighting.
4. Configure defaults under the extension options page.

## Keyboard shortcuts

| Action | Default |
| --- | --- |
| Highlight selection | `Ctrl+Shift+H` |
| Create note | `Ctrl+Shift+N` |
| Open sidebar | `Ctrl+Shift+S` |

Customize at `chrome://extensions/shortcuts`.

## Troubleshooting

- **`Manifest file is missing or unreadable`** — You loaded the source folder (e.g. `InkMind-main`) instead of `dist/`. Run `npm install && npm run build`, then load **`dist/`**. Confirm `dist/manifest.json` exists before loading.
- **Toolbar does not appear** — Restricted pages (`chrome://`, Chrome Web Store, some PDF viewers) block content scripts. Use the KnowledgeOS PDF viewer for PDFs.
- **Highlights missing after reload** — Dynamic pages that rewrite large DOM trees can invalidate locators. Re-highlight or prefer quote-based matches (KnowledgeOS stores text quotes as a fallback).
- **PDF fails to load** — Cross-origin hosts may block fetch. Download the PDF or open a CORS-friendly URL.
- **`npm` / Node not found** — Install Node.js 18+ from https://nodejs.org, then retry `npm install`.
