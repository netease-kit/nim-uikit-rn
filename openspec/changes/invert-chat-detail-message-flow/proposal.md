# Proposal

## Why

The RN chat detail page currently renders messages in forward order and then relies on repeated scroll-to-bottom corrections when the page opens. This adds extra scroll work on entry and differs from the desired message flow used by the Web implementation.

## What Changes

- render the chat detail message list in reverse visual flow so the latest messages are positioned at the initial visible edge
- make bottom anchoring use the inverted list origin instead of post-render scroll-to-end correction
- move history loading affordance and trigger logic to match the inverted message flow

## Impact

- affected spec: `chat-detail-message-flow`
- affected code: `app/chat/[id].tsx`
