# Paste Engine v1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a safe, paste-first body editor flow that sanitizes clipboard content, preserves useful APA-friendly structure, and asks for review before inserting risky payloads.

**Architecture:** Keep paste normalization and suspicious-pattern detection outside React in the application/domain layers, then wire the TipTap editor to those services through paste interceptors and a small review modal. Reuse the existing body-editor document model as the canonical sanitized output so paste, persistence, and rendering stay aligned.

**Tech Stack:** React 19, TipTap 3, ProseMirror editor props/plugins, TypeScript, Vitest, Testing Library, Zod-backed body editor schema

---

### Task 1: Add realistic paste fixtures and failing application tests

**Files:**
- Create: `tests/helpers/paste-engine-fixtures.ts`
- Create: `tests/unit/application/paste-engine.test.ts`
- Modify: `tests/helpers/body-editor-fixtures.ts`

**Step 1: Write the failing tests**

Add fixture-backed tests for:
- Word/Google Docs style HTML being sanitized into clean paragraph content
- plain text wrapped with broken line breaks being normalized into paragraphs
- safe inline emphasis surviving paste
- suspicious payloads being flagged for review

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- paste-engine`
Expected: FAIL because the paste engine module does not exist yet.

**Step 3: Write minimal fixture helpers**

Add reusable messy HTML/plain-text fixtures that represent:
- Word-like HTML with classes/styles/comments
- Google Docs-like HTML with spans and ids
- plain text with wrapped lines and double line breaks
- risky HTML with tables/images/scripts

**Step 4: Run test to verify the fixture-backed tests still fail for the right reason**

Run: `npm run test:unit -- paste-engine`
Expected: FAIL because the implementation is still missing, not because the fixtures are broken.

**Step 5: Commit**

```bash
git add tests/helpers/paste-engine-fixtures.ts tests/helpers/body-editor-fixtures.ts tests/unit/application/paste-engine.test.ts
git commit -m "test: add paste engine fixtures"
```

### Task 2: Implement the paste sanitization and detection pipeline

**Files:**
- Create: `src/application/services/paste-engine.ts`
- Modify: `src/domain/papers/body-editor-schema.ts`
- Test: `tests/unit/application/paste-engine.test.ts`

**Step 1: Write the next failing test**

Add coverage for:
- preserving paragraph boundaries
- preserving bold/italic emphasis
- flattening unsupported structure into safe paragraphs
- reporting suspicious patterns with user-facing reasons

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- paste-engine`
Expected: FAIL with missing exports or wrong sanitized output.

**Step 3: Write minimal implementation**

Implement a paste service that:
- accepts HTML and/or plain text clipboard payloads
- sanitizes HTML through a conservative allowlist
- normalizes whitespace and wrapped lines
- outputs a valid body-editor document
- returns warnings plus `requiresReview` when risky patterns are detected

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- paste-engine`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/application/services/paste-engine.ts src/domain/papers/body-editor-schema.ts tests/unit/application/paste-engine.test.ts
git commit -m "feat: add paste sanitization pipeline"
```

### Task 3: Wire TipTap paste interception into the body editor

**Files:**
- Modify: `src/renderer/app/paper-canvas/body-editor/BodyEditor.tsx`
- Modify: `src/renderer/app/paper-canvas/body-editor/create-body-editor-extensions.ts`
- Modify: `tests/renderer/body-editor.test.tsx`

**Step 1: Write the failing renderer tests**

Add tests that assert:
- HTML and plain-text paste are routed through the configured interceptors
- suspicious pastes stop default insertion and request review
- non-suspicious pastes continue through the editor pipeline

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- body-editor`
Expected: FAIL because the editor has no paste interceptors yet.

**Step 3: Write minimal implementation**

Update the body editor to:
- configure TipTap `editorProps.transformPastedHTML`
- configure TipTap `editorProps.transformPastedText`
- configure TipTap `editorProps.handlePaste` for the review gate
- keep callbacks stable with refs so rerenders do not break paste handling

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- body-editor`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/renderer/app/paper-canvas/body-editor/BodyEditor.tsx src/renderer/app/paper-canvas/body-editor/create-body-editor-extensions.ts tests/renderer/body-editor.test.tsx
git commit -m "feat: intercept body editor paste flows"
```

### Task 4: Add review-before-insert UI for suspicious paste payloads

**Files:**
- Create: `src/renderer/app/paper-canvas/body-editor/PasteReviewModal.tsx`
- Modify: `src/renderer/app/paper-canvas/body-editor/BodyEditor.tsx`
- Modify: `tests/renderer/body-editor.test.tsx`

**Step 1: Write the failing UI test**

Add coverage for:
- showing the review modal when a risky paste is detected
- rendering warning messages and sanitized preview text
- inserting the cleaned content only after explicit confirmation
- cancelling without insertion

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- body-editor`
Expected: FAIL because the review UI and confirm path do not exist yet.

**Step 3: Write minimal implementation**

Add a focused modal that:
- follows the existing glass-panel modal style
- explains why the paste was flagged
- shows the cleaned preview
- offers “Insert cleaned copy” and “Cancel”

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- body-editor`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/renderer/app/paper-canvas/body-editor/PasteReviewModal.tsx src/renderer/app/paper-canvas/body-editor/BodyEditor.tsx tests/renderer/body-editor.test.tsx
git commit -m "feat: add paste review modal"
```

### Task 5: Verify, sync epic tracking docs, and close the loop

**Files:**
- Modify: `docs/agile_plan/milestone_02_writing_core/epic_03_paste_engine_v1/README.md`
- Modify: `docs/agile_plan/milestone_02_writing_core/epic_03_paste_engine_v1/task_01_add_paste_interceptors.md`
- Modify: `docs/agile_plan/milestone_02_writing_core/epic_03_paste_engine_v1/task_02_implement_sanitization_pipeline.md`
- Modify: `docs/agile_plan/milestone_02_writing_core/epic_03_paste_engine_v1/task_03_preserve_safe_structure.md`
- Modify: `docs/agile_plan/milestone_02_writing_core/epic_03_paste_engine_v1/task_04_normalize_whitespace_and_line_breaks.md`
- Modify: `docs/agile_plan/milestone_02_writing_core/epic_03_paste_engine_v1/task_05_detect_suspicious_content_patterns.md`
- Modify: `docs/agile_plan/milestone_02_writing_core/epic_03_paste_engine_v1/task_06_add_review_before_insert_path.md`
- Modify: `docs/agile_plan/milestone_02_writing_core/epic_03_paste_engine_v1/task_07_create_messy_paste_fixtures.md`

**Step 1: Run targeted verification**

Run:
- `npm run test:unit -- paste-engine`
- `npm run test:unit -- body-editor`
- `npm run typecheck`

Expected: PASS with fresh evidence.

**Step 2: Update epic tracking**

Mark all seven task files as done and roll the epic README to done once the verification commands pass.

**Step 3: Optional broader verification**

Run: `npm run test:unit`
Expected: PASS unless unrelated failures already exist.

**Step 4: Commit**

```bash
git add docs/agile_plan/milestone_02_writing_core/epic_03_paste_engine_v1/README.md docs/agile_plan/milestone_02_writing_core/epic_03_paste_engine_v1/task_*.md
git commit -m "docs: sync paste engine epic completion"
```
