# Task 06 - Create secure BrowserWindow defaults

- Objective: configure Electron with secure window defaults and process boundaries.
- Why: the architecture explicitly requires safe Electron boundaries.
- Deliverable: hardened `BrowserWindow` setup in the main process.
- Acceptance: renderer code has no direct Node access and security defaults are enabled.
