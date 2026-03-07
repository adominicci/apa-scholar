# Task 07 - Add search placeholder API and UI

Status:
- [ ] Not started
- [x] Done

- Objective: reserve the search boundary and shell UI for future workspace search.
- Why: the architecture should expose clear extension points without premature complexity.
- Deliverable: placeholder search API and interface shell.
- Acceptance: the search surface exists without introducing unstable coupling.

## Implementation Notes

- The placeholder search contract is defined in `src/preload/api/contracts.ts` as `WorkspaceSearchPlaceholderResult`.
- `createApaScholarApi` exposes `search.query()` and routes it through the shared IPC channel in `src/application/contracts/persistence-ipc.ts`.
- Main-process handlers return a placeholder result with empty grouped arrays and `status: 'placeholder'`.
- The renderer search field triggers the placeholder API and surfaces a temporary status message without coupling the shell to real indexing behavior.
