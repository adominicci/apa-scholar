# Task 01 - Build app shell layout

Status:
- [ ] Not started
- [x] Done

- Objective: implement the main workspace layout with stable panel regions.
- Why: navigation should feel like an academic workspace before editor work begins.
- Deliverable: shell layout for sidebar, main view, and supporting panels.
- Acceptance: the app presents a clear workspace structure instead of a blank shell.
- Must use system settings for light and dark mode or user selectable

## Implementation Notes

### Layout structure
The layout follows the Stitch reference design (see `docs/UI/screen.png` and `docs/UI/code.html`):

- **Header bar** (`h-14`): full-width top bar with macOS traffic-light spacer, "APA Scholar" branding, centered search input, "Draft paper" CTA, notification and settings buttons. The header doubles as the macOS window drag region.
- **Sidebar** (256px / 48px collapsed): left panel with workspace nav icons (Dashboard, Research, Citations, Drafts), course/paper action buttons, collapsible course tree, and "Add reference" footer. Separated by `border-r`.
- **Main content** (`flex-1`): scrollable area rendering home, course, paper, or settings views.
- **Inspector** (288px / 48px collapsed): right panel with contextual details, issues placeholder, and search placeholder. Separated by `border-l`.

### Design system
Warm-dark studio aesthetic with:
- Fonts: Inter (UI), Material Symbols Outlined (icons), Satoshi (fallback) — all bundled offline
- Dark palette: `#1a1612` canvas, `rgba(35,26,15,0.8)` panels, `#ff8c00` accent
- Flat panels with border separators (no floating rounded glass containers)
- Uniform `0.5rem` border radius
- See `docs/UI/design-system.md` for full token reference

### Components
- `App.tsx` — root layout, state management, header bar, view routing
- `Sidebar.tsx` — left panel (expanded + collapsed icon rail)
- `Inspector.tsx` — right panel (expanded + collapsed icon rail)
- `CourseModal.tsx` / `PaperModal.tsx` — creation modals with backdrop blur
- `icons.tsx` — Material Symbols icon components
- `workspace-shell-state.ts` — useReducer state (navigation, panel collapse, selection)

### Panel collapse
Both side panels collapse to 48px icon rails with smooth opacity transitions. State is managed via `toggleLeftPanel` / `toggleRightPanel` reducer actions. Expanded content and icon rails are always in DOM, toggled via `opacity` + `pointer-events` + `visibility`.

### macOS window integration
- `titleBarStyle: 'hiddenInset'` for frameless window with inset traffic lights
- `.drag-region` class on header for window dragging
- Global `button, input, textarea, select { -webkit-app-region: no-drag }` to keep interactive elements clickable
