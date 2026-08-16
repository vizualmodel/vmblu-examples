# Session

## Node

### Prompt

Owns the operator-facing session lifecycle inside Application Shell. It
presents sign-in, requests session establishment, retains only the returned
non-secret browser context, and ends the visible session when expiry,
invalidation, or sign-out is reported.

It does not retain the secret session token, manage transport reconnection, or
decide OCS authorization. Operational Core Connection retains credentials and
OCS remains authoritative for identity and access.

### Status

The minimal establishment and termination boundary is defined and connected
through Application Shell. The internal handoff of usable non-secret session
context to Workspace remains open. The node remains architecture-only.

### Decisions

- A sign-in result distinguishes rejected credentials from temporary OCS
  unavailability.
- Established browser context contains only non-secret session information.
- Expiry, invalidation, and sign-out end the visible session; connection loss
  does not.
- Secret credentials remain behind Operational Core Connection.

### Open

- Define explicit sign-out, session refresh, and role switching only when the
  operator workflow requires them.
- Define the smallest internal session-context change needed by Workspace after
  successful establishment or a presentation-relevant role change.
- Define sign-in presentation and recovery behavior in the operator scenario.

## Pins

### session.establish

Requests an authenticated command-centre session when the operator submits the
sign-in interaction.

### session.status-changed

Ends the visible session state when an established session terminates.
