# APA Scholar Project Status

**As of:** 2026-07-11

**Current stabilization change:** `restore-project-truth-and-gates`

**Purpose:** Evidence-backed current state. The PRD defines product intent; this file records what is implemented, what has fresh verification, and what remains open.

## Evidence Rules

- `Verified` means the named command or acceptance check has a fresh, recorded successful result.
- `Implemented` means a code path exists; it does not by itself prove the user-facing acceptance criteria or release readiness.
- `Incomplete` means a required behavior is missing or an acceptance criterion has been disproved.
- `Unverified` means the repository may contain supporting code or a reusable checklist, but no executed result is recorded.
- A task, epic, or milestone may be marked done only when all of its acceptance criteria and required quality gates have current evidence.
- Reusable release procedures and blank checklists are instructions, not evidence that a release check ran.

## Verified Audit Baseline

The OpenSpec audit at commit `5ad4f61` found the following baseline before this stabilization work:

| Gate or contract | Verified baseline result | Meaning |
|---|---|---|
| ESLint | Failed with 122 errors | The repository quality gate was red. |
| Prettier | Failed with 86 files reported at `5ad4f61` | Formatting was not at the configured baseline. After planning artifacts were added, a fresh pre-fix run on this branch reported 93 files. |
| Unit/renderer tests | Failed with 3 regressions | Student title-page guidance was missing and two assertions described removed UI behavior. |
| TypeScript | Passed | Types compiled at the audited commit. |
| Production build | Passed | The standard main/preload/main-renderer build completed; this did not prove packaged print/export acceptance. |
| Electron E2E | Passed but unsafe | The single course/paper smoke test used the normal Electron `userData` path and could mutate a user's normal APA Scholar database. |

