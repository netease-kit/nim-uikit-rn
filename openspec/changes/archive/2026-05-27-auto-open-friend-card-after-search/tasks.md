## 1. Spec Alignment

- [x] 1.1 Update the add-friend flow spec to require automatic profile-card navigation after a matched search result.

## 2. Implementation And Validation

- [x] 2.1 Update `app/friend/add.tsx` so a matched exact-account search automatically opens the corresponding profile card without rendering an inline result.
- [x] 2.2 Replace the friend-card add-friend success alert with a toast success message.
- [x] 2.3 Keep the no-result and self-result behaviors working after the navigation change.
- [x] 2.4 Automatically remove the target account from the blocklist after a successful friend request.
- [x] 2.5 Validate the add-friend flow on device or simulator against the updated expectation.
