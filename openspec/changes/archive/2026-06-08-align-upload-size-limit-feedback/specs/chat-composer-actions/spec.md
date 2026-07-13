## MODIFIED Requirements

### Requirement: Chat Composer More Panel

The more toolbar action SHALL open an extension panel containing only shooting and file actions.

#### Scenario: Oversized files from composer entries are rejected before upload

- **WHEN** the user uses the chat `图片`, `拍摄`, or `文件` entry to send an image, video, or file
- **AND** the resolved local file size is greater than 200M
- **THEN** the app MUST show the native-aligned file size limit toast
- **AND** the app MUST keep the oversized asset out of the SDK upload flow
