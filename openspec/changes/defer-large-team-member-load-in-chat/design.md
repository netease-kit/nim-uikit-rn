## Context

The chat screen previously called `teamStore.loadMembers(targetId)` when entering any team conversation. For a 3000-member team this paginates through the whole member list and then fetches user profiles for all members, which can block Android's JS thread before the user can interact with the chat.

## Goals / Non-Goals

**Goals:**

- Keep team chat entry responsive for large groups.
- Preserve mute and role checks by fetching only the current user's team member record.
- Preserve full member loading for mention and team-management flows.
- Prevent duplicate large member requests when multiple effects ask for the same data.

**Non-Goals:**

- Redesign team member pages or mention picker UI.
- Change message loading, unread clearing, or team metadata refresh behavior.
- Change backend API behavior or SDK request limits.

## Decisions

- Chat entry uses `getTeamMemberListByIds` for the current user and preloads one bounded member page of 150 records.
  This keeps role-related composer behavior accurate and warms member cache without pulling thousands of members.
- `TeamStore.applyTeamMembers` no longer marks a team as fully loaded when applying partial member updates.
  This keeps mention picker and member pages able to detect that the full member list is still missing.
- `TeamStore.loadMembers` and `loadMembersByIds` share in-flight promises per team/query key.
  This avoids duplicate pagination requests from repeated effects, hot reload, or adjacent screens.
- `TeamStore.preloadMembers` has its own in-flight promise and does not mark the full member list as loaded.
  Mention picker and member-management flows can still detect that the complete member set is missing and request `loadMembers`.
- The team member screen uses `TeamStore.loadMembers`, matching the Android native strategy that allows loading the full member list and relies on the list view to virtualize rendering.
- Full member loading uses a high page limit aligned with Android's full-member path and applies each returned SDK page to MobX while the request continues.
- The team member list fetches missing user profiles from visible rows via FlatList viewability callbacks.
  This keeps avatar/name enrichment proportional to what the user can see.
- The team member list increases render batch/window settings and avoids per-row full-member scans.
  It keeps FlatList virtualization enabled so thousands of loaded member records do not mount as thousands of row views.
- The mention picker uses the same large-list virtualization posture as the member list and fetches visible candidate profiles instead of all team member profiles.
  This avoids blocking the mention sheet with all-member profile enrichment when users scroll quickly.
- Team member search is submitted explicitly from the search action and keeps virtualization enabled.
  This avoids filtering and rendering thousands of already-loaded rows on every keystroke.
- The search input owns its draft text locally and only notifies the member page on submit or clear.
  This prevents each typed character from re-rendering the large member list.

## Risks / Trade-offs

- Current-user role depends on `getTeamMemberListByIds` success. If it fails, the UI falls back to existing default behavior and does not trigger a full member load.
- Full team member browsing may issue multiple SDK member-list pages up front for very large teams. Rendering remains virtualized, but the in-memory member model contains the full loaded set.
- Searching the team member list can only match names that are available from member nicknames, aliases, or profiles already loaded for visible rows. Account IDs remain available as fallback display data.
