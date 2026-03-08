# Task 02 - Add body editor region

Status:
- [x] Not started
- [ ] Done

- Objective: place the editor inside the ghost-page canvas where body content belongs.
- Why: writing should happen within the guided page-like experience.
- Deliverable: editor region anchored to the paper body section.
- Acceptance: users can type naturally in the body area of the paper.

Implementation notes:

- Reuse `PaperCanvas`, `PaperCanvasPage`, and `PaperCanvasBlock`; add a dedicated shared body-editor component instead of wiring TipTap directly into `App.tsx`.
- Replace the temporary textarea path with a semantic editor block, not another page-kind special case.
