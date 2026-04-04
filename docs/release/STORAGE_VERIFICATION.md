# Storage Path and Permission Verification

## Expected Paths

| Item | Path |
|------|------|
| userData | `~/Library/Application Support/APA Scholar/` |
| Database | `~/Library/Application Support/APA Scholar/apa-scholar.sqlite` |
| WAL file | `~/Library/Application Support/APA Scholar/apa-scholar.sqlite-wal` |
| SHM file | `~/Library/Application Support/APA Scholar/apa-scholar.sqlite-shm` |

## Packaged Build Structure

| Item | Location inside .app |
|------|---------------------|
| Main process | `Contents/Resources/app.asar` > `.vite/build/main.js` |
| Preload | `Contents/Resources/app.asar` > `.vite/build/index.js` |
| Print preload | `Contents/Resources/app.asar` > `.vite/build/print-preload.js` |
| Renderer HTML | `Contents/Resources/app.asar` > `.vite/renderer/main_window/index.html` |
| Print HTML | `Contents/Resources/app.asar` > `.vite/renderer/print_window/index.html` |

## Verification Steps

1. Delete `~/Library/Application Support/APA Scholar/` if it exists.
2. Launch the packaged app.
3. Verify the directory and database file are created.
4. Create a course and a paper.
5. Quit and relaunch — verify data persists.
6. Export a PDF to ~/Desktop — verify the file is written.
7. Export a PDF to ~/Documents — verify the file is written.

## Permission Error Handling

The app handles database initialization failure gracefully:

- `bootstrap-persistence.ts` wraps initialization in try/catch
- Failure triggers `dialog.showErrorBox('Startup error', ...)` and `app.quit()`
- The user sees a native macOS error dialog, not a silent crash

## Notes on Native Modules

Vite bundles `better-sqlite3` as an external dependency. The native `.node` binding is resolved at runtime by the bundled main process. The `AutoUnpackNativesPlugin` ensures native bindings are accessible outside the ASAR archive when needed.

## Notes on ASAR Paths

The Vite plugin produces a minimal ASAR containing only the build output (main, preload, renderers) and `package.json`. All relative path references (print window HTML, preload scripts) resolve correctly within the ASAR via Electron's ASAR-aware fs layer.
