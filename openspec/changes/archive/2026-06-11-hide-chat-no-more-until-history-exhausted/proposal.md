# Proposal: hide-chat-no-more-until-history-exhausted

## Why

The chat detail timeline currently shows the "no more" system row too early. Users can still load older history after the row appears, and the row may also appear while a history load is still in progress.

## What Changes

- only show the chat "no more" indicator after history pagination has actually reached the end
- suppress the "no more" indicator while an older-history request is still loading

## Impact

- affects chat history pagination feedback in `app/chat/[id].tsx`
- does not change the actual message-history fetching API flow
