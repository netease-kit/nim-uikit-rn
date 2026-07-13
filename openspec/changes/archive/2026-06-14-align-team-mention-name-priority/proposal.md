# Change: Align Team Mention Name Priority

## Why

RN Android can show an account ID for non-friend members in the team chat `@` mention selector even when a group nickname or personal nickname is available. RN Android and RN iOS should use the same name priority in the selector, and the text inserted into the composer should follow the native `@` highlight priority rather than reusing the selector's friend-alias-first label.

## What Changes

- Use `好友备注名 > 群昵称 > 个人昵称 > accid` for the team chat mention selector row name.
- Use `群昵称 > 个人昵称 > accid` for the `@xxx` token inserted into the composer after a member is selected.
- Keep `@所有人` behavior unchanged.
- Recompute mention selector names when asynchronously loaded user or friend profile data becomes available.

## Impact

- Affects team chat `@` mention selection and composer insertion on RN Android and RN iOS.
- Does not change mention payload structure, push target account IDs, or message rendering.
