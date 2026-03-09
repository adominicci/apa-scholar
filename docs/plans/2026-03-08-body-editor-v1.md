# Body Editor v1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.
>
> **Required execution skills:** `superpowers:using-git-worktrees`, `superpowers:test-driven-development`, `superpowers:verification-before-completion`, `systematic-debugging` whenever a test/build/runtime check fails, and `superpowers:finishing-a-development-branch` after all verification passes.

**Goal:** Replace the temporary body textarea with a constrained TipTap-powered body editor that persists semantic paper content, reuses shared helpers/components, and stays aligned with the existing Electron boundaries.

**Architecture:** Put the editor document contract, schema rules, normalization, and serialization in shared domain/helpers so renderer, persistence, and tests all use one source of truth. Keep React responsible only for hosting the editor surface and dispatching typed updates through preload; do not duplicate schema or formatting rules in components, IPC handlers, or persistence code.

**Tech Stack:** Electron, React 19, TypeScript, Zod, better-sqlite3, TipTap, Vitest, Testing Library, Playwright

---

## Shared Implementation Guardrails

- Reuse the existing `PaperDraft` aggregate and `paper_content.body_doc` storage instead of introducing a second body-draft model.
- Add one shared editor module for schema/constants/serialization. Do not hardcode heading levels, blockquote support, or formatting restrictions in multiple files.
- Extend the existing paper canvas composition (`PaperCanvas`, `PaperCanvasPage`, `PaperCanvasBlock`) rather than wiring editor UI directly inside `App.tsx`.
- Use shared helpers for debounced saves and semantic document updates in `src/renderer/app/paper-draft-state.ts`; avoid one-off inline state transforms.
- Keep renderer code on `window.apaScholar`; do not import Electron or Node APIs into renderer files.
- Put paste/normalization logic in reusable helpers so Epic 03 can consume the same code instead of re-implementing filtering later.
- Keep git commit messages and PR comments in English.

### Task 1: Install editor dependencies and define the typed body-document contract

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `src/domain/shared/persistence-models.ts`
- Modify: `src/domain/shared/entity-helpers.ts`
- Create: `src/domain/papers/body-editor-document.ts`
- Test: `tests/unit/domain/body-editor-document.test.ts`

1. Write a failing unit test covering the empty body document shape, allowed root/node types, and safe parsing of persisted JSON into a typed body document contract.
2. Add the minimum TipTap packages needed for a constrained editor surface instead of a broad starter bundle that enables unsupported formatting by default.
3. Create a shared `BodyEditorDocument` type and related helpers in `src/domain/papers/body-editor-document.ts`.
4. Update `PaperContent.bodyDoc` typing to use the shared contract instead of a generic `Record<string, unknown>`.
5. Replace or extend `createEmptyRichTextDocument()` so empty editor documents are created from one shared helper only.
6. Run `npm run test:unit -- tests/unit/domain/body-editor-document.test.ts`.

### Task 2: Centralize schema, serialization, and normalization helpers

**Files:**
- Create: `src/domain/papers/body-editor-schema.ts`
- Create: `src/domain/papers/body-editor-serialization.ts`
- Create: `src/renderer/app/paper-canvas/body-editor/create-body-editor-extensions.ts`
- Test: `tests/unit/domain/body-editor-schema.test.ts`
- Test: `tests/unit/domain/body-editor-serialization.test.ts`

1. Write failing unit tests for supported nodes and marks: paragraph, text, heading levels 1 through 5, blockquote, and restricted hard breaks.
2. Add one shared schema/config module that exports the supported heading levels, allowed marks, and any editor-specific constants.
3. Implement normalization and serialization helpers that accept unknown persisted JSON, coerce it into the allowed body-editor document shape, and reject or strip unsupported structure.
4. Build a single TipTap extension factory that consumes the shared schema constants instead of redefining rules in the renderer.
5. Make unsupported formatting a shared concern here, not a later inline cleanup in React components.
6. Run:
   ```bash
   npm run test:unit -- tests/unit/domain/body-editor-schema.test.ts tests/unit/domain/body-editor-serialization.test.ts
   ```

### Task 3: Replace the temporary body textarea with a shared editor region

**Files:**
- Create: `src/renderer/app/paper-canvas/body-editor/BodyEditor.tsx`
- Modify: `src/domain/papers/ghost-page-view-model.ts`
- Modify: `src/renderer/app/paper-canvas/PaperCanvas.tsx`
- Modify: `src/renderer/app/paper-canvas/PaperCanvasBlock.tsx`
- Modify: `src/renderer/app/App.tsx`
- Modify: `src/renderer/app/paper-draft-state.ts`
- Test: `tests/renderer/paper-canvas-block.test.tsx`
- Test: `tests/renderer/app-shell.test.tsx`

1. Write failing renderer tests proving the body page renders a semantic editor region seeded from `paperContent.bodyDoc` instead of a plain `<textarea>`.
2. Introduce a dedicated `BodyEditor` component under `src/renderer/app/paper-canvas/body-editor/` and keep all TipTap setup inside that folder.
3. Update the ghost-page/body block modeling so the body editor uses an explicit shared block kind instead of a `pageKind === 'body-page'` special case.
4. Reuse `PaperCanvasBlock` as the only switchboard for page block rendering; do not mount the editor directly from `App.tsx`.
5. Replace the local `Record<string, string>` draft state in `App.tsx` with shared semantic document updates in `paper-draft-state.ts`.
6. Keep abstract and references placeholders read-only for this epic.
7. Run:
   ```bash
   npm run test:unit -- tests/renderer/paper-canvas-block.test.tsx tests/renderer/app-shell.test.tsx
   ```

