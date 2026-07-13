## Why

The chat detail composer voice toolbar icon does not show the native selected highlight color when voice input mode is active. RN currently disables tinting for the voice icon, so the active state is not visually reflected.

## What Changes

- Align the RN voice toolbar icon selected color with native Android/iOS behavior.
- Keep the voice toolbar icon's inactive color aligned with the native gray asset color.
- Preserve existing toolbar icon tint behavior for other composer and batch-action icons.

## Impact

- Affects the chat detail composer voice action visual state.
- Adds optional per-action tint overrides to the shared RN UIKit toolbar action component.