The current change has red-green evidence for the isolated `userData` override, student placeholders, CrossRef response mapping, and updated renderer behavior. Final whole-repository results from the branch synchronized with `origin/main` are recorded in [Final Verification Evidence](#final-verification-evidence).

## Current Capability Matrix

| Area | Current state | Evidence and remaining acceptance work |
|---|---|---|
| Milestone 01 — Workspace Skeleton | Implemented history preserved | Course-first shell, SQLite persistence, typed preload bridge, templates, and derived ghost pages exist. This stabilization slice did not re-run every original milestone acceptance check. |
| Milestone 02 — Writing Core | Implemented history preserved | Metadata inspector, body editor, paste pipeline, and issues engine exist with unit/renderer coverage. This slice does not claim new milestone-wide acceptance. |
| M3 Epic 01 — References and Citations | Partially implemented | Structured references, manual forms, linked citation marks, generated reference pages, and orphan rules exist. Citation display text becomes stale after its reference is edited, and a failed reference load is treated as an empty list that can produce false orphan issues. CrossRef mapping is now pure and validated, but the network request still lives in the renderer without the planned main-process adapter, timeout, and URL-hardening boundary. |
| M3 Epic 02 — PDF Export and Print Renderer | Incomplete | A semantic print model and Electron PDF handler exist. Export can read SQLite before pending debounced saves finish, still emits instructional fallback text when required metadata is missing, lacks issue preflight, has no content-overflow pagination, and lacks rendered-print/PDF golden evidence. A real UI-to-file export is not covered by E2E. |
| M3 Epic 03 — Bilingual UI and Polish | Incomplete | EN/ES resources and a persisted language setting exist. Hard-coded English remains, abstract authoring is still a read-only placeholder, professional-paper support is partial, and paper font selection is renderer-local rather than persisted or reflected in export. |
| Milestone 04 — Release Readiness | Incomplete and unverified | Forge makers, signing hooks, and release templates exist. No recorded clean-install, packaged-storage, signed/notarized artifact, or separate-machine acceptance result supports release completion. |

## Confirmed Product and Release Blockers

- Remove derived instructional placeholders from final export and add export issue preflight without removing the guided placeholders from the interactive student canvas.
- Flush or coordinate pending metadata/body saves before export and app close so the latest semantic paper state cannot be omitted or lost.
- Resolve linked citation display/export from reference IDs, or reconcile marked citation text when a reference changes; do not leave stale citation text after edits.
- Distinguish reference-load failure from a valid empty reference list so issue detection cannot create false orphan findings.
- Implement print pagination for body overflow and add rendered print/PDF golden coverage.
- Exercise the real PDF save flow in a safe integration or E2E environment and record the artifact result.
- Finish core EN/ES externalization and verify both languages through the primary workflows.
- Pass the selected paper language through derived ghost-page generation and localize issue/paste/export feedback instead of defaulting those paths to English.
- Complete or explicitly scope professional-paper metadata, abstract authoring, and paper-font persistence/export behavior.
- Complete course defaults and title-page mapping, including institution editing and the required combined course number/name output.
- Implement APA heading-level 4/5 terminal punctuation and same-line paragraph behavior, or explicitly mark those levels unsupported.
- Reconcile the documented Clean/Smart/Review paste modes with the actual paste mapper; current heading/list intent is flattened in supported inputs.
- Harden startup/export error contracts so aggregate lookup, save-dialog, initial-window, and activation-window failures reach controlled user-facing results.
- Execute and record packaging, clean-install, packaged-storage/permissions, signing, and notarization checks in disposable or clean environments.
- Implement remaining PRD workspace operations such as real search, archive/delete/move, and quick-paper flows; current search is explicitly a placeholder.

## Active OpenSpec Work

| Change | State | Scope |
|---|---|---|
| `restore-project-truth-and-gates` | Implementation complete; not archived | All 18 tasks are verified on the branch synchronized with `origin/main`. The change restores quality gates, isolates E2E data, repairs guided student scaffolding, validates CrossRef mapping, and reconciles current project truth. |

No later capability should be described as complete merely because a proposal, plan, or checklist exists. Additional export-safety, DOI-boundary, localization, professional-paper, and release work remains separate from this stabilization change.

## Required Repository Verification

Run from the repository root with the recommended Node 22 runtime:

1. `npm run format`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run test:unit`
5. `npm run build`
6. `npm run test:e2e`
7. `git diff --check`

The E2E harness must supply a unique absolute `APA_SCHOLAR_USER_DATA_DIR`, verify the active Electron path, close the app, and remove only its own temporary directories. It must never delete or reuse the normal APA Scholar database.

## Final Verification Evidence

Fresh verification was run on 2026-07-11 after synchronizing the feature branch with `origin/main` at `b3de21e6d8d2da926e46c99cf86be18fb9ea545e`. The verification environment was Node `v24.14.1`, npm `11.11.0`, and OpenSpec `1.5.0`; Node `22.x` remains the recommended project runtime, so these results prove this recorded environment rather than every supported machine.

| Command | Fresh result |
|---|---|
| `npm run format` | Exit 0; Prettier reported that all matched files use its configured style. |
| `npm run lint` | Exit 0 with zero ESLint errors or warnings. |
| `npm run typecheck` | Exit 0 from `tsc --noEmit`. |
| `npm run test:unit` | Exit 0 after the scripted Node native rebuild; 39 test files and 231 tests passed. |
| `npm run build` | Exit 0; Vite transformed 113 main-process modules, 86 preload modules, and 223 renderer modules. Vite emitted a non-failing warning that the 776.84 kB renderer chunk exceeds 500 kB. |
| `npm run test:e2e` | Exit 0 after the scripted Electron native rebuild and nested production build; the single Playwright Electron test passed. The harness created unique absolute temporary directories, asserted that Electron's active `userData` path matched `APA_SCHOLAR_USER_DATA_DIR`, observed the fixture database there, closed Electron, and removed only its own directories. |
| `git diff --check` | Exit 0 with no whitespace errors. |
| `openspec validate restore-project-truth-and-gates --strict` | Exit 0; the change is valid. |
| `openspec doctor --json` | Exit 0 with `root.healthy: true` and no status findings after adding the tracked empty `openspec/changes/archive/` scaffold. No OpenSpec change was archived. |

All 18 tasks in `openspec/changes/restore-project-truth-and-gates/tasks.md` are complete. This proves the stabilization slice and repository gates only; it does not close the separate product and release blockers listed above.
