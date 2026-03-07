# architecture.md — APA Scholar

**Version:** 1.0  
**Date:** 2026-03-07  
**Purpose:** Define the target architecture for APA Scholar so implementation can be done safely and incrementally with ChatGPT/Codex-style assistance.

---

## 1. Architectural Intent

APA Scholar is a **local-first desktop application** built for academic writing workflows, organized by course, and powered by a semantic APA document model.

The architecture must optimize for five things:

1. **Predictable AI-assisted development**
2. **Safe Electron boundaries**
3. **Semantic academic document handling**
4. **Paste-first editing reliability**
5. **Export correctness from structured data**

The architecture should avoid the classic trap of building a fake Word clone. The product is not a freeform page-layout engine. It is a **structured academic workspace** with page-like authoring and reliable output.

---

## 2. Core Architectural Decisions

## AD-1 Semantic Document Model is the Source of Truth

Paper content is stored as structured academic data, not as arbitrary HTML or style-driven text.

Why:
- Makes APA validation possible.
- Keeps export deterministic.
- Prevents paste from corrupting layout state.
- Allows ghost pages to be derived from metadata and sections.

## AD-2 Ghost Pages Are Derived UI, Not Hard Page Objects

The user sees pages, but the system stores semantic content.

Why:
- True live pagination is expensive and fragile.
- Derived page rendering is more realistic for an MVP.
- Export can remain reliable while the editor stays fast.

## AD-3 Main / Preload / Renderer Separation Is Strict

The renderer must not touch Node APIs, the filesystem, or the OS directly.

Why:
- Safer Electron app.
- Cleaner module boundaries.
- Easier to test and reason about.

## AD-4 Business Logic Lives Outside the UI

APA rules, paste normalization, serialization, citation formatting, and export mapping should live in domain/application modules, not inside React components.

Why:
- Lets AI modify UI without breaking core logic.
- Makes unit tests possible.
- Makes future web portability easier.

## AD-5 Repository Must Be AI-Friendly

Every subsystem must have:
- clear folder ownership,
- typed public interfaces,
- low coupling,
- tests near the logic,
- documentation that explains intended extension points.

---

## 3. Recommended Stack

## 3.1 Desktop Shell

- **Electron**
- **Electron Forge** for scaffolding, packaging, and macOS distribution
- **TypeScript** everywhere

### Why Electron Forge

Forge gives a simpler, official-feeling path for initialization, packaging, and later code signing / notarization. It also fits a modular plugin-based build pipeline better than a custom packaging setup.

## 3.2 Frontend

- **React**
- **Vite**
- **TypeScript**
- **CSS variables + Tailwind or CSS Modules**

Recommendation: prefer **Tailwind + CSS variables** for speed, but keep the design tokens centralized.

## 3.3 Editor Layer

- **TipTap / ProseMirror**

Why:
- Excellent fit for semantic nodes
- Custom paste pipeline
- Better control over schema and constraints than a generic rich text wrapper

## 3.4 State Management

- **Zustand** for UI/application state
- React local state for small isolated component state

Why:
- Minimal boilerplate
- Easy for AI to navigate
- Good fit for desktop app complexity without overengineering

## 3.5 Validation / Schemas

- **Zod** for runtime schemas and contract enforcement

## 3.6 Local Persistence

- **SQLite** as the primary local store
- **better-sqlite3** recommended for synchronous, local desktop operations

Why:
- Local-first desktop fit
- Reliable indexing and relations for courses, papers, references, and settings
- Simpler than inventing a custom filesystem graph

## 3.7 File Export / Interchange

- **PDF** via Electron print pipeline from a dedicated print renderer
- **DOCX** via `docx` library in Phase 2
- Optional external paper package format in future if needed

## 3.8 Localization

- **i18next** + **react-i18next**

## 3.9 Testing

- **Vitest** for unit tests
- **Playwright** for E2E tests
- Lightweight Electron integration tests for preload/API contracts

---

## 4. High-Level System View

