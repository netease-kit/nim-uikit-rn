## 1. Spec

- [x] 1.1 Create change `fix-verification-unread-badge-sync`
- [x] 1.2 Update contacts unread badge expectations for deduplicated applicants
- [x] 1.3 Update verification unread-count expectations for repeated applications from the same applicant

## 2. Implementation

- [x] 2.1 Keep local friend verification state from being overwritten by transient empty full-refresh results
- [x] 2.2 Derive unread verification badge counts from unread pending applicants instead of raw record count
- [x] 2.3 Deduplicate verification list rows by applicant and prefer unread pending records per applicant
- [x] 2.4 Retry friend verification refresh shortly after login so offline-arrived applications are recovered after sync completes

## 3. Validation

- [ ] 3.1 Run `OPENSPEC_TELEMETRY=0 openspec validate fix-verification-unread-badge-sync --type change --no-interactive`
- [ ] 3.2 Run `npm run lint`
- [ ] 3.3 Run `npx tsc --noEmit`
