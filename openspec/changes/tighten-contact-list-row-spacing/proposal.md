## Why

The RN "My Teams" and "My AI Users" pages currently use row spacing that is looser than the conversation list baseline, making both pages feel visually sparse.

## What Changes

- Tighten vertical spacing on the "My Teams" and "My AI Users" list rows.
- Align their row density more closely with the conversation list feel.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `contact-list-density`: Team and AI-user list rows use tighter vertical spacing.

## Impact

- Affected code: `app/contacts/teamlist.tsx`, `app/contacts/ai-users.tsx`
- Affected behavior: list row density on team and AI-user pages
