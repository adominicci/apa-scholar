# Task 03 - Add new course and new paper flows

Status:
- [ ] Not started
- [x] Done

- Objective: create the primary creation flows from the shell.
- Why: course and paper creation are the first critical user actions.
- Deliverable: UI flows for creating courses and creating papers inside courses.
- Acceptance: users can create a course and then create a paper within it.

## Implementation Notes

- Course creation is implemented in `src/renderer/app/CourseModal.tsx` and submitted from `App.tsx`.
- Paper creation is implemented in `src/renderer/app/PaperModal.tsx` and supports selecting a course when launched outside a course context.
- Successful creation updates renderer state immediately and navigates to the created course or paper.
- The Electron smoke test in `tests/e2e/app.spec.js` covers creating a course and then creating a paper from the shell.
