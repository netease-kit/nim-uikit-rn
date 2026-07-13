# IM2 RN Demo Agent Guide

This repository is an Expo Router + React Native IM demo that uses MobX stores and the NetEase NIM RN SDK.

`AGENTS.md` is the shared workflow entrypoint for `Codex`, `Claude Code`, and `OpenCode`. `CLAUDE.md` is a thin Claude Code wrapper that forwards to this file.

Use [README.md](README.md) for environment setup and startup instructions. Use [ARCHITECTURE.md](ARCHITECTURE.md) for code boundaries and module ownership. Use [openspec/config.yaml](openspec/config.yaml) and `openspec/changes/` for spec-driven changes.

The offline Figma export in [design/figma/instant-messaging](design/figma/instant-messaging) is the local UI visual design source for IM screens. Page UI changes must satisfy both that Figma visual source and the `src/NEUIKit` component/interaction baseline. If they differ, update or adapt `src/NEUIKit` so the UIKit implementation matches the Figma visuals.

## Reference Implementations

When implementing or aligning IM UIKit behavior, these sibling repositories are available as reference implementations. Unless a task explicitly says otherwise, inspect their `master` branch.

- Web implementations, including React, Vue, Web, and H5: `/Users/xumengxiang/Documents/00.NetEase/05.IM/nim-uikit-web`
- Android implementation: `/Users/xumengxiang/Documents/00.NetEase/05.IM/xkit-android/imkit`
- iOS implementation: `/Users/xumengxiang/Documents/00.NetEase/05.IM/xkit-ios/IMUIKit`

## Agent Assets

### Shared for Codex and OpenCode

- [AGENTS.md](AGENTS.md): shared workflow rules and repository entrypoint
- [README.md](README.md): project setup, Expo requirements, and NIM configuration guidance
- [ARCHITECTURE.md](ARCHITECTURE.md): code boundaries, runtime topology, and change routing
- [openspec/config.yaml](openspec/config.yaml): OpenSpec schema config for this repo
- [design/figma/instant-messaging](design/figma/instant-messaging): offline Figma export and screen PNGs used as the UI visual design source

### Codex Assets

- `.codex/prompts/opsx-*.md`

### OpenCode Assets

- `.opencode/command/opsx-*.md`

### Claude Code Compatibility Entrypoint

- [CLAUDE.md](CLAUDE.md): thin wrapper that tells Claude Code to follow [AGENTS.md](AGENTS.md)

## Skill Usage Policy

- agents may only use built-in platform skills and the non-built-in skills explicitly listed in [skills.md](skills.md)
- `skills.md` is the only repository whitelist for non-built-in skills
- if a non-built-in skill is not listed in `skills.md`, treat it as disallowed for this repository
- the initial `skills.md` whitelist is empty until the repository explicitly adds entries

## Repository Commands

This repo uses `npm` as the default package manager.

- install dependencies: `npm install`
- start Expo dev server: `npm run start`
- run Android target: `npm run android`
- run iOS target: `npm run ios`
- run web target: `npm run web`
- lint: `npm run lint`
- lint fix: `npm run lint:fix`
- format: `npm run format`
- format check: `npm run format:check`
- style sweep: `npm run code-style`

## Shared First Read

For a fresh task in this repository, use this order:

1. read `AGENTS.md`
   if you arrived through Claude Code, `CLAUDE.md` will send you here
2. read `README.md` for current environment, AppKey, Expo SDK, and startup expectations
3. read `ARCHITECTURE.md` sections `0`, `0.1`, `0.5`, and the relevant ownership section
4. for page UI changes, inspect both `design/figma/instant-messaging/` and `src/NEUIKit/` before editing
5. use the Figma export as the visual target and `src/NEUIKit/` as the component, utility, style, and interaction baseline
6. inspect the real route file under `app/` that owns the behavior you need to change
7. inspect `@xkit-yx/im-store-v2`, `@xkit-yx/utils`, and any existing adapter/store usage before adding or changing state behavior
8. inspect `constants/NIMConfig.ts` and `app.json` if configuration, runtime, or SDK setup is involved
9. if behavior, workflow, or repository expectations change, inspect `openspec/config.yaml` and the active files under `openspec/changes/`

## Task-Oriented Routing

Use actual repository files instead of assuming a separate architecture handbook:

