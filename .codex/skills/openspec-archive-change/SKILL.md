---
name: openspec-archive-change
description: Archive a completed change in the experimental workflow. Use when the user wants to finalize and archive a change after implementation is complete.
license: MIT
compatibility: Requires openspec CLI.
metadata:
  author: openspec
  version: '1.0'
  generatedBy: '1.5.0'
---

Archive a completed change in the experimental workflow.

**Store selection:** If the user names a store (a store is a standalone OpenSpec repo registered on this machine) or the work lives in one, run `openspec store list --json` to discover registered store ids, then pass `--store <id>` on the commands that read or write specs and changes (`new change`, `status`, `instructions`, `list`, `show`, `validate`, `archive`, `doctor`, `context`). Other commands do not take the flag. Hints printed by commands already carry the flag; keep it on follow-ups. Without a store, commands act on the nearest local `openspec/` root.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **If no change name provided, prompt for selection**

   Run `openspec list --json` to get available changes. Ask the user directly to select one.

   Show only active changes (not already archived).
   Include the schema used for each change if available.

   **IMPORTANT**: Do NOT guess or auto-select a change. Always let the user choose.

2. **Check artifact completion status**

   Run `openspec status --change "<name>" --json` to check artifact completion.

   Parse the JSON to understand:
   - `schemaName`: The workflow being used
   - `planningHome`, `changeRoot`, `artifactPaths`, and `actionContext`: path and scope context
   - `artifacts`: List of artifacts with their status (`done` or other)

   **If any artifacts are not `done`:**
   - Display warning listing incomplete artifacts
   - Ask the user directly to confirm they want to proceed
   - Proceed if user confirms

3. **Check task completion status**

   Read the tasks file (typically `tasks.md`) to check for incomplete tasks.

   Count tasks marked with `- [ ]` (incomplete) vs `- [x]` (complete).

   **If incomplete tasks found:**
   - Display warning showing count of incomplete tasks
   - Ask the user directly to confirm they want to proceed
   - Proceed if user confirms

   **If no tasks file exists:** Proceed without task-related warning.

4. **Assess delta spec sync state**

   Use `artifactPaths.specs.existingOutputPaths` from status JSON to check for delta specs. If none exist, proceed without sync prompt.

   **If delta specs exist:**
   - Resolve the canonical specs directory as `<planningHome.root>/openspec/specs` from the status JSON; never resolve it from the current working directory
   - When `--store <id>` is selected, `planningHome.root` is the selected store root, so all comparisons must stay inside that store
   - Compare each delta spec with its corresponding main spec at `<canonical-specs-dir>/<capability>/spec.md`
   - If a corresponding main spec does not exist, classify that capability as unsynced; its first promotion must use the sync path
   - Determine what changes would be applied (adds, modifications, removals, renames)
   - Show a combined summary before prompting

   **Prompt options:**
   - If any corresponding main spec is missing: "Sync and archive (required)", "Cancel"
   - If changes are needed: "Sync and archive (recommended)", "Archive without syncing", "Cancel"
   - If already synced: "Archive now", "Cancel"

   Honor an explicit archive/sync choice already present in the user's request. Otherwise, ask the user directly to choose. If the user chooses "Cancel", stop immediately without syncing specs or moving the change.

5. **Perform the archive**

   Use the OpenSpec CLI so validation, delta application, collision checks, and the archive move happen as one supported operation. Preserve `--store <id>` when a store was selected.
   - To sync outstanding deltas and archive:

     ```bash
     # Repository-local root
     openspec archive "<name>" --yes

     # Selected registered store
     openspec archive "<name>" --yes --store "<id>"
     ```

   - To archive without syncing an existing main spec, or when the main specs are already synchronized:

     ```bash
     # Repository-local root
     openspec archive "<name>" --yes --skip-specs

     # Selected registered store
     openspec archive "<name>" --yes --skip-specs --store "<id>"
     ```

   Never use `--skip-specs` when any corresponding main spec is missing. Do not add `--no-validate`. If the command fails, report the error and leave the change active; do not move files manually.

6. **Display summary**

   Show archive completion summary including:
   - Change name
   - Schema that was used
   - Archive location
   - Whether specs were synced (if applicable)
   - Note about any warnings (incomplete artifacts/tasks)

**Output On Success**

```
## Archive Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Archived to:** <path returned by `openspec archive`, or `planningHome.changesDir`/archive/YYYY-MM-DD-<name>/>
**Specs:** ✓ Synced to main specs (or "No delta specs" or "Sync skipped")

All artifacts complete. All tasks complete.
```

**Guardrails**

- Always prompt for change selection if not provided
- Use artifact graph (openspec status --json) for completion checking
- Don't block archive on warnings - just inform and confirm
- Preserve .openspec.yaml when moving to archive (it moves with the directory)
- Show clear summary of what happened
- Use `openspec archive` for both spec synchronization and the archive move; do not depend on an uninstalled helper skill
- Resolve canonical specs from `planningHome.root`, including for a selected store; never compare against an unrelated checkout
- If delta specs exist, always run the sync assessment and show the combined summary before prompting
- A missing main spec is unsynced and requires the sync path before archival
- A cancel choice stops the workflow before any synchronization or filesystem move
