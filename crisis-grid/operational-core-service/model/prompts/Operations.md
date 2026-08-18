# Operations

## Node

### Prompt

Receives trusted interactions from Client Access and decides what they mean in
the current incident. It applies domain rules, current-state authorization,
and approval requirements before returning information or proposing a change.

For a read, it loads persisted incident state, requests resource information
when needed, and builds the authorized domain result. For a change, it loads
the current incident version, asks Resource Registry to prepare any
resource-owned change, creates the incident change set and outcome, and asks
Operational Repository to commit them together. It treats the result as
authoritative only when the repository reports the original operation as
committed or already committed.

It owns crisis workflows and subscription decisions. It does not authenticate
actors, store records, own resource-specific state, create spatial
projections, or deliver external traffic.

### Status

The Client Access, Operational Repository, Resource Registry, and Geospatial
boundaries are accepted and connected. The first external operational-picture,
live-update, and command outcomes are accepted while their concrete domain
record and change shapes remain open. The group remains architecture-only.

### Decisions

- Authentication and coarse access at Client Access do not replace
  state-dependent domain authorization here.
- One trusted interaction boundary carries authorized snapshot, subscription,
  command, proposal, approval, and other domain messages without moving their
  state-dependent validation into Client Access.
- A read from Operational Repository supplies persisted incident state and
  version; Operations decides what may be disclosed and constructs the
  externally meaningful result.
- An operational-picture request identifies one incident. Operations returns
  available, not-found, rejected, or unavailable; an available picture carries
  one coherent result, its authoritative version, the live-update starting
  sequence, and any visible warnings.
- A consequential operation uses a stable operation identifier derived from
  its originating interaction or workflow step and reuses it for every retry.
- A client command identifies its incident, the version on which the operator
  acted, an opaque command, and an optional reason. Trusted actor context comes
  from Client Access rather than browser claims.
- A commit uses the version on which the decision was based. A version
  conflict applies no change and must be handled as a changed-state outcome,
  not as success.
- Operations passes a Resource Registry-prepared change and its validated
  resource version context to Operational Repository without interpreting or
  modifying the prepared change.
- When an operation affects both incident and resource state, Operations asks
  for one combined commit; it does not commit either part separately.
- A committed result and a duplicate result both refer to the same original
  commit and authoritative domain outcome.
- Both committed and duplicate repository outcomes map to the original
  committed result at the CCW boundary. Rejected, conflict, unavailable, and
  uncertain remain distinct external outcomes.
- A repository failure or uncertain outcome does not authorize Operations to
  claim that a change committed.
- Similar content submitted under different operation identifiers is not an
  idempotent retry; Operations decides whether it is a domain duplicate.
- Proposals, approvals, decisions, warnings, committed changes, and executed
  actions remain distinct and attributable.
- Operations owns the domain outcomes that complete correlated interactions
  and begin, update, or normally end an operational subscription.
- A subscription starts or resumes after the client's last applied sequence.
  OCS assigns its identity and reports active, rejected, unavailable, or that
  a new picture is required.
- A normal subscription end is distinct from security-owned session
  invalidation and does not invalidate the containing session.
- A live update identifies its subscription and incident, carries sequence and
  resulting version, and is either a delta or an invalidation. Detailed change
  records retain their own provenance and sensitivity where needed.

### Open

- Define the minimum incident, proposal,
  approval, change-set, outcome, attribution, audit, and notification semantics
  for the first vertical slice.
- Define the Resource Registry persistence-read boundary with Operational
  Repository.
- Define handling for missing incident state, repository failure, commit
  conflict, timeout, and uncertain commit outcome.
- Define replay-window limits, domain cancellation, and committed-event
  distribution behavior only when needed.
- Define policy and approval ownership for human and agent-originated actions.
- Design internal nodes and implementation units only after the remaining
  external boundaries and first vertical slice are accepted.

## Pins

### access.authorized

Processes a trusted external interaction using current incident state, domain
rules, authority requirements, and approval state.

### delivery.send-response

Emits the authorized domain outcome that completes a previously validated
external interaction.

### delivery.start-live

Emits an approved directive when an operational subscription can begin or
resume.

### delivery.send-update

Emits the next authorized delta or invalidation for an established operational
subscription.

### delivery.stop-live

Emits a domain-owned directive when one operational subscription must end
without invalidating its session.

### operational-state.load

Requests the current persisted incident state and version needed to evaluate a
trusted interaction.

### operational-state.commit

Requests an atomic commit after Operations has approved the change and
prepared its authoritative outcome and evidence, including any unchanged
Resource Registry-prepared change.

### resource-state.get-view

Requests the authorized resource information needed for an incident decision
or operational picture.

### resource-state.prepare-change

Requests validation and preparation of the resource-owned part of an
operational change.

### spatial.analyze



### spatial.build-projection
