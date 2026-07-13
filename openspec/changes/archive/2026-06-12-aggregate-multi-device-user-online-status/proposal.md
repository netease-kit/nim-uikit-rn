# Proposal

## Why

The RN online-status cache currently stores only one latest status record per account. When a multi-device user logs out on one device, that single offline event can overwrite the whole account status, causing the contact to appear offline even though other devices remain online.

## What Changes

- aggregate user online status by account and client device instead of keeping only one raw status per account
- treat an account as online when any subscribed device status remains in login state
- keep the latest offline state only when all tracked device states are offline

## Impact

- affected spec: `user-online-status`
- affected code: `src/NEUIKit/rn/user-status.ts`
