# Layout

## Node

### Prompt

Owns the outer screen layout and lifecycle of the browser containers allocated
to active visual workspaces. It decides region position, size, visibility, and
layout mode, then returns a serializable mount identity rather than a live DOM
element.

It tracks workspace activation so it can defensively reject requests from
inactive or unknown workspaces and reclaim containers after deactivation. A
workspace owns its renderer, canvas, controls, and other content mounted inside
the allocated container; Layout owns the container and its placement.

### Status

The node is implemented for the fixed desktop layout. It mounts the outer
Svelte shell, tracks active workspace identities, and allocates serializable
mount identities for Situation on the left, Spatial in the centre, Talk at the
upper right, and Action at the lower right. It rejects inactive or unknown
workspace requests. Operators can resize the three columns and adjust the
Talk-to-Action split with pointer dragging or focused arrow-key controls.
Release coordination, reassignment, persistence of operator sizing, and
alternative layout modes remain open.

### Decisions

- Activation precedes region acquisition; allocation does not implicitly
  activate a workspace.
- A region exists before it is reported as allocated.
- Allocation returns serializable identity and mode data; live DOM elements do
  not cross vmblu contracts.
- Region requests are independent exchanges and do not depend on a one-time
  layout-ready event or node initialization order.
- Layout owns the outer container lifecycle; the workspace owns only its
  mounted content.
- The accepted first desktop mode uses three columns with the right column
  split evenly between Talk and Action.
- Layout owns divider interaction and applies minimum usable sizes to
  Situation, Spatial, Talk, and Action without involving workspace nodes.
- Focused vertical dividers respond to left and right arrow keys; the focused
  Talk/Action divider responds to up and down arrow keys.

### Open

- Define layout release, reassignment, overlays, responsive modes, and
  unavailable-region handling.
- Decide whether operator-adjusted sizes persist across reloads, sessions, or
  devices only after session and preference ownership are reviewed.
- Define responsive and reduced-screen alternatives after the desktop operator
  journey is usable.
- Decide how deactivation coordinates workspace content cleanup with container
  reclamation.

## Pins

### workspace.activation-change

Tracks which workspaces may acquire regions and when their containers can be
reclaimed.

### layout.acquire-region

Allocates a Shell-owned screen region for an active workspace.
