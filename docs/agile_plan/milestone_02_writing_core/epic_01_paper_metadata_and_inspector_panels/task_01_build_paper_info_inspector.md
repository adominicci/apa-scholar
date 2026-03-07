# Task 01 - Build paper info inspector

Status:
- [x] Not started
- [ ] Done

- Objective: add the main structured inspector for paper settings and metadata.
- Why: metadata editing should be form-driven rather than freeform document editing.
- Deliverable: right-side inspector panel connected to the selected paper.
- Acceptance: users can access paper metadata from a stable inspector workflow.

## Design Alignment Notes

- Extend the existing right-side inspector shell instead of introducing a separate modal, drawer, or detached settings screen.
- Preserve the current workspace framing: left course-first navigation, central paper canvas, right contextual inspector.
- Styling should follow `docs/UI/design-system.md`, including the warm-dark palette, flat panel edges, and bundled local typography.
