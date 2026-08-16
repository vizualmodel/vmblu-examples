# Spatial Workspace

## Node

### Prompt

Presents the spatial part of the shared operational picture: base geography,
incident areas, routes, facilities, units, resources, hazards, forecasts, and
their visible provenance, confidence, freshness, and status.

It owns the map's local interaction: pan, zoom, visible-layer choices, spatial
selection, and rendering. When the current projection lacks the requested area,
layers, time, or detail level, it asks Operational Picture to obtain that
detail. Operational Picture remains the data coordinator and supplies the
result through the coherent projection.

When Application Shell activates it, it requests the `spatial` screen region,
resolves the returned mount identity in the browser, and creates and owns its
map renderer and canvas inside that container. When deactivated, it stops
spatial interaction and removes its mounted content. It does not reposition or
resize the outer region.

It owns spatial interaction and presentation, not the operational or resource
facts being shown. A map interaction that would change operational reality
creates a non-authoritative draft proposal for Action Workspace. It does not
independently call OCS or treat map edits as committed operational changes.

### Status

The source node mounts a MapLibre GL JS map of the bounded Antwerp scenario
area and renders the spatial features from the shared projection. The former
workspace-local fixture now lives behind the controlled OCS mock. Operators can
pan, zoom, reset the 2D extent, toggle layers, inspect status and provenance,
and resize the Shell-owned region. Selecting a projected object now opens a
context card, and a proposed evacuation zone can be sent to Action Workspace
for review. Cross-workspace selection and detail retrieval remain open. Internally, workspace coordination, Svelte
presentation, and MapLibre rendering are now separate modules connected by a
small view model and intent callbacks.

### Decisions

- The map consumes the same coherent browser projection as the other
  workspaces.
- The workspace requests its region when ready rather than depending on node
  creation order or receiving a live DOM element through initialization.
- The workspace requests a region only while active and cleans up mounted
  content when deactivated.
- The workspace owns all content inside the allocated container; Application
  Shell owns the container and outer layout.
- The vmblu node owns activation, region acquisition, projection state, and
  coordination. The Svelte component is presentational and does not import
  MapLibre or interpret the operational projection.
- The map controller owns MapLibre creation, sources, layers, interactions,
  resize observation, basemap status, and disposal. Map-specific styling and
  layer definitions remain with the map implementation.
- Proposed zones, routes, closures, assignments, and forecasts remain visually
  distinct from approved or observed facts.
- Stale, uncertain, restricted, or degraded layers remain visible as such.
- Pan, zoom, and already-loaded layer visibility remain local interactions.
- Missing authorized detail is requested from Operational Picture and arrives
  through the same coherent projection used by all workspaces.
- The OCS returns structured operational, resource, and geospatial data;
  Spatial Workspace owns its visual rendering.
- Consequential map interactions propose drafts to Action Workspace, which
  owns review and submission.
- Proposal delivery queues a draft in Action Workspace. Command submission and
  the authoritative OCS result remain separate.
- MapLibre GL JS is the browser renderer for the first spatial slice.
- MapLibre GL JS is pinned to 5.24.0 because the 6.1 ESM-only worker path is
  not emitted correctly by the current Vite development dependency optimizer;
  revisit the major upgrade when that integration is verified.
- The basemap style is configurable through `VITE_CGW_BASEMAP_STYLE_URL` so a
  hosted prototype can later be replaced by bounded self-hosted tiles without
  changing the workspace boundary.
- The default public OpenStreetMap raster source is prototype-only, retains
  visible attribution, and is not the production or offline hosting design.
- The first operational overlays remain deterministic synthetic scenario data,
  but reach the map only through Operational Core Connection and Operational
  Picture's shared projection.
- Flood forecasts, observed closures, units, and proposed evacuation geometry
  use distinct visual treatments. Feature inspection exposes synthetic status
  and provenance.

### Open

- Define shared selection and contextual navigation with the other workspaces.
- Select and package the bounded self-hosted basemap dataset and style.
- Define the 3D, non-WebGL accessibility, and offline fallback modes.
- Define behavior when the region is unavailable, replaced, hidden, or later
  released.
- Define which spatial interactions remain queries and which create explicit
  draft proposals for Action Workspace.

## Pins

### workspace.activation-change

Starts or stops this workspace's visible and interactive lifecycle in response
to Application Shell presentation policy.

### projection.detail-request

Requests additional authorized spatial detail when the current projection does
not cover the selected area, layers, time, or detail level.


### projection.updated

Updates the spatial presentation from the current coherent browser projection.

### operational-command.proposal

Offers a non-authoritative map-derived command to Action Workspace for review.

### layout.acquire-region

Requests the Shell-owned spatial region before mounting the map renderer.
