# Task 05 - Build course overview screen

Status:
- [ ] Not started
- [x] Done

- Objective: add a course overview view that contextualizes papers within a course.
- Why: the course is the primary organizational unit in the PRD.
- Deliverable: course summary screen with paper-related context.
- Acceptance: users can land on a course and understand its purpose and contents.

## Implementation Notes

- The course overview route is rendered from `App.tsx` when reducer state enters `{ view: 'course' }`.
- The screen includes course metadata, default template context, and a paper list for the selected course.
- The overview includes a direct `New paper` action and an empty state when the course has no papers yet.
- Renderer tests verify that selecting a course shows the overview and its contextual details.
