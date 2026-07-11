# Task 06 - Add snapshot and golden tests

Status:
- [ ] Not started
- [ ] Done

Current state: reopened on 2026-07-10. Pure print-view-model snapshots exist, but rendered print/PDF golden coverage and body-overflow pagination evidence do not. Prior implementation history is preserved; see `docs/project-status.md`.

- Objective: test rendered print HTML and export output deterministically.
- Why: export regressions are hard to notice without stable fixtures.
- Deliverable: snapshot or golden tests for print rendering.
- Acceptance: supported export output stays stable across changes.
