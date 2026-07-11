# Storage Path and Permission Verification

**Document status:** Unexecuted reusable procedure.

**Result handling:** Save executed results separately with the artifact, macOS version, architecture, observed `app.getPath('userData')`, and pass/fail outcome. This guide is not evidence that packaged storage has been verified.

## Safety Boundary

- Never delete or alter a normal APA Scholar database for testing.
- Prefer a separate clean macOS profile for release acceptance.
- For automated or diagnostic checks, set `APA_SCHOLAR_USER_DATA_DIR` to a unique absolute temporary directory before launch. The main process applies it before persistence bootstrap and ignores it when absent.
- Verify Electron reports the isolated path, close the app, and remove only the directory created for that run.

## Expected Paths

| Item | Path |
|------|------|
| userData | Default: `~/Library/Application Support/APA Scholar/`; isolated tests/diagnostics: the supplied absolute override |
| Database | `<active userData>/apa-scholar.sqlite` |
| WAL file | `<active userData>/apa-scholar.sqlite-wal` while present |
| SHM file | `<active userData>/apa-scholar.sqlite-shm` while present |

## Packaged Build Structure

| Item | Location inside .app |
|------|---------------------|
| Main process | `Contents/Resources/app.asar` > `.vite/build/main.js` |
| Main-window preload | `Contents/Resources/app.asar` > `.vite/build/preload.js` |
| Print preload | `Contents/Resources/app.asar` > `.vite/build/print-preload.js` |
| Renderer HTML | `Contents/Resources/app.asar` > `.vite/renderer/main_window/index.html` |
| Print HTML | `Contents/Resources/app.asar` > `.vite/renderer/print_window/print.html` |

These are configured target paths. Inspect and record the actual packaged artifact instead of treating this table as a completed packaging result.

## Verification Steps

1. Select a separate clean profile or create a unique absolute temporary directory for this run; record it.
2. Launch the packaged app with that isolated path and verify `app.getPath('userData')` resolves to it before creating fixtures.
3. Verify the database is created under the active isolated `userData` directory.
4. Create a course and a paper, then confirm the records are visible in the app.
5. Quit and relaunch against the same isolated directory; verify data persists.
6. Export a PDF to an approved disposable output directory; verify the file is written and opens.
7. Quit APA Scholar before cleanup.
8. Confirm no normal APA Scholar database timestamp or contents changed.
9. Remove only the isolated input/output directories created for this run.

## Permission Error Handling

Startup failure ownership is split explicitly:

- `bootstrap-persistence.ts` creates persistence and registers handlers; it does not own the startup catch.
- `handle-app-ready.ts` calls persistence bootstrap inside `try/catch`, invokes the injected `showErrorBox('Startup error', ...)`, and requests quit on failure.
- `src/main/index.ts` binds that injected error/quit behavior to Electron's `dialog` and `app` APIs.
- The user sees a native macOS error dialog, not a silent crash

This behavior has unit coverage. A packaged permission-denial result still must be executed and recorded before release acceptance.

## Notes on Native Modules

Vite keeps `better-sqlite3` external. Forge configuration copies the required external modules and `AutoUnpackNativesPlugin` unpacks native bindings. A successful build alone does not prove the packaged native module loads; record the clean-install/native-module result.

## Notes on ASAR Paths

Electron Forge's Vite plugin owns the main, both preload, and both renderer entries for packaging. Verify the generated ASAR/app contents and exercise both main-window and print preload paths in the actual artifact; do not infer success from configuration alone.
