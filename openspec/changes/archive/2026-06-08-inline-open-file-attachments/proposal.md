# Inline Open File Attachments

## Why

Merged-forward detail, collection, and pinned-message list currently route file-message taps to the standalone file detail page. Native behavior keeps users on the current message surface, shows download progress on the file message bubble, and opens the file directly after download, falling back to the system app chooser when no in-app viewer can open it.

## What Changes

- Add a shared RN file-attachment open flow that downloads to local storage, exposes per-message progress, and opens the local file through the platform file opener.
- Use that flow from merged-forward detail, collection list, and pinned-message list file messages instead of routing to `/chat/file-detail`.
- Pass the shared download state into the existing chat message bubble so the file icon area shows the native circular download progress.

## Impact

- Affects tapping file messages from merged-forward detail, collection, and pinned-message list pages.
- Does not remove the existing standalone file detail page for routes that still explicitly use it.
