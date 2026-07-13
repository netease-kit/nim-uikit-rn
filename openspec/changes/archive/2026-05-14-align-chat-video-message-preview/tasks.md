## 1. Spec

- [x] 1.1 Add a chat video-message preview requirement for sending/loading/success states

## 2. Implementation

- [x] 2.1 Update RN chat video-message rendering to show a preview surface instead of a text-only card
- [x] 2.2 Show a loading state while a local video message is still sending
- [x] 2.3 Show the video first-frame preview after the send succeeds
- [x] 2.4 Add an Android-only original-video toggle and map it to passthrough video export
- [x] 2.5 Differentiate portrait and landscape video card dimensions in the chat timeline
- [x] 2.6 Prevent media-viewer `conversationId` params from triggering root offline-push redirects
- [x] 2.7 Allow Android media-viewer WebView playback from downloaded local video files
- [x] 2.8 Handle Android Expo Go media-library save permission rejection with user-facing copy
- [x] 2.9 Preserve document file extensions when caching downloaded attachments
- [x] 2.10 Open downloaded chat files directly from chat detail instead of routing to file-detail
- [x] 2.11 Infer PDF extension from downloaded file content before opening when metadata is missing
- [x] 2.12 Open Android document files with explicit MIME type instead of relying on temporary file names

## 3. Validation

- [x] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate align-chat-video-message-preview --type change --no-interactive`
- [x] 3.2 Run `npx eslint 'app/chat/[id].tsx'`
- [x] 3.3 Run `npx tsc --noEmit`
