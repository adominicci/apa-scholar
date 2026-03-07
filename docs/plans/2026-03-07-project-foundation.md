# Project Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the secure, documented, AI-friendly APA Scholar project foundation with Electron Forge, Vite, React, TypeScript, Tailwind v4, and baseline quality tooling.

**Architecture:** Use Electron Forge as the outer desktop toolchain with strict `main`/`preload`/`renderer` boundaries. Keep the renderer lightweight and typed, expose only a minimal preload API, and reserve domain/application/infrastructure layers for later milestones.

**Tech Stack:** Electron Forge, Electron, Vite, React, TypeScript, Tailwind CSS v4, ESLint, Prettier, Vitest, Playwright

---

### Task 1: Bootstrap the desktop scaffold

**Files:**
- Create: root app scaffold files from Electron Forge + Vite + TypeScript
- Modify: root package metadata and app entry configuration
- Test: app boot command and typecheck command

1. Generate a Forge Vite + TypeScript scaffold in a temporary directory and copy the app files into this repo without disturbing existing docs.
2. Add React renderer dependencies and wire the renderer Vite config for React.
3. Run the scaffold dev or package sanity check to confirm the bootstrap is structurally valid.

### Task 2: Shape the source tree and boundaries

**Files:**
- Modify: `src/main/*`, `src/preload/*`, `src/renderer/*`
- Create: `src/domain`, `src/application`, `src/infrastructure`, `src/tests` placeholders as needed
- Test: alias-aware compile and imports

1. Reorganize the generated source tree to match the architecture-aligned layout.
2. Add TypeScript path aliases across tsconfig, Vite, and tests.
3. Harden the Electron window configuration and replace any direct renderer Electron usage with a typed preload API.

### Task 3: Add the initial renderer shell

**Files:**
- Create: renderer app shell components and styles
- Modify: renderer entrypoint and global styles
- Test: renderer component smoke test

1. Install Tailwind CSS v4 and configure it through the Vite plugin.
2. Add centralized theme tokens with CSS variables.
3. Build a minimal workspace placeholder shell with sidebar and content regions.

### Task 4: Add quality gates

**Files:**
- Create: ESLint, Prettier, Vitest, and Playwright config
- Modify: package scripts and test setup files
- Test: lint, unit/component tests, Electron smoke test

1. Configure ESLint flat config with typed TypeScript rules and environment-specific overrides.
2. Add Prettier and script integration.
3. Add Vitest projects for Node-side and renderer-side tests.
4. Add a Playwright Electron smoke test that launches the app and verifies the placeholder shell.

### Task 5: Document the foundation

**Files:**
- Create: root `README.md`
- Modify: docs references only if needed for discoverability
- Test: manual doc review for command accuracy

1. Document the product, architecture references, scripts, and contribution rules at the repo root.
2. Ensure the README reflects the actual scaffold and commands introduced by this epic.
