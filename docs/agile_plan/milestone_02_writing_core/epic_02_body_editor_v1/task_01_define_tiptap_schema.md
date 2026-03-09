# Task 01 - Define TipTap schema

Status:
- [ ] Not started
- [x] Done

- Objective: define the editor schema around the semantic domain model.
- Why: the editor cannot become an arbitrary style canvas.
- Deliverable: constrained TipTap schema aligned to supported paper structures.
- Acceptance: the editor stores and restores semantic structure cleanly.

Implementation notes:

- Put supported nodes, marks, and editor constants in shared domain helpers instead of duplicating schema decisions in React files.
- Use the execution plan in `docs/plans/2026-03-08-body-editor-v1.md` for exact file targets and required skills.
