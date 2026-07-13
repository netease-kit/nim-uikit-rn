## 1. Spec Alignment

- [x] 1.1 Record the confirmed-offline illegal-state fallback requirement for shared toast feedback in OpenSpec.
- [x] 1.2 Confirm the current RN shared error normalization does not distinguish offline `illegal state` from other illegal-state failures.

## 2. Implementation And Verification

- [x] 2.1 Update shared network state utilities so the app can synchronously read the latest confirmed network availability snapshot.
- [x] 2.2 Update shared error normalization so `illegal state` / `190002` maps to the common offline prompt only when the latest network state confirms offline.
- [x] 2.3 Verify edited files with diagnostics, validate the OpenSpec change, and confirm Metro remains available on port `8081`.
- [x] 2.4 Adopt the shared error normalization path in high-value RN screens that still surfaced raw SDK messages during offline failures, including team settings, pinned messages, and collection flows.
