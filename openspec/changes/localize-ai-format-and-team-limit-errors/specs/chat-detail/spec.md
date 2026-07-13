## ADDED Requirements

### Requirement: AI P2P Unsupported Non-Text Feedback

The chat detail screen SHALL allow non-text send entry interactions in AI P2P conversations and show localized unsupported-format feedback when the SDK rejects the send.

#### Scenario: User sends non-text message to AI P2P

- **GIVEN** the user is in a P2P conversation whose peer is an AI user
- **WHEN** the user attempts to send an image, video, file, or voice message
- **THEN** the app MUST let the selected message enter the normal send flow
- **AND** when the SDK rejects the message as an unsupported format, the app MUST show `暂不支持该格式` in Chinese mode
