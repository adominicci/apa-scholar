# implementation_plan.md — APA Scholar

**Version:** 1.0  
**Date:** 2026-03-07  
**Purpose:** Provide a step-by-step, AI-friendly implementation roadmap for APA Scholar so the product can be built coherently with ChatGPT/Codex-style assistance.

---

## 1. Planning Goal

This plan exists to keep implementation aligned with the revised PRD and architecture.

It should answer:
- what gets built first,
- what must wait,
- how modules are separated,
- how AI assistants should be used safely,
- what “done” means at each stage.

The plan intentionally prioritizes **architecture stability over feature quantity**.

---

## 2. Delivery Strategy

## 2.1 Approach

Build APA Scholar in **vertical slices**, but only after the foundational architecture is in place.

Sequence:
1. secure shell,
2. persistence,
3. navigation model,
4. template/ghost-page model,
5. editing,
6. rules,
7. references/citations,
8. export,
9. packaging.

## 2.2 Why This Sequence

This order prevents the most common failure mode:

> building editor/export features before the paper model and system boundaries are stable.

If that happens, the app turns into a brittle UI prototype instead of a maintainable product.

---

## 3. Implementation Phases

## Phase 0 — Project Foundation

### Objective

Create a clean, secure, documented project skeleton that future AI and human contributors can extend safely.

### Deliverables

- Electron Forge + Vite + React + TypeScript scaffold
- linting/formatting/test setup
- docs folder with PRD, architecture, implementation plan
- base folder structure
- secure BrowserWindow defaults
- typed preload bridge skeleton
- CI-ready scripts

### Tasks

1. Initialize project with Electron Forge using Vite + TypeScript template.
2. Create root docs and README.
3. Configure TypeScript path aliases.
4. Add ESLint + Prettier (or equivalent) with strict TypeScript rules.
5. Add Vitest and Playwright scaffolding.
6. Create BrowserWindow with secure defaults.
7. Add empty preload API namespace.
8. Add base theme tokens and app shell placeholder.

### Acceptance Criteria

- App boots locally on macOS.
- Renderer has no direct Electron/Node imports.
- `npm run lint`, `npm run test`, and `npm run dev` succeed.
- Folder structure matches architecture doc.

### Exit Gate

No feature work starts until the shell and boundaries are in place.

---

## Phase 1 — Persistence and Core Data Model

### Objective

Establish the local-first data backbone.

### Deliverables

- SQLite connection
- migration runner
- repository interfaces
- course/paper/settings schemas
- sample seed/dev data

### Tasks

1. Add SQLite layer using `better-sqlite3`.
2. Create migration system.
3. Define Zod schemas for course, paper, paper meta, and settings.
4. Create repositories:
   - `CourseRepository`
   - `PaperRepository`
   - `SettingsRepository`
5. Add integration tests for CRUD and migrations.
6. Add preload and IPC methods for course/paper listing and creation.

### Acceptance Criteria

- Can create/read/update/delete courses.
- Can create a paper linked to a course.
- Data persists across restarts.
- Migration runner is idempotent.

### Exit Gate

Navigation work can begin only after persistence is reliable.

---

## Phase 2 — Workspace Shell and Navigation

### Objective

Build the main user shell and course-first navigation model.

### Deliverables

- left sidebar
- routes/views for Home, Course, Paper, Settings
- expand/collapse course groups
- recent papers list infrastructure

### Tasks

1. Build app shell layout.
2. Create sidebar navigation and expandable course tree.
3. Add “New Course” and “New Paper” flows.
4. Add empty state screens.
5. Build course overview screen.
6. Add selection state and routing.
7. Add search placeholder API and UI shell.

### Acceptance Criteria

- User can create course from the shell.
- User can create paper within a course.
- Sidebar updates immediately.
- Empty states are meaningful and instructional.

### Exit Gate

The app should already feel like an academic workspace before editor work begins.

---

## Phase 3 — Template Engine and Ghost-Page View Models

### Objective

Define how papers are generated and displayed as structured APA skeletons.

### Deliverables

- template definitions
- paper creation use case
- ghost-page view model generator
- paper metadata form model

### Tasks

1. Define `TemplateDefinition` contracts.
2. Implement first template: `APA Student Paper`.
3. Implement second template: `APA Student Paper with Abstract`.
4. Generate initial paper records from selected template.
5. Create ghost-page view model builder.
6. Build title-page placeholder rendering.
7. Create references empty-state scaffold.

### Acceptance Criteria

- New paper opens with visible title-page placeholders.
- Page 2 behavior follows selected template.
- Course defaults prefill title-page metadata.
- Ghost page display is stable even when content is empty.

### Exit Gate

Do not start full editor integration before the skeleton experience works.

---

## Phase 4 — Paper Metadata and Inspector Panels

### Objective

Make title-page and paper settings editable through structured forms.

### Deliverables

- right-side inspector panel
- paper metadata form
- course default override flow
- template switching guardrails

### Tasks

