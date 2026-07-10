## ADDED Requirements

### Requirement: Missing student title-page metadata remains visible as guidance
The student ghost title page SHALL render localized instructional placeholders for every supported required field that has no user value: author, institution, course, instructor, and due date.

#### Scenario: New student paper has incomplete metadata
- **WHEN** a student paper is opened before all title-page metadata has been entered
- **THEN** the ghost title page displays the localized placeholder for each missing field in its APA title-page position

#### Scenario: Spanish student paper has incomplete metadata
- **WHEN** a Spanish-language student paper is opened with one or more title-page metadata fields empty
- **THEN** every missing field displays Spanish instructional guidance in its APA title-page position
- **AND** no English fallback guidance is displayed for those fields

#### Scenario: User fills a title-page field
- **WHEN** the user supplies a non-empty value for a guided title-page field
- **THEN** the ghost block displays the user's value instead of the instructional placeholder

### Requirement: Ghost guidance is derived-only
Instructional placeholder text MUST remain derived UI guidance and MUST NOT be written into persisted paper metadata or body content.

#### Scenario: Paper is saved with missing metadata
- **WHEN** autosave runs while one or more title-page fields remain empty
- **THEN** persisted metadata retains null or empty field state rather than the localized placeholder string
