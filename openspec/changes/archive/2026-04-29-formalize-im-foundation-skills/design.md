## Context

The repository now contains two different but complementary skill families. One is a portable IM mother skill intended for greenfield projects. The other is a repository adapter skill intended to explain how `im2-rn-demo` already implements IM features and how future changes should fit its code boundaries. Without a design document, these skills can drift into overlapping or ambiguous roles.

This change is cross-cutting because it affects long-lived agent workflow, repository knowledge packaging, and future feature-planning behavior. It also introduces a durable distinction between portable IM planning knowledge and repository-specific implementation knowledge.

## Goals / Non-Goals

**Goals:**

- Establish a clear split between the cross-project IM foundation skill and the repo-specific IM implementation skill
- Define the minimum reference artifacts each skill family must carry
- Ensure future contributors can extend either skill without collapsing them back into one ambiguous artifact
- Ensure both skills always produce implementation paths and test cases

**Non-Goals:**

- Archiving the current change in this turn
- Converting the skills into an external marketplace format
- Auto-generating runnable application code from the OpenSpec artifacts themselves

## Decisions

### Decision 1: Keep two skill layers instead of one merged skill

We separate the knowledge into `im-feature-foundation` and `im2-feature-implementation`.

Rationale:

- The foundation skill is portable and must not depend on repo-specific files.
- The repo skill must explicitly depend on current repository boundaries and source-of-truth rules.
- A merged skill would either become too abstract for this repo or too coupled for new projects.

Alternative considered:

- Merge both into one large IM skill.
  Rejected because it would blur whether the answer should be portable or repository-specific.

### Decision 2: Use reference packs instead of a single long skill body

Both skills are implemented as a thin core `SKILL.md` plus modular references.

Rationale:

- Different user requests need different depth.
- Modular references keep context smaller and make future extension safer.
- Advanced IM features and cross-platform guidance can evolve independently.

Alternative considered:

- Put all details into one monolithic `SKILL.md`.
  Rejected because it would scale poorly and become hard to maintain.

### Decision 3: Require implementation-oriented outputs from both skill families

Both skills are designed to produce module contracts, core implementation paths, and test cases, not just conceptual explanations.

Rationale:

- The user’s target is feature delivery, not general education.
- Test cases are a first-class artifact and must remain present even when the project is greenfield.

Alternative considered:

- Let the foundation skill stay at architecture level only.
  Rejected because it would not satisfy the goal of enabling zero-to-one feature development.

## Risks / Trade-offs

- [Risk] The foundation skill may still be too abstract for code generation → Mitigation: keep adding code skeleton and adapter templates as dedicated references
- [Risk] The repository skill may drift from real code over time → Mitigation: keep module-level references aligned with actual route/store/service ownership during future feature work
- [Risk] Users may trigger the wrong skill family → Mitigation: keep descriptions explicit about greenfield vs repository-specific use

## Migration Plan

1. Formalize both skill families through OpenSpec
2. Keep the current skill directories as the implementation target for these capabilities
3. Extend references incrementally as new IM feature classes are added
4. Validate the change so future work can refer to the capability contract

Rollback strategy:

- If needed, the spec change can be abandoned without affecting runtime application behavior because these are workflow artifacts, not product code paths

## Open Questions

- Whether the foundation skill should next include concrete code-file templates for stores, services, and route pages
- Whether the repo-specific skill should later gain workbook-specific mapping references tied to `TestCases.xlsx`
