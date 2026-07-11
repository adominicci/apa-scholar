# APA Scholar — Design System

**Last updated:** 2026-07-10
**Reference artifacts:** [`docs/UI/code.html`](./code.html) (Stitch reference), [`docs/UI/screen.png`](./screen.png) (target screenshot)
**Implementation authority:** The reference artifacts establish visual direction; current component behavior is defined by the renderer files named below and tracked in [`docs/project-status.md`](../project-status.md).

---

## Visual Direction

The workspace aesthetic is a **warm-dark studio** inspired by premium creative tools. The UI should feel focused, academic, and modern — never generic or sterile. Panels use warm brown tones with subtle translucency, copper/orange accents, and tight typography. The writing surface is the hero; chrome should recede.

Design language principles (from PRD Appendix B):
- Clean, focused, dark-mode friendly
- Workspace-oriented, modern but academic
- Instructional without feeling childish
- Inspired by modern coding/workspace apps adapted to academic writing

---

## Fonts

All fonts are **bundled locally** for fully offline operation. No CDN or Google Fonts links are used at runtime.

| Font | File | Size | Role | Weights |
|------|------|------|------|---------|
| Inter | `src/renderer/assets/fonts/Inter-Variable.woff2` | 344 KB | Primary UI font | 300–800 (variable) |
| Material Symbols Outlined | `src/renderer/assets/fonts/MaterialSymbolsOutlined.woff2` | 3.7 MB | Icon font | 100–700 |
| Satoshi | `src/renderer/assets/fonts/Satoshi-Variable.woff2` | 42 KB | Fallback UI font | 300–900 (variable) |

### Font stacks

```css
--font-ui: 'Inter', 'Satoshi', 'Avenir Next', 'Segoe UI', sans-serif;
--font-display: 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif;
```

- **`--font-ui`** — Used for all workspace chrome: sidebar, header, inspector, buttons, labels, form inputs.
- **`--font-display`** — Used for paper canvas content: title page text, body headings, references.

### Icon usage

Icons use Material Symbols Outlined via the `.material-symbols-outlined` CSS class. Icon components are defined in `src/renderer/app/icons.tsx` and render `<span>` elements with ligature names (e.g., `dashboard`, `search`, `settings`, `auto_stories`).

---

## Color Tokens

Defined as CSS custom properties in `src/renderer/styles/index.css`. The light theme is `:root`, the dark theme overrides via `[data-theme='dark']`.

### Light theme (`:root`)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-canvas` | `#f8f7f5` | Page background |
| `--color-panel` | `rgba(255, 255, 255, 0.8)` | Sidebar/inspector/header background |
| `--color-panel-muted` | `rgba(255, 255, 255, 0.64)` | Secondary panel surfaces |
| `--color-main` | `rgba(255, 255, 255, 0.9)` | Main content area background |
| `--color-page` | `#fcfaf6` | Paper canvas background |
| `--color-page-ink` | `#2f2419` | Paper canvas text |
| `--color-page-muted` | `#766553` | Paper canvas secondary text |
| `--color-input` | `rgba(255, 255, 255, 0.7)` | Input field background |
| `--color-selection` | `rgba(195, 139, 82, 0.18)` | Selected item highlight |
| `--color-line` | `rgba(65, 77, 97, 0.14)` | Borders and dividers |
| `--color-ink` | `#243144` | Primary text |
| `--color-ink-strong` | `#182334` | High-emphasis text |
| `--color-muted` | `#607089` | Secondary/label text |
| `--color-muted-strong` | `#415067` | Medium-emphasis text |
| `--color-accent` | `#be8452` | Accent / primary actions |
| `--color-accent-soft` | `rgba(190, 132, 82, 0.35)` | Accent borders/focus rings |
| `--color-accent-strong` | `#95592a` | Strong accent text |
| `--color-accent-ink` | `#1d1208` | Text on accent backgrounds |

