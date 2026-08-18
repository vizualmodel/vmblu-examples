# Operational Picture

## Node

### Prompt

Owns the browser's current authorized, read-oriented projection of one incident.
It loads the initial picture, resumes live delivery from the represented
sequence, applies ordered updates, and distributes one coherent projection to
the command-centre workspaces.

It also coordinates on-demand detail. When a workspace requests additional
detail, it uses information already held when sufficient; otherwise it obtains
authorized structured detail through Operational Core Connection, incorporates
it into the same browser projection, and emits an updated projection. It does
not return a separately rendered map or create a second workspace-owned source
of operational data.

It is not a canonical store. Missing updates, connection loss, snapshot
warnings, and failed resynchronization make the projection visibly stale or
degraded.

### Status

The source node loads and distributes the initial projection. After Action
Workspace reports a committed command it reloads the canonical picture rather
than applying an optimistic browser mutation. The concrete picture includes a
Situation summary, map-ready GeoJSON, resulting tasks, and recent audit
evidence. A lost connection marks an already loaded projection as visibly
degraded. Live updates, gap recovery, detail merging, startup retry, and
persistence remain open.

### Decisions

- All presentation workspaces consume the same projection instead of
  independently loading operational, resource, or spatial data.
- An initial load needs only the incident identity. The available result carries
  one coherent picture, its authoritative version, and the sequence after
  which live updates begin.
- A usable but incomplete picture remains available with visible warnings; it
  is not represented as a separate partial outcome.
- Retrieval otherwise reports not-found, rejected, or unavailable with a
  simple reason.
- Updates are applied only in their accepted order; a gap triggers visible
  degradation and resynchronization rather than silent best-effort merging.
- A successful command response does not directly mutate the projection; the
  corresponding canonical state arrives through snapshot or live-update flow.
- Browser caching remains disposable and never becomes the source of
  operational truth.
- On-demand detail is incorporated into the coherent projection and delivered
  through `projection.updated`; the request reply reports handling status
  rather than carrying a separate map-specific data store.
- This node coordinates authorized structured data and never renders map
  pixels, canvases, or browser elements.
- This node owns no screen region and does not participate in layout
  allocation.
- The first implementation publishes only an available initial picture; it
  does not pretend to implement subscription or recovery behavior.

### Open

- Extend the concrete record shapes beyond the minimal situation summary and
  spatial features only when the next operator workflow needs them.
- Define detail-cache coverage, request coalescing, cancellation, replacement,
  and merge behavior when operators move rapidly around the map.
- Define gap detection, resynchronization, replay, duplicate update, and
  incident-switch behavior.
- Decide whether a safely labelled cached picture is available while offline.
- Define projection-level freshness and degradation rules for operational,
  resource, spatial, communication, and integration data.

## Pins

### workspace.open-incident

Begins synchronization of the selected incident workspace.

### operational-picture.load

Requests the current authorized picture used to initialize or resynchronize
the browser projection.

### live-updates.subscribe

Requests ordered updates beginning after the last sequence represented locally.

### live-updates.received

Applies an authorized update to the current incident projection.

### projection.detail-request

Ensures requested map detail is present in the coherent browser projection.

### projection.updated

Emits the coherent browser projection after initialization, update, or
degradation changes what workspaces should present.

### connection.status-changed

Marks the projection appropriately when OCS connectivity changes.

### operational-command.committed

Reloads the canonical incident picture after OCS confirms a governed change.
