## Why

RN chat mention composition is currently limited to team members, so group and discussion chats omit AI chat users and P2P chats do not open the mention selector. Native Android supports mentioning AI chat users that are marked for AI chat, and RN needs the same visible behavior.

## What Changes

- Include AI chat users in the group or discussion mention selector even when they are not team members.
- Keep the existing `@所有人` permission rule and display AI chat users immediately below that option.
- Open the mention selector in friend P2P chats when AI chat users are available and the peer is not an AI user.
- Filter AI candidates with the Android-native `serverExtension.aiChat == 1` rule.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-message-content`: extend mention composition to include AI chat users and P2P AI mentions.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: chat composer `@` trigger, mention selector candidate list, and mention token insertion in team/discussion and P2P chats
- No dependency, SDK configuration, or message metadata format changes.
