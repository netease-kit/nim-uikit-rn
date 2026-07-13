# Design

## Native Reference

Native iOS `ChatViewController` marks the file action with `isFile = true`, then opens a bottom file action that can lead either to `UIDocumentPickerViewController` or album selection. When album media is selected while `isFile == true`, native iOS sends the resolved image/video path through `sendFileMessage(...)` instead of image/video message APIs.

## RN Approach

The RN chat screen already has:

- a document picker based file send path
- photo-library permission handling
- a custom limited-media picker for photo/video assets
- local media asset resolution before upload

The implementation will split document sending from the public file action:

- `handlePickDocumentFile` keeps the existing document picker behavior.
- `handlePickFile` becomes the file action entry. On iOS it asks for album or Files/iCloud. On non-iOS it calls `handlePickDocumentFile`.
- The limited-media picker receives a mode: `media` for the existing image/video action and `file` for the file action.
- In `file` mode, selected media assets are resolved locally and sent via `messageStore.sendFileMessage(...)`.

## Selection Rules

The existing media action keeps its restrictions: images and videos cannot be mixed, and only one video can be selected. The iOS file-from-album mode allows selecting photo and video assets together up to the existing media count limit because all selected assets are sent as file messages.

## Validation

Validate with OpenSpec, TypeScript, lint, and Metro status. Manual verification should use an iOS physical device or simulator:

1. Tap chat file action.
2. Choose album.
3. Select a photo or video.
4. Confirm that the outgoing message is a file message.
5. Choose Files/iCloud and confirm the existing document file send path still works.
