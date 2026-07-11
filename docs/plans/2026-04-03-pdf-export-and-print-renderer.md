# PDF Export and Print Renderer Implementation Plan

**Lifecycle status:** Partially completed and superseded for current-state guidance.

**Current source of truth:** [`docs/project-status.md`](../project-status.md), [`docs/architecture.md`](../architecture.md), and the reopened Milestone 03 export tasks. The initial print pipeline exists, while export preflight, placeholder removal, overflow pagination, rendered goldens, and real E2E export acceptance remain open.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Produce reliable PDF output from the semantic paper model via Electron's `printToPDF`.

**Architecture:** A hidden `BrowserWindow` loads a print-only React renderer that converts `PrintPageViewModel[]` into static APA-formatted HTML. The main process creates the window, waits for a ready signal, calls `printToPDF`, writes the buffer to disk, and destroys the window. The print view model is a pure domain function (no DOM, no editor) that maps the same `Paper + PaperMeta + PaperContent + ReferenceEntry[]` inputs into static blocks with pre-rendered HTML.

**Tech Stack:** Electron 40 (`webContents.printToPDF`), React 19, Vite 7 + Electron Forge VitePlugin (multi-renderer), Zod, Vitest

---

## Task 1: Body Editor Document to HTML Serializer

**Files:**
- Create: `src/domain/papers/body-editor-to-html.ts`
- Test: `tests/unit/domain/body-editor-to-html.test.ts`

This is a pure function with zero dependencies on React or Electron — ideal TDD target.

**Step 1: Write the failing test**

```typescript
// tests/unit/domain/body-editor-to-html.test.ts
import { describe, expect, it } from 'vitest';
import { bodyEditorDocumentToHtml } from '@domain/papers/body-editor-to-html';
import type { BodyEditorDocument } from '@domain/papers/body-editor-document';

const emptyDoc: BodyEditorDocument = { type: 'doc', content: [] };

describe('bodyEditorDocumentToHtml', () => {
  it('returns empty string for empty document', () => {
    expect(bodyEditorDocumentToHtml(emptyDoc)).toBe('');
  });

  it('renders a paragraph', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] }],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe('<p>Hello world</p>');
  });

  it('renders bold and italic marks', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [
          { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
          { type: 'text', text: ' and ' },
          { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
        ],
      }],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe('<p><strong>bold</strong> and <em>italic</em></p>');
  });

  it('renders heading levels 1-5', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'H1' }] },
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'H3' }] },
      ],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe('<h1>H1</h1><h3>H3</h3>');
  });

  it('renders blockquotes with nested paragraphs', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [{
        type: 'blockquote',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quoted' }] }],
      }],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe('<blockquote><p>Quoted</p></blockquote>');
  });

  it('renders hard breaks as <br>', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Line 1' },
          { type: 'hardBreak' },
          { type: 'text', text: 'Line 2' },
        ],
      }],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe('<p>Line 1<br>Line 2</p>');
  });

  it('renders citation marks as plain text', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: '(Smith, 2020)',
          marks: [{ type: 'citation', attrs: { referenceId: 'ref-1' } }],
        }],
      }],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe('<p>(Smith, 2020)</p>');
  });

  it('escapes HTML entities in text', () => {
    const doc: BodyEditorDocument = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '5 < 10 & 10 > 5' }] }],
    };
    expect(bodyEditorDocumentToHtml(doc)).toBe('<p>5 &lt; 10 &amp; 10 &gt; 5</p>');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/domain/body-editor-to-html.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// src/domain/papers/body-editor-to-html.ts
import type {
  BodyEditorBlockNode,
  BodyEditorDocument,
  BodyEditorInlineNode,
  BodyEditorMark,
} from '@domain/papers/body-editor-schema';

const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const renderMarks = (text: string, marks?: BodyEditorMark[]): string => {
  if (!marks || marks.length === 0) return escapeHtml(text);

  let result = escapeHtml(text);

  for (const mark of marks) {
    if (mark.type === 'bold') result = `<strong>${result}</strong>`;
    if (mark.type === 'italic') result = `<em>${result}</em>`;
    // citation marks render as plain text in print
  }

  return result;
};

const renderInlineNode = (node: BodyEditorInlineNode): string => {
  if (node.type === 'hardBreak') return '<br>';
  return renderMarks(node.text, node.marks);
};

const renderInlineContent = (content?: BodyEditorInlineNode[]): string =>
  (content ?? []).map(renderInlineNode).join('');

const renderBlockNode = (node: BodyEditorBlockNode): string => {
  switch (node.type) {
    case 'paragraph':
      return `<p>${renderInlineContent(node.content)}</p>`;
    case 'heading':
      return `<h${node.attrs.level}>${renderInlineContent(node.content)}</h${node.attrs.level}>`;
    case 'blockquote':
      return `<blockquote>${node.content.map(renderBlockNode).join('')}</blockquote>`;
  }
};

export const bodyEditorDocumentToHtml = (doc: BodyEditorDocument): string =>
  (doc.content ?? []).map(renderBlockNode).join('');
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/domain/body-editor-to-html.test.ts`
Expected: PASS (8 tests)

