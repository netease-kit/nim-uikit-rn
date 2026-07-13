# Proposal

## Why

The RN conversation list and chat detail empty states do not match the expected product behavior. An empty conversation list should show the standard illustration empty state with "暂无会话", and an empty chat detail should show a centered notification-style "没有更多了" tip instead of a plain empty-message text.

## What Changes

- show the standard empty-state illustration and copy when the conversation list has no conversations
- show the chat empty state as a centered notification-style "没有更多了" tip when a conversation has no messages

## Impact

- affected spec: `conversation-list`, `chat-detail`
- affected code: `app/(tabs)/index.tsx`, `app/chat/[id].tsx`
