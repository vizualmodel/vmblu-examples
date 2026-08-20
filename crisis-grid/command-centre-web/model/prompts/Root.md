# Root

## Node

### Prompt

Coordinates the CrisisGrid browser command centre as a role-aware operational
workspace over the Operational Core Service. It establishes an operator
session, opens an incident, maintains a synchronized local projection, presents
that projection through spatial, situation, talk, and action workspaces, and
submits explicit governed actions.

The browser never becomes an independent source of operational truth.
Canonical authorization, decisions, records, and commit outcomes remain with
the Operational Core Service.

### Status

The running implementation now starts as a Svelte command-centre layout.
Application Shell remains a group while its Workspace and Layout leaves are
implemented as source nodes. Spatial, Situation, Talk, and Action Workspace are
also source nodes for their first indivisible presentation implementation. The
existing activation and region-allocation contracts drive mounting into a
fixed desktop layout: Situation on the left, Spatial in the centre, and Talk
above Action on the right. Operational Core Connection and Operational Picture
are now source nodes for a controlled initial-projection slice. Session,
live-update, detail-loading, and governed-action behavior remain provisional.

The startup layout, source profile, generated application, production build,
and browser rendering have been verified. Spatial Workspace currently presents
a MapLibre-based Antwerp map with synthetic flood, road-closure, field-unit,
and proposed-evacuation overlays. The executable local OCS service supplies one
picture to Operational Picture, which publishes the same projection to Spatial
and Situation. Both views visibly identify the source as synthetic.

### Decisions

- The command centre is a role-specific projection and interaction surface,
  not an independent source of canonical operational state.
- The first model is organized by application responsibility rather than by
  pages, panels, widgets, framework components, or anticipated source files.
- Operational Core Connection is the sole browser boundary to OCS; workspaces
  do not call OCS independently.
- The browser session flow is deliberately small: establish a session, retain
  the secret token inside Operational Core Connection, expose only minimal
  non-secret context, and report later session termination separately from
  connection loss.
- Operational Picture distributes one coherent local projection to spatial,
  situation, talk, and action workspaces.
- Opening an incident requests one coherent picture. An available result
  carries the authoritative version and live-update starting sequence; usable
  degradation is expressed as warnings.
- Live delivery resumes after the last applied sequence. Duplicates are
  ignored, gaps force a new picture load, and invalidations reload affected
  data.
- Spatial Workspace requests missing map detail through Operational Picture;
  structured results join the coherent projection rather than bypassing it.
- Spatial and Situation workspaces may propose drafts, while Action Workspace
  alone owns operator review and consequential command submission.
- Spatial Workspace hands a map-derived command proposal to Action Workspace.
  The reply says only whether it was submitted, not whether OCS committed it.
- Application Shell owns screen-region allocation; visual workspaces own only
  the content mounted within their allocated regions.
- Application Shell explicitly activates eligible visual workspaces before
  they request regions. This is presentation policy, not OCS authorization.
- Application Shell delegates session presentation, workspace lifecycle,
  connection-condition presentation, and layout allocation to distinct
  internal responsibility nodes without changing its external boundary.
- Browser-side commands are proposals to OCS until an authoritative result is
  returned; canonical projection changes arrive through the synchronized
  picture flow.
- A command carries one stable operation identity and the projection version
  on which the operator acted. Retries reuse that identity, and an internal
  duplicate returns the original committed result.
- The running implementation uses Svelte components with TypeScript for views
  and JavaScript factory adapters. Model, generated artifacts, runtime, and
  tooling follow the vmblu 1.10 compatibility family.
- The first projection path is explicitly labelled as a synthetic local OCS
  mock and does not imply production connectivity or operational authority.
- UI implementation proceeds through vmblu-owned source nodes. Svelte
  component boundaries do not by themselves justify additional vmblu nodes.
- Direct feedback from the running application is the primary UI design loop;
  Figma remains optional, disposable design input.
- Controlled mocks and synthetic data must remain visibly and structurally
  distinguishable from production connections and authorized operational data.

### Open

- After the projection is demonstrable, complete one narrow operator journey:
  select an area in Spatial Workspace, create an
  `operational-command.proposal`, review it in Action Workspace, and submit or
  cancel it.
- Define shared selection, contextual navigation, role changes, sign-out,
  subscription stop, resynchronization, and incident switching.
- Define how receipt of a command proposal asks Application Shell to reveal or
  focus Action Workspace without letting workspaces activate one another.
- Define layout release, responsive modes, overlays, focus, and dynamic
  workspace replacement after the fixed initial layout is accepted.
- Decide where briefing, audit trace, integration health, and controlled AI
  assistance belong after the first vertical slice is concrete.
### References

- [CrisisGrid high-level objectives](../../../docs/high-level-objectives.md) —
  Defines the product vision and intended system outcomes.
- [CrisisGrid architecture principles](../../../docs/architecture-principles.md) —
  Defines project-wide domain, safety, governance, and architectural direction.
- [Antwerp flood scenario](../../../docs/crisisgrid-antwerp-flood-scenario-draft.md) —
  Supplies the synthetic incident sequence used to shape and demonstrate the
  first operator journey.
- [Conceptual architecture flows](../../../docs/conceptual-architecture-flows.md) —
  Records provisional cross-application responsibility and flow direction.
- [CCW operator scenarios](../../../docs/ccw-operator-scenarios.md) — Records
  demonstrated screen states, operator actions, and the next scenario increment.

## Pins
