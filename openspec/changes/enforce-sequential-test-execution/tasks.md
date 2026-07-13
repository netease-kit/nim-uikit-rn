## 1. Workflow Rule Definition

- [x] 1.1 Record the sequential testcase-execution rule in the OpenSpec change artifacts.
- [x] 1.2 Update `AGENTS.md` so testcase execution is explicitly single-case, repair-first, and re-verified before advancing.

## 2. Validation

- [x] 2.1 Run `OPENSPEC_TELEMETRY=0 openspec validate enforce-sequential-test-execution --type change --no-interactive`.
- [ ] 2.2 Run `npm run format:check` for the documentation change.
      Blocked by existing repository-wide Prettier baseline issues, including `.prettierrc` parse failure and pre-existing unformatted files outside this change scope.
