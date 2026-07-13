# Change: Stabilize Team Mention Candidates

## Why

The team chat mention sheet can occasionally show only the `@all` entry and omit regular team members. This happens when the sheet opens before the team member cache is loaded or while AI user metadata is still loading.

## What Changes

- Track whether a team's member list has been loaded.
- Load team members when opening the mention sheet if the list has not been loaded yet.
- Do not gate regular team member candidates on AI user metadata readiness.
- Keep filtering AI users from the mention sheet once AI user metadata is available.

## Impact

- Affects the team chat `@` mention candidate list.
- Does not change message sending, mention payload format, or non-team chats.
