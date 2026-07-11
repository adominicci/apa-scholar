# APA Scholar

APA Scholar is a local-first Electron desktop app for drafting APA-compliant academic papers. The macOS-first app organizes work as `Workspace -> Course -> Paper` and derives a guided page canvas from semantic paper data.

The workspace skeleton and writing core have completed implementation history. References/citations and an initial PDF pipeline exist, but Academic Submission Core remains incomplete: export safety/pagination, bilingual completion, professional/abstract workflows, and paper-format persistence still have open acceptance work. Release Readiness is not verified. See [docs/project-status.md](docs/project-status.md) for the current evidence matrix.

## Foundation Principles

- Electron main, preload, and renderer boundaries stay strict.
- Renderer code uses the typed `window.apaScholar` bridge instead of direct Electron or Node imports.
- Domain and application layers stay outside the UI so future APA logic can remain testable.
- The repository favors explicit docs, predictable structure, and automation-friendly tooling.

## Stack

- Electron Forge
- Electron
- Vite
- React
- TypeScript
- Tailwind CSS v4
- ESLint + Prettier
- Vitest
- Playwright

## Runtime

- Recommended Node: `22.x`
- `@electron/rebuild@4.0.3` requires Node `>=22.12.0`
- `better-sqlite3` must be rebuilt for the runtime that will load it

## Project Layout

```text
src/
  main/
  preload/
  renderer/
  domain/
  application/
  infrastructure/
tests/
docs/
```

## Scripts

- `npm run dev` starts the Electron app in development mode through Forge.
- `npm run build` builds the main process, main-window preload, and main renderer into `.vite/`; Forge packaging owns the additional print preload/renderer entries.
- `npm run lint` runs ESLint with typed TypeScript rules.
- `npm run format` checks formatting with Prettier.
- `npm run format:write` applies the existing Prettier configuration to non-ignored files.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run test:unit` rebuilds `better-sqlite3` for Node and runs the Vitest suite.
- `npm run test:e2e` rebuilds `better-sqlite3` for Electron, builds the app, and runs the isolated Playwright Electron smoke test.
- `npm run test` runs both unit and end-to-end verification.
- `npm run rebuild:native` rebuilds `better-sqlite3` for Electron.
- `npm run package` creates an unpacked app through Electron Forge.
- `npm run make` creates configured distribution artifacts through Electron Forge.

## Documentation

- Current evidence and blockers: [docs/project-status.md](docs/project-status.md)
- Product requirements: [docs/apa-scholar-prd-v2.md](docs/apa-scholar-prd-v2.md)
- Architecture: [docs/architecture.md](docs/architecture.md)
- Implementation roadmap: [docs/implementation_plan.md](docs/implementation_plan.md)
- Agile tracking: [docs/agile_plan/README.md](docs/agile_plan/README.md)
- UI design system: [docs/UI/design-system.md](docs/UI/design-system.md)
- Historical execution plans: [docs/plans/](docs/plans/)
- Release procedures and blank checklists: [docs/release/](docs/release/)
