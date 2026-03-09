# Task 03 - Support paragraphs and headings

Status:
- [ ] Not started
- [x] Done

- Objective: support paragraphs and APA heading levels 1 through 5.
- Why: heading structure is central to academic paper organization.
- Deliverable: paragraph and heading nodes with deterministic rendering.
- Acceptance: supported heading levels render consistently in the editor and paper model.

Implementation notes:

- Drive heading support from one shared schema/config module so allowed levels, commands, and tests stay in sync.
- Avoid freeform visual heading styles that bypass semantic heading levels.
