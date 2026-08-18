# Operational Core Connection

## Node

### Prompt

Owns the browser application's complete communication boundary with the
Operational Core Service. It retains the secret session token, attaches it to
protected interactions, translates transport behavior into application
messages, and manages reconnect attempts.

It carries session establishment, incident-wide and spatially scoped picture
retrieval, live subscriptions, and governed command submission. It does not
decide authorization, interpret operational meaning, render maps, or make a
browser-side action authoritative.

### Status

The boundary is a source node backed by the executable local OCS HTTP service.
It establishes a demo session, retains the returned token, loads one
deterministic synthetic incident, and submits the governed evacuation-zone
approval. Live updates, production credentials, and reconnect recovery remain
open.

### Decisions

- This is the only CCW node that communicates with OCS.
- The current HTTP transport is a local reference adapter, not a production
  deployment or security design.
- Secret session credentials remain behind this boundary and are not
  distributed to presentation workspaces.
- The local sign-in request needs no correlation identifier. This group may
  create any identifier required by the external transport.
- Sign-in reports established, rejected, or unavailable. Later expiry,
  invalidation, or sign-out ends the session; connection loss does not.
- An initial picture load identifies only the incident. This group adds the
  retained session token and any external correlation needed by OCS.
- Picture retrieval reports available, not-found, rejected, or unavailable. A
  usable picture may carry visible warnings without becoming a separate
  partial outcome.
- Live subscription identifies the incident and last sequence applied. OCS
  assigns the subscription identity and may require a fresh picture.
- Reconnect requests a new subscription after the last sequence successfully
  applied; connection and projection freshness remain separate states.
- A retry reuses the operation identifier supplied by the originating action;
  this group does not create a new identifier for each delivery.
- It attaches the retained session token to a command but does not add browser
  claims about trusted actor identity or authority.
- Internal duplicate detection is returned to CCW as the original committed
  result rather than as a separate browser outcome.
- A timeout or uncertain command outcome is not presented as success.

### Open

- Select transport, credential storage, reconnect backoff, timeout, and
  cancellation behavior.
- Define explicit subscription stop and optional session refresh only when
  needed.
- Define transport-level recovery of an uncertain command result without
  changing its operation identifier.
- Define how multiple browser tabs and concurrent incident workspaces share or
  isolate connections.

## Pins

### session.establish

Establishes a session with OCS and returns either safe browser context,
rejection, or temporary unavailability.

### session.status-changed

Emits when an established session ends and the browser must stop protected
work.

### operational-picture.load

Retrieves an authorized incident picture or additional scoped detail needed by
the coherent browser projection.

### live-updates.subscribe

Starts or resumes ordered incident updates after the browser's last applied
sequence.

### live-updates.received

Emits the next authorized delta or invalidation received for an active
subscription.

### operational-command.submit

Submits a governed action with its stable identity and returns the authoritative
or explicitly uncertain OCS result.

### connection.status-changed

Emits a visible change in OCS connectivity or transport degradation.
