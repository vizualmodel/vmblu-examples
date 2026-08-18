# External Communications

## Node

### Prompt

Owns external protocol connections, parsing, serialization, request
correlation, connection lifecycle, response delivery, and live-update
delivery. It converts successfully parsed external traffic into normalized
incoming messages and uses established correlation or live-delivery context to
route approved results back to clients.

Contains no authentication, authorization, persistence, or crisis-domain
logic. It does not decide whether a request or subscription is allowed and
starts or stops live delivery only in response to an accepted internal
directive.

### Status

The responsibility, transport-neutral boundary, minimal adjacent contracts,
internal Client Access connections, and domain-driven subscription-stop
boundary are accepted. The group remains architecture-only and is not ready
for implementation.

### Decisions

- Protocol handling is isolated from authentication, authorization,
  persistence, and crisis-domain behavior.
- Incoming application messages and meaningful connection lifecycle changes
  remain distinct concerns.
- A correlated one-time response is distinct from ongoing live delivery
  because most interactions do not establish a continuing delivery context.
- Live delivery begins or ends only in response to an explicit internal
  directive issued after the relevant upstream decision.
- Domain-owned subscription cancellation stops only the selected subscription;
  security-owned invalidation can stop all affected delivery for a session.
- Asynchronous input and output flow is preferred over holding a request/reply
  call chain open, allowing approved outcomes to return through previously
  validated correlation or live-delivery context.
- The boundary remains independent of any particular external protocol or
  session-token transport mechanism.

### Open

- Define the exact boundary between protocol parsing and shape rejection here
  and security or application validation elsewhere.
- Define correlation and live-delivery context lifecycles, including
  idempotency, cancellation, reconnection, and resumption.
- Decide how `connection.lifecycle` participates in connection management. It
  intentionally remains unconnected and private inside Client Access until
  that boundary has a reviewed consumer.
- Decide which delivery state is instance-local and which must be shared or
  recoverable across interchangeable application instances.
- Decide error, timeout, retry, ordering, backpressure, delivery-failure, and
  recovery behavior.
- Select the initial external protocol adapters and session-token transport
  mechanism.
- Define transport health, degradation, and delivery observability.
- Define how shared subscription identity resolves to instance-local or
  recoverable delivery context across interchangeable application instances.
- Decompose this group into implementation-ready source nodes and factories
  only after its contracts and flows are accepted.

## Pins

### incoming.received

Emits a normalized incoming message after protocol parsing succeeds so session
and access processing can decide whether it may proceed. It preserves the
correlation needed for a later response.

### connection.lifecycle

Emits meaningful external connection changes so correlated work and
live-delivery contexts can be released or resumed.

### delivery.send-response

Serializes and delivers an authorized outcome to the external interaction it
completes. It uses the previously established correlation context.

### delivery.stop-live

Stops further delivery for a context that has expired, been revoked, or
otherwise become invalid.

### delivery.send-domain-response

Serializes and delivers an authorized domain outcome to the external
interaction it completes.

### delivery.start-live

Begins a live-delivery context after upstream processing accepts a subscription
or resumption.

### delivery.send-update

Serializes and delivers an authorized live update to the selected active
delivery context.

### delivery.stop-subscription

Ends the selected operational subscription while preserving other delivery
contexts and the containing session.
