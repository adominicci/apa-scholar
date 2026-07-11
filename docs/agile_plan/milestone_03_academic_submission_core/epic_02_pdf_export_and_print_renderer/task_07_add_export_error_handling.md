# Task 07 - Add export error handling

Status:
- [ ] Not started
- [ ] Done

Current state: reopened on 2026-07-10. Basic error propagation exists, but export issue preflight and actionable release-grade diagnostics remain incomplete. Prior implementation history is preserved; see `docs/project-status.md`.

- Objective: handle export failures clearly and safely.
- Why: desktop export should fail gracefully instead of leaving users stranded.
- Deliverable: export diagnostics and user-facing error flows.
- Acceptance: export failures surface understandable feedback and preserve user work.
