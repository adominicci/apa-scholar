## ADDED Requirements

### Requirement: Current status claims are evidence-backed
Current project, milestone, epic, and task documentation SHALL agree with the latest verified implementation and SHALL distinguish verified, incomplete, and externally blocked work.

#### Scenario: Acceptance evidence disproves completion
- **WHEN** a completed tracker item fails its documented acceptance criteria
- **THEN** the item is reopened and linked to the current remediation change or recorded external blocker

#### Scenario: Verification confirms completion
- **WHEN** every acceptance criterion has fresh supporting evidence
- **THEN** the task, epic, milestone, and root roll-up may all be marked complete together

### Requirement: Historical plans declare their lifecycle state
Every dated implementation plan SHALL state whether it is planned, active, completed, partially completed, or superseded, and SHALL name its successor when one exists.

#### Scenario: Reader opens an old plan
- **WHEN** a contributor reads a dated plan whose instructions no longer match current code
- **THEN** the plan header identifies it as historical or superseded and directs the reader to the current source of truth

### Requirement: Release documentation records results separately from instructions
Release checklists and storage/signing guides MUST distinguish reusable procedures from the environment-specific results of an executed release verification.

#### Scenario: Release verification has not been executed
- **WHEN** a clean-install, packaged-storage, signing, or notarization check has no recorded run evidence
- **THEN** its tracker remains incomplete even if a checklist template exists
