You are working in the crisis-grid repository.

Before making changes, read these project documents carefully:

* `crisisgrid-antwerp-flood-scenario-draft.md`
* `architecture-principles.md`
* any existing vmblu schema, examples, runtime documentation, and coding-agent guidance in this repository

## Objective

Create the initial vmblu architecture model for the **CrisisGrid Browser Command Centre**.

This is the first application in a larger CrisisGrid system. It must be designed as a browser-based command-and-control application for a fictional but realistic Antwerp flood crisis.

Do not try to build the complete product. The goal is to establish a strong, extensible architectural foundation and a first vertical slice that proves the model can drive a realistic command-centre UI.

## Architectural intent

The browser application is one role-specific projection of a shared operational model.

It should provide a common operational picture for authorized command-centre users. The interface must be predictable under stress and should make map, timeline, operational messages, teams, tasks, decisions, and incident context feel like connected views of the same underlying system.

The initial application should support one active incident:

> A forecasted compound flood risk in Antwerp escalates into a district evacuation.

The initial end-to-end flow is:

`forecast → assessment → incident activation → evacuation decision → approved public warning → field-operation updates → live operational picture`

## Design principles to preserve

* Treat the vmblu model as executable architecture, not passive documentation.
* Build a modular system with explicit interfaces and bounded responsibilities.
* Make it possible to add later modules as if adding a circuit board: clear inputs, outputs, dependencies, policies, health, and UI contributions.
* Use existing libraries for specialist capabilities; do not rebuild mature technology unnecessarily.
* Keep AI interaction controlled: it may observe, analyse, and prepare actions, but sensitive actions must follow the ordinary approval flow.
* Use role-aware design. Roles affect authority, visible information, and interaction depth.
* Keep browser UI concepts consistent and easy to learn under pressure.
* Prefer synthetic operational data while using real geographic context where useful.
* Design for future degraded integrations and unreliable external services, even if the first implementation only simulates them.

## Scope: browser application only

Create the architecture for a browser-based command-centre application. Do not build the mobile application yet, but make interfaces compatible with a future field-operations mobile app.

The browser application should have these major UI regions:

1. **Operational Map**

   * 2D map as the primary spatial index
   * support for overlay layers
   * initial layers: flood forecast, observed flooding, evacuation zones, critical facilities, road status, responder/team locations, tasks, alerts
   * selection of an object on the map should drive context across the rest of the application

2. **Operational Timeline**

   * past observations, events, decisions, warnings, and task updates
   * current active items
   * expected future developments and forecasts
   * uncertainty/confidence where appropriate

3. **Messages and Activity**

   * all-incident activity
   * team messages
   * personal messages
   * system alerts
   * messages should be able to reference operational objects such as zones, tasks, teams, routes, and decisions

4. **People, Teams, and Resources**

   * who is active
   * team status
   * current assignments
   * availability and location where relevant

5. **Context / Detail Panel**

   * details of the currently selected operational object
   * related events, tasks, messages, decisions, and map context
   * clear ownership, status, priority, timestamps, and audit trail

6. **AI Overlay**

   * initially only an architectural placeholder and controlled tool boundary
   * it should be possible later to ask questions such as:

     * “What changed in the last fifteen minutes?”
     * “Which critical facilities are in the predicted flood zone?”
     * “Prepare an evacuation warning for Zone B, but do not publish it.”
   * do not implement unrestricted autonomous actions

## Domain primitives

Use the architecture-principles document as the source of truth. Model the initial browser application around these primitive families.

### Incident and situation

* `Incident`
* `Event`
* `Observation`
* `Forecast`
* `Assessment`

### Space

* `Location`
* `Zone`
* `Route`
* `Facility`

### People and resources

* `Person`
* `Team`
* `Unit`
* `Resource`

### Operations

* `Task`
* `Objective`
* `Assignment`
* `Request`

### Communication

* `Message`
* `Warning`
* `Alert`
* `Report`
* `Briefing`

### Governance and control

* `Role`
* `Decision`
* `Approval`
* `Policy`
* `AuditRecord`

Do not over-model every subtype yet. For example, a hospital should initially be a `Facility` with a type; an ambulance should initially be a `Unit` with a type; a road closure should be an event or status change affecting a route.

## Required vmblu model structure

Create a new browser-command-centre vmblu model, following existing repository conventions.

The model should at minimum contain explicit nodes or groups for:

* application shell and layout coordination
* incident state / operational model access
* map view and map-layer registry
* timeline view
* activity and messaging view
* people / teams / resources view
* selection and contextual navigation
* task and decision presentation
* role and policy-aware view filtering
* audit / trace feed
* simulated flood-intelligence input
* simulated field-operation updates
* public-warning workflow placeholder
* AI overlay boundary / tool manifest placeholder

Use interfaces to group related capabilities. Prefer explicit message flows over hidden shared coupling.

Make it clear in the model how these flows work:

1. Flood forecast or observation enters the operational model.
2. It creates or updates an assessment.
3. The assessment is visible on the map and timeline.
4. An evacuation decision is created and approved.
5. The approved decision creates or updates a warning and operational tasks.
6. Field reports update task status and map state.
7. Relevant activity appears in the timeline, message stream, and audit trail.
8. Selecting any relevant object updates contextual views consistently.

## Implementation expectations

1. First inspect existing vmblu examples and follow their conventions.
2. Reuse existing UI architecture and libraries where present.
3. Do not replace existing project structure without a clear reason.
4. Keep the initial implementation narrow, coherent, and runnable.
5. Add minimal synthetic data sufficient to demonstrate the first flood scenario.
6. Use placeholders where a later integration belongs, but make the interface explicit.
7. Prefer a stable browser shell and connected mock/live state over visual polish at this stage.
8. Add concise comments or README notes only where they explain architectural intent not obvious from the model.

## Deliverables

Produce:

1. A vmblu model for the browser command-centre application.
2. Any minimal source files or stubs required to run and render the architecture.
3. A first runnable browser shell with:

   * map area
   * timeline area
   * activity/messages area
   * teams/resources area
   * context panel
   * one selected flood-related operational object
4. Synthetic data demonstrating the first vertical slice.
5. A short implementation note describing:

   * the vmblu model’s main groups and interfaces
   * the first event flow
   * assumptions or architectural decisions that should be reviewed next

## Constraints

* Do not implement a generic dashboard disconnected from the operational model.
* Do not implement all future CrisisGrid modules.
* Do not add unrestricted AI control.
* Do not use real emergency-service credentials, sensitive data, or operational procedures.
* Keep all flood and responder data synthetic unless it is ordinary public geographic context.

Work incrementally. First establish the model and main application shell, then connect the initial flood-to-evacuation vertical slice.
