# Product Requirements Document: APA Scholar

**Version:** 2.0  
**Date:** 2026-03-07  
**Status:** Revised for workspace-first, ghost-page architecture  
**Product Owner:** Andres Dominicci + AI-assisted planning

---

## 1. Executive Summary

APA Scholar is a desktop academic writing workspace for students, professors, and academic authors who need to produce APA-compliant papers without fighting a blank word processor.

The product is **not** a generic document editor. It is a **course-based academic workspace** where users organize work by course and create papers from structured APA templates. Each paper opens as a guided “ghost-page” skeleton that shows the user exactly where each part of the paper belongs.

The core value proposition is:

> **Strict APA structure, flexible APA-valid choices, and frictionless copy-paste authoring.**

Version 2.0 of this PRD shifts the product from a flat paper editor to a **Workspace → Course → Paper** model and redefines the editor as a **semantic academic paper builder** rather than a freeform rich-text canvas.

---

## 2. Product Vision

### 2.1 Vision Statement

Create the best desktop writing environment for APA papers by combining:

- **course-based organization** that matches how students think,
- **ghost pages** that visually teach structure,
- **strict APA enforcement** for deterministic rules,
- **copy-paste friendliness** for real writing behavior,
- **semantic document architecture** that keeps exports reliable.

### 2.2 Positioning

APA Scholar is positioned between:

- **Word / Google Docs**: flexible but too manual,
- **template files**: fragile and easy to break,
- **citation managers**: useful but detached from writing,
- **Academic Writer-like guided systems**: structured but often not tailored to a local bilingual desktop-first workflow.

APA Scholar should feel like an **Essayist-style guided writing app** with the organizational clarity of a **workspace tool** and the discipline of an **APA rules engine**.

---

## 3. Product Principles

These principles are non-negotiable and should drive every design and implementation decision.

### 3.1 Guided Skeleton First

Users should rarely face a blank page. Papers begin with visible ghost pages, placeholder labels, and structural cues.

### 3.2 Strict Formatting, Flexible Valid Choices

The app should be rigid where APA is deterministic and flexible where APA allows variation.

Examples:
- Rigid: margins, page-number placement, header rules, reference indentation, heading formatting, student vs professional title-page structure.
- Flexible: acceptable APA font family options, abstract presence when instructor-dependent, optional running head only for professional papers, optional sections depending on assignment type.

### 3.3 Copy-Paste Is a Primary Workflow

Students paste from notes, drafts, web sources, PDFs, and Word documents. Paste handling is not a side feature. It is a core product behavior.

### 3.4 Semantic Model Over Styling Model

The source of truth is not arbitrary formatting. It is structured academic meaning:
- title-page metadata,
- abstract,
- body,
- headings,
- references,
- citations,
- document issues.

### 3.5 Course-Centered Organization

Users think in terms of classes and assignments, not random files. The information architecture should reflect this.

### 3.6 AI-Friendly Codebase

The codebase must be modular, explicit, interface-driven, and easy for ChatGPT/Codex-style tools to extend safely.

---

## 4. Problem Statement

### 4.1 Current Situation

Students and academic authors usually write APA papers in general-purpose editors. That creates recurring problems:

- users must remember title-page structure manually,
- assignment metadata is retyped repeatedly,
- pasted content imports messy formatting,
- headings drift out of APA compliance,
- references and citations become disconnected,
- PDF/DOCX exports are inconsistent,
- students often know *what* they want to say but not *where* each part belongs.

### 4.2 Opportunity

A course-aware workspace with ghost pages can reduce both formatting mistakes and decision fatigue. The user should be guided into the right paper structure from the first click.

---

## 5. Target Users

### 5.1 Primary User: Student Writer

A college or graduate student who needs to submit APA papers consistently.

**Goals**
- Create papers quickly.
- See exactly where each part belongs.
- Paste existing notes without ruining formatting.
- Avoid instructor deductions for APA mistakes.

**Pain Points**
- Confusion about title-page fields.
- Uncertainty around abstract and references.
- Word templates breaking after paste.
- Lack of clarity about heading levels.

### 5.2 Secondary User: Advanced Academic Author

A user writing multiple papers per course, often reusing sources and course metadata.

**Goals**
- Reuse professor/course/institution settings.
- Build multiple papers within the same course space.
- Maintain clean references and exports.

### 5.3 Tertiary User: Professor / Instructor

