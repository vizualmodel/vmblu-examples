# Talk Workspace

## Node

### Prompt

Presents the operational conversations taking place in the field so the
operator can follow who is communicating, in which conversation, and what is
being said. Text, voice or call state, channels, and participants may belong
here, but their concrete interaction contracts are not yet defined.

It receives communication state as part of the coherent Operational Picture
projection and owns its presentation and interaction inside the screen region
allocated by Application Shell. It does not query OCS independently.

A message is not automatically an authoritative observation, decision, or
action. Any later promotion of communication into structured operational state
must be explicit and reviewed through the appropriate responsibility.

### Status

The workspace is implemented as a source node for the first layout slice. On
activation it acquires the `talk` region and mounts a typed Svelte empty
communication state. Projection-backed communication, outbound text, voice,
membership, unread state, and promotion into structured work remain open.

### Decisions

- Talk Workspace owns human operational communication; Situation Workspace
  owns the summarized incident view, Spatial Workspace owns map interaction,
  and Action Workspace owns governed operational changes.
- It consumes the same coherent browser projection as the other workspaces and
  does not create an independent communication store.
- Messages remain distinct from observations, decisions, approvals, and
  actions.
- Ordinary outgoing communication will not masquerade as
  `operational-command.submit`.
- The workspace owns content mounted inside its allocated container;
  Application Shell owns the outer region.
- The layout placeholder creates no conversation store and exposes no outbound
  communication behavior.

### Open

- Define participants, audiences, channels, conversations, and threads from
  the first communication scenario.
- Define text sending, acknowledgement, editing, attachments, and history.
- Define the voice boundary: call control, audio transport, transcripts, and
  call metadata may require different responsibilities.
- Define how a message can be promoted into a structured observation or
  candidate action without making the original message authoritative.
- Define delivery, read and unread state, priority, connectivity, and degraded
  behavior.
- Add a boundary through Operational Core Connection only after the first
  outbound communication workflow has been reviewed.

## Pins

### workspace.activation-change

Starts or stops this workspace's visible and interactive lifecycle in response
to Application Shell presentation policy.

### projection.updated

Updates the displayed conversations from the current coherent browser
projection.

### layout.acquire-region

Requests the Shell-owned talk region before mounting its presentation.
