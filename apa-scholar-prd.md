# Product Requirements Document: APA Scholar

**Version**: 1.0
**Date**: 2026-03-07
**Author**: Sarah (Product Owner)
**Quality Score**: 91/100

---

## Executive Summary

APA Scholar is a free, open-source desktop application purpose-built for writing academic papers with strict APA 7th Edition formatting. Unlike general-purpose word processors that require manual formatting and rely on fragile templates, APA Scholar enforces APA rules at the editor level so authors can focus entirely on writing. The application features a rich text editor with built-in APA constraints, a full citation and reference manager with DOI auto-lookup, automatic title page generation for both student and professional paper formats, and pixel-perfect PDF and DOCX export.

Built with Electron, React, and TipTap, APA Scholar targets macOS first with Windows support following shortly after. The UI is bilingual (English and Spanish) from day one, serving the academic community in Puerto Rico and Latin America as a primary audience. The phased user rollout starts with the developer's own academic work, expands to students at Caribbean University-Ponce, and then targets the broader academic market.

The project addresses four critical pain points that every APA author faces: manually formatting headings, spacing, and margins for every paper; tedious reference and citation management; the absence of a tool that truly enforces APA rules rather than suggesting them; and export processes that consistently break APA formatting. By solving all four in a single, focused application, APA Scholar fills a gap that no existing free tool adequately addresses.

---

## Problem Statement

**Current Situation**: Academic authors writing APA-formatted papers currently rely on Microsoft Word or Google Docs with manual formatting or third-party templates. These tools do not enforce APA rules, meaning authors must independently verify every heading level, margin, font size, spacing value, title page layout, and reference format. Templates break frequently during editing, and exporting to PDF or DOCX often introduces formatting errors. Citation management requires separate tools (Zotero, Mendeley) that add friction to the writing workflow. For Spanish-speaking academics, the situation is worse since most academic writing tools are English-only.

**Proposed Solution**: A dedicated desktop editor that makes APA 7th Edition compliance automatic and unavoidable. The editor constrains formatting choices to APA-valid options, auto-generates title pages, manages references with DOI lookup, inserts in-text citations, and exports to PDF and DOCX with guaranteed APA compliance. Bilingual UI (EN/ES) serves underserved academic markets.

**Business Impact**: As an open-source tool, APA Scholar aims to become the standard free writing tool for APA papers, building community adoption through Caribbean University-Ponce and expanding across PR/LatAm academic institutions. Success is measured by adoption, contribution, and user satisfaction rather than revenue.

---

## Success Metrics

**Primary KPIs:**

- **Adoption**: 100+ active users within 6 months of public release, measured via GitHub stars, downloads, and opt-in anonymous usage telemetry
- **Export Accuracy**: 100% APA compliance on exported PDF/DOCX as validated against APA 7th Edition Publication Manual checklist (automated test suite)
- **User Retention**: 60%+ of users who create a paper return to create a second, measured via opt-in telemetry
- **Community Health**: 10+ GitHub contributors within first year; issues responded to within 48 hours

**Validation**: Monthly review of GitHub analytics (stars, forks, clones), download counts from release pages, and optional in-app feedback surveys. APA compliance validated through an automated test suite that checks exported documents against a 50-point APA formatting checklist.

---

## User Personas

### Primary: Andres (Developer & Academic Author)
- **Role**: Senior developer and university instructor pursuing a master's in industrial psychology
- **Goals**: Write APA-formatted academic papers efficiently without fighting Word formatting; build a tool that also helps his students
- **Pain Points**: Spends excessive time on formatting instead of content; exports from Word break APA compliance; no single tool combines writing, citations, and APA enforcement
- **Technical Level**: Advanced

### Secondary: Maria (Graduate Student)
- **Role**: Master's student at a Puerto Rico university
- **Goals**: Submit properly formatted APA papers without needing to memorize the Publication Manual; manage citations for research papers
- **Pain Points**: Unsure which APA heading level to use; forgets running head rules; wastes time manually formatting references; instructor returns papers for formatting issues
- **Technical Level**: Intermediate
- **Language**: Spanish-dominant, comfortable with bilingual interfaces

