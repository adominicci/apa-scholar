# Task 06 - Add selection state and routing

Status:
- [ ] Not started
- [x] Done

- Objective: wire route state and selected workspace entities into the shell.
- Why: navigation needs deterministic transitions between home, course, paper, and settings.
- Deliverable: route-aware shell and selection state model.
- Acceptance: navigation updates immediately and reliably as the user changes context.

## Implementation Notes

- Route and selection state are centralized in `src/renderer/app/workspace-shell-state.ts`.
- The route union includes `home`, `course`, `paper`, and `settings`.
- Reducer actions keep selected course, selected paper, and expanded course state aligned during navigation.
- Unit tests in `tests/unit/main/workspace-shell-state.test.ts` cover course navigation, paper navigation, and panel collapse state transitions.
