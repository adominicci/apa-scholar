## Context

The repository is at `5ad4f61` with no open PRs and no `dev` branch. Fresh verification found 122 lint errors, 86 Prettier failures, and three genuine unit/renderer failures; type checking, production build, and the single Electron E2E pass. The E2E currently launches against the normal Electron `userData` path, and live Computer inspection confirmed that repeated test courses are present in the packaged app's normal database. The latest UI change intentionally removed dead controls but did not update their tests, and it also filtered missing student title-page fields despite the PRD's guided-skeleton requirement.

This change establishes a trusted base before any remaining product capability is implemented. It spans test startup, domain rendering, reference metadata parsing, repository-wide formatting, and documentation truth, but does not change persisted application data or public IPC contracts.

## Goals / Non-Goals

**Goals:**

- Make the repository's documented verification commands green without weakening lint, type, or test rules.
- Ensure every Electron E2E run uses a unique disposable `userData` directory and never touches the normal APA Scholar database.
- Restore instructional student title-page placeholders in the ghost canvas while preserving issue reporting.
- Make the current DOI metadata mapper type-safe and testable outside the React component.
- Align every current-status document and milestone checkbox with fresh evidence, clearly distinguishing historical/completed plans from remaining work.

**Non-Goals:**

- Implement search, archive/delete/move/quick-paper operations, professional-paper completion, abstract authoring, persisted fonts, localization completion, or PDF pagination.
- Delete test-created records already present in the user's normal database.
- Move the CrossRef network request behind main-process IPC; that belongs to the dedicated DOI hardening change.
- Claim release readiness or close milestones whose acceptance evidence remains missing.

## Decisions

### Use an explicit test-only user-data override before `app.whenReady()`

`src/main/index.ts` will honor `APA_SCHOLAR_USER_DATA_DIR` only when it is present, calling `app.setPath('userData', value)` before persistence bootstrap. Playwright will create a unique temporary directory, pass it through the launch environment, and remove it in teardown.

This is preferred over clearing the normal database or relying on Chromium's `--user-data-dir` side effects because the application path becomes explicit, testable, and independent of launch timing. The variable also supports packaged clean-profile smoke tests later. Production behavior is unchanged when the variable is absent.

### Preserve strict linting and fix root causes

The current `recommendedTypeChecked` ESLint profile remains intact. Unsafe CrossRef JSON access will be replaced with a Zod-validated pure mapper; stale/unused props and imports will be removed; test doubles will receive explicit bridge types; and legitimate synchronous promise mocks will use resolved promises rather than disabling `require-await`.

Repository code will be formatted with the existing Prettier configuration. Documentation remains excluded by `.prettierignore`, so prose changes stay reviewable and intentional.

### Restore title-page ghost placeholders, not stale export placeholders

The interactive ghost canvas will again show localized labels for missing author, institution, course, instructor, and due date. These blocks remain derived view-model guidance and are never persisted. This resolves the PRD/test conflict in favor of the non-negotiable guided-skeleton direction.

Final PDF placeholder removal is intentionally deferred to the export-safety change because the print model has a separate contract and must also add issue preflight.

### Extract and validate CrossRef mapping without expanding network scope

A focused application service will accept `unknown`, validate the minimum CrossRef envelope and work fields with Zod, normalize supported reference types, and return a typed partial form-compatible metadata value. The React modal retains the fetch call for this stabilization slice and handles parse/fetch failures uniformly. A later change will introduce an infrastructure adapter, timeout, URL semantics, and IPC boundary.

### Treat status documentation as evidence-backed state, not optimistic roadmap copy

The docs will add one current status matrix containing the exact verification snapshot and remaining OpenSpec slices. Milestone 03 and 04 completion claims will be reopened where acceptance is disproven. Historical `docs/plans/*` files will receive explicit status/supersession headers rather than being rewritten as if they were current instructions. AGENTS.md, README.md, architecture, design-system, implementation plan, and release docs will describe the live code paths and known gaps.

## Risks / Trade-offs

- **Large formatting diff can obscure semantic fixes** -> Keep semantic commits separate from the final mechanical Prettier commit and review `git diff --check` plus focused tests before and after formatting.
- **Environment override could be misused outside tests** -> Require an explicit absolute path, document it as test/diagnostic-only, and leave normal startup unchanged when absent.
- **E2E cleanup can hide useful failure artifacts** -> Preserve Playwright trace/report output while deleting only the temporary user-data directory after the Electron process closes.
- **Reopening milestone checkboxes may appear to erase completed work** -> Reopen only disproven acceptance items, retain completed task history, and link each open item to the new status matrix/OpenSpec change.
- **CrossRef extraction is an interim boundary** -> Document the remaining main-process/timeout work and keep this mapper pure so it can be reused by the later adapter.

## Migration Plan

1. Add the isolated-user-data bootstrap and regression tests before changing the E2E launch.
2. Restore ghost placeholders and make the existing regression test pass.
3. Update stale renderer expectations and extract/validate CrossRef mapping.
4. Fix all remaining lint findings without suppressions, then run Prettier across non-ignored files.
5. Re-run typecheck, unit/integration, build, Electron E2E, lint, format, and `git diff --check`.
6. Update documentation and milestone state using only the verified results.

Rollback is a normal branch revert. There is no database migration and the test-only path override is inert in production.

## Open Questions

None for this slice. Broader product decisions are captured as separate proposed changes after this baseline is merged.
