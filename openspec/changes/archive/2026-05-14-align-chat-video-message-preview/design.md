## Context

The chat detail screen renders attachment messages and owns the tap flow for media and document
attachments. Video playback is delegated to the media-viewer route, while document opening depends
on Expo file-system caching and Android content intents.

This change spans chat message rendering, media-viewer playback/save behavior, and shared file
transfer helpers. Android Expo Go is the primary validation target, so native-module availability
and Android file URI handling must be treated explicitly.

## Goals / Non-Goals

**Goals:**

- Render video messages as preview cards with sending, downloaded, and playable states.
- Keep downloaded media and documents reusable across repeated taps.
- Preserve or infer document file extensions before opening cached files.
- Use Android-compatible content URIs and explicit MIME types for document viewers.
- Keep Expo Go permission failures user-readable.

**Non-Goals:**

- Replace the media-viewer with a native video player.
- Persist downloaded chat attachments into user-visible shared storage by default.
- Redesign unrelated attachment message types.

## Decisions

- Keep chat tap state in the chat route with `downloadedVideoMap`, `downloadingVideoIds`,
  `downloadedFileMap`, and `downloadingFileIds`.
  This keeps transient cache state local to the timeline and avoids changing shared store shape.

- Use `expo-file-system` app-private storage for attachment cache.
  This is sufficient for repeated playback/opening and does not require storage permissions. User
  visible export remains a separate save action.

- Use the Android media-viewer WebView for local video playback and enable file access settings.
  This minimizes route and dependency churn while allowing Expo Go playback of cached `file://`
  video sources.

- Open Android documents via `expo-intent-launcher` with `ACTION_VIEW`, a content URI, and an
  explicit MIME type.
  Android viewers are unreliable when asked to infer type from Expo temporary names, especially for
  extensionless PDFs.

- Infer missing document extensions from cached file headers only for common formats.
  This fixes PDFs without introducing a broad or brittle content-sniffing subsystem.

## Risks / Trade-offs

- App-private downloads are not visible in Android file managers -> the UI describes them as cached
  for opening, while explicit save/export remains a separate action.
- External Android viewers may still be unavailable for a MIME type -> opening failures surface as
  user-facing alerts.
- Header sniffing covers only common formats -> unknown files still fall back to generic MIME.
