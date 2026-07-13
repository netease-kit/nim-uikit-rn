## 1. Spec Alignment

- [x] 1.1 Cross-check Android conversation header menu entries and ordering.
- [x] 1.2 Cross-check discussion-vs-advanced-group settings differences used by Android.

## 2. Implementation

- [x] 2.1 Extend the conversation header add menu with join-group and create-discussion actions.
- [x] 2.2 Add an in-app join-group search/apply flow.
- [x] 2.3 Add explicit discussion/group mode handling to the conversation picker while preserving the p2p invite default.
- [x] 2.4 Align discussion and advanced-group settings/info page differences.
- [x] 2.5 Add Chinese and English localization for the new entry and flow copy.

## 3. Validation

- [x] 3.1 Run `npx tsc --noEmit`.
- [x] 3.2 Run `OPENSPEC_TELEMETRY=0 openspec validate align-team-entry-and-settings-with-android --type change --no-interactive`.
