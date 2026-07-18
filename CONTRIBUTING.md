# Contributing to InkMind

Thanks for helping improve a privacy-first, offline knowledge tool.

## Development setup

```bash
npm install
npm run dev
```

Load `dist/` as an unpacked Chrome extension. See [docs/INSTALLATION.md](docs/INSTALLATION.md).

## Coding standards

- TypeScript strict mode — no `any` unless justified and documented
- Keep components roughly under 300 lines; extract hooks/services instead
- Prefer feature folders over dumping logic into shared buckets
- Use constants from `src/utils/constants.ts` instead of magic values
- Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`)

## Checks before opening a PR

```bash
npm run lint
npm run test
npm run build
```

## Pull request guidelines

1. One focused change per PR when possible
2. Update docs if behavior or architecture changes
3. Add or update Vitest coverage for services/utils
4. Do not introduce network calls, analytics, or AI backends in Phase 1

## Project scope reminder

Phase 1 is offline-only. Cloud sync, auth, vector search, and AI features belong in later roadmap phases — leave adapters/interfaces instead of shipping stubs that call remote APIs.
