## 1. Implementation

- [x] Change add-friend input handling to avoid live searching while typing
- [x] Trigger account lookup only from the keyboard search submit action
- [x] Reset stale search result state when the input changes after a previous search

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate trigger-add-friend-search-on-submit --type change --no-interactive`
