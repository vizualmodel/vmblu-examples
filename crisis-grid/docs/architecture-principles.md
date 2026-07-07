# CrisisGrid Architecture Principles

> **Status:** Draft 0.1  
> **Purpose:** Establish the architectural principles and first domain concepts for CrisisGrid before detailed application, data, UI, or vmblu specifications are written.

## 1. Purpose of CrisisGrid

CrisisGrid is a flagship vmblu project: a realistic, visually compelling crisis-management platform that demonstrates how a large distributed system can be designed, built, understood, operated, and extended through executable architecture.

It is not a generic dashboard and it is not intended to claim replacement of any real public-safety system. It is a credible reference architecture and simulation environment for multi-agency flood response, initially centred on a fictional compound-flood incident affecting Antwerp.

CrisisGrid should demonstrate that a complex system can remain:

- understandable at scale;
- operationally useful under pressure;
- safe to extend;
- resilient to partial integration or connectivity failure;
- suitable for both conventional user interfaces and controlled AI assistance; and
- visually impressive without sacrificing operational clarity.

## 2. Product Shape: One Operational System, Multiple Applications

CrisisGrid is a system of cooperating applications, not a single application with many screens.

All applications operate on one shared operational model, subject to access policy and role-specific views. They may present different levels of information and interaction, but they refer to the same incidents, locations, teams, decisions, tasks, messages, forecasts, and audit history.

### 2.1 Initial applications

#### Command Centre — desktop/browser

The primary command-and-control application. It supports situational awareness, planning, coordination, resource allocation, approval workflows, and live operational decisions.

Its stable interface regions should include:

- a 2D operational map with selectable overlay layers;
- a timeline combining history, current activity, planned actions, and forecast developments;
- message and activity streams;
- people, team, and resource status;
- a contextual detail panel for selected operational objects;
- an AI interaction overlay; and
- visible integration health, risk, and alert status where relevant.

#### Field Operations — mobile

A deliberately simpler mobile application for responders and field coordinators.

Its essential operational loop is:

> receive task → understand place and risk → act → report outcome → receive next instruction

The mobile app should prioritize:

- current assignment and task checklist;
- route, local map, and immediate hazards;
- nearby team members and unit status;
- photo, voice, text, and location reporting;
- urgent team communication;
- offline or degraded-connectivity behaviour; and
- minimal navigation and one-handed use.

#### Coordination and Administration

A governance-oriented capability which may initially live within the command-centre application but remains architecturally distinct.

It includes:

- incident activation and operational roles;
- user, team, and authority management;
- approval policies and controlled actions;
- public-warning preparation and release;
- configuration of operational thresholds and map layers;
- integration monitoring and simulation controls; and
- audit, replay, and after-action review.

## 3. Architectural Layers

CrisisGrid should be understood as four primary layers.

### 3.1 Operational Core

The shared model of the evolving crisis: incidents, events, observations, forecasts, assessments, locations, teams, resources, tasks, decisions, communications, policies, and audit history.

This layer is the system's operational truth. Applications and integrations should not invent private versions of core operational state.

### 3.2 Event and Integration Layer

This layer accepts, normalizes, validates, and exposes information from sources such as:

- weather and flood forecasts;
- water-level gauges and environmental sensors;
- GIS and map services;
- field reports;
- dispatch systems;
- hospital and shelter capacity services;
- road, rail, utility, and public-alert systems;
- simulation feeds; and
- legacy or external systems.

Integrations must be treated as explicit modules with known availability, confidence, data sensitivity, and fallback behaviour.

### 3.3 Role-Specific Applications

Desktop, browser, mobile, reporting, administration, and other clients are projections of the operational core, adapted to role, authority, device, and urgency.

### 3.4 Controlled AI Interaction Layer

AI is an interface to the same operational model and policy system. It is not an independent source of authority.

AI tools must be explicitly connected to approved vmblu interfaces and be limited by the user's role, the sensitivity of the data, and the action's required approval level.

