# Proposal

## Why

The contacts page currently renders the shortcut entries and summary strip outside the friend list scroll container. As a result, only the friend list scrolls while the top functional area remains fixed, which does not match the expected unified page scrolling behavior.

## What Changes

- move the contacts shortcut entries into the same scroll container as the friend list
- move the contacts summary strip into the same scroll container as the friend list
- preserve the section index rail behavior for fast navigation

## Impact

- affected spec: `contacts-page`
- affected code: `app/(tabs)/contacts.tsx`
