## 1. Implementation

- [x] Move the contacts shortcuts into the contacts list scroll container
- [x] Move the contacts summary strip into the contacts list scroll container
- [x] Preserve section index jump behavior after the scroll container update

## 2. Validation

- [x] Run `npx tsc --noEmit`
- [x] Run `OPENSPEC_TELEMETRY=0 openspec validate scroll-contact-shortcuts-with-list --type change --no-interactive`
