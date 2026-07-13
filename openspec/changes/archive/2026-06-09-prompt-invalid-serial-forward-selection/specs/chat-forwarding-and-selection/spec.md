## MODIFIED Requirements

### Requirement: Forwarding Modes And Limits

The chat module SHALL support single-message forwarding, serial forwarding, and merged forwarding with the confirmation dialogs, message-count limits, ordering rules, and nested-merge limits required by the tests. The forwarding confirmation dialog SHALL render one selected target as avatar plus one-line target name after the avatar, SHALL render multiple selected targets as avatars only, SHALL show at most six target avatars with no seventh overflow item, and SHALL keep the conversation-record preview on one line by truncating only the source conversation title while preserving the fixed record suffix. When serial forwarding is started from chat multi-select mode and the selection contains unsupported message bodies, the page SHALL show the unsupported-forwarding tip, remove those unsupported messages from the selected set, and remain on the current multi-select chat page.

#### Scenario: Merged forward send failure exits multi-select

- **GIVEN** the user starts merged forwarding from chat message multi-select mode
- **AND** the selected target rejects the forwarded message because the sender is blocked, muted in the target group, or another send-time business rule fails
- **WHEN** the merged-forward send fails
- **THEN** RN MUST show only the generic `转发失败` toast
- **AND** RN MUST NOT show `系统异常，转发失败`
- **AND** RN MUST return to the source chat page
- **AND** the source chat page MUST exit multi-select mode with the selected message set cleared

#### Scenario: Serial forwarding removes unsupported selected messages with tip

- **GIVEN** the user is in chat multi-select mode
- **AND** the selected messages include voice messages, failed messages, call-record messages, or other unsupported message bodies
- **WHEN** the user taps one-by-one forwarding
- **THEN** the page SHALL show the tip `存在不可转发的消息体`
- **AND** the page SHALL remove those unsupported messages from the selected set
- **AND** the page SHALL remain in chat multi-select mode instead of continuing to the forwarding target picker