### Tertiary: Professor García (Instructor)
- **Role**: University professor who assigns APA-formatted papers
- **Goals**: Recommend a free tool to students that ensures proper formatting; reduce time spent grading formatting issues
- **Pain Points**: Students consistently submit papers with APA violations; existing free tools are inadequate; paid tools are too expensive for student budgets
- **Technical Level**: Novice to Intermediate

---

## User Stories & Acceptance Criteria

### Story 1: Write an APA-Formatted Paper

**As a** graduate student
**I want to** write my paper in an editor that automatically enforces APA formatting
**So that** I can focus on content and be confident my formatting is correct

**Acceptance Criteria:**
- [ ] Editor defaults to Times New Roman 12pt, double-spaced, 1-inch margins
- [ ] Font selector only offers APA-accepted fonts: Times New Roman (12pt), Calibri (11pt), Arial (11pt), Georgia (11pt)
- [ ] Font size automatically adjusts to the APA-specified size for the selected font
- [ ] Heading levels 1-5 are available and automatically styled per APA 7 rules (Level 1: centered bold, Level 2: left-aligned bold, Level 3: left-aligned bold italic, Level 4: indented bold with period, Level 5: indented bold italic with period)
- [ ] Paragraphs auto-indent 0.5 inches on first line
- [ ] Users cannot change margins, line spacing, or add non-APA formatting
- [ ] Block quotes (40+ words) are automatically formatted with 0.5-inch left indent, no quotation marks

### Story 2: Generate a Title Page

**As an** academic author
**I want to** auto-generate a correctly formatted title page
**So that** I don't have to manually position and format title page elements

**Acceptance Criteria:**
- [ ] Toggle between Student Paper and Professional Paper format
- [ ] Student paper title page includes: title (bold, centered, upper half), author name, institutional affiliation, course number and name, instructor name, assignment due date
- [ ] Professional paper title page includes: title (bold, centered, upper half), author name(s), institutional affiliation(s), author note
- [ ] Running head appears on all pages for professional papers (shortened title, max 50 characters, left-aligned header)
- [ ] Page numbers appear top-right on all pages starting from the title page
- [ ] Title page fields are editable via a sidebar form, not directly on the page

### Story 3: Manage References and Insert Citations

**As a** researcher
**I want to** manage my reference list and insert in-text citations
**So that** my references are always properly formatted and consistent

**Acceptance Criteria:**
- [ ] Add references manually via structured form fields (authors, year, title, source, volume, issue, pages, DOI, URL)
- [ ] Support reference types: journal article, book, edited book chapter, website, conference paper
- [ ] Paste a DOI and auto-populate all reference fields via CrossRef API lookup
- [ ] Import references from BibTeX (.bib) and RIS (.ris) files
- [ ] References auto-sort alphabetically by first author's last name
- [ ] References auto-format with hanging indent (0.5 inch)
- [ ] Insert in-text citation at cursor position: parenthetical (Author, Year) or narrative Author (Year)
- [ ] In-text citations are linked to reference entries; deleting a reference flags orphaned citations
- [ ] Multiple authors follow APA rules: 1-2 authors listed, 3+ uses "et al." after first citation

### Story 4: Export to PDF and DOCX

**As an** academic author
**I want to** export my paper as a properly formatted PDF or DOCX
**So that** I can submit it to my instructor or journal with confidence

**Acceptance Criteria:**
- [ ] PDF export produces a pixel-perfect APA-compliant document via Electron's native printToPDF
- [ ] DOCX export generates a proper Word document using the `docx` npm library with correct styles, fonts, margins, and spacing
- [ ] Exported documents include: title page, abstract (if present), body with headings, references page
- [ ] Page numbers appear in the top-right header on every page
- [ ] Running head (professional papers) appears in the top-left header on every page
- [ ] References page starts on a new page with centered "References" heading
- [ ] Hanging indent (0.5 inch) is preserved in both PDF and DOCX exports

### Story 5: Work in My Language

**As a** Spanish-speaking student
**I want to** use the application in Spanish
**So that** I can navigate the interface without language barriers

