## Why

RN chat currently waits for each selected image or video to finish its send path before starting the next one. Android and iOS native chat dispatch each selected media item immediately after selection, so RN feels slower and diverges from the native batch-send behavior.

## What Changes

- Change limited-media multi-select sending so selected assets are prepared in batch and valid assets are dispatched together instead of being awaited one by one.
- Keep existing per-message send semantics, upload progress, and failure state handling for each individual message.
- Prevent a single selected asset preparation or send failure from blocking the dispatch of other valid selected assets.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `chat-composer-actions`: multi-selected image and video sends from the chat media picker now dispatch without serial waiting and do not block sibling selections when one item fails.

## Impact

- Affected code: `app/chat/[id].tsx`
- Affected behavior: chat media-picker batch send flow for limited photo/video access and normal selected media dispatch
- No API or dependency changes
