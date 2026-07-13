## 1. Implementation

- [x] 1.1 Inspect chat multi-select message click handling in RN UIKit bubble components
- [x] 1.2 Restrict multi-select selection toggling to message bubble body clicks only
- [x] 1.3 Disable non-bubble child interactions in multi-select mode without affecting normal mode

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`
- [x] 2.2 Run `npm run lint`
- [x] 2.3 Run `OPENSPEC_TELEMETRY=0 openspec validate suppress-chat-attachments-in-selection-mode --type change --no-interactive`