**Step 5: Commit**

```bash
git add src/domain/papers/body-editor-to-html.ts tests/unit/domain/body-editor-to-html.test.ts
git commit -m "feat: add body editor document to HTML serializer for print export"
```

---

## Task 2: Print Page View Model

**Files:**
- Create: `src/domain/papers/print-page-view-model.ts`
- Test: `tests/unit/domain/print-page-view-model.test.ts`

Pure domain function — no React, no Electron. Builds `PrintPageViewModel[]` from the same inputs as `buildGhostPageViewModels` but with static HTML blocks.

**Step 1: Write the failing test**

```typescript
// tests/unit/domain/print-page-view-model.test.ts
import { describe, expect, it } from 'vitest';
import { createEmptyBodyEditorDocument } from '@domain/papers/body-editor-document';
import { createEmptyRichTextDocument } from '@domain/shared/entity-helpers';
import type { Paper, PaperContent, PaperMeta } from '@domain/shared/persistence-models';
import type { ReferenceEntry } from '@domain/references/reference-entry';
import { buildPrintPageViewModels } from '@domain/papers/print-page-view-model';

const createPaper = (overrides: Partial<Paper> = {}): Paper => ({
  archivedAt: null, courseId: 'course-1', createdAt: '2026-03-07T14:00:00.000Z',
  id: 'paper-1', language: 'en', paperType: 'student', status: 'draft',
  templateId: 'apa-student', title: 'Capstone Draft', updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createPaperMeta = (overrides: Partial<PaperMeta> = {}): PaperMeta => ({
  abstractEnabled: false, authorName: null, authorNote: null, courseCode: null,
  courseName: null, createdAt: '2026-03-07T14:00:00.000Z', dueDate: null,
  institution: null, paperId: 'paper-1', professorName: null, runningHead: null,
  shortTitle: null, title: 'Capstone Draft', updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

const createPaperContent = (overrides: Partial<PaperContent> = {}): PaperContent => ({
  abstractDoc: createEmptyRichTextDocument(), bodyDoc: createEmptyBodyEditorDocument(),
  createdAt: '2026-03-07T14:00:00.000Z', paperId: 'paper-1',
  updatedAt: '2026-03-07T14:00:00.000Z', ...overrides,
});

const createReference = (overrides: Partial<ReferenceEntry> = {}): ReferenceEntry => ({
  id: 'ref-1', paperId: 'paper-1', referenceType: 'journal-article',
  fields: { authors: [{ family: 'Smith', given: 'John' }], year: '2020',
    title: 'Test Article', journalName: 'Test Journal' },
  sortKey: 'smith|2020|test article',
  createdAt: '2026-03-07T14:00:00.000Z', updatedAt: '2026-03-07T14:00:00.000Z',
  ...overrides,
});

describe('buildPrintPageViewModels', () => {
  it('builds title, body, and references pages for a student paper', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper(),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta(),
    });

    expect(pages.map((p) => p.kind)).toEqual(['title-page', 'body-page', 'references-page']);
  });

  it('includes abstract page when enabled', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper({ templateId: 'apa-student-abstract' }),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta({ abstractEnabled: true }),
    });

    expect(pages.map((p) => p.kind)).toEqual([
      'title-page', 'abstract-page', 'body-page', 'references-page',
    ]);
  });

  it('uses body-html kind instead of body-editor', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper(),
      paperContent: createPaperContent({
        bodyDoc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] },
      }),
      paperMeta: createPaperMeta(),
    });

    const bodyPage = pages.find((p) => p.kind === 'body-page')!;
    const bodyBlock = bodyPage.blocks.find((b) => b.kind === 'body-html');
    expect(bodyBlock).toBeDefined();
    expect(bodyBlock!.html).toContain('<p>Hello</p>');
  });

  it('uses reference-entry kind with HTML containing italic segments', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper(),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta(),
      references: [createReference()],
    });

    const refsPage = pages.find((p) => p.kind === 'references-page')!;
    const refBlock = refsPage.blocks.find((b) => b.kind === 'reference-entry');
    expect(refBlock).toBeDefined();
    expect(refBlock!.html).toContain('<em>');
  });

  it('adds running head for professional papers', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper({ paperType: 'professional' }),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta({ runningHead: 'SHORT TITLE' }),
    });

    expect(pages[0]!.header.left).toBe('SHORT TITLE');
  });

  it('numbers pages sequentially', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper({ templateId: 'apa-student-abstract' }),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta({ abstractEnabled: true }),
    });

    expect(pages.map((p) => p.header.right)).toEqual(['1', '2', '3', '4']);
  });

  it('omits empty-state and textarea blocks', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper(),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta(),
    });

    const allBlocks = pages.flatMap((p) => p.blocks);
    expect(allBlocks.some((b) => b.kind === 'empty-state' || b.kind === 'textarea')).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/domain/print-page-view-model.test.ts`
