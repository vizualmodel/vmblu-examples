# Operational Repository

## Node

### Prompt

Stores and retrieves authoritative OCS data for domain-owning groups. It
reports what is persisted and whether an atomic commit succeeded; it does not
decide whether an operational action is valid or authorized.

For operational state, it loads the current persisted state of one incident
and atomically commits a domain-approved change with its new version, result,
attribution, audit evidence, idempotency record, and durable notification
intent. When the request includes a Resource Registry-prepared change, it
checks the accompanying resource version context and stores the incident and
resource changes in the same transaction. The physical database remains an
implementation detail behind this boundary.

### Status

The operational-state boundary is accepted and connected to Operations. It
exposes one load exchange and one atomic commit exchange. The commit can carry
an optional prepared resource change and its resource version context without
defining the still-unknown record shapes. The Resource Registry persistence
read boundary, repository internals, and implementation technology remain
undesigned.

### Decisions

- Operations decides what may be read or changed; this node performs no domain
  authorization or operational validation.
- Loading returns the persisted state and version of one incident rather than
  an externally consumable operational picture.
- A commit stores the approved changes, resulting version, domain outcome,
  attribution, audit evidence, idempotency record, and notification intents as
  one transaction.
- The operation identifier comes from the logical operation's origin and is
  reused for every retry; this node does not invent it.
- An already committed operation returns its original version and outcome
  rather than applying its changes again.
- Different operations that happen to contain similar data are not duplicates;
  Operations owns that domain-level comparison.
- A version mismatch is reported as a concurrency conflict and does not
  partially apply the submitted changes.
- A prepared resource change and its expected resource version context are a
  pair; if either is absent or invalid, no part of the request is committed.
- When a resource change is present, the incident version and every resource
  version in its context are checked before writing, and all incident and
  resource changes commit or fail together.
- The repository stores the prepared resource change as supplied; it does not
  reinterpret Resource Registry rules.
- Shared session state stores a secure token hash rather than a plaintext
  session token.
- Essential authoritative and session state is available to every
  interchangeable application instance.
- There is no generic save, delete, append, or arbitrary-query boundary.
- The database product and deployment topology are not part of the current
  semantic model.

### Open

- Define the first incident state, change-set, outcome, attribution, audit, and
  notification-intent structures with the first Operations vertical slice.
- Define transaction isolation, retry, timeout, uncertain-outcome, and
  recovery behavior.
- Review separate operational-state and session-and-identity internal
  responsibilities when repository internals are designed.
- Define identity, session, revocation, resource, and audit-history boundaries
  only with their owning consumers.
- Decide the database product, topology, replication, backup, recovery, and
  migration approach.
- Decide whether durable update distribution uses an outbox and shared
  publish/subscribe or another accepted mechanism.
- Define retention, sensitivity, encryption, access auditing, health,
  degradation, and observability.
- Design internal nodes and implementation units only after the relevant
  external boundaries are accepted.

## Pins

### operational-state.load

Returns the current persisted state and version of the requested incident for
domain processing.

### operational-state.commit

Commits an approved operational change atomically or reports that the
operation was already committed, conflicted with current incident or resource
state, or failed.
