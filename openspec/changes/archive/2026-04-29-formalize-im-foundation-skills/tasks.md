## 1. Capability Definition

- [x] 1.1 Formalize the proposal for the cross-project IM foundation skill and the repo-specific IM implementation skill
- [x] 1.2 Add OpenSpec capability specs for `im-feature-foundation-skill`
- [x] 1.3 Add OpenSpec capability specs for `im2-feature-implementation-skill`
- [x] 1.4 Add a technical design document explaining the split between portable and repo-specific skill layers

## 2. Foundation Skill Artifacts

- [x] 2.1 Create the core `im-feature-foundation` skill entrypoint and README
- [x] 2.2 Add reusable architecture, feature-map, data-model, SDK abstraction, workflow, and testing references
- [x] 2.3 Add MVP starter references and bootstrap guidance for zero-to-one IM projects
- [x] 2.4 Add advanced feature-pack references for message, media, relationship, team, and preference capabilities
- [x] 2.5 Add cross-platform adaptation guidance and code skeleton guidance
- [x] 2.6 Add eval prompts covering MVP, advanced features, and cross-platform planning
- [x] 2.7 Add concrete starter file templates for service, store, and page layers in the foundation skill
- [x] 2.8 Add stack-specific starter packs for at least one mobile-first and one web-first routing stack
- [x] 2.9 Add a validated MVP example reference based on a generated Expo Router scaffold
- [x] 2.10 Add a validated Web MVP example reference based on a generated React Router scaffold
- [x] 2.11 Add portable packaging docs and export tooling for the foundation skill

## 3. Repository Adapter Skill Artifacts

- [x] 3.1 Create the core `im2-feature-implementation` skill entrypoint and README
- [x] 3.2 Add repository implementation mapping references for login, conversation, chat, friend, team, and settings flows
- [x] 3.3 Add templates for repository-specific spec and test-case outputs
- [x] 3.4 Add eval prompts covering repository-specific feature planning and migration scenarios

## 4. Validation

- [x] 4.1 Validate that both skill families and references exist at the expected repository paths
- [x] 4.2 Run `OPENSPEC_TELEMETRY=0 openspec validate formalize-im-foundation-skills --type change --no-interactive`
- [x] 4.3 Review remaining unchecked tasks and reconcile them with the work already completed in the repository
