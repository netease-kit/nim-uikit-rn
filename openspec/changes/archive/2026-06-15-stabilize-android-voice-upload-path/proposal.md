## Why

Android voice recording currently sends the recorder cache URI directly to the SDK. On some devices the NOS upload stream closes immediately for that transient cache file, so voice messages fail with `status: 0` and `Stream Closed` before upload can proceed.

## What Changes

- Stabilize Android recorded voice files into app-local persistent storage before creating the SDK audio message.
- Verify the stabilized local file still exists before send and keep existing localized failure feedback when the file cannot be prepared.
- Retry the initial Android voice upload once after a short settle delay when NOS returns the transient `status: 0 / Stream Closed` failure.
- Preserve the existing iOS voice send path and the existing voice composer interaction flow.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `chat-voice-messages`: Android recorded voice send preparation now requires a stable local file URI before SDK send.
- `chat-send-failure-feedback`: Android recorded voice sends must fail early with existing user feedback if the recorded file cannot be stabilized locally.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: Android voice recording send preparation, transient upload retry, and failure handling
- No backend, SDK API contract, or message schema changes
