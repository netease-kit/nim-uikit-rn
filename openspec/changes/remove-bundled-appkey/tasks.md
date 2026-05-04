## 1. Spec And Documentation

- [ ] 1.1 Write the OpenSpec proposal, spec, and design for removing the bundled AppKey from the demo repository
- [ ] 1.2 Update `README.md` to explain that AppKey is intentionally blank, where to configure it, and what errors to expect if it is missing

## 2. Runtime Safeguards

- [ ] 2.1 Remove the tracked shared AppKey from `constants/NIMConfig.ts` and reuse a single local `appKey` source for SDK and SMS auth configuration
- [ ] 2.2 Add fail-fast checks in NIM initialization and SMS auth requests so missing AppKey surfaces a clear configuration error
- [ ] 2.3 Remove the hardcoded AppKey from the H5 initializer helper under `src/NEUIKit/common/utils/init.ts`

## 3. Validation

- [ ] 3.1 Validate the OpenSpec change and run the required repository checks for this configuration/documentation update
