# Task 04 - Support block quotations

Status:
- [x] Not started
- [ ] Done

- Objective: add block quotation support to the semantic editor.
- Why: common academic paper structures need more than plain paragraphs.
- Deliverable: block quote node and related rendering behavior.
- Acceptance: block quotations can be authored without breaking document structure.

Implementation notes:

- Extend the same shared schema and serialization pipeline used for paragraphs and headings instead of creating a blockquote-only path.
- Keep blockquote persistence semantic so later paste/import work can reuse it directly.
