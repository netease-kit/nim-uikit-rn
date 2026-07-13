## 1. Spec Alignment

- [x] 1.1 Record that repeated taps on the picker create action must not create more than one team while the first request is in flight.

## 2. Implementation And Verification

- [x] 2.1 Update `app/conversation/picker.tsx` to synchronously lock the create action before the next render.
- [ ] 2.2 Verify the duplicate-create fix with the required repository checks.