1. Build paper info inspector.
2. Add fields for title, author, institution, course, professor, due date.
3. Add student/professional paper toggle rules.
4. Add abstract enabled/disabled option.
5. Wire metadata changes into ghost-page rendering.
6. Add validation messages for incomplete required fields.

### Acceptance Criteria

- Title-page placeholders resolve live as user edits fields.
- Required metadata is clearly flagged.
- Switching template updates skeleton safely.

### Exit Gate

Paper metadata must be stable before rich-text editing begins.

---

## Phase 5 — Body Editor v1

### Objective

Introduce the main writing surface using a constrained semantic editor.

### Deliverables

- TipTap integration
- body document schema
- heading support
- paragraph support
- block quote support
- keyboard shortcuts for core structure

### Tasks

1. Define TipTap schema aligned with domain model.
2. Add body editor region to ghost-page canvas.
3. Support paragraphs and heading levels 1–5.
4. Support block quotations.
5. Restrict unsupported formatting.
6. Add editor serialization/deserialization.
7. Add unit tests for schema mapping.

### Acceptance Criteria

- User can type body content naturally.
- Heading levels render consistently.
- Unsupported formatting options are absent or ignored.
- Document round-trips cleanly between storage and UI.

### Exit Gate

Do not add citations before the base editor is stable.

---

## Phase 6 — Paste Engine v1

### Objective

Make the editor robust for real-world copy-paste writing.

### Deliverables

- clipboard parsing pipeline
- clean-paste default mode
- structure-preserving paste for safe cases
- paste cleanup rules
- paste-related issue generation

### Tasks

1. Add HTML/plain-text paste interceptors.
2. Implement sanitization pipeline.
3. Preserve paragraph breaks and safe inline emphasis.
4. Add normalization for whitespace and bad line breaks.
5. Detect suspicious content patterns.
6. Add optional review-before-insert path for complex content.
7. Create test fixtures from messy sample content.

### Acceptance Criteria

- Pasting from Word/Docs/web does not inject invalid global formatting.
- Paragraph boundaries remain intact.
- Broken spacing and noisy styles are cleaned.
- Complex paste can be reviewed when necessary.

### Exit Gate

This phase is critical. Do not under-test it.

---

## Phase 7 — APA Rules Engine v1 + Issues Panel

### Objective

Deliver the first compliance/intelligence layer.

### Deliverables

- rule runner
- issue models
- issue panel UI
- autofix framework
- template/metadata validation

### Tasks

1. Implement issue domain model.
2. Build deterministic formatting rules for supported features.
3. Build structural rules for title page, abstract, references presence.
4. Build issue panel with severity grouping.
5. Implement safe autofixes where deterministic.
6. Re-run validation on edit, metadata change, and paste.

### Acceptance Criteria

- Issues appear predictably after invalid edits or incomplete metadata.
- Clear explanations are shown.
- Autofix works for safe cases.
- Export can query issue state.

### Exit Gate

The app should now feel like an APA tool, not just a themed editor.

---

## Phase 8 — References and Citations

### Objective

Add the structured research layer.

### Deliverables

- reference data model
- references manager UI
- citation insertion flow
- references page generation
- orphan detection rules

### Tasks

1. Define reference entry schema.
2. Build references sidebar/panel.
3. Support manual reference creation.
4. Add formatted reference preview.
5. Insert linked citations into body editor.
6. Generate references section in alphabetical order.
7. Add mismatch/orphan issue rules.

### Acceptance Criteria

- User can add references without touching raw APA punctuation manually.
- User can insert in-text citations from saved references.
- References page updates automatically.
- Broken citation/reference relationships are flagged.

### Exit Gate

Reference formatting must be driven by structured data, not manual text paragraphs.

---

## Phase 9 — PDF Export and Print Renderer

### Objective

Generate reliable submission output from the semantic paper model.

### Deliverables

- print route / hidden print renderer
- print view model mapper
- PDF export flow
- export diagnostics

### Tasks

1. Create print view model generator.
2. Create print-only rendering route/layout.
3. Implement page headers and supported title-page rules.
4. Render references page correctly.
5. Wire Electron PDF export.
6. Add snapshot/golden tests for rendered print HTML.
7. Add export error handling.

### Acceptance Criteria

- PDF export succeeds from the UI.
- Export reflects metadata, body, and references correctly.
- Deterministic APA rules supported by the app are honored.

### Exit Gate

macOS packaging should not begin until PDF export is stable.

---

## Phase 10 — Bilingual UI Completion and Polish

### Objective

Finish product-level usability for target users.

### Deliverables

- complete i18n coverage
- settings panel
- recent papers
- keyboard polish
- onboarding empty states
- error copy polish

### Tasks

1. Externalize all strings.
2. Add EN/ES resources.
3. Build language setting.
4. Add recent papers query + UI.
5. Improve onboarding, tips, and empty states.
6. Improve paper/course rename flows.

### Acceptance Criteria

- Core workflows work fully in English and Spanish.
- New users understand the structure with minimal explanation.

---

