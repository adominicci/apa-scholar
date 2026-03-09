# Epic 02 - Body Editor v1

Source phase: Phase 5

Objective: add the main constrained writing surface with a semantic editor model.

Execution plan:

- `docs/plans/2026-03-08-body-editor-v1.md`

Required execution skills:

- `superpowers:executing-plans`
- `superpowers:using-git-worktrees`
- `superpowers:test-driven-development`
- `superpowers:verification-before-completion`
- `systematic-debugging` for any failing test/build/runtime check
- `superpowers:finishing-a-development-branch`

Implementation guardrails:

- Reuse shared body-editor helpers and schema modules instead of redefining editor rules inside renderer components.
- Extend the existing paper-canvas component tree instead of mounting editor logic directly inside `App.tsx`.
- Keep `paper_content.body_doc` as the single persisted source of truth for body content.
- Use shared update/save helpers in renderer state management; do not keep a second plain-text draft path once the editor lands.
- Build formatting restrictions once so Epic 03 paste cleanup can reuse them without duplicating logic.

Tracking rule: all tasks in this epic must be marked `Done` before the epic is considered complete.

Epic status:

- [x] Done

Current implementation anchors:

- Temporary body drafting currently lives in `src/renderer/app/App.tsx` local state and `src/renderer/app/paper-canvas/PaperCanvasBlock.tsx`.
- `paper_content.body_doc` already exists in persistence and should become the semantic editor source of truth instead of a placeholder string flow.
