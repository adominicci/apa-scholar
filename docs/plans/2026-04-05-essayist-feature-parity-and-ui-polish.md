# Essayist Feature Parity & UI Polish Implementation Plan

**Lifecycle status:** Partially completed and superseded for current-state guidance.

**Current source of truth:** [`docs/project-status.md`](../project-status.md), [`docs/UI/design-system.md`](../UI/design-system.md), and the current renderer. Dead-control cleanup and several polish slices shipped; complete bilingual acceptance, persisted/exported font choice, and other remaining product capabilities are still open.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bring APA Scholar to feature parity with Essayist.app while polishing the UI for a sharp, professional look — keeping the experience simpler and student-focused.

**Architecture:** Incremental changes across the renderer layer (React components, CSS, i18n). Remove all placeholder UI that has no backing functionality. Add word/page count metrics, wire print preview, and improve typography and spacing. No new backend services — leverage existing IPC APIs and domain logic.

**Tech Stack:** React 19, TipTap/ProseMirror, Tailwind CSS v4, CSS custom properties, i18next

---

## Phase 1: Remove Dead UI (Placeholder Cleanup)

### Task 1: Remove non-functional sidebar buttons (Research, Citations, Add Reference)

**Files:**
- Modify: `src/renderer/app/Sidebar.tsx`
- Modify: `src/renderer/i18n/resources/en.ts`
- Modify: `src/renderer/i18n/resources/es.ts`

**Step 1: Remove Research and Citations buttons from expanded sidebar**

In `Sidebar.tsx`, delete the two placeholder `<button>` elements for Research and Citations (lines ~173-187). They have no `onClick` handlers.

```tsx
// DELETE these two buttons:
<button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 ...">
  <DatabaseIcon />
  <span>{t('sidebar.research')}</span>
</button>
<button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 ...">
  <BookmarkIcon />
  <span>{t('sidebar.citations')}</span>
</button>
```

**Step 2: Remove disabled "Add Reference" button from sidebar bottom**

In `Sidebar.tsx`, delete the entire bottom section (lines ~321-331) containing the disabled `Add Reference` button:

```tsx
// DELETE this entire block:
<div className="mt-auto border-t border-[var(--color-line)] p-4">
  <button disabled ...>
    <LibraryAddIcon />
    {t('sidebar.addReference')}
  </button>
</div>
```

**Step 3: Remove unused icon imports**

In `Sidebar.tsx`, remove `BookmarkIcon`, `DatabaseIcon`, `LibraryAddIcon` from the icons import if no longer used.

**Step 4: Remove stale i18n keys**

In `en.ts`, remove: `research`, `citations`, `addReference`
In `es.ts`, remove the same keys.

**Step 5: Verify and commit**

Run: `npx tsc --noEmit`
Expected: No errors

```bash
git add src/renderer/app/Sidebar.tsx src/renderer/i18n/resources/en.ts src/renderer/i18n/resources/es.ts
git commit -m "chore: remove placeholder sidebar buttons (Research, Citations, Add Reference)"
```

---

### Task 2: Remove non-functional Notifications bell from header

**Files:**
- Modify: `src/renderer/app/App.tsx`
- Modify: `src/renderer/i18n/resources/en.ts`
- Modify: `src/renderer/i18n/resources/es.ts`

**Step 1: Remove Notifications button from header**

In `App.tsx`, find the notifications button (around line ~1356-1362) and delete it:

```tsx
// DELETE this button:
<button aria-label={t('header.notifications')} ...>
  <NotificationsIcon />
</button>
```

**Step 2: Remove unused NotificationsIcon import if no longer used elsewhere**

Search `App.tsx` for other uses of `NotificationsIcon`. If none, remove from the icons import.

**Step 3: Remove i18n key**

In `en.ts`: remove `notifications` from `header` section.
In `es.ts`: remove same.

**Step 4: Verify and commit**

Run: `npx tsc --noEmit`

```bash
git add src/renderer/app/App.tsx src/renderer/i18n/resources/en.ts src/renderer/i18n/resources/es.ts
git commit -m "chore: remove placeholder Notifications button from header"
```

---

### Task 3: Remove non-functional Print Preview button

**Files:**
- Modify: `src/renderer/app/App.tsx`
- Modify: `src/renderer/i18n/resources/en.ts`
- Modify: `src/renderer/i18n/resources/es.ts`

**Step 1: Find and remove the Print Preview button**

In `App.tsx`, search for `printPreview` or `Print preview`. The button exists in the paper view header but has no onClick handler. Remove it entirely.

