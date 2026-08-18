# Session and Access Control

## Node

### Prompt

Authenticates users and agents, creates and revokes sessions, validates every
protected interaction, applies coarse role and information-scope checks, and
establishes trusted internal actor context for domain-owning groups.

Creates cryptographically random opaque session tokens and returns plaintext
tokens only to the client. It never stores or forwards plaintext tokens into
domain groups; shared session state uses a secure token hash so any
interchangeable application instance can validate the session.

A valid session establishes identity and coarse scope, not authority for every
action. Domain-owning groups remain responsible for current-state rules,
approval requirements, consequential authority, and disclosure decisions.

### Status

The responsibility, transport-adjacent boundary, minimal session-token and
trusted-actor contracts, and internal Client Access connections are accepted.
The group is ready for adjacent domain and repository contract design but
remains architecture-only and is not ready for implementation.

### Decisions

- Every parsed external interaction is evaluated here before a protected
  message reaches a domain-owning group.
- Login, protected-interaction rejection, and other security-owned outcomes use
  the same transport-neutral correlated response boundary.
- A successful login creates a cryptographically random opaque token; only its
  secure hash and shared session record may be persisted.
- Plaintext session tokens do not cross the trusted actor boundary.
- Trusted actor context records identity, current roles, information scope, and
  session validity, while domain groups retain state-dependent authorization.
- Session invalidation produces an explicit directive to stop affected live
  delivery.
- Essential session state is shared or durable rather than tied to one
  application process.

### Open

- Define the repository-facing contracts for identity lookup, shared session
  records, secure token hashes, revocation, and attributable access outcomes.
- Decide whether initial authentication uses OCS-owned identity records or an
  external identity provider.
- Define credential and identity-assertion handling without embedding either in
  the transport boundary.
- Define session expiry, renewal, logout, revocation, authority-change, and
  concurrent-session policy.
- Define how invalidation reaches every interchangeable application instance
  and affected live-delivery context.
- Define coarse role and information-scope policy inputs, denial categories,
  audit evidence, and observability.
- Decide the client-side token storage and transport mechanism with the
  selected external protocol adapters.
- Refine the broad application-message fields when the adjacent domain
  boundaries are designed.
- Decompose this group into implementation-ready source nodes and factories
  only after its contracts and flows are accepted.

## Pins

### incoming.evaluate

Evaluates a normalized external interaction, authenticating or validating its
session and applying coarse access checks before it may proceed.

### access.authorized

Emits a protected interaction with trusted actor context after session and
coarse access validation succeeds.

### delivery.respond

Emits a correlated login outcome or security-owned rejection that is safe for
external delivery.

### delivery.stop-live

Directs transport delivery to stop contexts affected by session expiry,
logout, revocation, or an authority change.

### session.invalidate

Invalidates further use of an affected session and initiates the corresponding
live-delivery shutdown.
