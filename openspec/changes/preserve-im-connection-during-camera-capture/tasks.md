## 1. Investigation

- [x] 1.1 Inspect RN chat camera capture, AppState, NIM connection, and network precheck paths.
- [x] 1.2 Compare Android native chat camera capture behavior and NIM foreground/background APIs.
- [x] 1.3 Capture Android real-device evidence that the system camera Activity is involved during reproduction.

## 2. Implementation

- [x] 2.1 Add a shared native camera capture lifecycle marker with automatic stale-state protection.
- [x] 2.2 Route `launchCameraAsync` through a shared ImagePicker adapter so photo and video camera entries are marked for the duration of native capture.
- [x] 2.3 Skip app-level NIM background-state sync and guard SDK-level `setAppBackground(true)` when AppState changes are caused by active chat camera capture.
- [x] 2.4 Wait for the NIM login and connection state before sending, and retry once when the native SDK reports a transient `illegal state` after returning from camera.
- [x] 2.5 Replace Android chat camera capture with an in-app CameraX capture Activity so ColorOS does not switch the foreground app to `com.oplus.camera` and close the IM socket.
- [x] 2.6 Polish the in-app CameraX UI with icon controls, flash toggle, recording timer, immediate record/stop visual state, and 60s auto-stop feedback.

## 3. Validation

- [x] 3.1 Validate OpenSpec change.
- [x] 3.2 Run TypeScript check.
- [x] 3.3 Reinstall or refresh Android real device on Metro 8081 and verify camera capture no longer triggers IM disconnect. Verified on device `WOVGTGW4I7PR6DRG`: Android uses `com.netease.yunxin.app.im/.camera.NIMCameraCaptureActivity`, no `OAppNetControlService Close socket:[10445]`, no `Hans update:[10445=true]`, no NIM `onConnectStatus` disconnect/reconnect, and video send completed successfully.
- [x] 3.4 Compile the polished Android CameraX Activity and reinstall the updated debug build on Android real device.
