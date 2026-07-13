## 1. Spec Alignment

- [x] 1.1 Record that chat-detail limited photo access must only expose currently authorized assets.
- [x] 1.2 Confirm the existing RN chat flow still routes limited permission through `expo-image-picker`, which can expose non-authorized assets.

## 2. Implementation

- [x] 2.1 Update `app/chat/[id].tsx` so the chat image entry opens an in-app media picker backed by `expo-media-library`.
- [x] 2.2 Keep existing validation rules for mixed image/video selection, single-video selection, and “add more photos”.
- [x] 2.3 Keep denied permission flows unchanged while routing full and limited album access through the in-app media picker.
- [x] 2.4 Update the chat media picker UI so the first selected media type disables the other type, the max selection count disables remaining unselected assets, and the confirm action shows `确定(数量)`.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Run `npx tsc --noEmit`.
- [x] 3.3 Run lint and confirm Metro is running on 8081.
