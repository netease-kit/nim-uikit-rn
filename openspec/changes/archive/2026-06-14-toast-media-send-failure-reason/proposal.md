# Proposal

## Why

Voice, image, video, and file messages can fail after the SDK send call returns a server-side failure state. The chat UI currently leaves only the failed-message icon visible and does not surface the server failure reason to the user.

## What Changes

- Show a toast with the resolved failure reason when attachment message sending fails for non-antispam reasons.
- Map NOS upload `413 Request Entity Too Large` failures to an upload-request rejection toast that does not claim the file exceeds the local 200 MB limit.
- Preserve existing failed-message icon rendering and resend behavior.
- Keep antispam-specific handling unchanged.

## Impact

- affected spec: `chat-send-failure-feedback`
- affected code: `app/chat/[id].tsx`, `stores/MessageStore.ts`, `utils/error-message.ts`, `utils/app-language.ts`
