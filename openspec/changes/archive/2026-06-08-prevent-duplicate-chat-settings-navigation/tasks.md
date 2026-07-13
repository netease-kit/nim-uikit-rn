## 1. Implementation

- [x] 1.1 Add duplicate-navigation protection to the chat detail header settings entry.
- [x] 1.2 Apply the protection to both team and P2P settings routes.
- [x] 1.3 Extend the protection to other high-frequency chat, detail, and settings navigation entries.
- [x] 1.4 Reset the protection after returning to the source screen.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `OPENSPEC_TELEMETRY=0 openspec validate prevent-duplicate-chat-settings-navigation --type change --no-interactive`.