- app startup, AppKey setup, Expo Go requirements, and basic usage -> `README.md`
- module ownership, runtime topology, change routing, and edit boundaries -> `ARCHITECTURE.md`
- route structure and navigation ownership -> `app/_layout.tsx`, `app/(tabs)/_layout.tsx`
- login flow -> `app/login.tsx`
- conversation list behavior -> `app/(tabs)/index.tsx`
- chat detail behavior -> `app/chat/[id].tsx`
- UI visual design source, screen states, spacing, and colors -> `design/figma/instant-messaging/`
- baseline UIKit components, interaction behavior, icons, message rendering, list rows, panels, and shared utilities -> `src/NEUIKit/`
- IM domain state, UIKit data models, and base IM helpers -> `@xkit-yx/im-store-v2`, `@xkit-yx/utils`
- NIM initialization and lifecycle -> `stores/NIMStore.ts`
- conversation state shape and unread handling -> `stores/ConversationStore.ts`
- message sync and send behavior -> `stores/MessageStore.ts`
- runtime config and environment-sensitive values -> `constants/NIMConfig.ts`, `app.json`
- shared UI primitives, theme helpers, and reusable components -> `components/`, `hooks/`, `constants/Colors.ts`
- workflow policy and Spec threshold -> `AGENTS.md`, then `openspec/config.yaml` and the relevant change under `openspec/changes/`

## Shared Workflow Order

Apply the workflow in this order during normal development:

1. decide whether the task crosses the OpenSpec threshold
2. if `openspec/` is missing, initialize it with `OPENSPEC_TELEMETRY=0 openspec init --tools none`
3. if the task crosses the threshold, inspect active OpenSpec work before editing code or workflow docs
4. create or select the OpenSpec change first with the installed `openspec` CLI
5. write `proposal` first, then `specs`, then `design` when the change is cross-cutting, then `tasks`
6. inspect `design/figma/instant-messaging/`, `src/NEUIKit/`, and the H5 reference behavior together before editing page UI or interaction
7. inspect the real code path before editing
8. implement in small validated steps
9. after feature implementation, proactively verify the affected Expo target can start; for generic app changes run at least `npm run start`, and for Web-affecting changes run `npm run web`
10. validate both the OpenSpec change and the affected repo commands before closeout

OpenSpec owns the change contract and lifecycle. `AGENTS.md` owns the shared agent entrypoint. This repository currently may not have an archived capability baseline under `openspec/specs/`; when a task introduces or formalizes lasting behavior or workflow rules, create that capability inside the active change instead of assuming an existing baseline.

## OpenSpec Quickstart

Use the installed CLI instead of hand-crafting `openspec/changes/*` folders:

- inspect current specs: `OPENSPEC_TELEMETRY=0 openspec list --specs`
- inspect active changes: `OPENSPEC_TELEMETRY=0 openspec list`
- inspect an existing change or spec: `OPENSPEC_TELEMETRY=0 openspec show <name> --type change --no-interactive`
- create a new change: `OPENSPEC_TELEMETRY=0 openspec new change <kebab-case-name>`
- inspect artifact status: `OPENSPEC_TELEMETRY=0 openspec status --change <change-name> --json`
- generate next artifact instructions:
  `OPENSPEC_TELEMETRY=0 openspec instructions proposal --change <change-name>`
  `OPENSPEC_TELEMETRY=0 openspec instructions specs --change <change-name>`
  `OPENSPEC_TELEMETRY=0 openspec instructions design --change <change-name>`
  `OPENSPEC_TELEMETRY=0 openspec instructions tasks --change <change-name>`
- validate a change: `OPENSPEC_TELEMETRY=0 openspec validate <change-name> --type change --no-interactive`

Change names must be `kebab-case` and start with a letter.

## OpenSpec Threshold

Create or update an OpenSpec change before implementation when the task affects:

- screens, navigation, or route structure under `app/`
- login, logout, conversation, message, or other user-visible IM flows
- `constants/NIMConfig.ts`, NIM initialization, or store data shape that changes runtime behavior
- Expo runtime configuration in `app.json`
- repository commands, startup expectations, agent rules, or contributor workflow documentation
- architecture boundaries or onboarding documentation that changes how contributors navigate the codebase

Skip OpenSpec for typo fixes, formatting-only changes, local refactors with no behavior change, lint cleanup, and other small fixes that do not change user-facing or workflow-facing expectations.

## Code Boundaries

- use `src/NEUIKit/` as the primary source of page UI components, interaction patterns, icons, message rendering, list rows, bottom panels, and shared UIKit utilities
- use `design/figma/instant-messaging/` as the visual design source for page layout, spacing, color, typography, and state screenshots
- Figma visuals and `src/NEUIKit/` must both be satisfied for UI work; when they differ, update or adapt `src/NEUIKit` and its RN layer so the UIKit implementation matches Figma, unless an OpenSpec requirement or test case explicitly says otherwise
- when `src/NEUIKit/` does not satisfy an RN page requirement, improve or adapt the UIKit component first instead of building a parallel one-off page implementation
- when adding or changing user-facing copy, always consider Chinese and English localization together; do not introduce new hardcoded single-language strings in RN routes, RN UIKit adapters, or shared user-visible utilities when the text should follow the in-app language
- use `@xkit-yx/im-store-v2` and `@xkit-yx/utils` as the preferred IM state and base utility layer; add local store logic only as an Expo/RN adapter or temporary migration bridge
- keep raw H5 assumptions isolated when adapting UIKit components for Expo/RN, including DOM APIs, `window`, `localStorage`, Umi routing, and `.less` style imports
- keep the root navigation tree and initial route ownership in `app/_layout.tsx`
- keep tab shell ownership in `app/(tabs)/_layout.tsx`
- keep login UI and authentication entry behavior in `app/login.tsx`
- keep conversation-list UI behavior in `app/(tabs)/index.tsx`
- keep per-conversation chat UI behavior in `app/chat/[id].tsx`
- keep NIM SDK bootstrap and initialization state in `stores/NIMStore.ts`
- keep conversation collection, unread state, and avatar decoration in `stores/ConversationStore.ts`
- keep message collection, sync state, and send logic in `stores/MessageStore.ts`
- keep app-level NIM configuration in `constants/NIMConfig.ts`
- keep Expo runtime configuration in `app.json`
- keep shared code-boundary documentation in `ARCHITECTURE.md`
- do not edit generated outputs or dependency folders such as `.expo/` or `node_modules/`

