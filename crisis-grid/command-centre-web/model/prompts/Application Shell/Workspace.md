# Workspace

## Node

### Prompt

Owns incident navigation and the presentation lifecycle of installed
workspaces. It distinguishes whether a workspace is installed, eligible for the
current operator context, active in the current experience, or allocated a
screen region; those states are not interchangeable.

It opens an incident only after a usable visible session exists. It determines
the desired active workspace set from role-aware presentation policy and emits
explicit activation changes. When the session ends, it stops protected
workspace activity and deactivates affected workspaces.

It does not authorize incident access or operational actions. Eligibility and
activation are browser presentation policy; OCS authorizes every request and
command.

### Status

The node is implemented for the controlled projection slice. At startup it explicitly
activates Situation, Spatial, Talk, and Action so each can request its existing
Shell-owned region, then opens the single incident exposed by the local OCS
mock. A session-ended notification deactivates all four. Incident discovery,
role-aware eligibility, session gating, and switching remain open.

### Decisions

- Opening an incident identifies the desired workspace; it does not imply that
  OCS has authorized or found the incident.
- Workspace eligibility is role-aware presentation policy, not a security
  boundary.
- Activation is explicit and precedes region acquisition; layout denial is not
  the normal activation mechanism.
- Deactivation stops interaction and requires mounted workspace content to be
  removed.
- Startup incident opening is temporary demo policy and remains clearly
  labelled synthetic; it is not an authorization decision.

### Open

- Define the presentation-policy inputs and rules that determine which
  installed workspaces are eligible and active.
- Define how operators discover, choose, leave, and switch incidents.
- Define the internal session-context change received after establishment and
  presentation-relevant role changes.
- Define how focus and shared contextual navigation affect activation without
  conflating them.

## Pins

### session.status-changed

Stops protected incident and workspace activity when the visible session ends.

### workspace.open-incident

Opens the incident selected by the operator as the desired command-centre
workspace.

### workspace.activation-change

Emits when presentation policy makes a workspace active or inactive.
