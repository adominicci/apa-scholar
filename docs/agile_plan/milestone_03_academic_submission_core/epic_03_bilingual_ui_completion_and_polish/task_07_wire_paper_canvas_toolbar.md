# Task 07 - Wire paper canvas toolbar actions

Status:
- [ ] Not started
- [x] Done

- Objective: connect the floating paper canvas toolbar buttons to their respective features.
- Why: the Essayist-style floating toolbar was added as part of the paper canvas redesign, but the buttons are currently placeholders with no actions.
- Deliverable: each toolbar button either performs its action directly or opens the relevant panel/flow.

## Toolbar buttons and their wiring targets

### Block quote (can be wired immediately)
- The TipTap blockquote extension already exists with keyboard shortcut Mod-Shift-B.
- Wire the toolbar button to call `editor.chain().focus().toggleBlockquote().run()`.
- Requires passing the TipTap editor instance (or a command callback) from BodyEditor up through PaperCanvas to PaperCanvasToolbar.

### References (depends on M3 Epic 01 Task 02 — build references panel)
- Wire to open/focus the references panel in the inspector, or scroll to the references page.
- Blocked until the references management surface exists.

### Citation (depends on M3 Epic 01 Task 05 — insert linked citations)
- Wire to open the citation insertion flow from the toolbar.
- Blocked until the citation insertion system exists.

### Font / Aa (new feature — font selection)
- Wire to a popover or inspector section for selecting the APA-approved paper font.
- Initial font menu target per PRD Appendix D: Aptos 12, Calibri 11, Arial 11, Georgia 11, Times New Roman 12, Lucida Sans Unicode 10, Computer Modern 10.
- Changing font should update the paper canvas display font and persist as a paper-level or workspace-level setting.

### Insert / + (content insertion menu)
- Wire to a popover menu for inserting structured content: heading levels 1-5, block quote, horizontal rule, etc.
- Provides a discoverable alternative to keyboard shortcuts for users who don't know Mod-Alt-{1-5} or Mod-Shift-B.

## Acceptance criteria

- Block quote button toggles blockquote formatting in the body editor when focused.
- References button opens the references panel (once built).
- Citation button opens the citation insertion flow (once built).
- Font button opens font selection (once the setting exists).
- Insert button shows a content insertion menu.
- Buttons that depend on unbuilt features are visually disabled with a tooltip explaining they are coming soon.
