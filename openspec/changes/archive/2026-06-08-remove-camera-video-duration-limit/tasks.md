## 1. Implementation

- [x] 1.1 Remove chat page video duration validation from camera and media video send paths.
- [x] 1.2 Enforce video file size validation for recorded camera videos before sending.
- [x] 1.3 Remove Android custom camera's 60 second auto-stop recording limit while keeping the recording timer UI.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate remove-camera-video-duration-limit --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
- [x] 2.3 Run targeted ESLint for changed TypeScript files.
- [x] 2.4 Verify Metro on fixed port 8081 remains available.
