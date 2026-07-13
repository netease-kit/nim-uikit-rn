## 1. Spec Alignment

- [x] 1.1 Record the iOS Metro IP selection requirement for physical-device debug startup.

## 2. Implementation And Verification

- [x] 2.1 Update the iOS bundling script so Debug physical-device builds generate `ip.txt` from the active default-route interface first.
- [x] 2.2 Rebuild and reinstall the iOS Debug app on `iPhone11`.
- [x] 2.3 Verify Metro status, bundle URL reachability, and that the app no longer stalls on “Loading from Metro...”.
