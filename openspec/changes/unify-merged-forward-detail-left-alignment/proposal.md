# Proposal

## Why

The merged-forward detail page currently still distinguishes between self-sent and other-sent placeholder cards for audio and call messages, which makes the page visually inconsistent. In this read-only detail page, all messages should align to the left.

## What Changes

- make all merged-forward detail message rows render with left-side alignment regardless of whether the original sender is the current user
- align audio and call placeholder cards with the same left-side presentation already used by read-only message bubbles

## Impact

- affected spec: `merged-forward-detail`
- affected code: `app/chat/merged-forward-detail.tsx`