```text
┌──────────────────────────────────────────────────────────────┐
│                        Electron Main                        │
│ window lifecycle • menus • dialogs • file/export • DB boot │
└───────────────────────┬──────────────────────────────────────┘
                        │ IPC via preload bridge
┌───────────────────────▼──────────────────────────────────────┐
│                          Preload                            │
│ typed safe API surface via contextBridge                    │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                         Renderer                            │
│ React UI shell • sidebar • editor • inspector • issues      │
└───────────────────────┬──────────────────────────────────────┘
                        │
        ┌───────────────┼────────────────┬─────────────────────┐
        │               │                │                     │
┌───────▼───────┐ ┌─────▼────────┐ ┌────▼──────────┐ ┌────────▼────────┐
│ Domain Model  │ │ Rules Engine │ │ Paste Engine  │ │ Export Mappers  │
│ workspaces    │ │ APA profiles │ │ sanitize/map  │ │ print/docx      │
│ courses       │ │ issues       │ │ clipboard     │ │ render payloads │
│ papers        │ └──────────────┘ └───────────────┘ └─────────────────┘
│ references    │
└───────┬───────┘
        │
┌───────▼──────────────────────────────────────────────────────┐
│                    Persistence Layer                         │
│ SQLite repositories • migrations • settings • snapshots      │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Layered Architecture

## 5.1 Presentation Layer

Responsible for:
- layout,
- navigation,
- panels,
- editor view composition,
- forms,
- user feedback.

Must not contain:
- APA rules logic,
- database SQL,
- filesystem access,
- export formatting logic.

## 5.2 Application Layer

Responsible for use cases:
- create course,
- create paper,
- apply template,
- paste sanitized content,
- run validation,
- export PDF,
- manage references.

This layer orchestrates domain logic and repositories.

## 5.3 Domain Layer

Responsible for pure business concepts:
- workspace,
- course,
- paper,
- template,
- section,
- reference,
- citation,
- issue,
- APA profile,
- paste normalization result.

This layer should be mostly framework-agnostic.

## 5.4 Infrastructure Layer

Responsible for:
- SQLite,
- Electron dialogs,
- print/export transport,
- OS integration,
- i18n resource loading,
- clipboard adapters,
- logging.

---

## 6. Process Boundaries

## 6.1 Main Process Responsibilities

- Create BrowserWindow
- Configure security-related BrowserWindow flags
- App lifecycle
- Native menus
- Open/save/export dialogs
- Initialize SQLite connection and migrations
- Handle heavyweight export tasks if needed
- Register typed IPC handlers
- Handle packaging/runtime environment differences

## 6.2 Preload Responsibilities

- Expose a **minimal typed API** via `contextBridge`
- Forward explicit method calls only
- Avoid leaking generic IPC send functions

Recommended pattern:

```ts
window.apaScholar = {
  courses: {
    list: () => invoke('courses:list'),
    create: (payload) => invoke('courses:create', payload),
  },
  papers: {
    create: (payload) => invoke('papers:create', payload),
    open: (paperId) => invoke('papers:open', { paperId }),
  },
  export: {
    pdf: (paperId) => invoke('export:pdf', { paperId }),
  }
}
```

## 6.3 Renderer Responsibilities

- Manage user interaction and visual state
- Call preload APIs
- Render ghost pages
- Host TipTap editor instances
- Show issues and inspector data

Renderer must not:
- import `fs`
- import `electron`
- build SQL queries
- own APA formatting rules directly

---

## 7. Module Decomposition

The repository should be intentionally modular.

```text
src/
  main/
    app/
    db/
    ipc/
    services/
    windows/
  preload/
    api/
    index.ts
  renderer/
    app/
    routes/
    components/
    features/
      workspace/
      courses/
      papers/
      editor/
      references/
      issues/
      export/
      settings/
    state/
    styles/
  domain/
    workspace/
    courses/
    papers/
    references/
    citations/
    apa/
    paste/
    export/
    shared/
  application/
    commands/
    queries/
    services/
  infrastructure/
    persistence/
    localization/
    logging/
    clipboard/
    printing/
  tests/
