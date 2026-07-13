# Preserve trailing mention send

## Why

Team and discussion chat mention messages currently lose their mention effect when the composer only contains `@xxx ` or `@所有人 ` without additional message content. The composer trims the trailing space before send, while mention metadata validation still expects the original token including that space, so the `yxAitMsg` metadata is removed.

## What changes

- Preserve mention metadata when an intact mention token is the last visible message content after send-time trimming.
- Keep broken or partially edited mention tokens excluded from outgoing metadata.
- Keep existing normal text trimming behavior unchanged.

## Impact

- Affects RN team and discussion text-message mention sending.
- No navigation, layout, or native configuration changes.
