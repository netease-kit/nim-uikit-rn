## Evidence

- iPhone 真机控制台通过 `xcrun devicectl device process launch --console` 附着后，只看到应用启动、RN bundle 执行和 Expo 模块 warning；选择图片时的 `不支持该格式` 没有 native/SDK 错误输出。
- RN 文案 `chatUnsupportedFormat` 只在 `app/chat/[id].tsx` 的本地图片格式校验中触发。
- iOS 原生 `file_img_support` 为 `jpg/jpeg/png/tiff/heic/gif`，说明 HEIC/TIFF 在 iOS 原生侧属于允许图片格式。
- Android 原生图片有效性检查仍以 `jpg/jpeg/png/bmp/gif` 为主，RN 本次不扩大 Android 图片格式范围。

## Approach

- Keep the generic RN image whitelist unchanged for Android.
- Add an iOS-specific image extension whitelist that extends the generic list with `heic`, `heif`, `tiff`, and `tif`.
- Add an iOS-specific image MIME whitelist that extends the generic list with `image/heic`, `image/heif`, and `image/tiff`.
- Route both `expo-image-picker` and `expo-media-library` image validation through the platform-aware helpers.
