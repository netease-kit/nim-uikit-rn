## Overview

RN native toast feedback is centralized through a root-level host. Android keeps using `ToastAndroid`; iOS routes shared toast calls to a non-blocking floating overlay that mirrors the reference iOS UIKit `neMakeToast` style.

## Design Decisions

- Keep the public toast API in `src/NEUIKit/common/utils/toast.native.ts` so existing call sites can continue using `toast.info(...)` and `showToast(...)`.
- Add `NativeToastHost` to `app/_layout.tsx` so toast feedback can be presented above the navigation tree from any RN screen.
- Implement a tiny in-process dispatcher in `native-toast-host.tsx` instead of adding a native dependency. This matches the visual and behavioral shape of the iOS reference without changing the app's native module surface.
- Preserve Android behavior by keeping `ToastAndroid.show(...)` in the native toast utility.

## Risks

- Toast requests made before the host mounts are queued as a single pending request; earlier startup messages can be replaced by later ones.
- This change only updates shared toast pathways and selected existing toast-like local flows. Explicit confirmation dialogs remain as `Alert.alert`.
