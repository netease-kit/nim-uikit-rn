## Context

RN writes a local placeholder when a user opens a joined team from conversation search, but `ImStoreV2Bridge` uses only the cloud conversation store when cloud conversations are enabled. Native Android and iOS both route current-conversation operations through the active conversation mode, and iOS creates the active cloud conversation when inserting or sending local text.

## Goals / Non-Goals

**Goals:**

- Use the searched team metadata as a fallback in cloud conversation mode while the real cloud conversation is missing.
- Create the cloud conversation before cloud-mode sends when the SDK is reachable.
- Avoid accidentally placing placeholder rows in the pinned section.
- Preserve explicit delete and invalid-team pruning behavior.

**Non-Goals:**

- Persist a new long-term cloud/local merge database.
- Change SDK conversation semantics or retry policy for all failed network operations.
- Rework the conversation list UI.

## Decisions

- Merge only eligible local fallback rows into cloud-mode reads.
  - Rationale: the cloud store remains authoritative when it has a row, while search placeholders and local failed-message previews can keep the current RN session usable.
  - Alternative considered: always create a cloud conversation on search tap. This fails offline and would not solve already-failed local messages.
- Sanitize cloud-mode fallback rows with `stickTop: false`.
  - Rationale: a local placeholder is not a cloud pin state. This prevents rows from appearing in the pinned section or calling pin mutations for non-existent cloud conversations by default.
  - Alternative considered: preserve local `stickTop`. That can leak stale local state into cloud mode.
- Create the active cloud conversation when the user taps list pin/unpin, then apply the pin mutation.
  - Rationale: after offline search and a failed local send, returning directly to the list can leave the row displayable before the cloud conversation is fully materialized. Delaying creation until the explicit pin action avoids mutating cloud state merely because the user opened row actions, while still matching native behavior by ensuring a cloud conversation exists before `setTop`.
  - Alternative considered: create the cloud conversation when row actions open. That fixes the direct list-action path but creates a cloud conversation before the user has committed to pinning.
- Create cloud conversations before sending in cloud mode.
  - Rationale: native iOS explicitly calls `conversationRepo.createConversation` for cloud conversation mode around local text insertion, and this avoids `conversation not exist` when sending after reconnect.

## Risks / Trade-offs

- [Risk] A stale local placeholder could appear after explicit deletion. -> Mitigation: keep locally hidden and invalid-pruned filters authoritative before merging fallback rows.
- [Risk] Cloud conversation creation can fail offline. -> Mitigation: keep the local placeholder and failed message visible so the user can retry after reconnect.
- [Risk] Fallback rows duplicate real cloud rows after refresh. -> Mitigation: merge fallback rows only when the cloud store does not already contain the conversation id.
