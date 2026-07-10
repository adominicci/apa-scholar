## 1. Regression Contracts

- [ ] 1.1 Add a failing main-process test proving `APA_SCHOLAR_USER_DATA_DIR` is applied before persistence bootstrap and ignored when absent.
- [ ] 1.2 Add a failing E2E isolation contract that launches Electron with a unique temporary user-data directory and verifies fixture persistence stays inside it.
- [ ] 1.3 Add failing pure tests for valid, malformed, and unsupported CrossRef response mapping from `unknown` input.
- [ ] 1.4 Confirm the existing ghost-page regression test fails because missing student metadata placeholders are filtered out.
- [ ] 1.5 Update stale renderer assertions to the intended post-`5ad4f61` behavior: Settings is the remaining header icon action and references are available from the paper inspector.

## 2. Baseline Implementation

- [ ] 2.1 Implement the pre-ready user-data override and Playwright temporary-directory lifecycle without touching the normal APA Scholar database.
- [ ] 2.2 Restore localized derived placeholders for every missing student title-page field without persisting placeholder strings.
- [ ] 2.3 Extract a Zod-validated CrossRef work mapper outside React and integrate it into the DOI lookup failure path.
- [ ] 2.4 Remove stale renderer props/imports and correct strict typed-test doubles until ESLint reports zero errors without rule suppressions.
- [ ] 2.5 Apply the existing Prettier configuration to all non-ignored files and confirm no semantic behavior changed in the mechanical diff.

## 3. Documentation Reconciliation

- [ ] 3.1 Add a current project-status matrix containing the verified baseline, confirmed release blockers, active OpenSpec work, and evidence rules.
- [ ] 3.2 Update AGENTS.md and README.md to the current implementation stage, correct paths, verification state, and remaining milestones.
- [ ] 3.3 Reconcile architecture.md, implementation_plan.md, and docs/UI/design-system.md with the current shell, format panel, CrossRef interim boundary, and known incomplete capabilities.
- [ ] 3.4 Reopen disproven Milestone 03 and 04 tasks/rollups while preserving completed history and linking remaining acceptance work to the current status matrix.
- [ ] 3.5 Add lifecycle status headers to every dated plan and correct release storage/preload/error-ownership guidance without recording unexecuted checklist results.

## 4. Verification

- [ ] 4.1 Run focused red-green tests for user-data isolation, CrossRef mapping, ghost placeholders, and updated renderer behavior.
- [ ] 4.2 Run `npm run format`, `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, and `npm run test:e2e` with fresh successful output.
- [ ] 4.3 Run `git diff --check`, inspect the complete diff for unrelated changes, and record the exact verification evidence in the project-status document.
