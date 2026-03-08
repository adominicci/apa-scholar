# Task 05 - Restrict unsupported formatting

Status:
- [x] Not started
- [ ] Done

- Objective: prevent unsupported rich-text options from entering the document model.
- Why: arbitrary formatting would undermine APA enforcement and export reliability.
- Deliverable: editor controls and paste behavior that ignore unsupported formatting.
- Acceptance: unsupported formatting is absent or safely ignored.

Implementation notes:

- Centralize filtering and normalization in shared helpers so Epic 03 paste work can reuse the same logic.
- Do not repeat formatting restrictions across renderer components, IPC handlers, and persistence services.
