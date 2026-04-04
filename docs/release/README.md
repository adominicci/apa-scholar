# Release Documentation

This directory contains release operations documentation for APA Scholar.

## Files

- `RELEASE_NOTES_TEMPLATE.md` — Copy and fill in per release.
- `CLEAN_INSTALL_CHECKLIST.md` — Verification checklist for clean installs.
- `STORAGE_VERIFICATION.md` — Storage path and permission verification guide.

## Release Process

1. Bump version in `package.json`.
2. Copy `RELEASE_NOTES_TEMPLATE.md` to a versioned file (e.g., `v0.1.0.md`).
3. Fill in release notes.
4. Run `npm run make` (or with signing env vars for signed builds — see `.env.example`).
5. Test the output artifacts using `CLEAN_INSTALL_CHECKLIST.md`.
6. Distribute the DMG/ZIP.
