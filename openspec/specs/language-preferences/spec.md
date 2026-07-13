# language-preferences Specification

## Purpose

TBD - created by archiving change align-notification-and-language-testcases. Update Purpose after archive.

## Requirements

### Requirement: Language Preference Persistence

The app SHALL persist the language selected from the in-app language settings page so the saved choice survives later app restarts until the user changes it again.

#### Scenario: English preference applies to RN primary flows

- **GIVEN** the user has selected `英文` as the in-app language
- **WHEN** the user enters RN primary flows including conversations, contacts, and chat detail
- **THEN** those RN pages SHALL render English copy instead of leaving Chinese hardcoded text visible
- **AND** RN UIKit adapter components used by those pages SHALL follow the same active app language

#### Scenario: New user-facing copy follows app localization

- **GIVEN** a contributor adds or updates user-facing copy in an RN route, RN UIKit adapter, or shared user-visible utility
- **WHEN** that copy is intended to follow the in-app language setting
- **THEN** the contributor SHALL provide both Chinese and English localization coverage through the app translation path instead of introducing new hardcoded single-language copy

### Requirement: System Language Fallback

The app SHALL follow the current system language when the user has not yet saved an in-app override.

#### Scenario: Launching without a saved in-app language

- **WHEN** the app starts without a previously saved in-app language override
- **THEN** the app resolves its displayed language from the current system language, using Chinese for `zh*` locales and English otherwise

### Requirement: Default App Language

The app SHALL default to Chinese on first launch unless the user explicitly changes the in-app language preference later.

#### Scenario: First launch without saved language preference

- **GIVEN** the app has no persisted language preference
- **WHEN** the user launches the app for the first time
- **THEN** the app renders Chinese copy by default
- **AND** UIKit-managed text also renders in Chinese on the first visible screen
