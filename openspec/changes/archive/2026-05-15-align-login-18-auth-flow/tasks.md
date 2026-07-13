## 1. Login Suite Alignment

- [x] 1.1 Update the login-page UI copy, placeholders, consent action labels, and local input filtering to match the `登录-18` workbook.
- [x] 1.2 Align SMS request and login validation feedback so invalid mobile and SMS-code states use the required local messages.
- [x] 1.3 Change persisted-session restore so automatic login waits for IM validation before routing into the authenticated shell.

## 2. Verification

- [x] 2.1 Execute the `TestCases/10.0.0/登录-18` suite one testcase at a time, fixing the current testcase before advancing.
- [x] 2.2 Record pass/fail/blocked results, validation commands, and any environment limitations in the login-suite execution record.
- [x] 2.3 Validate the OpenSpec change and the affected repo checks before closeout.
