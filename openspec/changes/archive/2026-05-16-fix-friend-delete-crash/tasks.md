## 1. Spec

- [x] 1.1 Add the delete-friend crash fix proposal
- [x] 1.2 Update the friend-card relationship mutation spec for stable delete transitions

## 2. Implementation

- [x] 2.1 Guard the friend-card delete flow with a stable transition state until navigation completes
- [x] 2.2 Sync local friend state immediately after delete success so observers do not render stale relation data

## 3. Validation

- [x] 3.1 Run static validation for the changed TypeScript surfaces
- [x] 3.2 Validate the OpenSpec change and boot the affected Expo target
