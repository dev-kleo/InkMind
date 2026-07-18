# InkMind

Privacy-first Chrome extension for highlighting text on webpages and PDFs, attaching notes, organizing knowledge with tags and collections, and exporting everything offline.

**Phase 1 (MVP)** — fully local, no accounts, no cloud, no AI.

## Features

- Highlight webpage text with a floating toolbar or right-click menu
- Five highlight colors with persistence across reloads
- Markdown notes per highlight (editable, with character counter)
- Collapsible Chrome side panel with search, filters, tags, collections, and export
- PDF viewing and highlighting via PDF.js
- Instant search across highlight text, notes, and page titles
- Custom tags and collections
- Export to Markdown, JSON, or plain text
- Popup with today’s highlights, recent items, and quick actions
- Options page for theme, default color, font size, backup, and shortcuts
- Keyboard shortcuts: `Ctrl+Shift+H`, `Ctrl+Shift+N`, `Ctrl+Shift+S`

## Tech stack

React · TypeScript · Vite · Tailwind CSS · Zustand · Dexie (IndexedDB) · PDF.js · Vitest · Lucide

## Quick start

```bash
npm install
npm run dev
```

Load the unpacked extension from `dist/` in Chrome (`chrome://extensions` → Developer mode → Load unpacked).

See [docs/INSTALLATION.md](docs/INSTALLATION.md) for a full install guide.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite + CRXJS development build with HMR |
| `npm run build` | Typecheck and production build to `dist/` |
| `npm run test` | Run Vitest unit tests |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | TypeScript only |

## Architecture

Feature-based layout under `src/` — see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Privacy

All data stays in IndexedDB on your device. There is no analytics, sync, or remote API in Phase 1.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)

## Roadmap

See [ROADMAP.md](ROADMAP.md) for Phase 2+ ideas (AI, sync, etc.). Extension points already exist in `src/types` (`FutureSyncAdapter`, `FutureAiAdapter`).
