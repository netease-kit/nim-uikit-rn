## Context

This repository is a single Expo Router + React Native IM demo. The real code path lives in `app/`, `stores/`, `constants/`, and `app.json`, and the package manager and runnable commands are defined in `package.json`. The copied agent guide has already been corrected, but the root README still reads like a generic Expo starter in several places and the repository still lacks a maintained architecture handbook.

The repository already has OpenSpec enabled, but Spec-driven development is not fully operational until setup docs, architecture boundaries, and workflow entrypoints all point to the same real code paths and validation commands.

## Goals / Non-Goals

**Goals:**

- Make `AGENTS.md` the accurate shared entrypoint for this Expo RN demo
- Make `README.md` the accurate human-readable setup and validation guide
- Introduce `ARCHITECTURE.md` as the durable code-boundary reference
- Require OpenSpec before workflow, route, and user-visible behavior changes
- Route agents to the real code owners for navigation, NIM state, and configuration
- Limit validation guidance to commands that actually exist in this repo

**Non-Goals:**

- No product feature changes
- No NIM SDK business-logic refactor
- No CI or release-pipeline redesign
- No attempt to invent missing frontend/backend subprojects

## Decisions

### Decision 1: Keep `AGENTS.md` as the single maintained workflow source

**Choice**: `AGENTS.md` remains the shared source of truth for Codex, Claude Code, and OpenCode, and `CLAUDE.md` stays a thin wrapper.

**Rationale**: A single maintained entrypoint reduces drift between agent environments. The wrapper can stay short while delegating repository-specific rules to one place.

**Alternative considered**: Maintain separate workflow guides per agent.
This was rejected because it would duplicate the same repository rules and make drift likely.

### Decision 2: Document ownership by concrete files, not abstract modules

**Choice**: The repository documentation maps route, store, and config responsibilities directly to `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/login.tsx`, `app/(tabs)/index.tsx`, `app/chat/[id].tsx`, `stores/*.ts`, `constants/NIMConfig.ts`, and `app.json`.

**Rationale**: This repo needs a maintained architecture handbook, but it must still point to real entry files rather than abstract layers. Concrete ownership keeps both humans and agents grounded and avoids template leakage.

**Alternative considered**: Keep ownership only inside `AGENTS.md`.
This was rejected because `AGENTS.md` is workflow-focused and should not become the only architecture reference for contributors.

### Decision 3: Split setup and architecture documentation by purpose

**Choice**: `README.md` owns setup, startup, commands, configuration, and validation entrypoints, while `ARCHITECTURE.md` owns runtime topology, file boundaries, and change routing.

**Rationale**: Contributors need one short operational doc and one code-boundary doc. Mixing both into README makes onboarding noisy; putting setup details into the architecture doc makes navigation harder.

**Alternative considered**: Put all repository guidance into README only.
This was rejected because it scales poorly once route ownership and store boundaries need to be maintained over time.

### Decision 4: Make workflow changes and user-visible app changes OpenSpec-gated

**Choice**: OpenSpec is required before edits that change routes, login/conversation/chat flows, NIM runtime configuration, store behavior that changes user-visible state, or repository workflow expectations.

**Rationale**: Those changes alter either the runtime contract of the app or the collaboration contract of the repo. They need proposal/spec/tasks coverage instead of ad hoc doc edits.

**Alternative considered**: Limit OpenSpec to product features only.
This was rejected because the user specifically wants Spec-driven development, and developer workflow rules are part of that contract in this repo.

### Decision 5: Validation guidance must match the current toolchain

**Choice**: The guide only names commands that exist today: `npm run lint`, `npm run format:check`, `npx tsc --noEmit`, `npx expo install --check`, `npm run start`, and `openspec validate`.

**Rationale**: Copied commands are worse than missing commands because they create false confidence. Expo device verification remains manual where a simulator or phone is required.

**Alternative considered**: Keep generic "run the project checks" wording.
This was rejected because vague validation guidance is one of the reasons the current guide is not actionable.

## Risks / Trade-offs

- [Risk] The guide can drift again as routes or scripts evolve. -> Mitigation: future workflow or command changes must update OpenSpec and `AGENTS.md` together.
- [Risk] OpenSpec may feel heavy for small UI cleanup. -> Mitigation: the threshold explicitly excludes typo, formatting, lint-only, and refactor-only work.
- [Risk] Some runtime checks require a device or simulator that may not be available in an agent terminal. -> Mitigation: require agents to report manual verification gaps instead of fabricating success.

## Migration Plan

1. Create a new OpenSpec change for agent workflow alignment.
2. Add the `agent-spec-workflow` capability spec, proposal, design, and tasks artifacts.
3. Rewrite `AGENTS.md`, `README.md`, and `CLAUDE.md`, and add `ARCHITECTURE.md` around the current repo layout and commands.
4. Validate the OpenSpec change with the CLI.
5. Use this capability as the baseline for future workflow and documentation changes.

## Open Questions

- None for this documentation-only workflow change.
