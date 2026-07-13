## 1. Spec Alignment

- [x] 1.1 Record the limited album re-entry behavior for chat media entry and picker expansion.

## 2. Implementation

- [x] 2.1 Remove the intermediate limited-access alert from chat image and album-file entry points.
- [x] 2.2 Add a limited-access state flag and append an in-grid add-more card to the chat limited media picker.
- [x] 2.3 Refresh authorized assets after the system limited-access expansion flow completes.
- [x] 2.4 Add the iOS info plist configuration that suppresses automatic limited-access alerts.

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate align-limited-media-picker-access-flow --type change --no-interactive`.
- [x] 3.2 Run targeted lint/type validation for the changed chat and config files.