A faculty member who wants students to use a tool that reduces formatting errors and teaches paper structure indirectly.

---

## 6. Product Scope

## 6.1 In Scope for v1

- Desktop app for **macOS first**
- Workspace shell
- Course management
- Paper management inside courses
- Ghost-page paper templates for APA student and professional papers
- Paste-friendly semantic editor
- APA rules engine for deterministic formatting and structural checks
- Issues panel
- Reference manager
- In-text citations
- PDF export
- Local storage
- English and Spanish UI

## 6.2 Out of Scope for v1

- Real-time collaboration
- Cloud sync
- Mobile app
- MLA/Chicago styles
- Figures/tables with full APA automation
- Track changes / comments
- Journal submission workflows
- Auto-update infrastructure
- Advanced library sync integrations

## 6.3 Likely Phase 2

- DOCX export
- Windows packaging
- BibTeX/RIS import
- reusable course templates
- recent papers / quick actions
- reference reuse across papers within a course

---

## 7. Information Architecture

The product hierarchy is:

```text
Workspace
├── Courses
│   ├── Course Metadata
│   ├── Papers
│   │   ├── Paper Template
│   │   ├── Paper Metadata
│   │   ├── Sections
│   │   ├── References
│   │   └── Issues
│   └── Reusable Course Defaults
├── Quick Papers (optional / unfiled)
├── Templates
├── Recent
└── Settings
```

### 7.1 Workspace

A workspace is the user’s local academic environment.

### 7.2 Course

A course is the primary organizational unit.

Typical fields:
- course name,
- course code,
- professor name,
- institution,
- semester,
- default paper type,
- default language.

### 7.3 Paper

A paper belongs to a course by default. A paper may optionally exist in “Quick Papers” if the user starts outside a course.

### 7.4 Templates

Initial templates:
- APA Student Paper
- APA Student Paper with Abstract
- APA Professional Paper
- Blank APA Skeleton (advanced)

---

## 8. UX Concept

## 8.1 Overall Layout

The visual direction should resemble a modern workspace app:

- **Left sidebar**: navigation, courses, recent papers, templates
- **Center pane**: ghost-page editor / paper canvas
- **Right panel**: inspector, paper info, course info, references, issues
- **Top bar**: current location, actions, export

### 8.2 Ghost Pages

Ghost pages are visible instructional paper shells. They show where content belongs before the user types.

Examples:
- **Page 1**: Title Page with placeholders such as Title, Author, Institution, Course, Professor, Due Date
- **Page 2**: Abstract page if template requires it, otherwise body start
- **Body pages**: section-aware writing surface with heading guidance
- **References page**: scaffolded ending section with “References” header and empty-state guidance

Ghost pages are not decorative. They are part of the product’s instructional model.

### 8.3 Placeholder Behavior

Placeholders should be visible, descriptive, and removable once the user enters content.

Examples:
- “Professor name”
- “Course number and name”
- “Start your introduction here”
- “Add a Level 1 heading if your assignment requires major sections”
- “Your references will appear here in alphabetical order”

### 8.4 Copy-Paste Behavior

Paste must feel safe and predictable.

Supported paste behaviors:
- **Plain-text normalize**: strip external styling and map to current APA style
- **Smart structure preserve**: preserve paragraph breaks, bullet intent, italics/bold where valid, and basic heading intent when confidence is high
- **Paste and clean**: open preview dialog when content is complex

The product should default toward **clean APA-safe paste** rather than preserving foreign formatting.

### 8.5 Editing Philosophy

The user should feel like they are filling in a guided academic document, not wrestling with a design tool.

---

## 9. APA Rules Strategy

The app must distinguish among three rule types.

### 9.1 Deterministic Rules (Enforced)

These should be enforced automatically whenever supported:
- 1-inch margins
- page number placement
- student vs professional page-header behavior
- double spacing
- heading formatting
- 0.5-inch first-line paragraph indent where appropriate
- reference list hanging indent
- reference page starts on a new page
- block quotation formatting

### 9.2 Contextual Rules (Template/Assignment Driven)

These depend on template or user choice:
- abstract required vs omitted
- student paper vs professional paper
- author note presence
- running head presence
- optional sections by assignment type

### 9.3 Advisory Rules (Flagged, Not Hard-Blocked)

