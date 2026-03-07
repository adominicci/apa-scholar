# Agile Plan

This folder breaks the APA Scholar roadmap into milestone, epic, and task units based on:

- `docs/apa-scholar-prd-v2.md`
- `docs/architecture.md`
- `docs/implementation_plan.md`
- `docs/UI/design-system.md`

Structure:

- `milestone_01_workspace_skeleton`
- `milestone_02_writing_core`
- `milestone_03_academic_submission_core`
- `milestone_04_release_readiness`

Each milestone contains epics derived from implementation phases, and each epic contains task files that map directly to the implementation plan.

UI alignment rule:

- If a future task touches layout, shell structure, navigation, panels, theme, or visual behavior, validate it against `docs/UI/design-system.md` and the current renderer implementation before coding.
- The current shell direction is header + left sidebar + main canvas + right inspector, with a warm-dark studio design language and header-level global search.
- If a task document drifts from the current shipped UI direction, update the task document intentionally rather than forcing the app back toward stale assumptions.

Tracking rule: all task files must be marked `Done` before their parent epic or milestone can be considered complete.

Completion rules:

- Every task file must include a `Status` section with `Not started` and `Done` checkboxes.
- A task is only considered complete when its `Done` checkbox is marked.
- Epic and milestone README files must be kept in sync with task completion.
- An epic README should only be treated as done when all of its task files are marked done.
- A milestone README should only be treated as done when all of its epics are marked done.

Status roll-up:

- [ ] Milestone 01 - Workspace Skeleton
- [ ] Milestone 02 - Writing Core
- [ ] Milestone 03 - Academic Submission Core
- [ ] Milestone 04 - Release Readiness
