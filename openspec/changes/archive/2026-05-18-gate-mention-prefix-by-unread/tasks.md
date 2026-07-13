## 1. Spec And Mention Scope

- [x] 1.1 Record the unread-scoped mention-prefix requirement in OpenSpec.
- [x] 1.2 Confirm which local mention state currently survives after unread is consumed.

## 2. Implementation And Validation

- [x] 2.1 Update local conversation mention bookkeeping so `[有人@我]` only remains while unread mention messages still exist.
- [x] 2.2 Verify the fix with OpenSpec validation, lint, and TypeScript typecheck.