**Step 2: Remove i18n keys for print preview**

In `en.ts` and `es.ts`, remove `printPreview` key from the `paperView` section.

**Step 3: Verify and commit**

Run: `npx tsc --noEmit`

```bash
git add src/renderer/app/App.tsx src/renderer/i18n/resources/en.ts src/renderer/i18n/resources/es.ts
git commit -m "chore: remove placeholder Print Preview button"
```

---

### Task 4: Remove non-functional Search inspector rail button

**Files:**
- Modify: `src/renderer/app/Inspector.tsx`

**Step 1: Remove the Search rail button from Inspector collapsed state**

In `Inspector.tsx`, find the search rail button in the collapsed icon rail. It has no onClick handler. Remove it.

**Step 2: Verify and commit**

Run: `npx tsc --noEmit`

```bash
git add src/renderer/app/Inspector.tsx
git commit -m "chore: remove placeholder Search button from inspector rail"
```

---

## Phase 2: UI Polish — Typography, Spacing, Professional Look

### Task 5: Increase label-caps font size and adjust section spacing

**Files:**
- Modify: `src/renderer/styles/index.css`

**Step 1: Bump `.label-caps` from 10px to 11px for better readability**

```css
.label-caps {
  font-size: 0.6875rem; /* 11px — up from 10px */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em; /* slightly tighter */
  color: var(--color-muted);
}
```

**Step 2: Commit**

```bash
git add src/renderer/styles/index.css
git commit -m "style: increase label-caps size and tighten letter-spacing"
```

---

### Task 6: Polish sidebar typography and spacing

**Files:**
- Modify: `src/renderer/app/Sidebar.tsx`

**Step 1: Adjust font sizes for better hierarchy**

- Course names: keep `text-sm font-medium` (14px)
- Course meta line: keep `text-xs` (12px)
- Paper names in expanded list: keep `text-sm` but remove extra `font-medium` — use `font-normal` for papers to differentiate from course names
- Paper type label: keep `text-xs text-muted`

**Step 2: Adjust button sizing for New Course / New Paper**

Change from `text-xs` (12px) to `text-[13px]` for slightly larger touch targets and readability:

```tsx
className="flex-1 rounded-lg bg-[var(--color-accent)] px-3 py-2.5 text-[13px] font-semibold ..."
```

**Step 3: Commit**

```bash
git add src/renderer/app/Sidebar.tsx
git commit -m "style: polish sidebar typography and button sizing"
```

---

### Task 7: Polish header bar

**Files:**
- Modify: `src/renderer/app/App.tsx`

**Step 1: Ensure search input has consistent sizing**

The search input should use `text-[13px]` instead of `text-sm` for consistency across the UI. Increase padding slightly:

```tsx
className="w-full rounded-lg border-none bg-[var(--color-input)] py-2 pl-10 pr-4 text-[13px] ..."
```

**Step 2: Adjust header padding for breathing room**

Ensure the header has consistent `px-6 py-3` padding for a more spacious feel.

**Step 3: Commit**

```bash
git add src/renderer/app/App.tsx
git commit -m "style: polish header bar typography and spacing"
```

---

### Task 8: Polish inspector panel typography

**Files:**
- Modify: `src/renderer/app/Inspector.tsx`
- Modify: `src/renderer/app/inspector/PaperInspectorPanel.tsx`

**Step 1: Increase tab button text from current size to `text-[13px] font-semibold`**

Tab buttons (DETAILS, ISSUES, REFERENCES) should be more prominent:

```tsx
const tabButtonClass = (active: boolean) =>
  `px-3 py-1.5 text-[13px] font-semibold rounded-md transition ${
    active
      ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]'
      : 'text-[var(--color-muted)] hover:text-[var(--color-ink-strong)]'
  }`;
```

**Step 2: Ensure form labels in PaperInspectorPanel use consistent `text-[13px] font-medium`**

**Step 3: Commit**

```bash
git add src/renderer/app/Inspector.tsx src/renderer/app/inspector/PaperInspectorPanel.tsx
git commit -m "style: polish inspector panel typography"
```

---

## Phase 3: Student-Focused Features (Essayist Parity)

### Task 9: Add word count and page count display to paper view

**Files:**
- Modify: `src/renderer/app/App.tsx` (paper view header area)
- Modify: `src/renderer/i18n/resources/en.ts`
- Modify: `src/renderer/i18n/resources/es.ts`

**Step 1: Compute word count from paper body content**

Add a `useMemo` that counts words from `activePaperDetail.paperContent.bodyDoc`:

