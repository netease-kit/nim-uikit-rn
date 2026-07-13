# Proposal

## Why

Many notification-only toast calls pass both a title and description through `toast.alert(title, message)`, which currently renders two lines. The desired toast presentation should show only the descriptive content when both fields are present.

## What Changes

- Update shared alert-toast formatting so `toast.alert(title, message)` shows only `message` when `message` is non-empty.
- Preserve title-only toast behavior by showing `title` when no description is provided.
- Apply the same formatting rule to web and native toast utilities.

## Impact

- Affects all shared `toast.alert` calls across RN and web-compatible UIKit code.
- Does not change multi-button confirmation dialogs implemented with system alerts.
