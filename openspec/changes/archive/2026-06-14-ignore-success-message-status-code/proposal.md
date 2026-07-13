# Proposal

## Why

The RN message send flow treats any numeric `messageStatus.errorCode` returned by the SDK as a failed send. Some successful media sends return `messageStatus.errorCode = 200` together with `sendingState = SUCCEEDED`, which causes RN to incorrectly throw `Error: 200`, show a failure toast, and keep the send promise rejected even though the SDK completed the send.

## What Changes

- Treat `messageStatus.errorCode = 200` as success when evaluating SDK send results.
- Continue treating failed sending state and non-200 `messageStatus.errorCode` values as send failures.
- Preserve the existing failed-message affordance and toast handling for real media send failures.

## Impact

- affected spec: `chat-send-failure-feedback`
- affected code: `stores/MessageStore.ts`
