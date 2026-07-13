## ADDED Requirements

### Requirement: Chat Voice Message Bubble Width

The chat detail screen SHALL render voice message bubbles with a duration-proportional width aligned with the Android UIKit implementation.

#### Scenario: Short voice message uses minimum width

- **GIVEN** a voice message attachment duration is less than or equal to two seconds after converting milliseconds to integer seconds
- **WHEN** the message is rendered in the chat timeline
- **THEN** the voice message bubble SHALL use the minimum voice bubble width

#### Scenario: Longer voice message grows until maximum width

- **GIVEN** a voice message attachment duration is greater than two seconds
- **WHEN** the message is rendered in the chat timeline
- **THEN** the voice message bubble width SHALL increase by a fixed amount per second after the first two seconds
- **AND** once the calculated width exceeds the configured maximum, the bubble SHALL render at the maximum width instead
- **AND** the rendered width SHALL still respect the chat message content maximum width for the current screen
