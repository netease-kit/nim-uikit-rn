# Proposal

## Why

RN accepts inbound friend applications but only updates the verification record state. Android and iOS native implementations also send a greeting text message to the applicant after accepting, so the resulting P2P chat timeline differs from native.

## What Changes

- send a localized greeting text message to the applicant after an inbound friend application is accepted successfully
- reuse the existing message send path so the chat timeline and conversation preview update consistently
- keep the accept operation successful even if the follow-up greeting send fails

## Impact

- affected spec: `friend-verification-center`
- affected code: `stores/FriendStore.ts`, `utils/app-language.ts`