**Acceptance Criteria:**
- [ ] Full UI available in English and Spanish
- [ ] Language toggle accessible from settings or menu bar
- [ ] All labels, tooltips, menu items, error messages, and placeholder text are translated
- [ ] Language preference persists across sessions
- [ ] Paper content remains in whatever language the user writes in (no auto-translation of content)
- [ ] APA section headings (Abstract, References) remain in the language of the paper, not the UI

---

## Functional Requirements

### Core Features

**Feature 1: APA-Strict Rich Text Editor**

The editor is built on TipTap (ProseMirror) with React, configured to constrain all formatting to APA 7th Edition rules. The user cannot change margins (fixed at 1 inch), line spacing (fixed at double), or select non-APA fonts. The font selector presents four APA-accepted options, each locked to its correct point size. Heading levels 1-5 are exposed via toolbar dropdown and keyboard shortcuts, each auto-styled per APA rules. Paragraphs receive automatic 0.5-inch first-line indentation. The editor renders content on a simulated page canvas (8.5 × 11 inch proportions) for WYSIWYG accuracy.

User flow: Open app → new paper created with defaults → write in body section → switch sections via tabs (Body, Abstract) → use toolbar or shortcuts for headings, bold, italic, underline → content auto-formats to APA.

Edge cases: Pasting content from external sources strips non-APA formatting. Attempting to apply formatting not available in the toolbar has no effect. Empty documents still show correct page layout.

Error handling: If TipTap encounters a rendering error, editor gracefully degrades to last saved state with a notification.

**Feature 2: Reference Manager with DOI Lookup**

A sidebar panel for managing references with structured entry forms. Supports manual entry and DOI auto-lookup via the CrossRef API. BibTeX and RIS file import parses entries and maps fields to internal reference schema. References are stored as part of the document JSON and auto-sorted alphabetically. Each reference displays its APA-formatted preview in real time.

User flow: Open References panel → click "Add Reference" → choose type → enter fields manually OR paste DOI for auto-fill → save → reference appears in sorted list with APA preview. For import: click "Import" → select .bib or .ris file → preview parsed entries → confirm import.

Edge cases: DOI lookup fails (network error, invalid DOI) → show error with option to enter manually. Duplicate DOIs are detected and flagged. Malformed BibTeX/RIS files show a parse error with line number.

**Feature 3: In-Text Citation Insertion**

From the reference panel, users can insert a citation at the current cursor position. Two modes: parenthetical citation "(Author, Year)" and narrative citation "Author (Year)". The citation is rendered as a styled, non-editable inline node in the editor that links to its reference entry.

User flow: Position cursor in text → open References panel → click citation icon next to a reference → choose parenthetical or narrative → citation inserted at cursor.

Edge cases: Multiple citations at same position are combined: "(Author1, Year; Author2, Year)". If the linked reference is deleted, the citation is highlighted with a warning. Citations in the Abstract section are allowed per APA 7.

**Feature 4: Title Page Auto-Generation**

The title page is not directly editable in the main editor. Instead, a sidebar form captures all metadata (title, authors, affiliations, course info, etc.) and the title page is rendered automatically based on the Student/Professional toggle. Changes to the form update the title page preview in real time.

User flow: Open Paper Info panel → fill in metadata fields → toggle Student/Professional → title page updates automatically → title page appears as first page in editor preview and exports.

Edge cases: Missing required fields (title, author) show inline validation warnings. Very long titles wrap correctly. Multiple authors are stacked vertically with their affiliations.

**Feature 5: PDF and DOCX Export**

PDF export uses Electron's `webContents.printToPDF()` with an offscreen window that renders the full APA-formatted HTML (title page, abstract, body, references) at Letter size with 1-inch margins. DOCX export uses the `docx` npm library to programmatically construct a Word document with proper styles, fonts, heading levels, and page setup.

User flow: Open Export panel → click "Export as PDF" or "Export as DOCX" → save dialog → file saved to chosen location.

Edge cases: Very long papers (50+ pages) may take several seconds for DOCX generation; show a progress indicator. Papers with no references omit the references page. Papers with no abstract omit that page.

