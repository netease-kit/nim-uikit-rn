# Proposal: prepare-v10-release-sync

## Summary

Synchronize the `release/v10.0.0` branch with the current `im2-rn-demo` codebase, while removing bundled shared configuration and adding a sanitized integration guide for downstream adopters.

## Why

The beta branch no longer matches the current demo implementation. The release branch needs the newer UI/routes/state code, but it must not carry forward shared `AppKey`, push certificate values, or local signing expectations without clear onboarding instructions.

## What Changes

- Sync the current demo source into `release/v10.0.0`
- Remove bundled shared `AppKey` and offline-push certificate placeholders from runtime config
- Make login/bootstrap fail fast with a clear configuration error when `AppKey` is missing
- Add a dedicated integration guide that explains required replacements, optional native materials, and validation steps

## Impact

- Affects bootstrap/runtime configuration under `constants/` and auth/NIM initialization
- Updates repository onboarding documentation
- Establishes `release/v10.0.0` as the new sanitized integration baseline