## Phase 11 — macOS Packaging and Release Prep

### Objective

Prepare the first real desktop release.

### Deliverables

- Forge packaging config
- app icon/assets
- build scripts
- unsigned test artifacts
- signing/notarization-ready config
- release checklist

### Tasks

1. Configure Forge makers for macOS outputs.
2. Verify local packaging.
3. Add environment-driven signing config.
4. Prepare release notes template.
5. Test clean install on another machine.
6. Verify local data storage paths and permissions.

### Acceptance Criteria

- Can produce testable macOS artifacts.
- Signing/notarization path is documented and ready.
- App launches cleanly outside dev mode.

---

## 4. Post-MVP Phase

## Phase 12 — DOCX Export

Only begin after PDF/export model is proven stable.

### Deliverables

- semantic-to-DOCX mapper
- style/token mapping
- Word compatibility tests

## Phase 13 — Windows Support

Only begin after macOS MVP is stable.

### Deliverables

- Windows packaging config
- install tests
- font/render checks

---

## 5. Recommended Milestone Grouping

## Milestone A — Workspace Skeleton

Includes:
- Phase 0
- Phase 1
- Phase 2
- Phase 3

Goal:
- user can create course and open ghost paper shell

## Milestone B — Writing Core

Includes:
- Phase 4
- Phase 5
- Phase 6
- Phase 7

Goal:
- user can actually write and paste cleanly with issue feedback

## Milestone C — Academic Submission Core

Includes:
- Phase 8
- Phase 9
- Phase 10

Goal:
- user can create a meaningful paper and export it

## Milestone D — Release Readiness

Includes:
- Phase 11

Goal:
- macOS pilot build ready

---

## 6. Suggested Repository Conventions

### Branching

Recommended:
- `main`
- `dev`
- short-lived feature branches

### Commit Style

Use explicit scope-based commits:
- `feat(courses): add create course flow`
- `feat(editor): add heading nodes`
- `fix(paste): normalize duplicate line breaks`
- `test(rules): add title page validation cases`

### PR Size Guidance

Keep PRs small and module-focused.

Avoid PRs that simultaneously touch:
- persistence,
- editor schema,
- export,
- UI polish,
all at once.

---

## 7. AI-Assisted Development Rules

These rules are specifically for ChatGPT/Codex workflows.

## Rule 1 — One Module Boundary Per Task

A single AI coding task should preferably target one primary subsystem only.

Good:
- “Implement CourseRepository CRUD + tests.”

Bad:
- “Build references, citations, print export, and localization.”

## Rule 2 — Docs Before Broad Refactors

If changing architecture, update:
- PRD if product behavior changes,
- architecture.md if boundaries change,
- implementation_plan.md if sequence changes.

## Rule 3 — Tests Are Required for Domain Logic

Every AI-generated domain rule must come with tests.

## Rule 4 — Do Not Let AI Invent Hidden Coupling

Reject code that:
- reaches across layers casually,
- imports from internal files instead of module public APIs,
- mixes domain logic into React components.

## Rule 5 — Keep IPC Explicit

AI should not create generic “send any event” bridges. Every IPC method must be named, typed, and validated.

## Rule 6 — Keep the Source of Truth Semantic

Any AI output that starts relying on DOM scraping or arbitrary formatted HTML as the canonical paper state should be rejected.

---

## 8. Definition of Done (Global)

A feature is not done until:

1. code compiles,
2. lint passes,
3. tests pass,
4. public interfaces are typed,
5. module boundaries are respected,
6. user-facing copy is coherent,
7. relevant docs are updated,
8. acceptance criteria from this plan are satisfied.

---

## 9. Task Template for ChatGPT/Codex

Use this structure when asking an AI assistant to implement a module.

### Task Brief Template

**Objective**  
What exactly should be built.

**Context**  
What part of the app this belongs to and why.

**Allowed Files / Modules**  
List the folders the AI may touch.

**Do Not Touch**  
List protected modules.

**Interfaces to Respect**  
List repository or service contracts.

**Acceptance Criteria**  
Copy the exact criteria from this plan.

**Tests Required**  
Name unit/integration/E2E expectations.

**Definition of Done**  
Restate completion expectations.

---

## 10. Recommended First 10 Tasks

1. Scaffold Electron Forge + React + Vite + TS project with secure defaults.
2. Add folder structure, path aliases, lint/test tooling.
3. Implement SQLite bootstrap and migration runner.
4. Implement course repository + tests.
5. Implement paper repository + tests.
6. Build workspace shell and sidebar.
7. Build new course flow.
8. Build new paper flow with template selection.
9. Implement APA Student Paper ghost-page generator.
10. Build paper metadata inspector and live title-page placeholders.

If those 10 tasks are done well, the project will be pointed in the right direction from the start.

---

## 11. Final Guidance

When priorities conflict, choose in this order:

1. architectural integrity,
2. semantic correctness,
3. paste reliability,
4. export reliability,
5. visual polish,
6. extra features.

That order should keep the product coherent and prevent early technical debt.