These should surface in the Issues panel instead of being forcibly blocked:
- citation/reference mismatches
- missing expected sections
- suspicious heading hierarchy
- possible overuse of manual line breaks
- suspicious pasted formatting

### 9.4 Supported APA Flexibility

APA Scholar should support valid APA choices, not only one rigid preset.

Initial examples of valid variation to support:
- approved font choices
- student papers with or without abstract depending on assignment
- optional professional-paper features where appropriate

---

## 10. Functional Requirements

## FR-1 Workspace and Navigation

Users must be able to:
- create, rename, archive, and delete courses,
- create papers inside a course,
- move papers between courses,
- open recent papers,
- create quick papers outside a course,
- search across courses and papers.

### Acceptance Criteria
- Sidebar shows all courses and nested papers.
- Course rows can expand/collapse.
- New paper creation asks for destination course or quick-paper mode.
- Recent papers reopen correctly.

## FR-2 Course Metadata and Defaults

Users must be able to store course-level metadata and reuse it in new papers.

### Acceptance Criteria
- A course can store professor, course code, institution, and semester.
- Creating a new paper in a course pre-fills title-page metadata fields from course defaults.
- User can override defaults per paper.

## FR-3 Paper Template Generation

When a paper is created, the app must generate a structured paper skeleton.

### Acceptance Criteria
- Page 1 ghost title page is created automatically.
- Page 2 follows template logic: abstract or body.
- References scaffold exists even if empty.
- Paper type can be changed between supported templates with controlled migration rules.

## FR-4 Ghost-Page Editor

The editor must present a page-like academic canvas with section-aware placeholders.

### Acceptance Criteria
- Title-page fields are visible as placeholders or resolved values.
- Body content starts in the correct region.
- Major sections are visually distinct.
- Empty sections show ghost guidance instead of blank emptiness.

## FR-5 Paste Engine

The editor must support paste-first writing workflows.

### Acceptance Criteria
- External formatting is sanitized by default.
- Paragraph breaks are preserved.
- Unsupported styling is removed safely.
- Complex paste can trigger a cleanup preview.
- Pasting never breaks the paper structure or margins.

## FR-6 APA Rules Engine and Issues Panel

The app must validate paper structure and formatting continuously.

### Acceptance Criteria
- Issues panel updates after edits and paste operations.
- Deterministic issues are auto-corrected where possible.
- Advisory issues show severity and suggested fix.
- Export warns if unresolved high-severity issues remain.

## FR-7 References and Citations

The app must support structured references and linked in-text citations.

### Acceptance Criteria
- User can create references manually.
- References are formatted and sorted automatically.
- Citations can be inserted from the reference list.
- Orphaned references/citations are flagged.

## FR-8 Export

The app must export a paper in a submission-ready format.

### Acceptance Criteria
- v1 exports PDF reliably from the semantic paper model.
- Export respects title page, page headers, references, and supported formatting rules.
- PDF output matches the app’s supported APA profile.

## FR-9 Localization

The app must support English and Spanish UI.

### Acceptance Criteria
- Core navigation, forms, tooltips, dialogs, and issues are localized.
- Paper content language is independent from UI language.
- Course and paper metadata may be entered in any language.

---

## 11. Success Metrics

### Primary Metrics

- User can create a course and first paper in under 3 minutes.
- At least 80% of pilot users understand where to enter title-page fields without help.
- Paste operations do not produce broken formatting in 95%+ of tested scenarios.
- PDF export passes internal deterministic APA checks for supported features.
- At least 70% of pilot users say the ghost-page structure makes writing easier.

### Secondary Metrics

- Repeat usage across multiple papers in the same course
- Number of formatting-related instructor corrections reported by users
- Reference/citation consistency rate

---

## 12. Non-Goals

The app is not trying to be:
- a universal word processor,
- a page-layout design application,
- a complete research database,
- a cloud collaboration suite,
- a citation style swiss-army knife.

---

## 13. Technical Product Decisions

### 13.1 Source of Truth

The paper is stored as structured data, not as arbitrary formatted markup.

### 13.2 Rendering Model

Ghost pages and export pages are derived from the paper model.

### 13.3 Safety Model

Renderer code must not access the filesystem or operating system APIs directly.

### 13.4 AI Development Requirement

All modules must expose explicit boundaries and typed contracts so that AI-assisted development can safely modify one subsystem without destabilizing the rest.

---