Expected: FAIL — module not found

**Step 3: Write minimal implementation**

```typescript
// src/domain/papers/print-page-view-model.ts
import { bodyEditorDocumentToHtml } from '@domain/papers/body-editor-to-html';
import { deserializeBodyEditorDocument } from '@domain/papers/body-editor-serialization';
import { getGhostPageStrings } from '@domain/papers/ghost-page-strings';
import { formatReferenceApa } from '@domain/references/apa-formatter';
import type { ReferenceEntry } from '@domain/references/reference-entry';
import { abstractEnabledTemplates } from '@domain/shared/contracts';
import type { Language } from '@domain/shared/contracts';
import type { Paper, PaperContent, PaperMeta } from '@domain/shared/persistence-models';

export interface PrintPageBlock {
  kind: 'title' | 'line' | 'section-heading' | 'body-html' | 'reference-entry';
  html: string;
  align?: 'center' | 'left';
}

export interface PrintPageViewModel {
  kind: 'title-page' | 'abstract-page' | 'body-page' | 'references-page';
  header: { left?: string; right: string };
  blocks: PrintPageBlock[];
}

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const getDisplayValue = (value: string | null, fallback: string): string =>
  value?.trim() ? value : fallback;

const formatReferenceHtml = (entry: ReferenceEntry): string =>
  formatReferenceApa(entry)
    .map((seg) => (seg.italic ? `<em>${escapeHtml(seg.text)}</em>` : escapeHtml(seg.text)))
    .join('');

export const buildPrintPageViewModels = (input: {
  language?: Language;
  paper: Paper;
  paperContent: PaperContent;
  paperMeta: PaperMeta;
  references?: ReferenceEntry[];
}): PrintPageViewModel[] => {
  const lang = input.language ?? 'en';
  const s = getGhostPageStrings(lang);

  const getHeader = (pageNumber: number): PrintPageViewModel['header'] => ({
    left: input.paper.paperType === 'professional'
      ? getDisplayValue(input.paperMeta.runningHead, s.runningHead)
      : undefined,
    right: `${pageNumber}`,
  });

  const titleBlocks: PrintPageBlock[] =
    input.paper.paperType === 'professional'
      ? [
          { kind: 'line', html: escapeHtml(`${s.runningHeadPrefix} ${getDisplayValue(input.paperMeta.runningHead, s.runningHead)}`) },
          { kind: 'title', html: escapeHtml(input.paperMeta.title), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.authorName, s.authorName)), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.institution, s.institution)), align: 'center' },
          { kind: 'line', html: escapeHtml(s.authorNote), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.authorNote, s.authorNotePlaceholder)), align: 'center' },
        ]
      : [
          { kind: 'title', html: escapeHtml(input.paperMeta.title), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.authorName, s.studentName)), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.institution, s.institution)), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.courseName, s.courseName)), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.professorName, s.professorName)), align: 'center' },
          { kind: 'line', html: escapeHtml(getDisplayValue(input.paperMeta.dueDate, s.dueDate)), align: 'center' },
        ];

  const pages: PrintPageViewModel[] = [
    { kind: 'title-page', header: getHeader(1), blocks: titleBlocks },
  ];

  const hasAbstract = input.paperMeta.abstractEnabled || abstractEnabledTemplates.has(input.paper.templateId);

  if (hasAbstract) {
    pages.push({
      kind: 'abstract-page',
      header: getHeader(pages.length + 1),
      blocks: [
        { kind: 'section-heading', html: escapeHtml(s.abstract), align: 'center' },
      ],
    });
  }

  const bodyDoc = deserializeBodyEditorDocument(input.paperContent.bodyDoc);
  const bodyHtml = bodyEditorDocumentToHtml(bodyDoc);

  pages.push({
    kind: 'body-page',
    header: getHeader(pages.length + 1),
    blocks: [
      { kind: 'section-heading', html: escapeHtml(input.paperMeta.title), align: 'center' },
      { kind: 'body-html', html: bodyHtml },
    ],
  });

  const references = input.references ?? [];
  const sorted = [...references].sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  pages.push({
    kind: 'references-page',
    header: getHeader(pages.length + 1),
    blocks: [
      { kind: 'section-heading', html: escapeHtml(s.references), align: 'center' },
      ...sorted.map((ref) => ({
        kind: 'reference-entry' as const,
        html: formatReferenceHtml(ref),
      })),
    ],
  });

  return pages;
};
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/domain/print-page-view-model.test.ts`
Expected: PASS (7 tests)

