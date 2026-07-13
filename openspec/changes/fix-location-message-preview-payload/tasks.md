## 1. Spec Alignment

- [x] 1.1 Record the cross-platform location-message preview payload requirement in OpenSpec.
- [x] 1.2 Confirm the Android native conversation preview reads location title from `lastMessage.text`.

## 2. RN Payload Alignment

- [x] 2.1 Update `stores/MessageStore.ts` so RN-sent location messages keep the location title in `message.text` while preserving the attachment address.
- [x] 2.2 Update location-message resend so rebuilt drafts keep the original title payload.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Rebuild and install the Android app on the connected device.
- [ ] 3.3 Verify on-device that RN-sent location messages no longer show `[位置消息]null` in the Android native conversation list.
