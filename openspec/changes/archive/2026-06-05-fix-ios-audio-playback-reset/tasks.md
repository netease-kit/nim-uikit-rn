## 1. Implementation

- [x] 1.1 Restore explicit playback audio mode before voice message playback.
- [x] 1.2 Normalize audio attachment sources for native playback, prefer received-message remote URLs, and upgrade HTTPS-capable NOS URLs.
- [x] 1.3 Download remote received voice sources to a local file before native playback.
- [x] 1.4 Create the native audio player from a resolved source instead of an empty async-download player.
- [x] 1.5 Add playback-start fallback cleanup that does not depend on status updates.

## 2. Validation

- [x] 2.1 Validate the OpenSpec change.
- [x] 2.2 Run TypeScript and lint checks.
- [x] 2.3 Start the affected Expo target or record the local blocker.
