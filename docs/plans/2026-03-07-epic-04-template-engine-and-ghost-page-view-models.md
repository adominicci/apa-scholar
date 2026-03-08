# Epic 04 Template Engine and Ghost-Page View Models Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build Epic 04 as a thin-UI vertical slice that creates template-backed paper starter data, derives ghost-page view models outside React, and renders a shared paper canvas from one renderer-facing paper draft contract.

**Architecture:** Keep paper structure in shared domain/application helpers, not in React. Persist only semantic paper data (`paper`, `paper_meta`, `paper_content`), derive ghost pages at read time, and expose a paper-detail aggregate through preload so renderer code only renders view models and local draft interactions.

**Tech Stack:** Electron, React, TypeScript, Zod, better-sqlite3, Vitest, Testing Library

---

### Task 1: Define the template core and ghost-page contracts

**Files:**
- Create: `src/domain/papers/template-definitions.ts`
- Create: `src/domain/papers/ghost-page-view-model.ts`
- Test: `tests/unit/domain/template-definitions.test.ts`
- Test: `tests/unit/domain/ghost-page-view-model.test.ts`

1. Write failing unit tests for template registry resolution, template labels, abstract behavior, and stable ghost-page sequences.
2. Implement `TemplateDefinition`, `TemplateDefinitionId`, `TemplateSeedResult`, `GhostPageViewModel`, and `GhostPageBlockViewModel`.
3. Add a tiny template registry covering `apa-student` and `apa-student-abstract`, while preserving `apa-professional` compatibility in shared contracts only.
4. Re-run the new unit tests until green.

### Task 2: Stamp template starter data and build the renderer-facing paper draft aggregate

**Files:**
- Create: `src/application/services/build-paper-draft.ts`
- Modify: `src/application/services/resolve-create-paper-defaults.ts`
- Modify: `src/infrastructure/persistence/paper-repository.ts`
- Modify: `src/application/contracts/persistence-repositories.ts`
- Test: `tests/unit/application/build-paper-draft.test.ts`
- Test: `tests/integration/persistence/persistence-context.test.ts`

1. Write failing tests for template-driven paper meta/content defaults and paper-detail aggregate assembly.
2. Update paper creation so template seed data stamps `paper_meta` and `paper_content`.
3. Add repository reads for `paper_meta`, `paper_content`, and a single paper aggregate/detail fetch.
4. Build a service that derives ghost pages from persisted paper data for renderer consumption.
5. Re-run the targeted unit and integration tests until green.

### Task 3: Expose paper detail through IPC and preload

**Files:**
- Modify: `src/application/contracts/persistence-ipc.ts`
- Modify: `src/main/ipc/create-persistence-ipc-handlers.ts`
- Modify: `src/main/ipc/register-persistence-ipc-handlers.ts`
- Modify: `src/preload/api/contracts.ts`
- Modify: `src/preload/api/create-apa-scholar-api.ts`
- Test: `tests/unit/main/create-persistence-ipc-handlers.test.ts`
- Test: `tests/unit/preload/create-apa-scholar-api.test.ts`

1. Write failing tests for a `papers.getById` or equivalent paper-detail API path.
2. Add the IPC channel and preload contract for paper-detail retrieval.
3. Keep the renderer-facing response typed as one aggregate that bundles `paper`, `paperMeta`, `paperContent`, and `ghostPages`.
4. Re-run targeted unit tests until green.

### Task 4: Replace the hardcoded paper view with shared paper-canvas components

**Files:**
- Create: `src/renderer/app/paper-canvas/PaperCanvas.tsx`
- Create: `src/renderer/app/paper-canvas/PaperCanvasPage.tsx`
- Create: `src/renderer/app/paper-canvas/PaperCanvasBlock.tsx`
- Modify: `src/renderer/app/App.tsx`
- Modify: `src/renderer/app/PaperModal.tsx`
- Modify: `src/renderer/app/Inspector.tsx`
- Test: `tests/renderer/app-shell.test.tsx`

1. Write failing renderer tests for student and student-with-abstract paper creation, paper reopening, and shared page rendering.
2. Update the paper creation modal to offer the two supported student templates, defaulting from course settings.
3. Replace hardcoded paper scaffolding in `App.tsx` with focused shared paper-canvas components that render the derived ghost-page blocks.
4. Keep temporary local body draft editing separate from persisted semantic content.
5. Re-run renderer tests until green.

### Task 5: Verify the Epic 04 slice end-to-end

**Files:**
- Test only: touched unit, integration, and renderer suites

1. Run `npm run test:unit`.
2. Run `npm run typecheck`.
3. Run `npm run build`.
4. If any check fails, fix the implementation and rerun the failing command before reporting status.
