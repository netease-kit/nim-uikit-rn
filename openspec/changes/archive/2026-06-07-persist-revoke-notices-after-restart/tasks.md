## 1. Specification

- [x] 1.1 Define recall notice and re-edit recovery requirements for offline sync and process restart.

## 2. Implementation

- [x] 2.1 Hydrate RN recall maps from persisted message extension fields when messages are merged or history is loaded.
- [x] 2.2 Preserve recalled text and revoke time so `重新编辑` visibility survives re-entry and restart.

## 3. Validation

- [x] 3.1 Run OpenSpec validation.
- [x] 3.2 Run TypeScript and lint validation.
