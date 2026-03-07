# Epic 03 - Workspace Shell and Navigation

Source phase: Phase 2

Objective: build the course-first shell, routes, and navigation model that anchor the desktop workspace.

Tracking rule: all tasks in this epic must be marked `Done` before the epic is considered complete.

Epic status:

- [x] Done

Audit note:

- Verified against the current extracted workspace shell implementation on 2026-03-07.
- Implementation lives across `src/renderer/app/App.tsx`, `Sidebar.tsx`, `Inspector.tsx`, `CourseModal.tsx`, `PaperModal.tsx`, and `workspace-shell-state.ts`.
- Search placeholder plumbing is implemented through preload and main-process IPC contracts.
- Validation coverage exists in renderer tests, unit tests for route and IPC state, and Electron smoke coverage in `tests/e2e/app.spec.js`.
