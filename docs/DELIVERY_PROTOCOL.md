# Delivery Protocol

## Source of Truth

- queue state: `docs/agent-work-queue.json`
- execution rules: `docs/AUTONOMOUS_EXECUTION_MODEL.md`
- roadmap: `docs/AUTONOMOUS_ROADMAP.md`

## Task Lifecycle

Each task must move through:

1. `ready`
2. `in_progress`
3. `done`

Or to:

- `blocked`

## Definition of Done

A task is `done` only if:

- the intended change exists in the repo
- relevant checks pass
- docs reflect the new state
- queue metadata is updated
- any follow-up work is captured as a new task or dependency

## Validation Policy

Use the narrowest validation that can still catch regressions:

- content-only change: targeted script or test
- Python logic: targeted `pytest`, then broader suite if high-risk
- frontend logic: `lint` and `typecheck`, plus targeted tests if present
- release-critical change: relevant release gate checks

## Blocker Policy

If blocked, the task entry must record:

- blocker type
- exact missing capability
- safest next autonomous task

The agent must not wait idly on a blocked task if another ready task exists.
