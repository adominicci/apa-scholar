# CLAUDE.md — APA Scholar

## Project Overview

APA Scholar is a local-first Electron desktop app for writing APA 7th Edition academic papers. Built with Electron + React + TipTap, targeting macOS first. Bilingual UI (EN/ES).

## Tech Stack

- **Shell:** Electron 40, Electron Forge (Vite plugin)
- **Frontend:** React 19, TipTap/ProseMirror, Tailwind CSS v4
- **Persistence:** SQLite via better-sqlite3 (native module)
- **Validation:** Zod
- **i18n:** i18next + react-i18next
- **Testing:** Vitest (unit), Playwright (E2E)
- **Language:** TypeScript everywhere

## Commands

```bash
npm run dev          # Start dev server (rebuilds native modules first)
npm run make         # Package + create DMG/ZIP distributables
npm run package      # Package app without creating installers
npm run lint         # ESLint
npm run format       # Prettier check
npm run typecheck    # tsc --noEmit
npm run test:unit    # Vitest (rebuilds better-sqlite3 for Node first)
npm run test:e2e     # Playwright (rebuilds for Electron, then builds, then tests)
```

## Architecture

Strict Main / Preload / Renderer separation. Business logic in `domain/` and `application/`, not in React components.

```
src/
  main/           # Electron main process (window lifecycle, IPC handlers, DB boot)
  preload/        # Typed contextBridge API (no raw ipcRenderer exposure)
  renderer/       # React UI (app shell, editor, inspector, i18n)
    app/           # Shell components (App.tsx, Sidebar, Inspector, modals)
    paper-canvas/  # Paper view and body editor (TipTap)
    i18n/          # en.ts, es.ts resource files
    styles/        # CSS custom properties, Tailwind config
    print/         # Print-only renderer for PDF export
  domain/         # Pure business logic (papers, references, shared)
  application/    # Use cases, service contracts
  infrastructure/ # SQLite repos, migrations, persistence
```

## Key Patterns

- **Ghost pages:** Paper pages are derived views from semantic content, not stored page objects
- **Preload API:** All IPC goes through typed `window.apaScholar.*` bridge — no direct `ipcRenderer`
- **State:** React `useReducer` for shell/route state (`workspace-shell-state.ts`)
- **Native modules:** `better-sqlite3` is externalized in Vite and copied into packaged app via `packageAfterCopy` hook in `forge.config.ts`
- **Fuses:** `OnlyLoadAppFromAsar` and `EnableEmbeddedAsarIntegrityValidation` are disabled because native modules must load from `app.asar.unpacked`
- **electron-squirrel-startup:** Windows-only, conditionally required in `src/main/index.ts`

## Packaging

- Electron Forge with Vite plugin
- Native modules (`better-sqlite3`, `bindings`, `file-uri-to-path`) are copied into the package via `packageAfterCopy` hook in `forge.config.ts`
- `.node` files are unpacked from asar via `packagerConfig.asar.unpack`
- DMG maker requires `macos-alias` to be compiled for the system Node version (run `npm rebuild macos-alias` if it fails)
- Icon: `assets/icon.icns` (macOS), referenced in `forge.config.ts` and `window-options.ts`

## Docs

- `docs/architecture.md` — full architectural decisions and module decomposition
- `docs/UI/design-system.md` — design tokens, color palette, layout spec
- `docs/apa-scholar-prd-v2.md` — product requirements
- `docs/agile_plan/` — milestone/epic/task breakdown
- `apa-scholar-prd.md` — original PRD (root)

## Testing Notes

- `npm run rebuild:native` rebuilds better-sqlite3 for Electron's Node version
- `npm run rebuild:native:node` rebuilds for system Node (needed before unit tests)
- Unit tests run with system Node; E2E tests run inside Electron
