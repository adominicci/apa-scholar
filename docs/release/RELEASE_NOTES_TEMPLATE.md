# APA Scholar — Release Notes

**Document status:** Template only. Copy to a versioned file and replace every placeholder with evidence from an executed build/release check.

## Version X.Y.Z — YYYY-MM-DD

### Build Info

- **Version:** X.Y.Z
- **Platform:** macOS (arm64 / x64)
- **Signed:** Yes / No
- **Notarized:** Yes / No

### What's New

- [Brief description of new feature or change]

### Bug Fixes

- [Brief description of fix]

### Known Issues

- [Description of known issue and workaround if any]

### Install Instructions

1. Download `APA Scholar-X.Y.Z-arm64.dmg` from [distribution location].
2. Open the DMG and drag **APA Scholar** to your **Applications** folder.
3. On first launch, macOS may show a security prompt. Click **Open** to proceed.
4. By default, the app creates its database under Electron's macOS `userData` path (`~/Library/Application Support/APA Scholar/` for the current product name). Test/diagnostic builds may use an explicitly isolated override; record the observed path for the released artifact.

### Uninstall Instructions

1. Drag **APA Scholar** from Applications to Trash.
2. To remove all data, delete `~/Library/Application Support/APA Scholar/`.

### Feedback

Report issues to [contact/issue tracker].
