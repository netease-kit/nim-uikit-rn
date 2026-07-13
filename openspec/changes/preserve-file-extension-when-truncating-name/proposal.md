## Why

当前 RN 文件消息在文件名超长时会整体省略，导致文件后缀也被截断，用户无法快速识别文件类型。React Web 端已采用“主文件名省略、后缀保留”的展示方式。

## What Changes

- 将 RN 文件消息标题改为分段展示主文件名和后缀。
- 在文件名超长时仅省略主文件名，始终保留文件后缀。

## Capabilities

### Modified Capabilities

- `chat-detail`: 文件消息标题超长时需要保留文件后缀可见。

## Impact

- Affected code: `src/NEUIKit/rn/chat-message-bubble.tsx`
- Affected behavior: file message filename truncation in RN chat detail
- No API, dependency, or backend impact.
