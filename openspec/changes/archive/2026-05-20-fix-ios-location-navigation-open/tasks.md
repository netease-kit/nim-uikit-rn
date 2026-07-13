## 1. Spec Alignment

- [x] 1.1 Record the iOS location-detail navigation fallback requirement in OpenSpec.
- [x] 1.2 Confirm the current RN location-detail flow aborts when an iOS third-party map scheme cannot be queried.

## 2. Implementation And Validation

- [x] 2.1 Update `app/chat/location-detail.tsx` so map URL probing is per-target tolerant and falls back to system/web map targets with the same coordinates.
- [x] 2.2 Update `app.json` so iOS declares the third-party map query schemes used by the location-detail flow.
- [x] 2.3 Validate the OpenSpec change, lint/typecheck the app, and start the affected Expo target to confirm the project still boots.
