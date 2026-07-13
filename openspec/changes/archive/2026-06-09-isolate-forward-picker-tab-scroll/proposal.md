## Why

The forward target picker renders Recent Chats, Friends, and Groups through one shared scroll container. Switching tabs reuses the same scroll offset, so scrolling one tab changes the visible position of the other tabs.

## What Changes

- Give each forward target tab its own mounted scroll container.
- Hide inactive tab panes instead of replacing one shared list body.
- Preserve the selected-target strip, recent-forward shortcut module, and tab header behavior.

## Impact

- Affected route: `app/chat/forward.tsx`
- Affected behavior: forward target picker tab scrolling
- No message payload, forwarding send logic, SDK API, or navigation contract changes.
