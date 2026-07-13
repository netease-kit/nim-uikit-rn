# chat-user-online-status Specification

## Purpose

TBD - created by archiving change mark-visible-messages-read-on-open. Update Purpose after archive.

## Requirements

### Requirement: RN Online Status Uses Subscription Events

The RN UIKit online/offline status display SHALL update from SDK user-status subscription events and current subscription results, SHALL NOT infer online state from message receipt or message receive activity, SHALL preserve the last known status while the current device is temporarily disconnected, and SHALL converge to the latest status after reconnect and status synchronization. After reconnect, a previously online peer status that is not confirmed by the new subscription/current-status cycle SHALL no longer render as online. The chat detail screen SHALL keep the P2P peer online/offline status in the header synchronized with the shared UIKit user-status source.

#### Scenario: P2P chat peer goes offline while current device is disconnected

- **GIVEN** the current user is viewing a P2P chat page
- **AND** the peer is shown as online
- **WHEN** the current device disconnects from the network
- **AND** the peer goes offline before the current device reconnects
- **THEN** while the current device remains disconnected RN MUST continue showing the peer's last known online/offline status instead of forcing a local offline fallback
- **AND** after reconnect and status synchronization RN MUST show the peer as offline

#### Scenario: P2P chat peer status remains known offline during current device disconnection

- **GIVEN** the current user is viewing a P2P chat page
- **AND** the peer is shown as offline before the current device disconnects
- **WHEN** the current device disconnects from the network
- **THEN** RN MUST keep showing the peer as offline during the disconnected period
- **AND** RN MUST NOT rewrite that cached state merely because the current device lost connectivity

#### Scenario: Android friend status updates chat detail

- **GIVEN** the chat detail screen runs on Android
- **AND** the current conversation is a P2P friend chat
- **WHEN** that friend logs in or logs out
- **THEN** the chat header online/offline label MUST update from the received user-status change without requiring a manual refresh
