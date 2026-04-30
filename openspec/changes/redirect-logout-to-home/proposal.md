## Why

The current manual logout flow sends the user to `login`, while the app's unauthenticated default
entry is `home`. This makes the post-logout landing inconsistent with the rest of the unauthenticated
routing model.

## What Changes

- Update the manual logout flow so confirming logout returns the user to `home`.
- Keep session clearing and async NIM logout behavior unchanged.
- Align the logout redirect requirement with the existing unauthenticated root-layout routing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `auth-session-lifecycle`: manual logout now lands on `home` instead of `login`

## Impact

- Affected specs: `openspec/specs/auth-session-lifecycle/spec.md`
- Affected code: `app/user/setting.tsx`
- No API, dependency, or storage model change