```tsx
const wordCount = useMemo(() => {
  if (!activePaperDetail?.paperContent?.bodyDoc) return 0;
  const text = activePaperDetail.paperContent.bodyDoc.content
    .map((node) => getBlockTextContent(node))
    .join(' ');
  return text.trim().split(/\s+/).filter(Boolean).length;
}, [activePaperDetail?.paperContent?.bodyDoc]);
```

Note: Import or reuse `getBlockTextContent` from `src/domain/papers/paper-issues.ts` — check if it's already exported.

**Step 2: Compute page count estimate**

Approximate page count: ~250 words per double-spaced APA page.

```tsx
const pageCount = Math.max(1, Math.ceil(wordCount / 250));
```

**Step 3: Render in paper view header**

Add a subtle word/page count display next to the paper title in the paper view toolbar area:

```tsx
<span className="text-xs text-[var(--color-muted)]">
  {t('paperView.wordCount', { count: wordCount })} · {t('paperView.pageCount', { count: pageCount })}
</span>
```

**Step 4: Add i18n keys**

```ts
// en.ts
paperView: {
  wordCount: '{{count}} words',
  pageCount: '{{count}} pages',
}

// es.ts
paperView: {
  wordCount: '{{count}} palabras',
  pageCount: '{{count}} páginas',
}
```

**Step 5: Verify and commit**

Run: `npx tsc --noEmit`

```bash
git add src/renderer/app/App.tsx src/renderer/i18n/resources/en.ts src/renderer/i18n/resources/es.ts
git commit -m "feat: add word count and page count display to paper view"
```

---

### Task 10: Add URL auto-fill for references (DOI/URL metadata lookup)

**Files:**
- Modify: `src/renderer/app/inspector/ReferenceFormModal.tsx`
- Modify: `src/renderer/i18n/resources/en.ts`
- Modify: `src/renderer/i18n/resources/es.ts`

**Step 1: Add a "Paste URL or DOI" input at the top of the reference form**

When a user pastes a DOI (e.g., `https://doi.org/10.xxxx/...`) or a URL, attempt to fetch metadata from the CrossRef API (`https://api.crossref.org/works/{doi}`) to auto-fill title, authors, year, journal, volume, issue, pages.

This is a renderer-side fetch since CrossRef is a public API. Add a helper function:

```tsx
const fetchDOIMetadata = async (doi: string) => {
  const cleanDoi = doi.replace(/^https?:\/\/doi\.org\//, '');
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(cleanDoi)}`);
  if (!res.ok) return null;
  const data = await res.json();
  const item = data.message;
  return {
    title: item.title?.[0] ?? '',
    authors: (item.author ?? []).map((a: { family: string; given: string }) => ({
      family: a.family ?? '',
      given: a.given ?? '',
    })),
    year: item.published?.['date-parts']?.[0]?.[0]?.toString() ?? '',
    journal: item['container-title']?.[0] ?? '',
    volume: item.volume ?? '',
    issue: item.issue ?? '',
    pages: item.page ?? '',
    doi: `https://doi.org/${cleanDoi}`,
  };
};
```

**Step 2: Add UI for the DOI lookup**

At the top of the reference form, add:

```tsx
<div className="mb-4">
  <label className="text-[13px] font-medium">{t('referenceForm.pasteDoiUrl')}</label>
  <div className="flex gap-2 mt-1">
    <input
      className="flex-1 rounded-lg border ..."
      placeholder="https://doi.org/10.xxxx/..."
      value={doiInput}
      onChange={(e) => setDoiInput(e.target.value)}
    />
    <button onClick={handleDoiLookup} disabled={lookingUp}>
      {lookingUp ? t('common.loading') : t('referenceForm.lookup')}
    </button>
  </div>
