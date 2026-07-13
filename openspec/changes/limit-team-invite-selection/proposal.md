# Change: Limit Team Invite Selection

## Why

Inviting 201 friends to an existing team currently allows the picker to submit all selected accounts to the SDK. The SDK rejects the request with a generic `parameter error`, which does not tell the user the actionable selection limit.

## What Changes

- Cap a single team invite operation at 200 selected contacts.
- When the user attempts to select the 201st contact, show `最多只能选择200个联系人`.
- Keep the existing final team member limit validation for the target team.

## Impact

- Affects the team member picker invite flow under `app/team/member-picker.tsx`.
- Does not change team creation or other conversation picker flows.
