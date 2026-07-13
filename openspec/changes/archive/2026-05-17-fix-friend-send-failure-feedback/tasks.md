## 1. Spec Alignment

- [x] 1.1 Record the `104404 friend not exist` send-failure feedback and friend-card handling requirements in OpenSpec.
- [x] 1.2 Confirm the current RN flow duplicates the friend-deleted prompt and can crash while surfacing add-friend failures from the friend card.

## 2. Implementation And Verification

- [x] 2.1 Update the message failure path so `104404` only renders the timeline friend-deleted prompt once.
- [x] 2.2 Harden friend-card error-message extraction for add-friend, blacklist, mute, delete-friend, and open-chat failures.
- [x] 2.3 Hide the ordinary add-friend action for AI accounts on the stranger card.
- [x] 2.4 Align AI direct-message sends with the Web `aiConfig` behavior.
- [x] 2.5 Run repository validation required for chat/friend flow changes.
