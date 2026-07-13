## 1. Voice Recording

- [x] 1.1 Add synchronous refs for recording startup, active recording, and pending release handling.
- [x] 1.2 Update press-to-talk stop flow so valid release reliably sends and short/cancelled recordings still discard.

## 2. Chat UI

- [x] 2.1 Add blank chat content dismissal for the voice composer without breaking message gestures.
- [x] 2.2 Move outgoing audio sending presentation to an adjacent loading indicator and remove the sending text label.

## 3. Validation

- [x] 3.1 Validate the OpenSpec change.
- [x] 3.2 Run focused static checks and startup verification for the affected app target.

## 4. Error Localization

- [x] 4.1 Add localized mappings for known SDK send/upload failure messages.
- [x] 4.2 Use normalized display errors for chat send-failure feedback.

## 5. Voice Composer Dismissal

- [x] 5.1 Expand voice composer dismissal from blank areas to all non-recorder chat content taps.
