# Task 04 - Add empty state screens

Status:
- [ ] Not started
- [x] Done

- Objective: design empty states that explain the workspace structure clearly.
- Why: new users should understand what to do next without extra guidance.
- Deliverable: empty views for home, course, and paper entry points.
- Acceptance: empty states are instructional and reduce first-run confusion.

## Implementation Notes

- The home route presents a first-run instructional state with direct actions to create a course or draft a paper shell.
- The course view includes an empty-paper state when a course has no papers yet.
- The paper route renders an instructional APA shell instead of a blank document area, including title page, local draft, and references scaffold.
- The right inspector also shows contextual workspace guidance when no course or paper is selected.
