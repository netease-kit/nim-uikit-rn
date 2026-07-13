# Proposal

## Why

Several RN pages still rely on hardcoded bottom spacing for fixed bottom regions or absolutely positioned bottom elements. These pages should reserve the device bottom safe area explicitly.

## What Changes

- add bottom safe-area reservation to fixed bottom panels and composer regions on affected RN pages
- add bottom safe-area reservation to absolutely positioned bottom elements on affected RN pages
- keep the existing page interactions and layout hierarchy unchanged apart from safe-area spacing

## Impact

- affected spec: `page-safe-area-behavior`
- affected code: `app/chat/location-detail.tsx`, `app/chat/message-preview.tsx`, `app/chat/forward-selected.tsx`, `app/home.tsx`, `app/user/setting.tsx`
