# Application Shell

## Node

### Prompt

Coordinates the browser application's visible lifecycle and outer screen
composition. It brings together session presentation, workspace and incident
lifecycle, connection-condition presentation, and allocation of the stable
regions in which visual workspaces render.

The group preserves one coherent Shell boundary while delegating each of those
responsibilities to an internal architectural node. It ensures that workspace
activation remains distinct from layout allocation and that ending a visible
session stops workspace activity.

It does not retain secret session credentials, synchronize operational data,
render workspace-specific content, or decide whether an operator is authorized
for an incident or action. Workspace eligibility and activation are
presentation policy only. OCS remains responsible for authorizing every data
request and operational command regardless of what the Shell displays.

### Status

The existing external Shell boundary is preserved and routed to four internal
responsibilities. Workspace and Layout are implemented as source nodes for the
first screen-layout slice; Session and Connection remain architectural.
Session termination still reaches Workspace, and Workspace activation reaches
Layout so allocation precedes workspace mounting. The fixed desktop shell has
been verified in the running application.

### Decisions

- Workspace and Layout are the first selected internal implementation units;
  Session and Connection remain architectural responsibility boundaries.
- The established external interfaces and contracts remain unchanged by the
  internal split.
- Session termination is shared with Workspace because an ended session must
  stop protected workspace activity.
- Workspace activation is shared with Layout because allocation follows
  activation and deactivation affects the container lifecycle.
- Detailed session, workspace, connection, and layout decisions belong to the
  corresponding child prompt repositories.

### Open

- Define the smallest internal session-context change needed by Workspace after
  successful sign-in or presentation-relevant role changes.
- Review whether Connection emits any internal notice beyond presenting the
  normalized connection condition.
- Keep cross-node coordination minimal and add it only when the operator
  scenario demonstrates a need.

## Pins

### session.establish

Requests an authenticated command-centre session for the operator.

### session.status-changed

Ends the visible active-session state after expiry, invalidation, or sign-out.

### workspace.open-incident

Opens the selected incident as the active command-centre workspace.

### workspace.activation-change

Announces that a visual workspace should become active or inactive. Active
workspaces may then acquire screen space; inactive workspaces stop interaction.

### connection.status-changed

Makes the current OCS connection condition visible to the operator.

### layout.acquire-region

Allocates the requested Shell-owned screen region and returns a serializable
mount identity to the requesting visual workspace.
