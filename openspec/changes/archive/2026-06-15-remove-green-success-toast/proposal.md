## Why

当前 RN 中 `toast.success` 会显示绿色提示气泡，和现有页面期望不一致。验证消息页面的清空提示不应特殊着色，其他页面也不应再出现绿色 toast。

## What Changes

- 统一 RN toast 的成功提示视觉样式，使其与普通 toast 一致。
- 保留现有 `toast.success` 调用方式，不要求逐页替换调用点。
- 不改变 warning、error 等其它提示类型的视觉语义。

## Capabilities

### New Capabilities

### Modified Capabilities

- `toast-feedback`: 成功 toast 的视觉样式需要与普通 toast 统一。

## Impact

- Affected code: `src/NEUIKit/common/utils/toast.ts`, `src/NEUIKit/common/utils/native-toast-host.tsx`
- Affected behavior: all RN/web toast success styling
- No API, dependency, or backend impact.