**Step 5: Commit**

```bash
git add src/domain/papers/print-page-view-model.ts tests/unit/domain/print-page-view-model.test.ts
git commit -m "feat: add print page view model generator"
```

---

## Task 3: Print Renderer React Components + CSS

**Files:**
- Create: `src/renderer/print/PrintRenderer.tsx`
- Create: `src/renderer/print/PrintPage.tsx`
- Create: `src/renderer/print/PrintBlock.tsx`
- Create: `src/renderer/print/print.css`
- Create: `src/renderer/print/main.tsx`
- Create: `print.html`

No tests for this task — these are thin rendering components. They'll be covered by snapshot tests in Task 6.

**Step 1: Create `print.css`**

```css
/* src/renderer/print/print.css */
@page {
  size: letter;
  margin: 0;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Times New Roman', 'Georgia', serif;
  font-size: 12pt;
  line-height: 2;
  color: #000;
  background: #fff;
}

.print-page {
  width: 8.5in;
  min-height: 11in;
  padding: 1in;
  page-break-after: always;
  position: relative;
}

.print-page:last-child {
  page-break-after: auto;
}

.print-header {
  position: absolute;
  top: 0.5in;
  left: 1in;
  right: 1in;
  display: flex;
  justify-content: space-between;
  font-size: 12pt;
  line-height: 1;
}

.print-header-left {
  text-transform: uppercase;
}

.print-blocks {
  padding-top: 0.5in;
}

.print-blocks--title-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 9in;
  text-align: center;
}

.print-block--title {
  font-weight: bold;
  text-align: center;
}

.print-block--line {
  text-align: center;
}

.print-block--section-heading {
  font-weight: bold;
  text-align: center;
}

.print-block--body-html p {
  text-indent: 0.5in;
}

.print-block--body-html p:first-child {
  text-indent: 0;
}

.print-block--body-html h1 { text-align: center; font-weight: bold; }
.print-block--body-html h2 { text-align: left; font-weight: bold; }
.print-block--body-html h3 { text-align: left; font-weight: bold; font-style: italic; }
.print-block--body-html h4 { text-indent: 0.5in; font-weight: bold; }
.print-block--body-html h5 { text-indent: 0.5in; font-weight: bold; font-style: italic; }

.print-block--body-html blockquote {
  margin-left: 0.5in;
}

.print-block--body-html blockquote p {
  text-indent: 0;
}

.print-block--reference-entry {
  padding-left: 0.5in;
  text-indent: -0.5in;
}
```

**Step 2: Create `PrintBlock.tsx`**

```tsx
// src/renderer/print/PrintBlock.tsx
import type { PrintPageBlock } from '@domain/papers/print-page-view-model';

export const PrintBlock = ({ block }: { block: PrintPageBlock }) => {
  if (block.kind === 'body-html') {
    return (
      <div
        className="print-block--body-html"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    );
  }

  return (
    <p
      className={`print-block--${block.kind}`}
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
};
```

**Step 3: Create `PrintPage.tsx`**

