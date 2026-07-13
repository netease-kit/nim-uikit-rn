## Overview

This change keeps voice recording owned by the chat route and voice message rendering owned by the RN UIKit bubble. The implementation is limited to interaction reliability and sending-state presentation.

## Recording Lifecycle

`recordingBusy` is a React state flag and can lag behind `onPressIn`/`onPressOut` timing. The stop path should use refs for synchronous lifecycle checks so a release event that arrives during the startup boundary can be remembered and executed after recording actually starts.

The recording path should:

- track whether a recording start is in progress
- track whether a stop was requested before `recorderState.isRecording` updates
- stop and send once the recorder is available and the recorded duration is valid
- reset audio mode and flags after stop, cancel, or failure

## Composer Dismissal

Blank chat content taps should collapse the voice composer to text mode when no recording is active. This should avoid intercepting message bubble gestures or composer controls.

## Audio Sending Presentation

The outgoing audio sending state should not replace the duration text with `commonSending`. Instead, the bubble keeps the normal audio content layout and an adjacent loading indicator appears before the bubble for the current user's outgoing sending audio message.