```

### Key rule

A feature folder may depend inward on `application/`, `domain/`, and approved shared UI utilities, but domain logic should never depend on renderer code.

---

## 8. Domain Model

## 8.1 Core Entities

### Workspace

Represents the user’s local academic environment.

### Course

Fields:
- `id`
- `name`
- `code`
- `professorName`
- `institution`
- `semester`
- `defaultLanguage`
- `defaultPaperTemplate`
- `createdAt`
- `updatedAt`
- `archivedAt?`

### Paper

Fields:
- `id`
- `courseId?`
- `title`
- `templateId`
- `paperType` (`student` | `professional`)
- `language`
- `status`
- `createdAt`
- `updatedAt`

### PaperMeta

Fields:
- title page fields
- author list
- institution
- course name/code
- professor
- due date
- running head
- author note
- abstract enabled boolean

### PaperContent

Fields:
- `abstractDoc`
- `bodyDoc`
- optional future section docs

Store these as structured ProseMirror/TipTap JSON documents.

### ReferenceEntry

Structured reference record with normalized source fields.

### CitationOccurrence

Represents an in-text citation linked to one or more references.

### Issue

Fields:
- `id`
- `paperId`
- `code`
- `severity` (`info` | `warning` | `error`)
- `location`
- `message`
- `autofixAvailable`

### TemplateDefinition

Defines ghost-page skeleton structure and rules for a paper type.

---

## 9. Persistence Design

## 9.1 Why SQLite

SQLite is the best first storage engine because APA Scholar is:
- local-first,
- single-user,
- relation-heavy,
- search-oriented,
- metadata-rich.

## 9.2 Storage Strategy

Use SQLite for:
- courses
- papers
- metadata
- references
- citations
- settings
- recent items
- validation snapshots

Use JSON columns / text blobs for TipTap document payloads.

## 9.3 Suggested Tables

- `courses`
- `papers`
- `paper_meta`
- `paper_content`
- `references`
- `citation_occurrences`
- `issues`
- `settings`
- `recent_items`
- `migrations`

## 9.4 Migration Policy

- Every schema change must have an explicit migration.
- No destructive migration without backup logic.
- Migration runner executes at app boot.

---

## 10. Editor Architecture

## 10.1 Authoring Model

The editor is **section-aware**, not a giant unconstrained document.

Initial editable regions:
- title-page metadata form
- abstract editor (optional)
- body editor
- references manager

Important:
- The title page is primarily metadata-driven.
- References are structured data, not user-typed raw paragraphs.
- Only body/abstract use rich-text document editing directly.

## 10.2 Ghost-Page Rendering

Ghost pages should be rendered as view models produced from:
- paper template,
- paper metadata,
- section content,
- issue state.

This means the UI can show:
- page 1 shell,
- optional page 2 shell,
- body shells,
- references shell,
without storing literal page boxes in the database.

## 10.3 Soft Pagination Strategy

Do **not** implement true live hard pagination in the editor for v1.

Instead:
- show page-sized containers and visual separators,
- allow body content to flow semantically,
- generate actual print pagination in preview/export renderer.

This keeps copy-paste behavior fast and maintainable.

## 10.4 TipTap Schema Direction

Recommended node strategy:
- paragraph
- text
- heading (level 1–5)
- blockquote
- citation_inline
- hard_break (restricted)
- maybe list nodes only if allowed for notes/import staging, not main APA body formatting

Marks:
- bold
- italic
- underline only where explicitly allowed

Prevent or heavily restrict:
- arbitrary font sizes
- arbitrary colors
- arbitrary alignment
- arbitrary spacing

---

## 11. Paste Engine Architecture

Paste handling is important enough to deserve its own subsystem.

## 11.1 Pipeline

```text
Clipboard Input
→ Detect source/type
→ Parse HTML/plain text
→ Sanitize disallowed formatting
→ Normalize whitespace/paragraphs
→ Infer semantic structure
→ Map into editor nodes
→ Validate against APA rules
→ Insert + emit issues if needed
```

## 11.2 Paste Modes

### Mode A — Clean Paste (default)

- strip most styling
- preserve paragraphs
- preserve inline emphasis when safe
- map headings conservatively

### Mode B — Smart Paste

- attempts to preserve heading intent and emphasis
- used when source quality is high

### Mode C — Review Before Insert

- opens cleanup preview for messy/complex imports

## 11.3 Rules

- paste may never change document margins, page setup, or global style state
- paste may not inject unsupported HTML
- paste should generate advisory issues when cleanup changed structure materially

---

## 12. APA Rules Engine

The rules engine must be separate from the editor.

## 12.1 Responsibilities

- validate paper metadata
- validate template requirements
- validate section ordering
- validate deterministic formatting rules
- validate reference/citation consistency
- expose autofixes where safe

## 12.2 Rule Categories

### Deterministic

Examples:
- page number rules
- heading style rules
- block quote rules
- reference indentation rules

### Structural

Examples:
- references page missing but citations exist
- student paper fields incomplete
- abstract present when disabled or missing when required by selected template

### Advisory

Examples:
- suspicious manual spacing
- likely heading-level jump
- suspicious pasted numbering

## 12.3 Rule Profiles

Use versioned rule profiles.

Example:
- `apa7-current`
- future: `apa8-current`

This keeps the system extensible.

---

## 13. Export Architecture

## 13.1 Export Principle

Export should never read directly from uncontrolled editor DOM state as the source of truth.

Instead:
- read semantic paper model,
- map to print view model,
- render export-specific view,
- generate output.

## 13.2 PDF Export (v1)

Flow:
1. Load paper model
2. Build print view model
3. Render hidden print window / dedicated print route
4. Apply print CSS and page setup
5. Generate PDF

## 13.3 DOCX Export (Phase 2)

Flow:
1. Map semantic content to DOCX section/paragraph objects
2. Apply style tokens based on APA profile
3. Generate `.docx`
4. Validate core structural expectations via snapshot tests

## 13.4 Why Export Is Separate

Keeping export separate prevents UI changes from silently breaking submission output.

---

## 14. Security Architecture

Electron security defaults and constraints must be respected.

### Required baseline

- `contextIsolation: true`
- `sandbox: true` for renderer processes where compatible
- `nodeIntegration: false`
- typed preload bridge only
- no raw `ipcRenderer` exposure to the window
- no renderer-side filesystem access
- remote content disabled unless explicitly justified later

### Additional principles

- deny-by-default permissions
- validate all IPC payloads with schemas
- never trust renderer input
- no arbitrary shell execution

---

## 15. Build and Packaging Architecture

## 15.1 Packaging Tool

Use **Electron Forge** from the beginning.

## 15.2 Initial Target

- macOS first
- universal binary if feasible
- DMG/ZIP outputs for release testing

## 15.3 Later Target

- Windows installer via Forge maker when post-macOS MVP is stable

## 15.4 Signing / Notarization

Design the build pipeline so code signing and notarization can be added cleanly without restructuring the app.

---

## 16. Observability and Diagnostics

Even local desktop apps need diagnosability.

Recommended:
- structured local logs
- debug flag in settings
- export failure diagnostic bundle
- copy debug info action

Do not add telemetry by default without explicit user consent.

---

## 17. Testing Strategy

## 17.1 Unit Tests

Highest priority for:
- APA rules
- citation formatting
- paste normalization
- template generation
- serialization/deserialization

## 17.2 Integration Tests

Highest priority for:
- preload API contracts
- repository operations
- export mapping
- migration runner

## 17.3 E2E Tests

Critical user journeys:
- create course
- create paper from template
- fill title-page data
- paste content
- add references
- insert citation
- export PDF

## 17.4 Snapshot / Golden Tests

Use golden output tests for:
- print HTML/CSS structure
- PDF metadata assumptions where practical
- APA issue lists for known sample inputs

---

## 18. Repository Standards for AI-Assisted Development

These standards are specifically intended to keep ChatGPT/Codex work safe.

### 18.1 Module Ownership

Each module should have:
- README or module notes
- public API surface
- tests
- no hidden cross-imports

### 18.2 Public vs Private Boundaries

Prefer:
- `index.ts` public exports
- internal folders not imported across module boundaries directly

### 18.3 File Size Guidance

Avoid giant “everything files.”

Targets:
- components under ~250 lines when possible
- domain services under ~300 lines when possible
- split logic before AI starts struggling with context

### 18.4 Mandatory Types

No `any` in public interfaces.

### 18.5 Schema Validation

All IPC payloads and persisted records should be validated with Zod schemas.

---

## 19. Proposed Folder Layout

```text
apa-scholar/
  docs/
    PRD.md
    architecture.md
    implementation_plan.md
  src/
    main/
      app/
      db/
      ipc/
      services/
      windows/
    preload/
      api/
      index.ts
    renderer/
      app/
      components/
      features/
        workspace/
        courses/
        papers/
        editor/
        references/
        issues/
        export/
        settings/
      state/
      styles/
      i18n/
    domain/
      apa/
      courses/
      papers/
      references/
      citations/
      paste/
      export/
      shared/
    application/
      commands/
      queries/
      services/
    infrastructure/
      persistence/
      printing/
      localization/
      logging/
      clipboard/
  tests/
    unit/
    integration/
    e2e/
```

---

## 20. Architecture Anti-Goals

Do not do these early:
- do not build a full Word clone
- do not let the renderer read/write random files directly
- do not couple print layout to transient editor DOM
- do not let references become free-typed paragraphs
- do not mix APA rules directly into React components
- do not build Windows packaging before macOS MVP is stable
- do not start DOCX export before semantic mapping is stable

---

## 21. Initial Architectural Milestones

1. App shell + secure Electron scaffold
2. SQLite persistence + migrations
3. Course/paper navigation
4. Template generator + ghost-page view models
5. Body editor + paste engine v1
6. APA issues engine v1
7. References/citations
8. Print renderer + PDF export
9. macOS packaging/signing prep

---

## 22. Final Recommendation

If a future implementation choice conflicts with this document, prefer the option that preserves:

1. semantic source of truth,
2. strict process boundaries,
3. module clarity,
4. predictable export behavior,
5. copy-paste reliability.

Those five priorities matter more than visual cleverness.

