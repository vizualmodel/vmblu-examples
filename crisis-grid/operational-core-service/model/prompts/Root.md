# Root

## Node

### Prompt

Owns the operational core application as the authoritative boundary for
canonical incident state, governed domain flows, policy and approval gates,
audit evidence, persistence coordination, and controlled external
capabilities.

Runs as interchangeable application instances over one logically authoritative
external database. It maintains one operational truth while exposing
role-appropriate interactions and projections to other CrisisGrid
applications, integrations, and agents.

### Status

The top-level responsibilities and scaling posture are accepted. A deliberately
in-memory executable reference adapter now demonstrates the minimal session,
picture-load, governed evacuation approval, version conflict, idempotent retry,
task creation, and audit-evidence path. It maps to the accepted boundaries but
is not the production decomposition. The CCW session, picture-retrieval,
live-update, and command boundary behavior is also accepted. Client Access and
its boundary with Operations are reviewed.
The Operations boundaries with Operational Repository, Resource Registry, and
Geospatial are structurally connected, including atomic incident/resource
commit preparation and map-ready projection. The model remains the
architectural source of truth; most responsibilities are still
architecture-only and Resource Registry's persistence-read boundary is the
next refinement.

### Decisions

- Canonical operational state and governed changes remain authoritative here;
  client applications maintain only derived projections.
- Application instances are interchangeable and do not hold essential
  authoritative state only in one process.
- The physical database is infrastructure behind the persistence boundary, not
  another CrisisGrid application.
- Agent-facing adapters expose only explicitly declared capabilities and remain
  subject to the same policy, approval, and audit flow as other actors.
- Model refinement proceeds through responsibilities, reviewed boundaries, and
  then connections. Source nodes and factories are introduced only when an
  implementation unit is intentionally selected.

### Open

- Define and review Resource Registry's persistence-read boundary next.
- Complete responsibility and boundary design for each active group before
  introducing implementation units.
- Refine `docs/conceptual-architecture-flows.md` only when later concrete
  workflows change the accepted cross-application direction.
- Define the first cross-application contracts, transport, synchronization,
  degradation, and recovery behavior.
- Decide the production runtime and later deployable-service boundaries.
- Define capability metadata only after authoritative domain operations and
  their controls are accepted.

### References

- [CrisisGrid high-level objectives](../../../docs/high-level-objectives.md) —
  Defines the product vision and intended system outcomes.
- [CrisisGrid architecture principles](../../../docs/architecture-principles.md) —
  Defines project-wide domain, safety, governance, and architectural direction.
- [Antwerp flood scenario](../../../docs/crisisgrid-antwerp-flood-scenario-draft.md) —
  Supplies the synthetic operational context against which OCS responsibilities
  and governed flows are evaluated.
- [Conceptual architecture flows](../../../docs/conceptual-architecture-flows.md) —
  Records provisional cross-application responsibility and flow direction.

## Pins