### Task 4: Add paragraph, heading, and keyboard-structure support from one source of truth

**Files:**
- Modify: `src/domain/papers/body-editor-schema.ts`
- Modify: `src/renderer/app/paper-canvas/body-editor/create-body-editor-extensions.ts`
- Modify: `src/renderer/app/paper-canvas/body-editor/BodyEditor.tsx`
- Test: `tests/unit/domain/body-editor-schema.test.ts`
- Test: `tests/renderer/app-shell.test.tsx`

1. Write failing tests for paragraph entry, deterministic APA heading levels 1 through 5, and the keyboard shortcuts/commands that create those structures.
2. Drive heading behavior from the shared schema/config module only; do not duplicate heading-level logic in component props, CSS branches, and tests.
3. Add editor commands or keyboard bindings through the shared extension setup so structure creation stays centralized.
4. Keep the visual presentation aligned with the design system and page typography without leaking visual class decisions into domain helpers.
5. Run:
   ```bash
   npm run test:unit -- tests/unit/domain/body-editor-schema.test.ts tests/renderer/app-shell.test.tsx
   ```

### Task 5: Support block quotations and restrict unsupported formatting through the same pipeline

**Files:**
- Modify: `src/domain/papers/body-editor-schema.ts`
- Modify: `src/domain/papers/body-editor-serialization.ts`
- Modify: `src/renderer/app/paper-canvas/body-editor/create-body-editor-extensions.ts`
- Modify: `src/renderer/app/paper-canvas/body-editor/BodyEditor.tsx`
- Test: `tests/unit/domain/body-editor-serialization.test.ts`
- Test: `tests/renderer/app-shell.test.tsx`

1. Write failing tests for blockquote round-trips and for stripping or ignoring unsupported styles such as arbitrary colors, alignment, font sizing, or list structures.
2. Extend the shared schema/serialization/normalization helpers once so blockquotes and restrictions are enforced in one place.
3. Keep only safe emphasis marks that the shared schema explicitly allows.
4. Do not scatter formatting cleanup across `BodyEditor.tsx`, `PaperCanvasBlock.tsx`, and persistence services.
5. Run:
   ```bash
   npm run test:unit -- tests/unit/domain/body-editor-serialization.test.ts tests/renderer/app-shell.test.tsx
   ```

### Task 6: Add a typed body-content persistence/update path end to end

**Files:**
- Modify: `src/application/contracts/persistence-repositories.ts`
- Modify: `src/application/contracts/persistence-ipc.ts`
- Modify: `src/application/services/build-paper-draft.ts`
- Modify: `src/application/services/persistence-services.ts`
- Modify: `src/infrastructure/persistence/paper-repository.ts`
- Modify: `src/preload/api/contracts.ts`
- Modify: `src/preload/api/create-apa-scholar-api.ts`
- Modify: `src/main/ipc/create-persistence-ipc-handlers.ts`
- Modify: `src/renderer/app/App.tsx`
- Modify: `src/renderer/app/paper-draft-state.ts`
- Test: `tests/unit/application/build-paper-draft.test.ts`
- Test: `tests/unit/main/create-persistence-ipc-handlers.test.ts`
- Test: `tests/unit/preload/create-apa-scholar-api.test.ts`
- Test: `tests/integration/persistence/persistence-context.test.ts`

1. Write failing tests for a typed `papers.updateBodyContent` flow that normalizes editor JSON, persists `paper_content.body_doc`, and returns a rebuilt `PaperDraft`.
2. Add one repository/service method for body content updates; do not overload `updateMetadata()` with editor persistence concerns.
3. Thread the new method through the IPC contract and preload API with explicit naming so renderer and tests share the same call path.
4. Reuse one debounced save helper in `paper-draft-state.ts` for editor updates instead of ad hoc timers in multiple components.
5. Ensure `buildPaperDraft()` continues to be the single renderer-facing aggregate builder.
6. Run:
   ```bash
   npm run test:unit -- tests/unit/application/build-paper-draft.test.ts tests/unit/main/create-persistence-ipc-handlers.test.ts tests/unit/preload/create-apa-scholar-api.test.ts tests/integration/persistence/persistence-context.test.ts
   ```

### Task 7: Add shared fixtures, regression coverage, and final verification

**Files:**
- Create: `tests/helpers/body-editor-fixtures.ts`
- Modify: `tests/unit/domain/body-editor-document.test.ts`
- Modify: `tests/unit/domain/body-editor-schema.test.ts`
- Modify: `tests/unit/domain/body-editor-serialization.test.ts`
- Modify: `tests/integration/persistence/persistence-context.test.ts`
- Modify: `tests/renderer/app-shell.test.tsx`
- Modify: `tests/renderer/paper-canvas-block.test.tsx`

1. Extract shared body-editor fixtures for empty, heading-rich, blockquote, and unsupported-formatting scenarios so tests do not duplicate raw JSON blobs.
2. Add round-trip regression coverage across domain, renderer, and persistence tests using the same fixtures.
3. Run the full completion checks in this order:
   ```bash
   npm run typecheck
   npm run test:unit
   npm run build
   npm run rebuild:native
   npx playwright test tests/e2e/app.spec.js
   ```
4. If any verification fails, stop, use `systematic-debugging`, and fix the root cause before continuing.
5. After all checks pass with fresh output, use `superpowers:finishing-a-development-branch`.

## Suggested English Commit Checkpoints

- `feat(editor): add typed body editor document contract`
- `feat(editor): render shared body editor surface`
- `feat(editor): persist semantic body editor content`
- `test(editor): add schema and round-trip regression coverage`
