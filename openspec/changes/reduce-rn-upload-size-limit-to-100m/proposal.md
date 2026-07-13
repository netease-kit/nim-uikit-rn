# Proposal

## Why

RN currently blocks local attachments only after they exceed 200 MB, but the active React Native NOS upload path rejects smaller large videos with `413 Request Entity Too Large` before the send can complete. This produces a slow upload failure instead of an immediate local validation message.

## What Changes

- Reduce the RN local pre-send upload size limit for images, videos, and files from 200 MB to 100 MB.
- Update localized oversize copy so the user-facing limit matches the actual RN behavior.

## Capabilities

### Modified Capabilities

- `chat-send-failure-feedback`: oversized attachment pre-send validation and copy.
- `chat-composer-actions`: chat image, video, and file send entry validation.

## Impact

- Affected code: `app/chat/[id].tsx`, `utils/app-language.ts`
- Affected behavior: chat image/video/file local size validation and oversize feedback
- No SDK API, backend, message schema, or stored message migration impact.