## Platform Assets

### Codex

- entrypoint: `AGENTS.md`
- repository assets: `.codex/prompts/opsx-*.md`

### Claude Code

- entrypoint: `CLAUDE.md`, then follow `AGENTS.md`
- repository assets: `.claude/settings.json`, `.claude/commands/opsx/*`
- local override: `.claude/settings.local.json`

### OpenCode

- entrypoint: `AGENTS.md`
- repository assets: `.opencode/command/opsx-*.md`

## Validation

- repository formatting: `npm run format:check`
- repository lint: `npm run lint`
- TypeScript typecheck: `npx tsc --noEmit`
- Expo dependency alignment: `npx expo install --check`
- startup verification after feature work: run the relevant Expo startup command (`npm run start`, `npm run web`, `npm run ios`, or `npm run android`) and confirm Metro reports ready or Web returns HTTP 200 after bundling
- OpenSpec change validation: `OPENSPEC_TELEMETRY=0 openspec validate <change-name> --type change --no-interactive`
- manual app verification after route, store, or NIM changes: confirm login, conversation list, and chat flows on the relevant target
- when executing testcase-based verification: never verify testcases in parallel; execute exactly one testcase at a time; if it fails, fix and re-verify that same testcase until it passes; once the current testcase passes directly or after repair and re-verification, automatically continue to the next testcase unless the user stops or redirects the work
- when executing testcase-based verification, keep the testcase execution record updated as work progresses; record the executed testcase range, pass/fail or skipped status, fixes made, validation commands, and any unresolved notes or requirement conflicts

## Local Startup In Agent Terminals

Development in this repository uses fixed Metro port `8081`. If Metro is already running on `8081`, do not restart it after each fix; rely on Expo/React Native hot update to deliver changes to connected physical devices. For closeout verification in that state, check that `http://localhost:8081/status` returns `packager-status:running` instead of starting a second server or switching ports.

When an agent is asked to start the project from this terminal environment, map startup intent like this:

- if the user says `启动应用`, `启动项目`, or similar generic startup wording, default to `npm run start`
- if the user explicitly wants a specific target, use `npm run ios`, `npm run android`, or `npm run web`
- if the goal is only to verify that Expo boots in a non-interactive terminal, prefer `npm run start -- --non-interactive`
- after startup, verify that Expo reports the Metro bundler as ready and note any missing simulator or device prerequisites
- after completing a feature, do not stop at lint/typecheck; proactively start the affected target and record whether startup succeeded, failed, or was blocked by a local environment issue
- when validating Web, request `http://localhost:8081` after startup so Metro performs the Web bundle and confirm the response is HTTP 200
- do not claim backend health URLs, Docker health checks, or fullstack service readiness for this repo; this project is a single Expo app

### iOS Physical Device Metro Checks

When installing or launching the iOS target on a physical iPhone with Metro on port 8081:

- confirm the iPhone and Mac are on the same reachable network before treating an install as failed; the native app can install successfully but remain on the transition screen if the iPhone cannot reach `http://<mac-lan-ip>:8081`
- if iOS shows the Local Network permission prompt, allow it; if it was denied earlier, ask the user to re-enable local network access for the app in iOS Settings before retrying
- verify Metro from the Mac with both `curl http://localhost:8081/status` and `curl http://<mac-lan-ip>:8081/status`; both should return `packager-status:running`
- distinguish install failure from JavaScript loading failure: if `npx expo run:ios --device <device> --port 8081` reports install complete but the iPhone stays on the transition screen, check Metro for an `iOS ... Bundled` line and use `xcrun devicectl device process launch --device <device-id> --terminate-existing --console <bundle-id>` to confirm whether React Native reaches `evaluateJavaScript() with JS bundle`
- this repo's iOS Debug startup reads React Native's generated `ip.txt` and directly constructs the Metro bundle URL; do not remove that path unless replacing it with an equivalent physical-device Metro resolution, because `RCTBundleURLProvider` auto-detection can return `nil` on physical devices even when the app installed correctly