**Feature 6: Bilingual UI (EN/ES)**

Internationalization is implemented using a JSON-based i18n system (e.g., `i18next` with React). All UI strings are externalized into locale files. The language toggle is accessible from the app's settings menu. Language preference is stored in a local config file and persists across sessions.

### Out of Scope (v1)

- MLA, Chicago, or other citation style support
- Cloud sync or collaboration features
- Spell check beyond browser/OS native spell check
- Image/figure insertion with APA captions
- Table insertion with APA table formatting
- Footnotes and endnotes
- Table of Contents generation
- Track changes or commenting
- Mobile or web version
- Auto-update mechanism (manual download for updates)

---

## Technical Constraints

### Performance

- App launch to editor-ready: under 3 seconds on modern hardware
- Keystroke-to-render latency: under 50ms
- DOI lookup response: under 3 seconds (network dependent; show loading state)
- PDF export: under 5 seconds for a 25-page paper
- DOCX export: under 10 seconds for a 25-page paper
- Memory usage: under 300MB for a 50-page paper with 100 references

### Security

- No user accounts or authentication required
- No data leaves the device except CrossRef API calls (DOI lookup, read-only)
- CrossRef API calls use HTTPS only
- Documents stored as local JSON files; no encryption needed for v1
- No telemetry without explicit opt-in

### Integration

- **CrossRef API**: RESTful API for DOI metadata lookup. Free tier with polite pool (include mailto in User-Agent). Endpoint: `https://api.crossref.org/works/{doi}`
- **BibTeX Parser**: Parse .bib files using `@retorquere/bibtex-parser` or similar npm library
- **RIS Parser**: Parse .ris files using custom parser or `ris-parser` npm library

### Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Shell | Electron | 31+ |
| Frontend | React | 18+ |
| Editor | TipTap 2 (ProseMirror) | 2.6+ |
| Styling | CSS Modules or Tailwind CSS | — |
| i18n | i18next + react-i18next | — |
| DOCX Export | docx (npm) | 8.5+ |
| PDF Export | Electron printToPDF (native) | — |
| Build/Package | electron-builder | 24+ |
| Citations | CrossRef REST API | — |
| BibTeX Import | @retorquere/bibtex-parser | — |

### Compatibility

- **macOS**: 12+ (Monterey and later), Apple Silicon and Intel (universal binary)
- **Windows**: 10+ (64-bit), target after macOS launch
- **Document format**: Custom `.apapaper` (JSON) for save/open; PDF and DOCX for export

---

## MVP Scope & Phasing

### Phase 1: MVP (Required for Initial Launch)

1. **Rich text editor** with strict APA formatting (fonts, spacing, margins, heading levels 1-5, paragraph indentation, block quotes)
2. **Reference manager** with manual entry, DOI auto-lookup, and APA-formatted reference list
3. **In-text citation insertion** (parenthetical and narrative) linked to reference entries
4. **Title page auto-generation** with Student/Professional toggle
5. **PDF and DOCX export** with full APA compliance
6. **Bilingual UI** (English/Spanish)
7. **Save/Open** using `.apapaper` local file format
8. **macOS build** (DMG, universal binary)

**MVP Definition**: A user can create a new paper, write content with APA-enforced formatting, add references (manually or via DOI), insert in-text citations, generate a proper title page, and export to PDF or DOCX that passes APA 7th Edition formatting review. All in English or Spanish.

### Phase 2: Enhancements (Post-Launch)

- Windows build (NSIS installer)
- BibTeX and RIS file import
- Multiple citation combination at same position
- Orphaned citation detection and cleanup
- Keyboard shortcut customization
- Recent documents list
- Auto-save with recovery
- APA compliance checker (scan document and flag issues)

### Phase 3: Future Considerations

