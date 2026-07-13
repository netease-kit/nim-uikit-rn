# Proposal

## Why

The RN conversation list should not continue to show invalid team conversations after the team becomes unavailable.

## What Changes

- filter invalid team conversations from the RN conversation list data source
- keep the invalid-conversation rule aligned with the existing conversation-store bridge logic
- keep conversation list interactions unchanged for valid conversations

## Impact

- affected spec: `conversation-list-invalid-filter`
- affected code: `app/(tabs)/index.tsx`
