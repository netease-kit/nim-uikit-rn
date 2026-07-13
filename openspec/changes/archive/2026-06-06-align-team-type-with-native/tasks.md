## 1. Implementation

- [x] 1.1 Inspect Android and iOS team creation parameters and discussion marker.
- [x] 1.2 Update RN team creation to use native-compatible team type and server extension.
- [x] 1.3 Keep RN category detection compatible with native and historical RN markers.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate align-team-type-with-native --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
