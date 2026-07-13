# Proposal

## Why

The conversation page header in RN currently uses search and add icons that do not match the Android implementation. The header should reuse the Android icon style for cross-platform visual consistency.

## What Changes

- align the conversation page search icon with the Android conversation header icon
- align the conversation page add icon with the Android conversation header icon
- scope the icon swap to the conversation page header so other existing icon usages stay unchanged

## Impact

- affected spec: `conversation-header-icons`
- affected code: `app/(tabs)/index.tsx`, `src/NEUIKit/rn/icon.tsx`
