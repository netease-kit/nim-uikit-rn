# Align Contacts Friend List Display

## Why

The contacts test suite expects friend-list rows to use the same identity precedence as IM UIKit: remark first, then profile nickname, then account ID. This precedence affects the displayed row name, fallback avatar text, and pinyin grouping. The current contacts page prefers nickname before remark and shows an empty-state copy that does not match the friend-list testcase.

## What Changes

- Use `alias > nickname > accountId` for friend-list row titles and grouping.
- Pass the same resolved avatar source while relying on UIKit avatar fallback labels.
- Show the empty friend-list state as `暂无好友`.

## Impact

- Affected surface: `app/(tabs)/contacts.tsx`.
- No new dependencies.
- Validation uses targeted lint, TypeScript, and OpenSpec validation.
