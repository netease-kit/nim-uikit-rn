## 1. Spec Alignment

- [x] 1.1 Record the top anti-fraud banner report-link behavior in OpenSpec.
- [x] 1.2 Record that anti-spam blocked tip banners no longer expose a report button.

## 2. Implementation

- [x] 2.1 Update `app/chat/[id].tsx` so the top anti-fraud banner exposes a clickable report link aligned with Android behavior.
- [x] 2.2 Update `src/NEUIKit/rn/chat-message-bubble.tsx` to remove the report button from anti-spam blocked tips.
- [x] 2.3 Replace the placeholder report page with an in-app embedded report page and remove dead anti-spam route usage.
- [x] 2.4 Align anti-spam blocked failure-tip styling to a text-only presentation without an extra background frame.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [ ] 3.2 Rebuild and install the Android app on the connected device.
- [ ] 3.3 Verify that the top anti-fraud banner opens the in-app embedded report page and anti-spam blocked tips no longer show a report button.
