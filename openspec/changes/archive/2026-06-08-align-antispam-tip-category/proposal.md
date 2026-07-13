# Align Anti-Spam Tip Category

## Why

RN chat send failure currently turns anti-spam results into a generic sensitive-content tip, so users cannot tell which content category triggered the Safety Pass rejection. Android and iOS native clients show the specific category extracted from the anti-spam `label` result.

## What Changes

- Parse anti-spam `label` codes from send results and send errors.
- Map anti-spam categories to the native category names, including pornography, ad, advertising law, violence, prohibited, politics, abuse, spam, other, and value-related.
- Render the chat timeline tip with the native-style template: content may involve `{type}`, please adjust and send.

## Impact

- Affects RN chat message send failure feedback for anti-spam blocked messages.
- Does not change non-anti-spam send failure handling, message state, or duplicate-toast suppression.
