# APA Scholar Agent Guide

This file is for agents working in this repository. It should help you make good decisions fast, avoid unsafe assumptions, and stay aligned with the actual product direction.

## What This Product Is

- Product: `APA Scholar`
- Type: local-first Electron desktop app for APA-compliant academic writing
- Core model: `Workspace -> Course -> Paper`
- Current emphasis: workspace shell, navigation, persistence foundation, and design-system alignment
- Platform focus: macOS first

The app is not a generic word processor. It is a guided academic writing workspace with a semantic paper model.

## Read This First

Before making architecture, product, or UI decisions, read these in order:

1. `docs/apa-scholar-prd-v2.md`
2. `docs/architecture.md`
3. `docs/implementation_plan.md`
4. `docs/agile_plan/README.md`

For shell and visual work, also read:

1. `docs/UI/design-system.md`
2. `src/renderer/app/App.tsx`
3. `src/renderer/app/Sidebar.tsx`
4. `src/renderer/app/Inspector.tsx`
5. `src/renderer/styles/index.css`

Do not rely on old screenshots, old placeholder copy, or stale assumptions. Read the current files first.

## Non-Negotiables

- Preserve strict Electron boundaries:
  - `src/main/` owns Electron and OS access
  - `src/preload/` owns the typed bridge
  - `src/renderer/` must not import Node or Electron APIs directly
- Use `window.apaScholar` plus preload contracts from the renderer
- Keep business logic out of React components
- Keep the codebase AI-friendly: explicit types, low coupling, clear module ownership
- Follow DRY, but do not invent abstractions too early. Remove real duplication, not hypothetical duplication.
- When in doubt, do not guess library or framework behavior. Use Context7 MCP and verify against the source docs.
- Prefer changing existing patterns over introducing a second competing pattern
- Never revert unrelated user changes

## Current UI Direction

The workspace shell is componentized under `src/renderer/app/`:

- `App.tsx`: top-level shell orchestration
- `Sidebar.tsx`: workspace navigation and course tree
- `Inspector.tsx`: contextual right panel
- `CourseModal.tsx`: create-course flow
- `PaperModal.tsx`: create-paper flow
- `workspace-shell-state.ts`: reducer and route state
- `icons.tsx`: icon helpers

Design expectations:

- Warm-dark studio aesthetic
- Local bundled fonts in `src/renderer/assets/fonts/`
- CSS custom properties in `src/renderer/styles/index.css`
- System-theme-aware light/dark mode
- Header + left sidebar + main canvas + right inspector layout

Important current behavior:

- Search belongs in the header, not the sidebar
- Epic 03 was reconciled with the extracted shell on 2026-03-07
- If shell behavior changes, compare docs and implementation before reopening old scope

## Architecture Map

- `src/main/`: Electron main process, windows, IPC handlers
- `src/preload/`: typed API exposed to renderer
- `src/renderer/`: React UI
- `src/domain/`: pure domain contracts and schemas
- `src/application/`: use cases and orchestration
- `src/infrastructure/`: SQLite and persistence implementation

Default rule:

- If logic can be pure, put it in `domain` or `application`
- If logic touches storage details, put it in `infrastructure`
- If logic only shapes screen behavior, keep it in `renderer`

## How To Work In This Repo

1. Read the relevant source-of-truth docs and the exact files you plan to touch.
2. Check for existing patterns before adding new ones.
3. Reuse existing types, helpers, and contracts when they already fit.
4. If a library API, framework behavior, or version detail is uncertain, use Context7 instead of guessing.
5. Make the smallest coherent change that solves the task cleanly.
6. Add or update focused tests for the changed behavior.
7. Run the smallest meaningful verification first, then expand only if needed.

## Task-Specific First Reads

UI polish or layout work:

- `docs/UI/design-system.md`
- `src/renderer/app/App.tsx`
- `src/renderer/app/Sidebar.tsx`
- `src/renderer/app/Inspector.tsx`
- `src/renderer/styles/index.css`

IPC or preload work:

- `src/preload/api/contracts.ts`
- `src/preload/api/create-apa-scholar-api.ts`
- `src/application/contracts/persistence-ipc.ts`
- `src/main/ipc/create-persistence-ipc-handlers.ts`

Persistence work:

- `src/infrastructure/persistence/`
- `tests/integration/persistence/persistence-context.test.ts`

Product or scope decisions:

- `docs/apa-scholar-prd-v2.md`
- `docs/architecture.md`
- `docs/agile_plan/`

## Native Module Notes

This repo uses `better-sqlite3`. Native rebuilds matter.

- Recommended Node: `22.x`
- `@electron/rebuild@4.0.3` requires Node `>=22.12.0`
- If Electron shows a `NODE_MODULE_VERSION` mismatch, run `npm run rebuild:native`
- `npm run rebuild:native:node` is only for Node-side unit test runs
- Before Electron, dev, or e2e work, prefer `npm run rebuild:native`

## Scripts You Will Actually Use

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run rebuild:native`

## Testing Rules

- Start with the smallest meaningful test for the change
- Prefer targeted unit tests over broad or slow tests
- Do not write tests only to inflate coverage
- Write unit tests that exercise the code you changed in real usage paths
- If a unit test does not protect behavior we care about, do not add it
- Use integration tests for persistence boundaries
- Use e2e only when shell flow or cross-boundary behavior truly needs it

Preferred verification order for UI, IPC, or shared contract work:

1. `npm run typecheck`
2. `npm run test:unit`
3. `npm run build`
4. `npm run rebuild:native`
5. `npm run test:e2e` or `npx playwright test tests/e2e/app.spec.js`

When time or scope is limited, still run the smallest command that gives real signal and report what was not verified.

## DRY Guidance

- Reuse existing types before creating new near-duplicates
- Reuse existing UI tokens and layout patterns before adding new ones
- Extract helpers only after duplication is real and the shared shape is stable
- Do not copy business rules into components, tests, or IPC layers
- Keep docs and code aligned intentionally; do not duplicate stale explanations

## Context7 Rule

Use Context7 MCP when:

- you are unsure about a library API
- version-specific behavior matters
- a framework pattern is non-obvious
- you catch yourself about to "probably" or "I think" a solution

Do not invent API usage from memory when the cost of checking is low.

## Git And PR Rules

- If `dev` exists, feature branches should target `dev`
- Never close or delete `origin/main`, `origin/dev`, local `main`, or local `dev`
- All git comments must be in English

Before opening a PR:

1. Merge `origin/main` into local `main`
2. Merge `origin/dev` into local `dev`
3. Review and resolve conflicts before creating the PR
4. Tag `@greptile review` on commit comments to the PR

After a PR is merged:

1. Merge `origin/main` into local `main`
2. Merge `origin/dev` into local `dev`

## In-Progress Files That Often Matter Together

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

If you touch shell behavior, inspect both docs and implementation before editing.

## Default Assumptions

Unless newer docs or direct user instructions override this:

- The app is course-first, not file-first
- The paper canvas is guided and APA-aware, not a generic editor
- UI should feel premium, restrained, and academic
- Local-first behavior beats cloud assumptions
- Clear contracts and explicit types are preferred over cleverness
