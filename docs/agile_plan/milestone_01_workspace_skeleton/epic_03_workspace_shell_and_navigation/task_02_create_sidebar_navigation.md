# Task 02 - Create sidebar navigation

Status:
- [ ] Not started
- [x] Done

- Objective: build expandable course-first navigation in the left sidebar.
- Why: the PRD centers organization around workspace and course hierarchy.
- Deliverable: sidebar tree with expandable course groups.
- Acceptance: users can browse the workspace hierarchy intuitively.

## Implementation Notes

- Sidebar implementation lives in `src/renderer/app/Sidebar.tsx`.
- The course list is loaded from `window.apaScholar.courses.list()` and rendered as a course-first tree.
- Course groups expand and collapse through reducer-backed `expandedCourseIds` state in `src/renderer/app/workspace-shell-state.ts`.
- Paper lists are lazy-loaded per course and cached in renderer state before nested paper buttons render.
- Collapsed and expanded sidebar variants both preserve navigation access.