## 4. Design Principles

### 4.1 One operational truth, many role-specific views

A commander, field responder, hospital coordinator, public-information officer, and executive may see different views, but they must operate on one consistent incident model.

### 4.2 Same concepts, same visual language, different operational depth

The interface should use a predictable shared grammar for concepts such as incident, task, team, alert, risk, message, and decision.

Uniformity does not mean identical screens. It means that users do not need to learn a new interaction model when they change context or device.

### 4.3 The map is the spatial index of the system

The 2D map is not decoration. It is the primary spatial view of operational reality.

Map layers should eventually include:

- flood forecast and observed extent;
- weather, rainfall, water levels, and sensor data;
- evacuation zones and shelters;
- road, rail, bridge, and tunnel status;
- field teams, vehicles, and resources;
- hospitals, care homes, schools, utilities, and hazardous sites;
- tasks, hazards, and public warnings; and
- integration or communications degradation.

Real geographic base data and open map services may be used, while operational incident data remains synthetic unless an approved integration is introduced.

### 4.4 The timeline is an operational instrument, not an event log

The timeline must combine:

- observed past events;
- active events and unresolved tasks;
- decisions and approvals;
- planned actions;
- forecast developments; and
- confidence and uncertainty.

Users should be able to understand both what happened and what is expected to happen next.

### 4.5 Communication is structured operational data

Messages must be more than free-form chat. They should be able to reference and create links to incidents, tasks, teams, locations, routes, observations, decisions, and alerts.

A field message such as “bridge access is no longer possible” should be capable of becoming a verified observation, map marker, route-status update, escalation, or task trigger.

### 4.6 Every consequential action is attributable and auditable

Significant actions require an owner, authority basis, timestamp, and audit trail.

The system should make it possible to answer:

- who knew what, and when;
- who made or approved a decision;
- what evidence or forecast informed that decision;
- which tasks and messages followed from it; and
- what changed after the action was taken.

### 4.7 AI may observe, analyse, and propose; controlled actions follow normal policy

AI should support three modes:

- **Ask:** explain, find, compare, summarize, and answer questions about the current situation;
- **Prepare:** draft alerts, reports, plans, task proposals, and handover material; and
- **Act under approval:** prepare structured actions that are routed through the normal authority and approval flow.

AI must not bypass permissions, policy gates, data classifications, or human approval for sensitive actions.

### 4.8 Design for graceful degradation

CrisisGrid must remain useful when integrations fail, data is delayed, or field connectivity is reduced.

The system should make degraded services visible, preserve confidence and provenance, allow fallback workflows where possible, and avoid treating external integrations as invisible assumptions.

### 4.9 New capabilities should plug in as bounded modules

Adding a capability should resemble adding a circuit board to a computer: the new module has a clear responsibility, known interfaces, limited dependencies, health status, policy requirements, and a defined contribution to the operational picture.

A module should declare, where applicable:

- commands, queries, events, and data it consumes;
- outputs, services, and events it provides;
- data classifications and security requirements;
- operational dependencies and fallback behaviour;
- health, audit, and observability interfaces;
- UI contributions; and
- controlled AI tools.

Examples of future modules include drone coordination, traffic control, hospital capacity, utility restoration, volunteer management, public communications, flood modelling, and cyber-incident response.

### 4.10 Simulation and live operations share the same architecture

Simulation must not be a disconnected demo mode. The same operational concepts, event flows, policies, applications, and interfaces should support both simulated exercises and operational deployments.

### 4.11 The vmblu model is executable architecture

The vmblu model is not secondary documentation. It is the navigable, runnable architecture that connects domains, application capabilities, integrations, policies, UI surfaces, and agent tools.

## 5. Roles: Authority, Information Scope, Interaction Mode

Role is not only a UI permission flag. Each role determines three related dimensions:

