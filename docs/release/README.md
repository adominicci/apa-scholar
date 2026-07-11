# Release Documentation

This directory contains release operations documentation for APA Scholar.

**Status:** Reusable procedures and templates only. No clean-install, packaged-storage, signing, notarization, or distribution result is recorded by these files. Current release blockers are tracked in [`docs/project-status.md`](../project-status.md).

## Files

- `RELEASE_NOTES_TEMPLATE.md` — Copy and fill in per release.
- `CLEAN_INSTALL_CHECKLIST.md` — Verification checklist for clean installs.
- `STORAGE_VERIFICATION.md` — Storage path and permission verification guide.

Executed results must be saved as versioned, dated files that name the artifact, environment, command, outcome, and observed paths. Do not mark the reusable source templates as though a run occurred.

## Release Process

1. Bump version in `package.json`.
2. Copy `RELEASE_NOTES_TEMPLATE.md` to a versioned file (e.g., `v0.1.0.md`).
3. Fill in release notes.
4. Run the full repository verification suite from `docs/project-status.md`.
5. Run `npm run make` (or supply the signing environment variables documented in `.env.example`).
6. Record the exact generated artifact paths and whether the build was signed/notarized.
7. Copy and execute `CLEAN_INSTALL_CHECKLIST.md` in a disposable clean profile or separate machine; save the results separately.
8. Execute `STORAGE_VERIFICATION.md` without deleting or altering a normal user database; save the results separately.
9. Distribute only after all required release checks have recorded successful evidence.
