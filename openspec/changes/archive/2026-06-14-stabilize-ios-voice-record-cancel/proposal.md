## Why

iPad real-device reproduction shows valid voice recordings are sometimes discarded after release because the composer marks the touch as cancelled when the finger briefly leaves the circular record button near the top edge. The recorded file and duration are valid, but the send path is skipped before the SDK is called.

## What Changes

- Change voice recording cancellation to use the circular record button radius plus a 20px edge tolerance instead of cancelling at the exact visual button edge.
- Keep valid recordings sendable when the user releases within the tolerated edge area after the minimum duration.
- Keep diagnostic voice logs available while validating the fix on iOS devices.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-voice-messages`: voice recording cancellation should not discard valid recordings for incidental movement within the tolerated edge area.

## Impact

- Affected code: `app/chat/[id].tsx`, `utils/app-language.ts`
- Validation: OpenSpec change validation, TypeScript check, lint, and iPad real-device voice send reproduction.
