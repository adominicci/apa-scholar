# Task 07 - Add orphan detection rules

Status:
- [ ] Not started
- [ ] Done

Current state: reopened on 2026-07-10. Orphan rules exist, but a reference-load failure is silently treated as an empty list and can generate false mismatch findings. Prior implementation history is preserved; see `docs/project-status.md`.

- Objective: detect mismatches between citations and references.
- Why: missing or unused source relationships should be surfaced as issues.
- Deliverable: orphan and mismatch validation rules.
- Acceptance: broken citation/reference relationships are flagged predictably.