</div>
```

**Step 3: Auto-fill form fields from lookup result**

When metadata returns, populate the form state with the returned values (only fill empty fields to avoid overwriting user edits).

**Step 4: Add i18n keys**

```ts
// en.ts
referenceForm: {
  pasteDoiUrl: 'Paste DOI or URL',
  lookup: 'Look up',
  lookupFailed: 'Could not find metadata for this DOI',
}
```

**Step 5: Verify and commit**

```bash
git commit -m "feat: add DOI/URL metadata auto-lookup for references"
```

---

### Task 11: Improve paper creation flow — auto-select course + streamlined modal

**Files:**
- Modify: `src/renderer/app/PaperModal.tsx`
- Modify: `src/renderer/app/App.tsx`

**Step 1: When user is viewing a course, auto-select it in the paper creation modal**

The `openPaperModal` function in `App.tsx` already does this (finds `defaultCourse` from `shellState.selectedCourseId`). Verify it works correctly. If the course dropdown is read-only when pre-selected, consider keeping it editable but pre-filled.

**Step 2: Simplify the modal — default to "Student paper" template**

Most users are students. Default the template selection to `apa-student-basic` and make the toggle less prominent (secondary action, not a required choice).

**Step 3: Commit**

```bash
git commit -m "feat: streamline paper creation flow with smart defaults"
```

---

## Phase 4: APA Rules Verification

### Task 12: Verify heading level styles against APA guide

**Files:**
- Read: `docs/APA_Guides/apa7_student_basic_rules.json` — `heading_levels` section
- Verify: `src/renderer/styles/index.css` — `.apa-body-editor .ProseMirror h1-h5`

**Step 1: Cross-reference each heading level**

| Level | APA Rule | Current CSS | Status |
|-------|----------|-------------|--------|
| H1 | Centered, bold, title case | `text-align: center; font-weight: 700` | ✅ Correct |
| H2 | Left-aligned, bold, title case | `text-align: left; font-weight: 700` | ✅ Correct |
| H3 | Left-aligned, bold, italic, title case | `text-align: left; font-weight: 700; font-style: italic` | ✅ Correct |
| H4 | Indented 0.5in, bold, title case, period at end | `text-indent: 48px; font-weight: 700` | ⚠️ Period not enforced by CSS — handled by editor? Verify. |
| H5 | Indented 0.5in, bold, italic, title case, period at end | `text-indent: 48px; font-weight: 700; font-style: italic` | ⚠️ Same period concern |

**Step 2: Verify all headings use same font-size as body (APA requirement)**

Current CSS: all headings use `font-size: 1rem` ✅ Correct — APA headings are same size as body text.

**Step 3: Document any issues found; fix if needed**

No CSS changes needed. The period-at-end for L4/L5 is a content concern (editor behavior), not CSS.

**Step 4: Commit any fixes**

```bash
git commit -m "docs: verify APA heading levels match 7th edition rules"
```

---

### Task 13: Verify reference list formatting against APA guide

**Files:**
- Read: `docs/APA_Guides/apa7_student_basic_rules.json` — `reference_list` section
- Verify: `src/renderer/app/inspector/ReferencesPanel.tsx`
- Verify: Reference formatting logic in domain layer

**Step 1: Check reference list requirements**

| APA Rule | Implementation | Status |
|----------|---------------|--------|
| Heading: centered, bold "References" | Ghost page rendering | Verify |
| Hanging indent: 0.5in | CSS in reference preview | Verify |
| Alphabetical order | Sorting in references list | Verify |
| Double-spaced | Line height in references | Verify |
| Up to 20 authors: list all | Formatting function | Verify |
| 21+: first 19, ellipsis, last | Formatting function | Verify |
| DOI as URL format | Reference form field | ✅ Has DOI field |

**Step 2: Fix any discrepancies found**

**Step 3: Commit fixes**

---

## Phase 5: Documentation Update

### Task 14: Update CLAUDE.md and architecture docs

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/architecture.md` (section 4 — Current shell reference, if file list changed)

**Step 1: Update CLAUDE.md**

Add any new features (word count, DOI lookup), remove references to deleted UI elements (Research/Citations sidebar, Notifications, Print Preview).

**Step 2: Update architecture.md section 4 (Current shell reference)**

Remove references to deleted components. Add any new components.

**Step 3: Commit**

```bash
git commit -m "docs: update CLAUDE.md and architecture.md after UI cleanup"
```

---

## Execution Order Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| **Phase 1** | Tasks 1-4 | Remove all placeholder/dead UI |
| **Phase 2** | Tasks 5-8 | Typography and spacing polish |
| **Phase 3** | Tasks 9-11 | New features (word count, DOI lookup, flow improvements) |
| **Phase 4** | Tasks 12-13 | APA rules verification against guide JSON files |
| **Phase 5** | Task 14 | Documentation update |

## Testing Strategy

- After each task: `npx tsc --noEmit` (type check)
- After Phase 1 complete: `npm run dev` — visually verify sidebar, header, inspector
- After Phase 2 complete: `npm run dev` — visually verify typography changes
- After Phase 3 complete: `npm run dev` — test word count updates live, test DOI lookup with real DOI
- After Phase 4: Review APA guide JSON files against rendered output
- Final: `npm run make` — verify DMG builds successfully
