# team-conversation-unavailable-feedback Specification

## Purpose

Define the required RN feedback and cleanup behavior when a stale team conversation is opened after the team has been dismissed or the user is no longer a member.

## Requirements

### Requirement: Invalid team conversations must show unavailable feedback before cleanup

When a dismissed team or a team the user has already left is still reachable from the RN conversation flow, the app MUST show a confirmation prompt before cleaning up that stale conversation.

#### Scenario: Opening an invalid team conversation from the conversation list

- **WHEN** the user taps a team conversation that is already known to be invalid or no longer joined
- **THEN** the app MUST show a confirmation prompt explaining that the group has been dismissed or the user is no longer in the group
- **AND** confirming the prompt MUST delete that stale conversation from the active conversation source

#### Scenario: Entering chat detail and history loading reveals an invalid team

- **WHEN** the user opens a stale team conversation and the chat detail flow detects a team-unavailable error while loading history
- **THEN** the app MUST show the same unavailable prompt
- **AND** confirming the prompt MUST return the user to the conversation list
- **AND** the stale team conversation MUST be removed from the active conversation source
