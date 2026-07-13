## Context

`useNavigationLock` stores the lock in a ref and clears it from `useFocusEffect`. Ref changes do not cause React to re-render. Pages such as the joined-team list and conversation search pass `disabled={isNavigationLocked()}` to row pressables, so a render that happens while the lock is active can leave the row visually and interactively disabled after focus returns.

## Decision

Keep the ref for synchronous duplicate-tap protection, and add a small state revision that increments whenever the lock is set or reset. This keeps existing call sites and sync behavior, while ensuring consumers that call `isNavigationLocked()` during render re-render after the lock clears.

## Risks

- The hook is shared across many pages, so the change must preserve the existing `runWithNavigationLock` return value and immediate lock semantics.
- Extra re-renders should be limited to lock transitions only.
