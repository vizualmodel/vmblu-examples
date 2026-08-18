# Client Access

## Node

### Prompt

Owns the boundary through which users, applications, and agents interact with
the operational core. It separates external protocol handling from identity,
session, and coarse access decisions so every protected inbound interaction
receives consistent security processing before reaching a domain-owning group.

All application instances remain interchangeable: essential session and
subscription state cannot depend on one process. Authorized domain responses
and updates may return directly to External Communications when they remain
tied to previously validated request or live-delivery context.

### Status

Its two child responsibilities and adjacent transport-security boundary are
accepted. Its first domain boundary with Operations is also accepted, including
the minimal start/resume and ordered-update behavior used by CCW. The group
remains architecture-only.

### Decisions

- Every protected external interaction receives consistent session and coarse
  access processing before it reaches a domain-owning group.
- Transport correlation may carry an authorized outcome directly back for
  delivery without repeating session validation.
- Plaintext opaque session tokens stay at the external and session boundary;
  domain groups receive trusted actor context instead.
- Essential session and subscription state cannot make one application
  instance uniquely authoritative.
- A client resumes by incident and last applied sequence. OCS assigns the new
  subscription identity; replay may instead require a fresh picture.
- Raw external interactions and transport connection lifecycle remain inside
  Client Access; only trusted interactions cross into domain-owning groups.
- Security-owned responses and invalidations route internally to External
  Communications, while authorized domain responses and live-delivery
  directives enter through the group delivery boundary.
- Operations owns the outer contracts for domain responses and live-delivery
  directives; Client Access follows them while retaining matching internal
  delivery contracts for valid group-boundary relay.
- Normal domain cancellation ends one operational subscription through a
  dedicated directive and remains distinct from security-owned session
  invalidation.

### Open

- Define subscription revocation propagation, replay limits, explicit client
  stop, and multi-instance delivery behavior only when needed.
- Define consistent failure categories, audit attribution, boundary health,
  degradation, and observability.
- Refine the trusted interaction boundary only when concrete domain messages
  reveal stable shared structure beyond their trusted envelope.

## Pins

### access.authorized

Emits an interaction after session and coarse access processing establishes
trusted actor context for domain-owned validation.

### delivery.send-response

Accepts an authorized domain outcome for correlated delivery to the external
interaction it completes.

### delivery.start-live

Accepts an approved directive to begin or resume live delivery for an
established external context.

### delivery.send-update

Accepts an authorized update for delivery through an established live context.

### delivery.stop-live

Accepts a domain-owned directive to end one operational subscription while
leaving its session valid.

### session.invalidate

Accepts an authoritative invalidation so further session use and affected live
delivery cease.
