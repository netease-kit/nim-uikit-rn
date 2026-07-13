# Proposal: append-reply-mention-after-existing-text

## Why

In team chat, if the user already typed text into the composer and then starts a reply by long-pressing a member message, the generated `@member` mention is inserted at the beginning of the input. This reorders the existing draft unexpectedly.

## What Changes

- append the reply mention after existing composer text instead of inserting it at the beginning
- preserve a single separating space between existing text and the inserted reply mention when needed

## Impact

- affects team-chat reply composer behavior in `app/chat/[id].tsx`
- no intended behavior change for empty composer reply flow
