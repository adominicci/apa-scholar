# Task 06 - Add preload and IPC CRUD methods

- Objective: expose typed create/list flows for courses and papers through preload and IPC.
- Why: the renderer must stay isolated from the database and main process internals.
- Deliverable: explicit methods for course and paper creation and listing.
- Acceptance: the UI can create and query core records without direct infrastructure access.
