# Action Workspace

## Node

### Prompt

Owns operator review and submission of governed operational actions and
decisions, including resource assignments and other consequential changes. It
uses the current shared projection to show what the operator is acting on,
creates a stable operation identity when an action is submitted, and sends the
action through Operational Core Connection.

It displays the authoritative result returned by OCS but does not change the
shared projection itself. A committed change becomes visible through the
normal live-update or picture-reload flow.

### Status

The workspace implements the first governed review journey. It receives the
selected evacuation-zone proposal, presents evidence and an editable decision
reason, allows cancellation, submits one stable operation identity, and keeps
committed, rejected, conflict, unavailable, and uncertain outcomes distinct.

### Decisions

- This is the only CCW workspace that submits consequential operational
  commands.
- It receives a non-authoritative proposed command from Spatial Workspace and
  owns its review before deciding whether to submit it.
- Proposal delivery only queues a draft for review; it is not a request held
  open across human interaction and does not imply submission.
- It creates one operation identifier for a logical submission and reuses that
  identifier for every retry.
- It submits the incident version currently shown to the operator so OCS can
  detect changed-state conflicts.
- It does not send trusted actor or role claims; Operational Core Connection
  supplies the session and OCS establishes trusted actor context.
- Committed, rejected, conflict, unavailable, and uncertain remain visibly
  different outcomes.
- A committed result does not optimistically modify Operational Picture.
- Workspace activation and screen allocation control presentation only; OCS
  still authorizes every command.
- Layout readiness never implies action readiness; submission controls remain
  unavailable until a concrete proposal and decision reason are present.

### Open

- Define concrete commands only with the first operator workflow.
- Decide whether Situation or Talk Workspace should use the same proposal
  boundary when their first consequential interaction is reviewed.
- Define review, approval, reason capture, confirmation, and cancellation for
  commands that require them.
- Define how an uncertain result is reconciled before the operator may create
  a genuinely new operation.

## Pins

### workspace.activation-change

Starts or stops this workspace's operator interaction for the current
presentation context.

### projection.updated

Refreshes the operational context against which actions are reviewed.

### operational-command.submit

Submits a reviewed action and waits for the authoritative OCS result.

### operational-command.proposal

Receives a non-authoritative proposed command from Spatial Workspace and queues
it for human review.

### operational-command.committed

Notifies Operational Picture after OCS authoritatively commits the reviewed
command so the shared projection can be reloaded.

### layout.acquire-region

Requests this workspace's Shell-owned screen region after activation.
