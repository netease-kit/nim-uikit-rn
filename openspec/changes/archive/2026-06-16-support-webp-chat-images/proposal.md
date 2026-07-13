## Why

当前 RN 聊天链路对图片格式做了本地白名单限制，导致 WebP 图片不能稳定进入图片发送流程，也不能在文件消息场景中被统一识别成可预览图片。这会让 WebP 图片在聊天里出现“不能发送”或“只能当普通文件”的行为缺口。

## What Changes

- 将 WebP 纳入 RN 聊天图片发送支持范围。
- 将 WebP 纳入文件消息和媒体查看器的图片可预览识别范围。
- 保持现有图片发送、预览和文件打开链路不变，仅扩展 WebP 格式支持。

## Capabilities

### New Capabilities

### Modified Capabilities

- `chat-message-content`: 聊天附件消息类型需要支持 WebP 图片的发送、渲染和预览识别。

## Impact

- Affected code: `app/chat/[id].tsx`, `utils/fileTransfer.ts`, `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: image selection whitelist, WebP message sending, WebP file preview recognition
- No API, dependency, or backend impact.
