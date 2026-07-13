## Why

Collection list text previews currently render UIKit emoji keys as plain text in some paths. This is visible for collected emoji messages when the collection row uses a stored preview or when a text bubble is line-limited for the collection card.

## What Changes

- Render collection list text previews with the RN UIKit rich text renderer so supported UIKit emoji keys are displayed as emoji icons.
- Preserve the existing collection card line limits and metadata layout.

## Impact

- Affects My > Collection message preview rendering only.
- Reuses existing `UIKitChatRichText` emoji parsing and icon mapping.
