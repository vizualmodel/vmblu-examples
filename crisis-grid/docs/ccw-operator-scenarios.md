# CCW Operator Scenarios

> **Status:** Incremental implementation companion  
> **Scope:** Records demonstrated Command Centre Web screen states and operator
> actions. Incident facts remain in the flood-scenario document.

## Scenario 01: Start the Command Centre

### Purpose

Confirm that the browser application starts and presents the accepted desktop
workspace arrangement before operational behavior is introduced.

### Starting state

- The CCW application is started locally.
- No operator session or incident is established.
- Operational Core Connection is not implemented or connected.
- No operational projection is available.

### Demonstrated screen state

The application displays a clearly labelled disconnected layout preview:

- Situation Dashboard occupies the left column.
- Spatial Workspace occupies the large centre region.
- Talk Workspace occupies the upper half of the right column.
- Action Workspace occupies the lower half of the right column.
- Every workspace presents an explicit empty state rather than synthetic facts
  that could be mistaken for an authorized operational picture.

### Runtime flow

1. Application Shell's Workspace responsibility activates the four installed
   visual workspaces for the initial preview.
2. Layout receives the same activation changes and records the active set.
3. Each workspace requests its named region through `layout.acquire-region`.
4. Layout returns a serializable mount identity for the existing container.
5. Each workspace resolves that identity and mounts its own Svelte content.

### Operator actions

The operator can:

- drag the divider between Situation and Spatial to resize the left column;
- drag the divider between Spatial and the right column to resize Talk and
  Action together;
- drag the horizontal divider between Talk and Action to adjust their split;
- focus a divider and use the corresponding arrow keys for incremental
  resizing.

Minimum sizes keep every region usable. Conversation and action-review controls
remain disabled or visibly unavailable.

### Acceptance

- The production bundle builds successfully.
- The generated vmblu application starts in a browser.
- A 1440 × 900 visual verification shows all four regions in the accepted
  arrangement without overlap or clipping.
- The screen identifies itself as synthetic and disconnected.
- Pointer dragging changes the selected region size while adjacent regions
  adapt within their minimum bounds.
- Focused divider controls resize the layout in keyboard increments.

## Scenario 02: Inspect the first spatial picture

### Purpose

Validate the selected map renderer and the visual distinction between
forecast, observed, assigned, and proposed spatial information before those
records are supplied by Operational Picture.

### Starting state

- The CCW application is running in its disconnected synthetic preview.
- The Spatial Workspace uses real Antwerp base geography.
- Operational overlays are deterministic local scenario fixtures and are not
  presented as an authorized OCS projection.

### Demonstrated screen state

The Spatial Workspace displays:

- an OpenStreetMap-derived prototype basemap centred on Antwerp;
- a blue synthetic projected flood extent;
- a red synthetic riverside road closure;
- a green synthetic field-unit marker;
- an amber dashed proposed evacuation assessment zone;
- visible attribution, external-basemap status, coordinates, and an explicit
  synthetic-data notice.

### Operator actions

The operator can pan and zoom the map, return to the initial 2D extent, show or
hide each operational layer, click a feature to inspect its status and
provenance, and resize the Spatial region using the Shell-owned dividers.

### Acceptance

- The production bundle builds with MapLibre GL JS.
- Operational overlays remain visually distinguishable from one another and
  from the basemap.
- Proposed geometry cannot be mistaken for an approved operational zone.
- The map resizes with its allocated region rather than changing the outer
  layout itself.
- The basemap style can be replaced with `VITE_CGW_BASEMAP_STYLE_URL` without
  changing Spatial Workspace's runtime boundary.

## Scenario 03: Load one shared operational projection

### Purpose

Prove the first end-to-end application data boundary before adding live updates
or operational actions.

### Starting state

- CCW starts with the four established workspace regions.
- The executable local OCS is running on its default port.
- OCS exposes one deterministic synthetic Antwerp incident.

### Runtime flow

1. Application Shell activates the four visual workspaces and opens the
   synthetic incident.
2. Operational Picture requests the incident picture through
   `operational-picture.load`.
3. Operational Core Connection returns the service picture, version, and initial
   sequence.
4. Operational Picture creates one `CommandCentreProjection` and emits
   `projection.updated` to all presentation workspaces.
5. Spatial renders the projection's GeoJSON features; Situation renders its
   incident summary. Neither workspace imports the mock fixture.

### Demonstrated screen state

- The Shell identifies a synthetic exercise connected through the governed OCS boundary.
- Spatial shows the same four distinguishable scenario features as Scenario 02.
- Situation shows the incident title, assessment, phase, observation time,
  operational counts, projection version, and synthetic provenance.
- Talk remains a placeholder; Action presents an idle governed-review state.

### Acceptance

- The model, visualization, runtime, CLI-generated source profile, and generated
  application belong to the vmblu 1.10 compatibility family.
- `vmblu verify` reports current generated artifacts and canonical factory
  entries.
- The production bundle builds successfully.
- No operational fixture remains owned or imported by Spatial Workspace.
- Live updates and detail loading remain explicitly unavailable or unimplemented.

## Scenario 04: Review and approve the evacuation zone

### Purpose

Demonstrate that a consequential map interaction remains a proposal until a
human reviews it and OCS authoritatively commits it.

### Runtime flow

1. The operator selects the proposed evacuation zone in Spatial Workspace.
2. Spatial Workspace sends a non-authoritative proposal to Action Workspace.
3. Action Workspace presents the evidence, expected projection version, and an
   editable decision reason.
4. Approval submits one stable operation identity through Operational Core
   Connection to the executable local OCS.
5. OCS checks the expected version and idempotency record, commits the zone
   decision, creates a field-preparation task, and records audit evidence.
6. Action Workspace reports the authoritative outcome without changing the
   shared projection.
7. Operational Picture reloads the canonical snapshot and distributes version
   `ocs-2` to every workspace.

### Acceptance

- Cancellation creates no command or state change.
- A stale expected version returns `conflict` and does not change the incident.
- Retrying the same operation identity returns the original result and creates
  no duplicate task or audit entry.
- A committed result changes the selected zone from proposed to approved.
- Situation Dashboard shows the resulting task and attributable audit evidence.
- Browser code never imports or mutates OCS's canonical incident fixture.
- Live synchronization, durable persistence, and production authentication
  remain explicitly outside this slice.

## Next scenario increment

No further scenario is required for the current credibility milestone. A later
increment should be selected only when it proves a specific architectural risk,
such as reconnect recovery or a field-operations update.
