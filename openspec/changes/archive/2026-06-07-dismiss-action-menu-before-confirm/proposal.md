# Proposal

## Why

When the user long-presses a message and chooses Delete or Recall, the message action menu remains visible while the native confirmation alert is shown. The two overlays overlap, which makes the flow visually inconsistent and harder to operate.

## What Changes

- dismiss the long-press message action menu before showing the Delete confirmation
- dismiss the long-press message action menu before showing the Recall confirmation
- keep the selected message stable for the confirmation callback after the action menu is dismissed

## Impact

- affected spec: `chat-message-actions-and-receipts`
- affected code: `app/chat/[id].tsx`
