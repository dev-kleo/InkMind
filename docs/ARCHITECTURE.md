# Architecture overview

KnowledgeOS is a Manifest V3 Chrome extension with a feature-based frontend and a local IndexedDB persistence layer.

## High-level diagram

```
┌─────────────┐   messages    ┌──────────────────┐
│  Popup UI   │──────────────▶│ Background SW    │
└─────────────┘               │  menus/commands  │
                              │  side panel API  │
┌─────────────┐               └─────────┬────────┘
│ Side panel  │◀── runtime msgs ────────┤
└──────┬──────┘                         │
       │ Dexie                          │ tabs.sendMessage
       ▼                                ▼
┌─────────────┐               ┌──────────────────┐
│ IndexedDB   │◀──── Dexie ───│ Content script   │
└─────────────┘               │ toolbar/DOM HL   │
                              └──────────────────┘
┌─────────────┐
│ Options UI  │── Dexie ──▶ IndexedDB
└─────────────┘
┌─────────────┐
│ PDF viewer  │── PDF.js + Dexie overlays
└─────────────┘
```

## Directory map

```
src/
  background/          Service worker (commands, menus, side panel)
  content/             Webpage injection (selection toolbar, restore)
  popup/               Extension popup React app
  options/             Settings React app
  components/          Shared presentational UI
  features/
    highlight/         Selection, DOM apply/restore, cards, toolbar
    notes/             Note editor
    pdf/               PDF.js viewer + overlay highlights
    sidebar/           Side panel app and panels
  storage/             Dexie database + seed data
  services/            Domain services (highlights, tags, export…)
  hooks/               React hooks
  types/               Shared TypeScript contracts
  utils/               Pure helpers and constants
```

## Data model

Primary entities stored in IndexedDB via Dexie:

- `highlights` — text, color, locator/PDF rects, note, tags, collections, timestamps, URL metadata
- `tags` — user-defined labels
- `collections` — grouping containers
- `settings` — theme, defaults, export preferences

Webpage highlights persist using a **text-quote locator** (exact/prefix/suffix) with an XPath fallback. PDF highlights store normalized page rectangles.

## Messaging

`ExtensionMessage` covers content ↔ background ↔ UI coordination (`HIGHLIGHT_SELECTION`, `OPEN_SIDEBAR`, `HIGHLIGHTS_CHANGED`, etc.). UI surfaces listen for `HIGHLIGHTS_CHANGED` to refresh lists.

## Performance notes

- Search input is debounced (`SEARCH_DEBOUNCE_MS`)
- Side panel lists are virtualized with `@tanstack/react-virtual`
- PDF.js is loaded only in the PDF viewer entry
- Highlight cards are memoized

## Future extension points

`FutureSyncAdapter` and `FutureAiAdapter` in `src/types` mark where Phase 2+ sync/AI layers can plug in without changing MVP storage contracts.
