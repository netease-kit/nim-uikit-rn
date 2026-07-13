## 1. Specification

- [x] 1.1 Define mention behavior for chat content, conversation previews, and forwarding.

## 2. Implementation

- [x] 2.1 Add Android-compatible mention metadata helpers for tracking text ranges and serializing `yxAitMsg`.
- [x] 2.2 Add team member mention selector and composer insertion/deletion behavior in chat detail.
- [x] 2.3 Send, reply, resend, and forward text messages with mention metadata and push configuration.
- [x] 2.4 Track current-user mention state in the local conversation store and clear it on conversation reset.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Run TypeScript, lint, and affected Expo startup validation.
