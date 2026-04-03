# APA Scholar

APA Scholar is a local-first Electron desktop app for drafting APA-compliant academic papers. The macOS-first workspace includes the full workspace skeleton (course and paper navigation, template engine, ghost-page rendering), the writing core (body editor, paste engine, APA rules engine with issues panel), and initial references management. Built with Electron Forge, Vite, React, TypeScript, and Tailwind CSS v4.

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
- `npm run build` builds the main, preload, and renderer outputs into `.vite/`.
- `npm run lint` runs ESLint with typed TypeScript rules.
- `npm run format` checks formatting with Prettier.
- `npm run typecheck` runs TypeScript without emitting files.
- `npm run test:unit` runs the Vitest suite.
- `npm run test:e2e` builds the app and runs the Playwright Electron smoke test.
- `npm run test` runs both unit and end-to-end verification.

## Documentation

- Product requirements: [docs/apa-scholar-prd-v2.md](/Users/andresdominicci/Projects/apa-writer/docs/apa-scholar-prd-v2.md)
- Architecture: [docs/architecture.md](/Users/andresdominicci/Projects/apa-writer/docs/architecture.md)
- Implementation roadmap: [docs/implementation_plan.md](/Users/andresdominicci/Projects/apa-writer/docs/implementation_plan.md)
- Foundation execution plan: [docs/plans/2026-03-07-project-foundation.md](/Users/andresdominicci/Projects/apa-writer/docs/plans/2026-03-07-project-foundation.md)
