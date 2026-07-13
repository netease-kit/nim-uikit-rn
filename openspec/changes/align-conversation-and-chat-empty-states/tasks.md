## 1. Implementation

- [x] Inspect the RN conversation list and chat detail empty-state render paths
- [x] Show the standard empty-state illustration for an empty conversation list
- [x] Show the empty chat timeline as a notification-style "没有更多了" tip

## 2. Validation

- [ ] Run `npx tsc --noEmit`
- [ ] Run `OPENSPEC_TELEMETRY=0 openspec validate align-conversation-and-chat-empty-states --type change --no-interactive`
