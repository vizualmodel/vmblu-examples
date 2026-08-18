# Situation Workspace

## Node

### Prompt

Presents the non-map operational picture needed to understand the incident:
current status, timeline, forecasts, observations, objectives, tasks, people,
teams, resources, communication status and highlights, integration condition,
provenance, and selected-object detail.

When Application Shell activates it, it requests the `situation` screen region,
resolves the returned mount identity, and owns the situation content inside
that container. When deactivated, it stops interaction and removes its mounted
content. It does not control the outer region or independently query OCS.

### Status

The source node acquires the `situation` region and renders the first shared
projection slice: incident title, assessment, severity, phase, observation
time, three operational counts, and explicit synthetic provenance. Richer
information hierarchy, temporal behavior, shared selection, and briefing
remain open.

### Decisions

- Observations, forecasts, assessments, decisions, approvals, tasks, and
  messages remain visibly distinct.
- The timeline combines past events, active work, decisions, plans, and
  forecasts rather than acting as a raw event log.
- Resource availability, integration health, confidence, provenance, and
  staleness are part of situational understanding, not hidden diagnostics.
- The workspace requests its region when ready and owns only content mounted
  inside the allocated Shell container.
- The workspace requests a region only while active and cleans up mounted
  content when deactivated.
- A situation interaction may propose a non-authoritative action draft, but
  review and consequential submission remain owned by Action Workspace.
- The empty state remains until a projection is received; displayed incident
  values come only from `projection.updated`.

### Open

- Extend the minimum situation panels and relationships for the first operator
  action workflow.
- Define shared selection and contextual navigation with Spatial, Talk, and
  Action workspaces.
- Define how communication highlights open their conversation in Talk
  Workspace.
- Decide where briefing generation, audit trace, and controlled AI assistance
  belong.
- Define behavior when the region is unavailable, replaced, hidden, or later
  released.
- Define information-density, prioritization, and accessibility behavior for
  different command-centre roles.

## Pins

### workspace.activation-change

Starts or stops this workspace's visible and interactive lifecycle in response
to Application Shell presentation policy.

### projection.updated

Updates situational presentation from the current coherent browser projection.

### layout.acquire-region

Requests the Shell-owned situation region before mounting its presentation.
