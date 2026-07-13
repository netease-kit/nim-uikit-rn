## Context

Native Android and iOS both expose a message-level sending status before the outgoing message bubble. RN already has attachment-local upload/download progress affordances, but attachment sends still need the message-level loading where the native UIKit shows it.

## Native Alignment

- iOS `NEBaseChatMessageCell` adds `ChatActivityIndicatorView` before the right bubble, sized 22 x 22, right-aligned to the bubble left by `chat_content_margin`, and vertically centered to the bubble. `ChatActivityIndicatorView` uses a gray `UIActivityIndicatorView` while the message sending state is `SENDING`.
- Android `chat_base_message_view_holder.xml` defines a 16 x 16 `messageStatus` area before the message content group, bottom-aligned to the content group with 3dp end margin. `ChatBaseMessageViewHolder` shows its `ProgressBar` for sent messages in `SENDING` unless the message cell disables `showSendingStatus`.
- Android image and video cells keep the default message-level sending status. Android file cells set `showSendingStatus = false`, so file sends only show the file icon area's circular progress.

## RN Approach

- Reuse React Native `ActivityIndicator` for the platform-native spinner implementation.
- Gate the message-level loading to outgoing, non-read-only messages whose `sendingState` is `SENDING`.
- Show it for image and video on both Android and iOS.
- Show it for file only on iOS, preserving Android's file-specific disablement.
- Keep the existing attachment-local progress overlays unchanged so upload/download progress remains deterministic.
