## 1. Implementation

- [x] 1.1 Prevent reply-preview taps from jumping when the source message is missing, revoked, or deleted.
- [x] 1.2 Render file-message reply previews as `[文件消息]`.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`, `npm run lint`, and `OPENSPEC_TELEMETRY=0 openspec validate stabilize-reply-jump-and-file-preview --type change --no-interactive`.
