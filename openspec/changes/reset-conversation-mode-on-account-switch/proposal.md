# Proposal

## Why

Cloud conversation mode is currently stored as a global preference and survives account switching. When one account enables cloud conversation and logs out, the next account incorrectly inherits that mode instead of defaulting back to local conversation. A follow-up issue also showed that resetting the global flag on logout wipes the same account's own preference, so re-login can no longer restore its prior choice.

## What Changes

- store cloud-conversation preference by IM account instead of as a single global flag
- make every newly logged-in account default to local conversation mode unless that same account explicitly enabled cloud conversation before
- preserve the same account's own conversation-mode choice across logout and re-login

## Impact

- affected spec: `auth-session-lifecycle`, `user-setting-page`
- affected code: `stores/AuthStore.ts`, `stores/PreferenceStore.ts`
