## 1. Spec

- [x] 1.1 Write the proposal for stabilizing Android recorded voice upload paths before SDK send.
- [x] 1.2 Add spec deltas for voice send preparation and failure feedback behavior.

## 2. Implementation

- [x] 2.1 Copy Android recorded voice files into stable local storage before creating the SDK audio message.
- [x] 2.2 Block SDK send and surface the existing recording failure feedback if the stabilized file is unavailable.
- [x] 2.3 Retry the first Android voice upload once when NOS returns the transient `status: 0 / Stream Closed` failure.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change and run repository lint/type checks for the affected code path.
- [x] 3.2 Verify Metro is still available on port 8081 for the connected device workflow after the change.
