# Task 06 - Add editor serialization

Status:
- [ ] Not started
- [x] Done

- Objective: implement serialization and deserialization between editor state and stored paper content.
- Why: persistence and export both depend on a stable semantic round-trip.
- Deliverable: storage mapping for body editor content.
- Acceptance: document data round-trips cleanly between UI and persistence.

Implementation notes:

- Add one typed body-content update flow across repository, service, IPC, preload, and renderer state helpers.
- Keep `paper_content.body_doc` as the only persisted body-content source of truth; do not keep a parallel plain-text fallback.
