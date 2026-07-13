## 1. Implementation

- [x] 1.1 Record WebP support for chat image selection and file preview recognition in OpenSpec.
- [x] 1.2 Extend RN image selection whitelist and MIME checks to allow WebP.
- [x] 1.3 Extend file preview and file-type icon recognition to treat WebP as an image format.

## 2. Validation

- [x] 2.1 Run `npx tsc --noEmit`.
- [x] 2.2 Run `npm run lint`.
- [x] 2.3 Run `OPENSPEC_TELEMETRY=0 openspec validate support-webp-chat-images --type change --no-interactive`.