| Dimension | Meaning | Example |
|---|---|---|
| Authority | What a user is permitted to decide, approve, or execute | Can this user approve a public warning? |
| Information scope | Which data and operational objects a user may access | Can this user view hospital capacity or restricted reports? |
| Interaction mode | Which view and level of control is appropriate | Does this user receive a command dashboard, a task-focused mobile view, or a read-only briefing? |

Initial representative roles include:

- Incident Commander;
- Operations Officer;
- Field Responder;
- Hospital Coordinator;
- Public Information Officer;
- Executive / Mayor / Governor;
- System Administrator; and
- Auditor.

## 6. Initial Common Operational Domain Model

The common operational domain model is the backbone of CrisisGrid. It must be small enough to remain comprehensible, but expressive enough to connect maps, timelines, workflows, messages, AI tools, policy, and audit.

The primitives are grouped into a limited set of families.

### 6.1 Incident and Situation

| Primitive | Purpose |
|---|---|
| Incident | Durable coordination container for a crisis or major operational situation. It can last days, contain many events, involve many organizations, and hold objectives, decisions, tasks, communications, and audit history. |
| Event | A time-bound thing that happened or changed in the operational world. |
| Observation | A report or measurement produced by a person, sensor, system, or external source. |
| Forecast | A prediction about a future condition, event, or impact, with confidence and validity period. |
| Assessment | An interpretation of events, observations, and forecasts that identifies risk, impact, urgency, or recommended action. |

An `Incident` is not merely an event. It is the durable operational context that binds related information and action together.

A `Decision` is not merely an event either. It is a governed operational act with authority, policy, and consequences.

### 6.2 Space

| Primitive | Purpose |
|---|---|
| Location | A point or addressable geographic position. |
| Zone | A defined area, such as an evacuation area, flood extent, operational sector, or restricted region. |
| Route | A traversable path or connection, including roads, rail links, emergency routes, or access corridors. |
| Facility | A fixed place with operational significance, such as a hospital, school, shelter, care home, utility site, command post, or industrial facility. |

### 6.3 People and Resources

| Primitive | Purpose |
|---|---|
| Person | An identified individual participating in or affected by operations, subject to appropriate data protection and access policy. |
| Team | A coordinated group of people with a shared role, task, location, or authority. |
| Unit | An operational deployable unit, such as an ambulance, fire appliance, police patrol, drone team, or utility repair crew. |
| Resource | A consumable, allocatable, or trackable operational resource, such as equipment, vehicles, materials, shelter capacity, pumps, barriers, or sensors. |

### 6.4 Operations

| Primitive | Purpose |
|---|---|
| Objective | A desired operational outcome for an incident or operational period. |
| Plan | A structured intended course of action, potentially made up of multiple tasks, decisions, and contingencies. |
| Task | A unit of assigned operational work with owner, location, priority, status, and outcome. |
| Assignment | The connection of a task, role, or responsibility to a person, team, or unit. |
| Request | A request for information, resource, assistance, approval, or external support. |

### 6.5 Communication

| Primitive | Purpose |
|---|---|
| Message | Operational communication between people, teams, roles, or systems. It may reference any other operational object. |
| Report | A structured operational update, often produced by field staff or another service. |
| Warning | A significant communication intended to influence behaviour or readiness of a defined audience. |
| Alert | A high-priority notification requiring immediate awareness, acknowledgement, escalation, or action. |
| Briefing | A curated summary of the situation for a role, organization, operational period, or audience. |

### 6.6 Governance and Control

| Primitive | Purpose |
|---|---|
| Role | A defined organizational responsibility associated with authority, information scope, and interaction mode. |
| Policy | A rule governing access, approval, data handling, escalation, retention, or permitted action. |
| Decision | An authorized choice that changes operational direction, creates obligations, or triggers controlled actions. |
| Approval | A recorded authorization step required by policy before an action becomes effective. |
| AuditRecord | An immutable record of an access, action, decision, system event, or policy-relevant change. |