```tsx
// src/renderer/print/PrintPage.tsx
import type { PrintPageViewModel } from '@domain/papers/print-page-view-model';
import { PrintBlock } from '@renderer/print/PrintBlock';

export const PrintPage = ({ page }: { page: PrintPageViewModel }) => (
  <article className="print-page">
    <div className="print-header">
      {page.header.left ? (
        <span className="print-header-left">{page.header.left}</span>
      ) : <span />}
      <span>{page.header.right}</span>
    </div>
    <div className={`print-blocks${page.kind === 'title-page' ? ' print-blocks--title-page' : ''}`}>
      {page.blocks.map((block, index) => (
        <PrintBlock block={block} key={index} />
      ))}
    </div>
  </article>
);
```

**Step 4: Create `PrintRenderer.tsx`**

```tsx
// src/renderer/print/PrintRenderer.tsx
import { useEffect, useState } from 'react';
import { buildPrintPageViewModels, type PrintPageViewModel } from '@domain/papers/print-page-view-model';
import type { StoredPaperAggregate } from '@domain/papers/paper-draft';
import type { ReferenceEntry } from '@domain/references/reference-entry';
import { PrintPage } from '@renderer/print/PrintPage';

interface ExportData {
  aggregate: StoredPaperAggregate;
  references: ReferenceEntry[];
}

export const PrintRenderer = () => {
  const [pages, setPages] = useState<PrintPageViewModel[] | null>(null);

  useEffect(() => {
    const handler = (_event: unknown, data: ExportData) => {
      const result = buildPrintPageViewModels({
        paper: data.aggregate.paper,
        paperContent: data.aggregate.paperContent,
        paperMeta: data.aggregate.paperMeta,
        references: data.references,
        language: data.aggregate.paper.language as 'en' | 'es',
      });

      setPages(result);
    };

    window.electronPrintBridge?.onExportData(handler);

    return () => {
      window.electronPrintBridge?.removeExportDataListener(handler);
    };
  }, []);

  useEffect(() => {
    if (pages) {
      window.electronPrintBridge?.signalReady();
    }
  }, [pages]);

  if (!pages) {
    return <div>Preparing export...</div>;
  }

  return (
    <div>
      {pages.map((page, index) => (
        <PrintPage key={index} page={page} />
      ))}
    </div>
  );
};
```

**Step 5: Create `main.tsx` and `print.html`**

```tsx
// src/renderer/print/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PrintRenderer } from '@renderer/print/PrintRenderer';
import '@renderer/print/print.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Print root element was not found.');
}

createRoot(container).render(
  <StrictMode>
    <PrintRenderer />
  </StrictMode>,
);
```

```html
<!-- print.html (project root) -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>APA Scholar — Print</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/renderer/print/main.tsx"></script>
  </body>
</html>
```

**Step 6: Add print window type declarations**

```typescript
// src/renderer/print/print-bridge.d.ts
interface ElectronPrintBridge {
  onExportData: (handler: (event: unknown, data: unknown) => void) => void;
  removeExportDataListener: (handler: (event: unknown, data: unknown) => void) => void;
  signalReady: () => void;
}

interface Window {
  electronPrintBridge?: ElectronPrintBridge;
}
```

**Step 7: Commit**

```bash
git add src/renderer/print/ print.html
git commit -m "feat: add print renderer components and layout"
```

---

## Task 4: Electron Forge Multi-Renderer + Print Preload

**Files:**
- Modify: `forge.config.ts` — add print renderer and preload entries
- Create: `src/preload/print-preload.ts` — print-specific preload
- Create: `vite.print-renderer.config.ts` — vite config for print renderer

**Step 1: Create print preload**

```typescript
// src/preload/print-preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronPrintBridge', {
  onExportData: (handler: (event: unknown, data: unknown) => void) => {
    ipcRenderer.on('export:data', handler);
  },
  removeExportDataListener: (handler: (event: unknown, data: unknown) => void) => {
    ipcRenderer.removeListener('export:data', handler);
  },
  signalReady: () => {
    ipcRenderer.send('export:ready');
  },
});
```

**Step 2: Create print renderer vite config**

```typescript
// vite.print-renderer.config.ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  base: './',
  build: {
    outDir: '.vite/renderer/print_window',
    emptyOutDir: false,
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@application': path.resolve(rootDir, 'src/application'),
      '@domain': path.resolve(rootDir, 'src/domain'),
      '@infrastructure': path.resolve(rootDir, 'src/infrastructure'),
      '@main': path.resolve(rootDir, 'src/main'),
      '@preload': path.resolve(rootDir, 'src/preload'),
      '@renderer': path.resolve(rootDir, 'src/renderer'),
    },
  },
});
```