- Image/figure support with APA captions and figure numbers
- APA table formatting
- Table of Contents generation
- Footnotes and endnotes
- MLA and Chicago style support
- Plugin system for community extensions
- Light/dark theme toggle
- Zotero direct integration (beyond file import)
- Web-based version (Electron → web migration)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| CrossRef API rate limiting or downtime | Medium | Low | Implement retry with backoff; manual entry always available as fallback; cache DOI results locally |
| TipTap extensions insufficient for APA constraints | Low | High | ProseMirror allows custom node/mark development; evaluate early with proof-of-concept for strict formatting constraints |
| DOCX export formatting discrepancies across Word versions | Medium | Medium | Test exported files in Word 2019, 365, and LibreOffice; maintain a compliance test suite |
| PDF rendering inconsistencies across platforms | Low | Medium | Use Electron's Chromium renderer which is consistent; test on macOS 12-15 |
| User adoption slower than expected | Medium | Low | Open source reduces barrier; leverage Caribbean University-Ponce as pilot user base; gather feedback early |
| APA 8th Edition released during development | Low | Medium | Modular format engine allows version switching; APA editions are typically 10+ years apart |
| Electron app size too large for student machines | Medium | Low | Target under 200MB bundled; Electron universal binary compression; lazy-load non-critical features |

---

## Dependencies & Blockers

**Dependencies:**
- **CrossRef API availability**: Required for DOI lookup feature. Free tier with polite-use headers. No API key required.
- **Electron 31+ stable release**: Required for consistent printToPDF behavior and macOS universal binary support
- **TipTap React bindings**: Must support custom node types for citation marks and constrained formatting
- **Apple Developer Certificate** (optional): Required only for signed/notarized macOS distribution; not required for direct download

**Known Blockers:**
- None currently identified. All technologies are available and proven.

---

## Appendix

### APA 7th Edition Quick Reference

- **Margins**: 1 inch on all sides
- **Font options**: Times New Roman (12pt), Calibri (11pt), Arial (11pt), Georgia (11pt)
- **Line spacing**: Double-spaced throughout, including title page, abstract, body, and references
- **Paragraph indent**: 0.5 inch first-line indent (exceptions: abstract, block quotes, title, headings, table/figure notes, reference entries)
- **Heading levels**:
  - Level 1: Centered, Bold, Title Case
  - Level 2: Left-Aligned, Bold, Title Case
  - Level 3: Left-Aligned, Bold Italic, Title Case
  - Level 4: Indented 0.5", Bold, Title Case, Ending With a Period.
  - Level 5: Indented 0.5", Bold Italic, Title Case, Ending With a Period.
- **Running head** (professional papers only): Shortened title, max 50 characters, all caps, top-left header
- **Page numbers**: Top-right header, all pages including title page
- **References**: Hanging indent (0.5 inch), double-spaced, alphabetical by first author

### Document File Format (.apapaper)

```json
{
  "version": "1.0",
  "format": "apa7",
  "meta": {
    "title": "string",
    "runningHead": "string (max 50 chars)",
    "paperType": "student | professional",
    "authors": [{ "name": "string", "affiliation": "string" }],
    "courseInfo": "string",
    "instructorName": "string",
    "dueDate": "string",
    "authorNote": "string",
    "createdAt": "ISO 8601",
    "updatedAt": "ISO 8601"
  },
  "sections": {
    "abstract": "TipTap JSON | null",
    "body": "TipTap JSON"
  },
  "references": [
    {
      "id": "uuid",
      "type": "journal | book | chapter | website | conference",
      "authors": "string (APA format)",
      "year": "string",
      "title": "string",
      "source": "string",
      "volume": "string",
      "issue": "string",
      "pages": "string",
      "doi": "string",
      "url": "string"
    }
  ],
  "settings": {
    "font": "timesNewRoman | calibri | arial | georgia",
    "language": "en | es"
  }
}
```

### References

- [APA 7th Edition Publication Manual](https://apastyle.apa.org/products/publication-manual-7th-edition)
- [TipTap Editor Documentation](https://tiptap.dev/)
- [Electron Documentation](https://www.electronjs.org/docs)
- [CrossRef API Documentation](https://api.crossref.org/)
- [docx npm library](https://docx.js.org/)

---

*This PRD was created through interactive requirements gathering with quality scoring to ensure comprehensive coverage of business, functional, UX, and technical dimensions.*
