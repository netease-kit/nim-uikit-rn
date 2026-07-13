# Tasks

## 1. Implementation

- [x] Stop app lifecycle pinned-message refresh from scanning every loaded conversation
- [x] Reuse same-conversation in-flight pinned-message list requests
- [x] Preserve active conversation and explicit pins-page refresh behavior

## 2. Validation

- [x] Run `npx eslint app/_layout.tsx stores/MessageStore.ts`
- [x] Run `npx tsc --noEmit`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate reduce-pinned-message-refresh-errors --type change --no-interactive`