**Step 3: Create print preload vite config**

```typescript
// vite.print-preload.config.ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { builtinModules } from 'node:module';
import { defineConfig } from 'vite';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  build: {
    outDir: '.vite/build',
    emptyOutDir: false,
    lib: {
      entry: path.resolve(rootDir, 'src/preload/print-preload.ts'),
      formats: ['cjs'],
      fileName: () => 'print-preload.js',
    },
    rollupOptions: {
      external: [
        'electron',
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
      ],
    },
  },
  resolve: {
    alias: {
      '@application': path.resolve(rootDir, 'src/application'),
      '@domain': path.resolve(rootDir, 'src/domain'),
      '@preload': path.resolve(rootDir, 'src/preload'),
    },
  },
});
```

**Step 4: Update `forge.config.ts`**

Add the print preload build entry and print renderer entry:

```typescript
// In the VitePlugin build array, add:
{
  entry: 'src/preload/print-preload.ts',
  config: 'vite.print-preload.config.ts',
  target: 'preload',
},

// In the VitePlugin renderer array, add:
{
  name: 'print_window',
  config: 'vite.print-renderer.config.ts',
},
```

**Step 5: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS

**Step 6: Commit**

```bash
git add forge.config.ts src/preload/print-preload.ts vite.print-renderer.config.ts vite.print-preload.config.ts
git commit -m "feat: configure Electron Forge for print renderer window"
```

---

## Task 5: Wire Electron PDF Export (IPC + Main Process)

**Files:**
- Create: `src/application/contracts/export-ipc.ts`
- Create: `src/main/ipc/create-export-ipc-handlers.ts`
- Modify: `src/main/app/bootstrap-persistence.ts`
- Modify: `src/preload/api/contracts.ts`
- Modify: `src/preload/api/create-apa-scholar-api.ts`
- Modify: `src/renderer/app/App.tsx` — wire Export PDF button

**Step 1: Create export IPC contracts**

```typescript
// src/application/contracts/export-ipc.ts
import { z } from 'zod';

export const exportIpcChannels = {
  exportPdf: 'export:pdf',
} as const;

export type ExportIpcChannel = (typeof exportIpcChannels)[keyof typeof exportIpcChannels];

export const exportPdfPayloadSchema = z.object({
  paperId: z.string().trim().min(1, 'Paper id is required.'),
});

export type ExportPdfPayload = z.infer<typeof exportPdfPayloadSchema>;

export type ExportResult =
  | { status: 'success'; filePath: string }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };
```

**Step 2: Create export IPC handler**

```typescript
// src/main/ipc/create-export-ipc-handlers.ts
import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { BrowserWindow, dialog, ipcMain } from 'electron';
import { exportPdfPayloadSchema, type ExportResult } from '@application/contracts/export-ipc';
import type { StoredPaperAggregate } from '@domain/papers/paper-draft';
import type { ReferenceEntry } from '@domain/references/reference-entry';

const PRINT_WINDOW_TIMEOUT_MS = 15_000;

const getPrintWindowName = (): string =>
  typeof PRINT_WINDOW_VITE_NAME !== 'undefined'
    ? PRINT_WINDOW_VITE_NAME
    : 'print_window';

const getPrintWindowDevServerUrl = (): string | undefined =>
  typeof PRINT_WINDOW_VITE_DEV_SERVER_URL !== 'undefined'
    ? PRINT_WINDOW_VITE_DEV_SERVER_URL
    : undefined;

export const createExportPdfHandler = (deps: {
  getAggregate: (paperId: string) => StoredPaperAggregate | null;
  getReferences: (paperId: string) => ReferenceEntry[];
  printPreloadPath: string;
}) => async (payload: unknown): Promise<ExportResult> => {
  const { paperId } = exportPdfPayloadSchema.parse(payload);

  const aggregate = deps.getAggregate(paperId);
  if (!aggregate) return { status: 'error', message: 'Paper not found.' };

  const references = deps.getReferences(paperId);

  const focusedWindow = BrowserWindow.getFocusedWindow();
  const saveResult = await dialog.showSaveDialog(focusedWindow ?? BrowserWindow.getAllWindows()[0]!, {
    defaultPath: `${aggregate.paper.title || 'paper'}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }],
  });

  if (saveResult.canceled || !saveResult.filePath) {
    return { status: 'cancelled' };
  }

  const filePath = saveResult.filePath;
  let printWindow: BrowserWindow | null = null;

  try {
    printWindow = new BrowserWindow({
      show: false,
      width: 816,
      height: 1056,
      webPreferences: {
        preload: deps.printPreloadPath,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    const devServerUrl = getPrintWindowDevServerUrl();
    if (devServerUrl) {
      await printWindow.loadURL(devServerUrl);
    } else {
      await printWindow.loadFile(
        path.join(__dirname, `../renderer/${getPrintWindowName()}/index.html`),
      );
    }

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Print renderer timed out.'));
      }, PRINT_WINDOW_TIMEOUT_MS);

      ipcMain.once('export:ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      printWindow!.webContents.send('export:data', { aggregate, references });
    });

    const pdfBuffer = await printWindow.webContents.printToPDF({
      printBackground: false,
      pageSize: 'Letter',
      margins: { top: 0, bottom: 0, left: 0, right: 0 },
    });

    await writeFile(filePath, pdfBuffer);

    return { status: 'success', filePath };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Export failed.',
    };
  } finally {
    if (printWindow && !printWindow.isDestroyed()) {
      printWindow.destroy();
    }
  }
};
```

**Step 3: Register in bootstrap**

Add to `src/main/app/bootstrap-persistence.ts`:

```typescript
import { exportIpcChannels, type ExportIpcChannel } from '@application/contracts/export-ipc';
import { createExportPdfHandler } from '@main/ipc/create-export-ipc-handlers';

