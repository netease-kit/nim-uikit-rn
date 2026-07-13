# Search Team Members By Display Name

## Summary

Update the RN team member list search so a submitted keyword matches both member account ID and the exact name shown in the member row.

## Motivation

The full team member list currently shows names using the member-list display precedence, but search can miss members whose visible name comes from user profile data. Users expect search results to follow the text they can see in the list, not only the account ID.

## Scope

- Build team member search entries from the same display-name resolver used by member rows.
- Keep existing account ID search behavior.
- Preserve existing sorting, role badges, remove actions, and large-list chunked search behavior.

## Out Of Scope

- Remote/cloud team-member search APIs.
- Search highlighting or UI layout changes.