## 14. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---:|---|
| Trying to build a true Word-like paginator too early | High | Use semantic sections and derived paginated preview/export rather than live hard-pagination as source of truth |
| Paste behavior is too destructive | High | Provide smart paste modes and preview cleanup dialog |
| APA rules become too rigid for real assignments | Medium | Separate enforced rules from advisory rules and template-dependent rules |
| Workspace shell adds too much scope | Medium | Keep v1 workspace model simple: local only, single workspace, no accounts |
| DOCX export delays release | High | Keep PDF in v1 and move DOCX to Phase 2 |
| AI-assisted coding causes architecture drift | High | Use module boundaries, docs-first approach, and acceptance criteria per workstream |

---

## 15. Release Phasing

### Phase 1 — Foundation MVP

- app shell
- course and paper navigation
- course metadata
- ghost-page APA student paper template
- body editor
- paste engine v1
- issues panel v1
- PDF export
- macOS build

### Phase 2 — Academic Workflow MVP+

- professional paper template
- references and citations
- additional paper templates
- bilingual UI completion
- better issue coverage
- quick papers / recent papers

### Phase 3 — Distribution and Expansion

- DOCX export
- Windows build
- import flows
- course-level reusable references

---

## 16. MVP Definition

A student can:
1. create a course,
2. add professor/course metadata,
3. create a new APA paper inside that course,
4. see a ghost title page and ghost body structure,
5. paste and write content cleanly,
6. review issues,
7. manage references,
8. export a clean PDF for submission.

If that experience feels intuitive and reduces formatting stress, v1 is successful.

---

## 17. Appendix A — Initial Paper Templates

### APA Student Paper
- Title page
- Optional abstract
- Body
- References

### APA Student Paper with Abstract
- Title page
- Abstract
- Body
- References

### APA Professional Paper
- Title page
- Author note (if used)
- Abstract
- Body
- References

---

## 18. Appendix B — Design Language

The UI should feel:
- clean,
- focused,
- dark-mode friendly,
- workspace-oriented,
- modern but academic,
- instructional without feeling childish.

The visual inspiration is a warm-dark studio workspace (see `docs/UI/screen.png` for the reference screenshot and `docs/UI/code.html` for the reference HTML). The aesthetic uses flat panels with border separators, a warm brown/orange palette (`#1a1612` canvas, `#ff8c00` accent), and the Inter font family for UI chrome.

For the full design token reference, color palette, font specification, layout structure, and component architecture, see **`docs/UI/design-system.md`**.

### Workspace UI fonts
- **Inter** (bundled, variable woff2) — all workspace UI text
- **Material Symbols Outlined** (bundled, woff2) — all UI icons
- **Iowan Old Style / Palatino** (system) — paper canvas display text

These are distinct from the **APA paper fonts** listed in Appendix D, which apply only to the paper content rendered in the editor and PDF export.

---

## 19. Appendix C — External Reference Baseline

These official sources should guide the rules baseline and implementation:
- APA Style paper format guidance
- APA Style student/professional title page guidance
- APA Style page header guidance
- Electron security guidance
- Electron Forge packaging and signing guidance


## 20. Appendix D — Initial Supported APA 7 Current Baseline

The v1 rules profile should be based on the current APA 7 guidance supported by official APA Style resources.

### Page Setup
- 1-inch margins on all sides
- page numbers in the top-right header on all pages
- student papers: page header contains the page number only
- professional papers: page header contains page number and running head

### Title Page
- student title page supports title, author, affiliation, course number/name, instructor, and due date
- professional title page supports professional-paper metadata and running head behavior
- title-page fields are edited through structured forms, not freeform manual layout

### Typography and Spacing
- double spacing throughout supported paper regions
- left-aligned text with ragged right edge
- approved font choices should include the current official APA options the app elects to support from the official list
- initial font menu target: Aptos 12, Calibri 11, Arial 11, Georgia 11, Times New Roman 12, Lucida Sans Unicode 10, Computer Modern 10

### Paragraphs and Headings
- first-line paragraph indent of 0.5 inch where applicable
- heading levels 1–5 mapped to APA 7 rules
- block quotation formatting for quotations of 40 words or more

### Abstract and References
- student papers may omit the abstract unless the assignment or instructor requires one
- references page starts on a new page
- references are double spaced and use hanging indent

Any behavior beyond this supported baseline should be marked as either unsupported, template-dependent, or advisory.

---
