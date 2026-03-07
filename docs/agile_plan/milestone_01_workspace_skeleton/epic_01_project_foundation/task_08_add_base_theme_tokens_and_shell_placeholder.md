# Task 08 - Add base theme tokens and shell placeholder

Status:
- [ ] Not started
- [x] Done

- Objective: add the first visual tokens and a placeholder app shell.
- Why: the app should feel like a workspace early, even before feature depth exists.
- Deliverable: theme variables and a minimal shell layout.
- Acceptance: the app renders a coherent placeholder shell that matches the architecture direction.

## Implementation Notes

### Token file
`src/renderer/styles/index.css` — CSS custom properties for both light (`:root`) and dark (`[data-theme='dark']`) themes.

### Fonts (bundled offline)
All fonts are local woff2 files in `src/renderer/assets/fonts/`:
- **Inter** (variable, 300–800) — primary UI font
- **Material Symbols Outlined** — icon font for all UI icons
- **Satoshi** (variable, 300–900) — fallback UI font

Font stacks:
- `--font-ui`: Inter → Satoshi → system sans-serif
- `--font-display`: Iowan Old Style → Palatino → serif (for paper canvas)

### Color palette
Warm-dark studio aesthetic inspired by the Stitch reference (`docs/UI/`):
- Dark canvas: `#1a1612`, panels: `rgba(35, 26, 15, 0.8)`, accent: `#ff8c00`
- Light canvas: `#f8f7f5`, panels: `rgba(255, 255, 255, 0.8)`, accent: `#be8452`
- See `docs/UI/design-system.md` for the complete token table

### Layout radii
Uniform `0.5rem` across panels, cards, buttons, and inputs. No large rounded containers.

### Utility classes
- `.glass-panel` — backdrop blur
- `.label-caps` — 10px bold uppercase labels
- `.material-symbols-outlined` — icon font rendering
- `.drag-region` — macOS window drag
- `.no-scrollbar` — hidden scrollbars
- `.panel-content` / `.panel-rail` — collapsible panel transitions
