# Clean Install Verification Checklist

Use this checklist when validating a new build on a clean environment.

**Document status:** Unexecuted reusable template.

**Result handling:** Copy this file to a dated/versioned result file before checking boxes. Record the artifact path and environment; leaving this template in the repository does not prove a clean install ran.

Safety rules:

- Use a separate machine, a disposable macOS user/profile, or an explicitly isolated absolute `APA_SCHOLAR_USER_DATA_DIR`.
- Never delete, rename, or reuse an existing normal APA Scholar `userData` directory to manufacture a clean state.
- Remove only the disposable directory created for this run after APA Scholar has quit.

## Environment Setup

- [ ] Testing on a machine or user profile that has never run APA Scholar
- [ ] The selected disposable profile has never run APA Scholar, or an isolated absolute test/diagnostic `userData` directory was created for this run
- [ ] macOS version: ________
- [ ] Architecture: arm64 / x64
- [ ] Build artifact: DMG / ZIP
- [ ] Build version: ________
- [ ] Build signed: Yes / No

## Installation

- [ ] DMG mounts without error
- [ ] App icon is visible in the DMG (not the generic Electron icon)
- [ ] App drags to /Applications successfully
- [ ] DMG can be unmounted after copy

## First Launch

- [ ] App launches from /Applications without crash
- [ ] macOS security prompt appears (if unsigned): user can click Open
- [ ] Main window appears with the workspace shell
- [ ] No error dialogs on startup
- [ ] App icon appears in Dock (correct icon, not Electron default)
- [ ] Menu bar shows "APA Scholar" (not "Electron" or "apa-writer")

## Database Initialization

- [ ] `~/Library/Application Support/APA Scholar/` directory was created
- [ ] `apa-scholar.sqlite` file exists in that directory
- [ ] SQLite reports WAL mode while the database is open
- [ ] Any transient `-wal` / `-shm` files remain beside the isolated database (their absence after a clean quit is not a failure)

## Core Functionality

- [ ] Can create a new course
- [ ] Can create a new paper within the course
- [ ] Paper canvas loads with title page ghost rendering
- [ ] Body editor accepts text input
- [ ] Text persists after closing and reopening the app

## PDF Export

- [ ] Export to PDF triggers save dialog
- [ ] PDF file is written to the selected location
- [ ] PDF opens in Preview and contains expected content

## Window Behavior

- [ ] Minimize and restore works
- [ ] Resize works within min constraints (1100x720)
- [ ] Close window and reactivate from Dock creates new window (macOS behavior)
- [ ] Cmd+Q quits the app cleanly

## Native Module Verification

- [ ] No "MODULE_NOT_FOUND" or "NODE_MODULE_VERSION" errors in console
- [ ] SQLite operations do not throw
- [ ] App does not show the Electron crash reporter

## Cleanup Verification

- [ ] After uninstall (move to Trash), app is removed from /Applications
- [ ] `~/Library/Application Support/APA Scholar/` still exists (user data preserved)
- [ ] Reinstalling and launching picks up existing data

## Notes

[Record any observations, warnings, or issues here]
