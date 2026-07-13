## 1. Spec

- [x] 1.1 Create the OpenSpec proposal for the marked-message list UI alignment
- [x] 1.2 Update the `chat-timeline-and-history` delta spec for pinned-list card layout and overflow actions

## 2. Implementation

- [x] 2.1 Rebuild `app/chat/pins.tsx` as a Figma-aligned card list with sender identity, time, divider, and message preview
- [x] 2.2 Add the pinned-message overflow menu with unpin, copy, and forward actions while preserving preview tap behavior

## 3. Validation

- [x] 3.1 Run `npx tsc --noEmit`
- [x] 3.2 Run `npm run start -- --non-interactive`
- [x] 3.3 Validate `OPENSPEC_TELEMETRY=0 openspec validate align-marked-message-list-ui --type change --no-interactive`
