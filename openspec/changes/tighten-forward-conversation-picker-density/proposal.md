# Proposal

## Why

The RN forward conversation picker currently uses loose spacing across the search area, recent targets, and target rows. This makes the forward target selection page feel visually sparse compared with the desired compact mobile layout.

## What Changes

- tighten the spacing in the RN forward conversation picker header area
- reduce recent-target and target-row visual density to a more compact layout
- keep the scope limited to the forward conversation selection page without changing forward behavior

## Impact

- affected spec: `forward-conversation-picker-density`
- affected code: `app/chat/forward.tsx`
