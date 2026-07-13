## 1. Spec Alignment

- [x] 1.1 Record the Android native location-picker key-source and fallback requirement in OpenSpec.
- [x] 1.2 Confirm the current RN/Android location picker hard-codes the provider key and shows failure before fallback completes.

## 2. Implementation And Validation

- [x] 2.1 Update `NIMLocationPickerActivity.kt` to read map keys from native configuration instead of Activity-local constants.
- [x] 2.2 Adjust Android native location failure handling so system-location fallback completes before a terminal failure toast is shown.
- [x] 2.3 Rebuild and install the Android app on the connected device, then verify the location picker can still search and select locations after provider-location failure.
