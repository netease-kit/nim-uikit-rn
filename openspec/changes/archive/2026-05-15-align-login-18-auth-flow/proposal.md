## Why

The current RN login flow does not satisfy the `登录-18` workbook baseline: the login page misses required copy, input constraints differ from the tested behavior, invalid states surface the wrong feedback, and persisted-session restore can route into the authenticated shell before token validation completes. The login suite is the entry gate for the whole app, so these gaps block reliable testcase execution.

## What Changes

- Align the RN SMS login page copy, required helper text, placeholders, input filtering, countdown affordance, and registration-consent actions with the `登录-18` suite.
- Tighten local login validation so mobile-number and SMS-code failures return the exact feedback buckets required by the tests.
- Change persisted-session restore so automatic login succeeds only after IM token validation and automatic-login failure returns to the unauthenticated shell without stale routing.
- Add testcase execution records for the `登录-18` suite and capture environment-blocked cases separately from code failures.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `auth-form-and-sms`: Refine login-page UI copy, input filtering, SMS-code formatting, countdown presentation, and local validation feedback to match the `登录-18` workbook.
- `auth-session-lifecycle`: Require persisted-session restore to validate IM login before entering the authenticated shell and keep the existing consent and logout expectations aligned with the login suite.

## Impact

- Affected code: `app/login.tsx`, `stores/AuthStore.ts`, shared RN feedback helpers, testcase execution records.
- Affected specs: `openspec/specs/auth-form-and-sms/spec.md`, `openspec/specs/auth-session-lifecycle/spec.md`.
- External dependencies remain unchanged; runtime behavior changes are limited to login/session handling.