## 7. Key Semantic Distinctions

The following distinctions are essential to avoid a vague or overloaded model.

- An **Event** says something happened.
- An **Observation** says that a person, sensor, or system reported or measured something.
- A **Forecast** says that something may happen.
- An **Assessment** says what known information means operationally.
- A **Decision** says that an authorized actor chose a course of action.
- A **Task** says that someone or some team must perform work.
- A **Message** communicates information.
- A **Warning** or **Alert** communicates information that is operationally significant to a defined audience.
- An **Incident** provides the lasting coordination context for all of the above.

## 8. Core Relationships

The relationship model is at least as important as the primitives themselves. CrisisGrid should behave as an operational graph, not as a collection of isolated tables.

```text
Incident
  contains → Event
  contains → Observation
  contains → Forecast
  contains → Assessment
  contains → Decision
  contains → Task
  contains → Message
  affects → Zone / Route / Facility / Resource

Observation
  concerns → Location / Zone / Resource / Incident
  producedBy → Person / Sensor / System
  mayTrigger → Assessment

Forecast
  predicts → Event / Condition
  appliesTo → Zone / Route / Facility
  hasConfidence → ConfidenceLevel
  mayTrigger → Assessment

Assessment
  isBasedOn → Observation / Forecast / Event
  identifiesRiskTo → Person / Team / Facility / Zone / Route
  mayRecommend → Decision / Task / Warning

Decision
  madeBy → Person / Role
  authorizedBy → Policy / Approval
  appliesTo → Incident / Zone / Task / Alert
  creates → Task / Warning / StatusChange

Task
  belongsTo → Incident
  assignedTo → Person / Team / Unit
  occursAt → Location / Zone / Route
  supports → Objective
  produces → Report / Observation / Event

Message
  references → any operational object
  addressedTo → Person / Team / Role
  mayEscalateTo → Alert / Task / Decision
```

## 9. Persistent Things and Time-Based Happenings

For architecture, storage, UI, timeline, and audit purposes, CrisisGrid should distinguish broadly between persistent operational objects and time-based happenings.

### Persistent things

- Incident
- Location
- Zone
- Route
- Facility
- Person
- Team
- Unit
- Resource
- Objective
- Plan
- Task
- Role
- Policy

### Time-based happenings

- Event
- Observation
- Forecast
- Assessment
- Decision
- Approval
- Message
- Warning
- Alert
- Report
- Status change
- AuditRecord

Some objects bridge both categories. A `Task` is persistent, but its lifecycle is recorded through time-based events and status changes.

## 10. Initial Modelling Guidance

The first version should avoid excessive specialization.

Examples:

- a hospital is `Facility(type: hospital)`;
- an ambulance is `Unit(type: ambulance)`;
- a river gauge is `Resource(type: sensor)`;
- an evacuation area is `Zone(type: evacuation)`;
- a road closure is initially an `Event` or `StatusChange` affecting a `Route`;
- an evacuation order is a `Decision` plus a `Warning` plus generated `Tasks`.

Additional domain-specific object types should only become first-class primitives when their behaviour, policy, lifecycle, and interfaces genuinely differ from the broader primitive they currently extend.

## 11. Next Architectural Work

The next documents should derive from these principles rather than bypass them:

1. **Common operational domain model specification** — attributes, identifiers, lifecycle states, cardinalities, and relationship rules for the initial primitives.
2. **Application architecture** — command centre, mobile field operations, and coordination/admin boundaries.
3. **Capability and module map** — initial vmblu domains, node interfaces, events, commands, queries, policies, and module contracts.
4. **Role and policy model** — authority, information scope, approval flows, classification, and audit rules.
5. **Reference flood scenario mapping** — connect each scenario event and decision to operational primitives and application capabilities.
6. **Initial vertical slice specification** — forecasted flood risk triggers an evacuation, approval, public warning, field response, live map update, and audit trace.