### Dark theme (`[data-theme='dark']`)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-canvas` | `#0a0a0a` | Page background (near-black) |
| `--color-panel` | `rgba(18, 18, 18, 0.85)` | Panel background with translucency |
| `--color-panel-muted` | `rgba(28, 28, 28, 0.6)` | Secondary panel surfaces |
| `--color-main` | `#050505` | Main content area (darkest) |
| `--color-input` | `rgba(28, 28, 28, 1)` | Input field background |
| `--color-selection` | `rgba(255, 140, 0, 0.15)` | Selected item highlight |
| `--color-line` | `rgba(255, 255, 255, 0.1)` | Borders (subtle white) |
| `--color-ink` | `#cbd5e1` | Primary text (slate-300) |
| `--color-ink-strong` | `#f1f5f9` | High-emphasis text (slate-50) |
| `--color-muted` | `#64748b` | Secondary text (slate-500) |
| `--color-muted-strong` | `#94a3b8` | Medium-emphasis text (slate-400) |
| `--color-accent` | `#ff8c00` | Primary accent (orange) |
| `--color-accent-soft` | `rgba(255, 140, 0, 0.38)` | Accent borders/focus |
| `--color-accent-strong` | `#ff8c00` | Strong accent (same as accent in dark) |
| `--color-accent-ink` | `#0a0a0a` | Text on accent backgrounds |

### Shadow and glow tokens

| Token | Light | Dark |
|-------|-------|------|
| `--shadow-shell` | `0 28px 80px rgba(25,38,59,0.15)` | `0 32px 120px rgba(0,0,0,0.38)` |
| `--shadow-page` | `0 28px 90px rgba(31,25,18,0.12)` | `0 34px 120px rgba(0,0,0,0.22)` |
| `--shadow-glow` | `0 0 24px rgba(190,132,82,0.06)` | `0 0 24px rgba(255,140,0,0.06)` |
| `--color-glow` | `rgba(190,132,82,0.08)` | `rgba(255,140,0,0.08)` |

---

## Layout Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-panel` | `0.5rem` | Panel corners, modal corners |
| `--radius-card` | `0.5rem` | Inner card corners |
| `--radius-button` | `0.5rem` | Button corners |
| `--radius-input` | `0.5rem` | Input/select corners |
| `--tracking-caps` | `0.1em` | Letter-spacing for `.label-caps` |
| `--blur-panel` | `12px` | Glass morphism blur |
| `--blur-heavy` | `32px` | Heavy blur for overlays |
| `--transition-panel` | `280ms cubic-bezier(0.4, 0, 0.2, 1)` | Panel collapse/expand |

---

## Layout Structure

The workspace uses a **header + three-column flex** layout. Paper routes add a collapsible APA Format panel inside the main canvas:

```
┌─────────────────────────────────────────────────────────────────┐
│ Header bar (60px) — logo, global search, settings               │
├───────────┬─────────────────────────────────────┬───────────────┤
│ Sidebar   │ Main content area                   │ Inspector     │
│ (w-300)   │ (flex-1, scrollable)                │ (w-340)       │
│ border-r  │                                     │ border-l      │
│           │ Paper route: Format panel + pages   │               │
│           │                                     │               │
│           │                                     │               │
├───────────┴─────────────────────────────────────┴───────────────┘
```

### Header bar
- Full-width, fixed height (60px / `h-[60px]`)
- Contains: macOS traffic-light spacer, vertical divider, "APA Scholar" branding, centered global search input, and Settings
- Settings is the only header icon action. Notifications and the header-level Draft paper CTA were intentionally removed; paper creation remains available in the sidebar and content views.
- The header has the `drag-region` class for macOS window dragging (`-webkit-app-region: drag`). Interactive elements (buttons, inputs) use `-webkit-app-region: no-drag` via a global rule.

### Sidebar (left)
- Fixed width: 300px expanded, 48px collapsed (icon rail)
- Separated from main by `border-r border-[var(--color-line)]`
- Contains: Dashboard, New course / New paper buttons, and the expandable course/paper tree
- The collapsed rail exposes Home, Search/expand, New course, course initials, and Settings. References are not a workspace-sidebar footer action.
- Collapsible: expanded content uses `.panel-content[data-collapsed]`, icon rail uses `.panel-rail[data-visible]`

