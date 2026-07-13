## Why

On a physical iPhone the chat detail page can show the network-unavailable banner while messages still send successfully. The page currently combines IM connection state with a separate React Native NetInfo reachability check. On iOS physical devices, NetInfo reachability can report unavailable even while the IM SDK is connected and message sending works, causing a false offline banner.

## What Changes

- Align the chat detail network banner with the conversation list behavior: authenticated users should see no offline banner when the IM SDK is logged in and connected.
- Remove the chat detail page's independent NetInfo banner gate so false iOS reachability results do not override a healthy IM connection.
- Preserve the existing connecting/offline banner behavior when the IM login or connection state is genuinely not ready.

## Impact

- Affected spec: `chat-detail`
- Affected route: `app/chat/[id].tsx`
- No change to message sending, login, or NIM initialization behavior.
