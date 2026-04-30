# Instant Messaging Offline Figma

This directory contains the offline Figma export originally moved from `/Users/xumengxiang/Downloads/即时通讯`.

Use this directory as the local UI visual design source for the IM React Native demo:

- `index.html`: offline Figma viewer entry
- `data/exports/`: exported screen PNGs and SVG assets
- `data/*.png`: node-level image data used by the offline viewer
- `static/`: offline viewer runtime assets

When implementing or reviewing page UI, satisfy this design source and `src/NEUIKit` together. Use this directory for layout, spacing, typography, colors, and screen states. Use `src/NEUIKit` as the implementation and interaction baseline. If the current UIKit implementation differs from Figma, update the UIKit component or RN adapter so the UI matches Figma. Use OpenSpec/test cases as the behavior contract.

Use [page-state-map.md](page-state-map.md) for the maintained mapping between current project
routes and Figma page/state exports. That map intentionally ignores logo, icon, and pure slice
exports.
