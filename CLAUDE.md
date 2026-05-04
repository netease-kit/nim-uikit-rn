# IM2 RN Demo Claude Code Guide

This repository is an Expo Router + React Native IM demo that uses MobX stores and the NetEase NIM RN SDK.

Read `AGENTS.md` next for the shared repository workflow.

Follow @AGENTS.md for the shared repository workflow.

After `AGENTS.md`, use `README.md` for setup and Expo runtime expectations, use `ARCHITECTURE.md` for code boundaries, and use `openspec/` for spec-driven changes.

## Claude Code Notes

- `CLAUDE.md` is only a thin Claude Code entrypoint; do not treat it as the full project rule set
- the shared project rules live in `AGENTS.md`
- this repo's real code path is `app/`, `stores/`, `constants/`, `components/`, `hooks/`, and `app.json`
- for route changes, login/chat flow changes, `constants/NIMConfig.ts`, `app.json`, or workflow-doc changes, create or update an OpenSpec change first
- use the repo's `npm` commands from `package.json`; do not assume `pnpm`, `frontend/` + `backend/`, or Docker-based startup flows
- after implementing a feature, follow `AGENTS.md` validation rules and proactively start the affected Expo target before closeout
- Claude-specific repository assets live in `.claude/`
- shared repository settings live in `.claude/settings.json`
- local overrides belong in `.claude/settings.local.json` and must stay uncommitted

## Claude Code Assets

- `.claude/settings.json`
- `.claude/commands/opsx/*`
