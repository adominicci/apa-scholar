## Why

APA Scholar's milestone trackers claim completed work while the repository's defined quality gates are red and several source-of-truth documents describe behavior that no longer exists. The latest UI/packaging change also regressed the guided title-page skeleton and left tests writing fixture data into the normal desktop user-data directory, so broader feature work would compound an untrusted baseline.

## What Changes

- Restore all repository quality gates: formatting, lint, type checking, unit/integration tests, production build, and Electron E2E.
- Isolate every E2E run in a disposable user-data directory so tests cannot read or mutate a user's normal APA Scholar database.
- Restore visible instructional title-page placeholders for missing student metadata while keeping the issues panel as the validation surface.
- Update stale UI tests to reflect the intentionally removed Notifications control and the shipped references workflow.
- Move CrossRef response parsing out of unsafe `any` access by introducing a validated, focused metadata mapper without changing the current DOI-only user workflow.
- Reconcile AGENTS.md, README, architecture, UI design, implementation, agile tracking, historical plans, and release docs with verified repository behavior.
- Reopen milestone/task claims whose acceptance criteria are not yet met, and add a current status matrix that names verified evidence and remaining work.

## Capabilities

### New Capabilities

- `project-quality-gates`: Defines the required green verification suite, test-data isolation, and truthful evidence needed before a slice can be called complete.
- `guided-paper-scaffolding`: Defines visible student title-page guidance for missing metadata without allowing instructional copy to become persisted paper content.
- `project-status-documentation`: Defines how live roadmap, milestone, historical-plan, architecture, and release claims remain synchronized with verified implementation state.

### Modified Capabilities

None. This repository has no existing OpenSpec capability specifications; this change establishes the first canonical specs.

## Impact

- Verification and test infrastructure: ESLint, Prettier, Vitest, Playwright Electron launch configuration, and fixture setup.
- Renderer/domain behavior: student ghost-page generation and the typed CrossRef metadata mapping used by the reference form.
- Documentation: AGENTS.md, README.md, core product/architecture/implementation/UI documents, agile task rollups, dated plan status headers, and release verification guidance.
- No persisted schema, IPC channel, or end-user data migration is introduced in this slice.