// After existing handler registration:

const printPreloadPath = path.join(__dirname, 'print-preload.js');
const exportPdfHandler = createExportPdfHandler({
  getAggregate: (paperId) => persistenceContext.paperRepository.getAggregateById(paperId),
  getReferences: (paperId) => persistenceContext.referenceRepository.listByPaper(paperId),
  printPreloadPath,
});

ipcMain.handle(exportIpcChannels.exportPdf, (_event, payload) => exportPdfHandler(payload));
```

**Step 4: Extend preload API**

Add to `src/preload/api/contracts.ts`:

```typescript
import type { ExportResult } from '@application/contracts/export-ipc';

// In ApaScholarApi interface:
export: {
  pdf: (paperId: string) => Promise<ExportResult>;
};
```

Add to `src/preload/api/create-apa-scholar-api.ts`:

```typescript
import { exportIpcChannels } from '@application/contracts/export-ipc';

// In the returned object:
export: {
  pdf: (paperId) => invoke(exportIpcChannels.exportPdf, { paperId }),
},
```

**Step 5: Wire Export PDF button in App.tsx**

Find the Export PDF button (currently a dead button around line 1197) and wire it:

```tsx
<button
  className={`${shellButtonClass} border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]`}
  onClick={() => {
    if (!api) return;
    void api.export.pdf(paper.id).then((result) => {
      if (result.status === 'error') {
        setWorkspaceError(result.message);
      }
    });
  }}
  type="button"
>
  {t('paperView.exportPdf')}
</button>
```

**Step 6: Update test mocks**

Add `export: { pdf: vi.fn(async () => ({ status: 'cancelled' as const })) }` to the API mock in `tests/renderer/app-shell.test.tsx`.

**Step 7: Run typecheck and tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS

**Step 8: Commit**

```bash
git add src/application/contracts/export-ipc.ts src/main/ipc/create-export-ipc-handlers.ts \
  src/main/app/bootstrap-persistence.ts src/preload/api/contracts.ts \
  src/preload/api/create-apa-scholar-api.ts src/renderer/app/App.tsx \
  tests/renderer/app-shell.test.tsx
git commit -m "feat: wire Electron PDF export pipeline"
```

---

## Task 6: Snapshot and Golden Tests

**Files:**
- Create: `tests/unit/domain/print-page-view-model.snapshot.test.ts`
- Modify: `tests/unit/domain/body-editor-to-html.test.ts` — add snapshot tests

**Step 1: Add snapshot tests for print view models**

```typescript
// tests/unit/domain/print-page-view-model.snapshot.test.ts
import { describe, expect, it } from 'vitest';
import { createEmptyBodyEditorDocument } from '@domain/papers/body-editor-document';
import { createEmptyRichTextDocument } from '@domain/shared/entity-helpers';
import type { Paper, PaperContent, PaperMeta } from '@domain/shared/persistence-models';
import type { ReferenceEntry } from '@domain/references/reference-entry';
import { buildPrintPageViewModels } from '@domain/papers/print-page-view-model';

