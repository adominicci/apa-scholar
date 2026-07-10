## ADDED Requirements

### Requirement: All repository quality gates are authoritative
The project SHALL keep formatting, lint, type checking, unit and integration tests, production build, and Electron E2E verification green before any change is declared complete.

#### Scenario: Complete verification suite passes
- **WHEN** the documented repository verification suite is run from a clean checkout with the recommended runtime
- **THEN** every command exits successfully with zero lint errors, formatting differences, type errors, or test failures

#### Scenario: A gate fails
- **WHEN** any required verification command exits non-zero
- **THEN** the relevant task and milestone SHALL remain incomplete and documentation SHALL record the failure rather than claim completion

### Requirement: Electron E2E data is isolated
Every automated Electron E2E run MUST use a unique disposable user-data directory and MUST NOT read or write the normal APA Scholar user-data directory.

#### Scenario: E2E creates course and paper fixtures
- **WHEN** the Electron E2E creates persisted course and paper data
- **THEN** those records exist only under the run-specific temporary user-data directory

#### Scenario: E2E process exits
- **WHEN** the Electron test application closes
- **THEN** the temporary user-data directory is removed without changing the user's normal APA Scholar database

### Requirement: External metadata is validated before mapping
Unknown CrossRef response data MUST be schema-validated before application code reads nested fields or maps it to a reference form.

#### Scenario: Valid CrossRef work response
- **WHEN** the mapper receives a supported valid CrossRef work envelope
- **THEN** it returns typed normalized reference metadata for the supported APA Scholar reference type

#### Scenario: Invalid or incomplete CrossRef response
- **WHEN** the mapper receives malformed, unsupported, or structurally incomplete data
- **THEN** it returns a controlled failure without unsafe property access or partially corrupt form state
