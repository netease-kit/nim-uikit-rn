## 1. Implementation

- [x] 1.1 Add the cloud-conversation switch row back to `/user/setting`.
- [x] 1.2 Persist the cloud-conversation preference and feed it into later NIM initialization/login configuration.
- [x] 1.3 Keep the existing RN settings entries and logout action intact.

## 2. Validation

- [x] 2.1 Run `npm run lint`.
- [x] 2.2 Run `npx tsc --noEmit`.
- [x] 2.3 Validate `align-user-setting-with-web` with OpenSpec.

Note: `npm run lint` still reports pre-existing unrelated issues in other files outside this change scope.
