## 1. Implementation

- [x] 1.1 Add a fixed Android-aligned formatter for collection-list timestamps in RN.
- [x] 1.2 Replace collection-card footer `toLocaleString()` rendering with the fixed formatter.
- [x] 1.3 Replace locale-dependent timestamp rendering in pinned-message list, chat history list, merged-forward detail time dividers, and message preview pages with the same fixed formatter.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `OPENSPEC_TELEMETRY=0 openspec validate align-collection-time-format-with-android --type change --no-interactive`.
