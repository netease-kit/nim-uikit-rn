## MODIFIED Requirements

### Requirement: Cloud conversation toggle takes effect after re-login

The `/user/setting` cloud-conversation toggle SHALL change the effective conversation mode used by later login sessions.

#### Scenario: User changes the cloud-conversation toggle and logs in again

- **WHEN** the user changes `是否开启云端会话`
- **AND** logs out or restarts into a new validated login session
- **THEN** the active NIM instance MUST be rebound into the RN `im-store-v2` bridge with the stored `enableV2CloudConversation` value
- **AND** the conversation list MUST read from the bridge store that matches the current mode instead of falling back to stale local conversation data
