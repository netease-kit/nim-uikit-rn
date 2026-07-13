## 1. Implementation

- [x] Update forwarding target selection spec for deleted-friend retained conversations
- [x] Include retained P2P recent-chat conversations for deleted friends
- [x] Include retained P2P recent-forward conversations for deleted friends

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `npm run lint`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate include-deleted-friend-forward-conversations --type change --no-interactive`
- [x] Verify Metro status on port 8081
