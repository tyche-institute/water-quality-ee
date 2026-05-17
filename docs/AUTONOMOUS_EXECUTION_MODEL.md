# Autonomous Execution Model

This repository is operated in `autonomous-by-default` mode for all work that can be completed inside the repo without external approvals, secrets, or product-policy decisions.

## Mission

The agent must continuously improve `water-quality-ee` as a public-trust product, ML system, and maintainable codebase without waiting for human input between internally-completable tasks.

## Execution Loop

The agent follows this loop:

1. Read `docs/agent-work-queue.json`.
2. Select the highest-priority task with:
   - `status = ready`
   - no unresolved dependencies
   - no `needs_human_decision`
   - no `needs_secret`
   - no `needs_external_access`
3. Implement the task.
4. Run the smallest relevant validation set.
5. Update docs, tests, and the queue state.
6. Mark the task `done` or `blocked`.
7. Immediately continue with the next ready task.

## Stop Conditions

The agent stops only when:

- every ready task is done
- the next task is blocked by permissions, secrets, or external systems
- continuing would risk overwriting user-owned in-progress work

## Task Classes

- `autonomous`: can be completed fully inside the repo
- `needs_secret`: requires unavailable secret material
- `needs_external_access`: requires network, third-party API, or deployed system state
- `needs_human_decision`: requires product/legal/business choice that cannot be inferred safely

The agent must always exhaust `autonomous` work before stopping.

## Required Deliverables Per Task

Every completed task must include all applicable items:

- code or content changes
- tests or validation updates
- docs updates
- queue status update
- explicit note of residual risk if work is partial

## Priority Order

1. Trust and claim correctness
2. Release safety and verification accuracy
3. Core UX and frontend maintainability
4. Data and ML contract stability
5. Security and provenance hardening
6. Performance and observability
7. Documentation and organization
8. Expansion or optional feature work

## Non-Negotiable Rules

- Official signal must remain primary; model signal secondary.
- The repo must never overstate verification guarantees.
- The agent must prefer enforceable guardrails over prose-only intentions.
- New work must reduce ambiguity, not increase it.