// (reuse the same fixtures from Task 2)

describe('print page view model snapshots', () => {
  it('matches student paper snapshot', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper(),
      paperContent: createPaperContent({
        bodyDoc: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Introduction paragraph.' }] }] },
      }),
      paperMeta: createPaperMeta({ title: 'Test Paper', authorName: 'Jane Doe', institution: 'MIT' }),
      references: [createReference()],
    });

    expect(pages).toMatchSnapshot();
  });

  it('matches professional paper with abstract snapshot', () => {
    const pages = buildPrintPageViewModels({
      paper: createPaper({ paperType: 'professional', templateId: 'apa-professional' }),
      paperContent: createPaperContent(),
      paperMeta: createPaperMeta({ abstractEnabled: true, runningHead: 'SHORT', title: 'Pro Paper' }),
      references: [],
    });

    expect(pages).toMatchSnapshot();
  });
});
```

**Step 2: Run to generate snapshots**

Run: `npx vitest run tests/unit/domain/print-page-view-model.snapshot.test.ts -u`
Expected: PASS, snapshots written

**Step 3: Run again to verify stability**

Run: `npx vitest run tests/unit/domain/print-page-view-model.snapshot.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add tests/unit/domain/print-page-view-model.snapshot.test.ts tests/unit/domain/__snapshots__/
git commit -m "test: add snapshot tests for print page view models"
```

---

## Task 7: Export Error Handling + Task Doc Updates

**Files:**
- Modify: `src/renderer/app/App.tsx` — loading state, error display, i18n keys
- Modify: `src/renderer/i18n/resources/en.ts` — add export error strings
- Modify: `src/renderer/i18n/resources/es.ts` — add export error strings
- Modify: task docs — mark all 7 tasks as Done

**Step 1: Add export i18n keys**

Add to `en.ts` `paperView` section:
```typescript
exporting: 'Exporting...',
exportSuccess: 'PDF exported successfully.',
```

Add to `en.ts` `errors` section:
```typescript
exportFailed: 'PDF export failed. Please try again.',
exportPaperNotFound: 'Paper not found. It may have been deleted.',
exportTimeout: 'Export timed out. The print renderer did not respond.',
```

Add matching Spanish strings to `es.ts`.

**Step 2: Add export loading state to App.tsx**

```typescript
const [isExporting, setIsExporting] = useState(false);

const handleExportPdf = async (paperId: string) => {
  if (!api || isExporting) return;
  setIsExporting(true);
  setWorkspaceError(null);

  try {
    const result = await api.export.pdf(paperId);
    if (result.status === 'error') {
      setWorkspaceError(result.message);
    }
  } catch {
    setWorkspaceError(t('errors.exportFailed'));
  } finally {
    setIsExporting(false);
  }
};
```

Update the Export PDF button:
```tsx
<button
  className={`${shellButtonClass} border-[var(--color-line)] bg-[var(--color-panel-muted)] text-[var(--color-ink-strong)]`}
  disabled={isExporting}
  onClick={() => void handleExportPdf(paper.id)}
  type="button"
>
  {isExporting ? t('paperView.exporting') : t('paperView.exportPdf')}
</button>
```

**Step 3: Run all tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASS

**Step 4: Update task docs**

Mark all 7 task files as Done:
- `task_01_create_print_view_model_generator.md`
- `task_02_create_print_only_route_and_layout.md`
- `task_03_implement_headers_and_title_page_rules.md`
- `task_04_render_references_page.md`
- `task_05_wire_electron_pdf_export.md`
- `task_06_add_snapshot_and_golden_tests.md`
- `task_07_add_export_error_handling.md`

Mark epic README as Done. Update milestone README to check Epic 02.

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add export error handling and mark Epic 02 complete"
```

---

## Verification Checklist

After all 7 tasks:

1. `npx tsc --noEmit` — passes
2. `npx vitest run` — all tests pass (existing + new body-to-html + print view model + snapshots)
3. `npm run dev` — app starts, open a paper with body content and references
4. Click "Export PDF" → save dialog → PDF file written → verify: title page, body with indents, references with hanging indent and italics, page numbers, running head for professional papers
5. Cancel export → no error, no file
6. Export with nonexistent paper → error message displayed
