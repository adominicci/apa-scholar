# APA Scholar Agent Guide

This file is the fast-start context for any agent or engineer opening this repository in a fresh session.

## Product Snapshot

- Product name: `APA Scholar`
- App type: local-first Electron desktop app for APA-compliant academic writing
- Primary information model: `Workspace -> Course -> Paper`
- Current milestone emphasis: workspace shell, navigation, persistence foundation, and design-system alignment
- Platform focus: macOS first

## Source of Truth

Read these first before making product or architecture decisions:

1. `docs/apa-scholar-prd-v2.md`
2. `docs/architecture.md`
3. `docs/implementation_plan.md`
4. `docs/agile_plan/README.md`

For current UI direction, also read:

1. `docs/UI/design-system.md`
2. `docs/UI/code.html`
3. `docs/UI/screen.png`

## Current UI State

The renderer is no longer a simple placeholder shell. The workspace UI is actively evolving and is split into extracted components under `src/renderer/app/`:

- `App.tsx`: top-level workspace orchestration
- `Sidebar.tsx`: left workspace navigation and course tree
- `Inspector.tsx`: right contextual panel
- `CourseModal.tsx`: create-course flow
- `PaperModal.tsx`: create-paper flow
- `workspace-shell-state.ts`: route and shell reducer state
- `icons.tsx`: icon helpers

Design system expectations:

- Warm-dark studio aesthetic
- Bundled local fonts in `src/renderer/assets/fonts/`
- CSS custom properties in `src/renderer/styles/index.css`
- System-theme-aware light/dark mode
- Header + left sidebar + main canvas + right inspector structure

Do not assume the older placeholder-shell screenshots or copy still apply. Check the actual renderer files and `docs/UI/design-system.md` first.

Epic sanity check:

- Epic 03 (`workspace_shell_and_navigation`) was audited against the current code on 2026-03-07 and its task docs were brought in line with the extracted component-based shell.
- The current implementation uses header-level search, not sidebar-local search, and that is intentional in the current UI direction.
- If future sessions revisit Epic 03, compare changes against the current renderer and `docs/UI/design-system.md` before reopening scope.

## Project Architecture

The repo follows strict Electron boundaries:

- `src/main/`: Electron main process
- `src/preload/`: typed bridge exposed to the renderer
- `src/renderer/`: React UI
- `src/domain/`: pure domain contracts and schemas
- `src/application/`: use cases and service orchestration
- `src/infrastructure/`: SQLite and persistence implementation

Important rule:

- Renderer code should use `window.apaScholar` and typed contracts from preload.
- Do not import Node or Electron APIs directly into renderer code.

## Persistence and Native Module Notes

This repo uses `better-sqlite3`, so native module rebuilds matter.

Recommended local Node version:

- Use Node `22.x`
- `@electron/rebuild@4.0.3` requires Node `>=22.12.0`

Important scripts:

- `npm run dev`
- `npm run build`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run rebuild:native`

Native module rule of thumb:

- If Electron shows a `NODE_MODULE_VERSION` mismatch for `better-sqlite3`, run `npm run rebuild:native`.
- `npm run rebuild:native:node` is only for Node-side unit-test runs.
- Before Electron/dev/e2e work, prefer `npm run rebuild:native`.

## In-Progress Files

This repo currently has active changes across both docs and UI. Before editing, inspect the latest content and avoid reverting user work.

Files that often matter together:

- `docs/apa-scholar-prd-v2.md`
- `docs/architecture.md`
- `docs/plans/2026-03-07-project-foundation.md`
- `docs/UI/design-system.md`
- `src/renderer/app/*.tsx`
- `src/renderer/styles/index.css`
- `src/preload/api/contracts.ts`
- `src/preload/api/create-apa-scholar-api.ts`
- `src/application/contracts/persistence-ipc.ts`
- `src/main/ipc/create-persistence-ipc-handlers.ts`

If a task touches shell behavior, inspect both the docs and the extracted renderer components before changing anything.

## Testing Expectations

Use the smallest meaningful verification first, then expand:

- Renderer/UI logic: targeted `vitest` or `npm run test:unit -- <paths>`
- Contract/preload changes: unit tests in `tests/unit/`
- Persistence changes: integration tests in `tests/integration/persistence/`
- Full app shell behavior: `tests/e2e/app.spec.js`

Preferred completion checks for UI or IPC work:

1. `npm run typecheck`
2. `npm run test:unit`
3. `npm run build`
4. `npm run rebuild:native`
5. `npm run test:e2e` or at minimum `npx playwright test tests/e2e/app.spec.js`

## Working Norms for Future Sessions

- Read current files before assuming architecture or design details.
- Prefer updating the extracted renderer components instead of collapsing logic back into `App.tsx`.
- Keep UI consistent with `docs/UI/design-system.md` unless the task explicitly changes the design system.
- Preserve strict main/preload/renderer separation.
- Do not overwrite modified docs just because code changed; sync intentionally.
- Do not revert unrelated user changes in docs, UI files, or generated lockfiles.
- When debugging Electron startup issues, distinguish between:
  - system Node version
  - Electron-bundled Node runtime
  - native modules rebuilt for Node vs rebuilt for Electron

## Good First Reads by Task Type

- UI polish or layout work:
  - `docs/UI/design-system.md`
  - `src/renderer/app/App.tsx`
  - `src/renderer/app/Sidebar.tsx`
  - `src/renderer/app/Inspector.tsx`
  - `src/renderer/styles/index.css`

- IPC or bridge work:
  - `src/preload/api/contracts.ts`
  - `src/preload/api/create-apa-scholar-api.ts`
  - `src/application/contracts/persistence-ipc.ts`
  - `src/main/ipc/create-persistence-ipc-handlers.ts`

- Persistence work:
  - `src/infrastructure/persistence/`
  - `tests/integration/persistence/persistence-context.test.ts`

- Product or scope decisions:
  - `docs/apa-scholar-prd-v2.md`
  - `docs/architecture.md`
  - `docs/agile_plan/`

## Default Assumptions

Unless a newer document or direct user instruction overrides this:

- The app is course-first, not file-first.
- The paper canvas is guided and APA-aware, not a generic document editor.
- UI should feel premium, restrained, and academic.
- Local-first behavior is preferred over cloud assumptions.
- Documentation and code should remain AI-friendly: explicit types, clear boundaries, low ambiguity.
