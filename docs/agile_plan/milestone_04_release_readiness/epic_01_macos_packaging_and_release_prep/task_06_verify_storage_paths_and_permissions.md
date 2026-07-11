# Task 06 - Verify storage paths and permissions

Status:
- [ ] Not started
- [ ] Done

Current state: reopened on 2026-07-10. Storage guidance exists, but packaged path/permission acceptance has no recorded run and the prior E2E was not isolated from normal `userData`. Prior documentation history is preserved; see `docs/project-status.md`.

- Objective: confirm local storage paths and permission handling in packaged builds.
- Why: a local-first desktop app must protect user data and avoid runtime permission surprises.
- Deliverable: verified storage-path and permission behavior.
- Acceptance: packaged builds store data in the correct locations and handle permissions safely.