### Main content
- `flex-1`, darker background (`--color-main`), scrollable
- Renders views: home, course overview, paper canvas, settings
- Paper routes render `PaperCanvasToolbar` as an inner 256px panel (40px collapsed rail) beside the scrollable page canvas. Its sections cover paper type, live font preview, body structure commands, and APA workflow shortcuts.

### Inspector (right)
- Fixed width: 340px expanded, 48px collapsed
- Separated from main by `border-l border-[var(--color-line)]`
- Contains: contextual workspace/course details and, for papers, Details, Issues, and References tabs
- References are created, edited, deleted, and inserted as citations from this inspector surface.
- Same collapse mechanism as sidebar

### Current APA Format Behavior

- Paper-type controls update the semantic paper metadata flow.
- Paragraph, heading, list, and block-quote controls dispatch commands to the body editor.
- References and Citation controls focus the paper inspector's References tab.
- Font choices currently override canvas CSS variables only. They are not persisted and are not passed into the print model, so font persistence/export acceptance remains open.
- Abstract authoring is not part of the format panel; the current abstract page remains derived read-only guidance.

---

## Utility Classes

Defined in `src/renderer/styles/index.css`:

| Class | Purpose |
|-------|---------|
| `.glass-panel` | Applies `backdrop-filter: blur(var(--blur-panel))` |
| `.label-caps` | 10px bold uppercase label (0.625rem, 700 weight, 0.1em tracking) |
| `.material-symbols-outlined` | Material Symbols icon font rendering |
| `.drag-region` | macOS window drag handle (`-webkit-app-region: drag`) |
| `.no-scrollbar` | Hides scrollbar across browsers |
| `.panel-content` / `.panel-content[data-collapsed='true']` | Expanded panel content with opacity transition |
| `.panel-rail` / `.panel-rail[data-visible='true']` | Collapsed panel icon rail with opacity transition |

---

## Component Architecture

The workspace shell is composed of extracted components:

| Component | File | Purpose |
|-----------|------|---------|
| `App` | `src/renderer/app/App.tsx` | Root layout, state, header bar, routing |
| `Sidebar` | `src/renderer/app/Sidebar.tsx` | Left panel with nav, course tree, collapse |
| `Inspector` | `src/renderer/app/Inspector.tsx` | Right panel with context details, collapse |
| `CourseModal` | `src/renderer/app/CourseModal.tsx` | Course creation modal |
| `PaperModal` | `src/renderer/app/PaperModal.tsx` | Paper creation modal |
| `PaperCanvas` | `src/renderer/app/paper-canvas/PaperCanvas.tsx` | Paper-route canvas composition |
| `PaperCanvasToolbar` | `src/renderer/app/paper-canvas/PaperCanvasToolbar.tsx` | Inner collapsible APA Format panel |
| `icons` | `src/renderer/app/icons.tsx` | Material Symbols icon components |

State is managed via `useReducer` in `src/renderer/app/workspace-shell-state.ts` with actions for navigation, panel collapse, and course expansion.

---

## Theme Switching

- Theme follows system preference via `window.matchMedia('(prefers-color-scheme: dark)')`
- Applied via `data-theme="dark"` or `data-theme="light"` on the root `div[data-testid="workspace-shell"]`
- All color tokens switch automatically through the `[data-theme='dark']` selector

---

## Key Design Decisions

1. **Flat panels, not floating cards** — Sidebar and inspector are flush with borders, not rounded floating glass containers. This matches the Stitch reference and reduces visual noise.
2. **Black canvas, orange accent** — Dark theme uses `#0a0a0a` near-black canvas with neutral dark panels. Accent is `#ff8c00` (orange).
3. **Small border radii** — Uniform `0.5rem` across all elements. No large rounded containers.
4. **Bundled fonts** — All three font families are locally bundled woff2 files. No network dependency.
5. **Material Symbols for icons** — Consistent icon language using Google's Material Symbols Outlined font, rendered via CSS ligatures.
6. **Search in header** — Global search lives in the top header bar, not duplicated in the sidebar.
7. **References in context** — Reference management belongs to the paper inspector, not the global workspace sidebar.
8. **Formatting inside the paper route** — APA Format controls live beside the paper pages inside `PaperCanvas`, keeping global navigation and contextual metadata separate.
