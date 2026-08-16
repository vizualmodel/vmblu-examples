# Connection

## Node

### Prompt

Owns Application Shell's operator-facing presentation of the current OCS
connection condition. It turns normalized connection changes into visible
global status or degradation notices without treating connection loss as
session termination.

It does not open transports, retain credentials, reconnect, or determine
projection freshness. Operational Core Connection owns communication behavior,
and Operational Picture owns the freshness of the browser projection.

### Status

The normalized connection-condition input is defined and connected. Exact
operator notices and escalation behavior remain open. The node remains
architecture-only.

### Decisions

- Connection condition and session validity are separate states.
- Connection condition and projection freshness are separate states.
- This node presents communication status but does not manage communication.

### Open

- Define which connection states require persistent, transient, or blocking
  operator presentation.
- Decide whether any normalized connection change must be forwarded internally
  beyond its existing delivery to Operational Picture.
- Define recovery presentation in the operator scenario.

## Pins

### connection.status-changed

Updates the operator-visible global connection condition or degradation notice.
