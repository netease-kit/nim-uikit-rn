## 1. Spec Alignment

- [x] 1.1 Record the native location-picker map-center selection requirement in OpenSpec.
- [x] 1.2 Confirm the current Android native picker re-inserts stale current-location data after map movement.

## 2. Android Native Picker Alignment

- [x] 2.1 Update `NIMLocationPickerActivity.kt` so dragging the map refreshes nearby POIs around the new center without forcing the old current-location row back to the top.
- [x] 2.2 Ensure the default selected item and send payload follow the map-center result, with a coordinate fallback when no POI row is available.
- [x] 2.3 Add or adapt the Android native marker assets needed to present a clear center-point selection affordance.

## 3. Validation

- [x] 3.1 Rebuild and install the Android app on the connected device.
- [ ] 3.2 Verify on-device that dragging the map changes the selected location and the sent payload follows the moved center point.
