## MODIFIED Requirements

### Requirement: Send failure avoids duplicate failure prompts

The chat detail flow SHALL avoid duplicate failure prompts when a send failure already has message-level feedback in the timeline, SHALL localize known SDK send or upload failure messages before any failure text is displayed to the user, and SHALL show a user-visible toast containing the resolved failure reason when voice, image, video, or file message sending fails for non-antispam reasons that do not already have dedicated inline or local-tip feedback.

#### Scenario: AI model request error variant is localized

- **GIVEN** the chat page renders an AI-related error or notification message
- **WHEN** the raw message text is `ai model request error` or another supported AI model request failure variant
- **THEN** RN MUST replace it with the localized `sdkErrorAIRequestLLMFailed` copy before rendering
