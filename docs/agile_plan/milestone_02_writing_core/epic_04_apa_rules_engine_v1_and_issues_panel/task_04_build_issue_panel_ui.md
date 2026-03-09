# Task 04 - Build issue panel UI

Status:
- [ ] Not started
- [x] Done

- Objective: surface issues in a panel grouped by severity and context.
- Why: users need understandable feedback, not hidden validation failures.
- Deliverable: issue panel integrated into the writing workspace.
- Acceptance: issues appear with clear explanations and grouping.

## Design Alignment Notes

- Build this inside the existing inspector region or an inspector-adjacent composition, not as a new floating workspace surface.
- Keep issue feedback visually subordinate to the paper canvas; the writing surface remains the hero.
- Reuse the current shell language for sections, borders, and typography so the issues experience feels native to the existing workspace.
