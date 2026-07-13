## 1. Implementation

- [x] 1.1 Lower media picker page and render batch sizes to reduce thumbnail decode pressure.
- [x] 1.2 Fix media grid item-layout offset for three-column FlatList virtualization.
- [x] 1.3 Disable clipped subview recycling for the modal media grid to avoid blank cells during fast scroll.
- [x] 1.4 Guard media picker pagination during momentum scrolling.
- [x] 1.5 Resolve stable preview sources for image assets and generate local video thumbnail cache before rendering grid cells.
- [x] 1.6 Keep media selection and sending behavior unchanged.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate stabilize-chat-media-picker --type change --no-interactive`.
- [x] 2.2 Run `npx tsc --noEmit`.
- [x] 2.3 Run targeted ESLint for changed TypeScript files.
