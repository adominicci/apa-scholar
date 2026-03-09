# Task 07 - Add schema mapping tests

Status:
- [ ] Not started
- [x] Done

- Objective: test editor schema mapping and round-trip behavior.
- Why: editor integrity is an exit gate before citations and export.
- Deliverable: unit tests for semantic mapping.
- Acceptance: schema mapping tests cover supported nodes and catch regressions.

Implementation notes:

- Use shared editor fixtures/helpers so domain, renderer, and persistence tests validate the same document shapes.
- Completion for this task should include the full verification stack called out in `docs/plans/2026-03-08-body-editor-v1.md`.
