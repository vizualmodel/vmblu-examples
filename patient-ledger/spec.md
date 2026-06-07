# PatientLedger Example Spec

## Purpose

PatientLedger is a public beta example for vmblu. It demonstrates how a realistic
application can expose a controlled agent-facing capability surface while also
using Node.js runtime security settings to report and block unsafe behavior.

The example is a synthetic health records workspace. It runs locally on a
developer machine and should include a clinical user experience, a governance
or administration experience and a server-side authority for records, policy,
audit and security. The exact project boundaries and node boundaries are not
fixed by this spec; they should be decided during the architecture design phase.

The application must make the vmblu message clear:

```text
vmblu makes applications usable by agents through a controlled, inspectable and
policy-governed capability surface.
```

PatientLedger is not an agent framework. The agent remains outside the
application boundary. vmblu defines and enforces the boundary that the agent can
use.

## Non-Goals

- Do not use real patient data.
- Do not imply clinical correctness or medical advice.
- Do not build a production healthcare system.
- Do not make browser code responsible for Node.js `fs`, `net` or `process`
  security enforcement.
- Do not let the agent call arbitrary application code or database functions.

All records, users, credentials and events are synthetic demo data.

## Example Goals

PatientLedger should show:

- a realistic browser application that looks and feels substantial;
- a Node.js runtime that protects sensitive operations;
- explicit authentication before record access;
- role-based and agent-specific access configuration;
- tools, probes and events exposed through vmblu capabilities;
- all agent operations routed through the `ToolBroker`;
- audit logging for human and agent activity;
- scripted scenarios that demonstrate normal and unsafe use;
- prompt injection resistance through capability limits and policy;
- model-wide runtime security settings and per-node requests;
- node security requests being clipped by the model-wide security envelope.

## Architecture To Be Designed

The architecture is intentionally unresolved at this stage. PatientLedger should
not start from a fixed `server`, `client` and `admin` folder split, nor from a
preselected list of node names. The first deliverable should be a reviewed
architecture proposal that explains the runtime boundaries, node
responsibilities, shared abstractions, pin contracts and security boundaries.

The server-side authority remains important: browser code must not read the
records database directly, and browser code is not responsible for enforcing
Node.js `fs`, `net` or `process` security. However, the exact transport nodes,
session nodes, UI nodes, audit nodes and scenario nodes should be designed
before implementation begins.

## Product Surfaces To Consider

The design phase should consider these product surfaces without assuming they
must map one-to-one to projects:

- clinical workspace: patient search, patient detail, timeline, labs,
  medications, notes, visit brief and access denial feedback;
- governance workspace: scenarios, audit stream, security events, policy
  explanation, capability trace and reset controls;
- server-side authority: authentication, sessions, records, policy decisions,
  audit/security recording and runtime security enforcement;
- agent capability surface: declared tools, probes and events exposed through
  vmblu, with no direct database access;
- scenario orchestration: visible demo flows that can drive or observe the
  clinical and governance workspaces.

## Architecture Design Phase

Before creating projects, models or node files, complete an explicit
architecture design phase.

Recommended approach:

1. Define the domain vocabulary.
   - Agree on names for records, sessions, actors, policies, decisions, audit
     entries, security events, capability calls, scenarios and UI surfaces.
   - Use those names consistently in node names, interfaces and pin contracts.

2. Draw the logical architecture before the physical project split.
   - Identify the major responsibilities independent of browser/server folders.
   - Decide which responsibilities are domain logic, which are adapters and
     which are visual presentation.
   - Only then decide whether the implementation should have two projects,
     three projects or shared packages.

3. Identify shared concerns early.
   - Login/session handling should probably be one reusable concept, not one
     separate design per UI surface.
   - Server transport should probably be one reusable adapter concept, unless
     different security or lifecycle requirements justify separate nodes.
   - Audit and security recording should be unified or deliberately separated
     with a clear reason.

4. Decide node granularity deliberately.
   - Split nodes when they have different ownership, security boundaries,
     lifecycle, reuse potential, observability needs or failure modes.
   - Combine responsibilities when splitting would only spread one domain
     decision across several routing-only nodes.
   - Keep UI nodes mostly presentational; policy decisions and data access
     decisions should live in domain or server-side authority nodes.

5. Make security boundaries visible in the model.
   - Show where authentication is checked.
   - Show where role policy is evaluated.
   - Show where agent capability policy is evaluated.
   - Show where runtime security events are recorded.
   - Show which nodes are allowed to request file, network or process access.

6. Design the event model before the panels.
   - Define the canonical activity event, audit event, access denial event,
     security event and capability trace event.
   - Decide whether UI panels subscribe to one shared event stream or to
     specialized projections.
   - Avoid creating separate event shapes only because separate panels need
     different views.

7. Design scenario behavior explicitly.
   - Decide whether scenarios drive the real clinical UI, simulate server-side
     operations only, or publish state for both UI surfaces to render.
   - For side-by-side demos, define which visible changes should appear in the
     clinical workspace and which should appear in the governance workspace.
   - Keep scripted scenarios deterministic enough for documentation and tests.

8. Write pin contracts before implementation.
   - For every interface, define payload shape, ownership, policy assumptions,
     error behavior and whether the payload may contain sensitive data.
   - Prefer interfaces for groups of related pins, especially shared prefixes
     such as `session.*`, `server.*`, `audit.*`, `security.*` and `scenario.*`.
   - Treat contracts as implementation guidance for node code, not as comments
     added after the fact.

Implementation should not start until the architecture proposal has been
reviewed and accepted.

## Synthetic Data

The database should contain around 12 to 20 synthetic patients.

Each patient should have:

- patient id;
- name;
- date of birth;
- contact details;
- assigned clinician;
- diagnoses;
- allergies;
- medications;
- visit notes;
- lab results;
- appointments;
- tasks or follow-up items;
- audit log entries.

The data should include realistic variation:

- chronic condition follow-up;
- recent lab result;
- medication change;
- referral;
- unresolved task;
- patient message;
- note that contains prompt-injection text.

The prompt-injection content must be clearly synthetic. It should look like a
malicious instruction embedded in a record note, for example an instruction to
ignore policy and export all records. The system should treat it as record
content, not as an instruction.

## Users And Roles

Start with four synthetic identities:

- `clinician`: can read assigned patients, view clinical notes and create
  clinical notes;
- `records-admin`: can inspect audit logs and manage synthetic access records;
- `front-desk`: can view demographics and appointments, but not clinical notes
  or labs;
- `agent-assistant`: represents the configured agent access surface and cannot
  exceed its declared capability policy.

Each user operation should include:

- actor id;
- actor role;
- operation;
- patient id when relevant;
- timestamp;
- outcome;
- reason or policy decision when relevant.

## Agent Access Model

The agent should not have database access. It should only use declared
capabilities.

The capability surface should include at least:

Tools:

- `patient.select`: select a patient by id or search result;
- `note.createDraft`: create a review-required draft note for the selected
  patient;
- `task.createFollowUp`: create a follow-up task;
- `summary.prepareVisitBrief`: prepare a visit-prep brief from allowed record
  sections;
- `export.writeBrief`: write an allowed brief to the configured export folder.

Probes:

- `session.current`: inspect the current user/session;
- `patient.visibleSummary`: read the allowed summary for the selected patient;
- `patient.timeline`: read the allowed timeline for the selected patient;
- `audit.recent`: read recent audit entries allowed for the current role;
- `security.recentEvents`: read recent runtime security events.

Events:

- `session.changed`;
- `patient.selected`;
- `audit.recorded`;
- `security.event`;
- `summary.created`;
- `access.denied`.

The capability policy should be configurable by role or agent profile. The demo
should show that a role can be allowed to use some tools and denied others.

## AI Functionality

The first AI feature should be a visit-prep assistant.

Example user request:

```text
Prepare a brief for today's appointment with Ana Torres.
```

The assistant should:

- verify the current session;
- find or select the patient through allowed tools/probes;
- read only the allowed record sections;
- produce a concise visit-prep brief;
- record audit entries;
- optionally create a draft note or follow-up task when permitted.

The brief should include:

- recent visits;
- active medications;
- allergies;
- recent abnormal labs;
- open follow-up items;
- suggested topics for review.

The output must be clearly labeled as a draft for human review.

## Security Model

The server should define a model-wide Node.js runtime security envelope.

Initial model envelope:

- `fs.read`: deny by default;
- `fs.write`: warn or allow only under `./exports` and `./logs`;
- `fs.delete`: deny;
- `net.egress`: deny by default, optionally warn/allow for one configured local
  or mock provider endpoint;
- `process.exec`: deny.

Specific nodes may request narrower access. A node request must not broaden the
model envelope.

Example node requests:

- `AuditLogger`: write under `./logs`;
- `BriefExporter`: write under `./exports`;
- `VisitBriefGenerator`: network egress only if the optional AI provider bridge
  is enabled and the model envelope allows it;
- `ScenarioRunner`: no process execution.

The example should include one deliberate misconfiguration scenario where a node
requests broader access than the model allows. The effective policy should show
that the request is clipped or denied.

## Realistic Security Scenarios

The scenario runner should support scripted scenarios so users can reproduce
the demo without manually driving every step.

Required scenarios:

### Normal Use

A clinician logs in, selects an assigned patient, asks for a visit-prep brief,
reviews allowed data and creates a follow-up task.

Expected result:

- capability calls succeed;
- audit entries are recorded;
- no denied security events;
- the UI shows a useful patient brief.

### Front Desk Access Denied

A front-desk user asks for clinical notes or lab details.

Expected result:

- the request is denied by capability or role policy;
- an `access.denied` event is emitted;
- audit records show the attempted operation;
- no raw clinical data is leaked.

### Prompt Injection In A Note

A patient note contains malicious text instructing the agent to ignore policy,
reveal all records or write files outside the allowed folder.

Expected result:

- the note is treated as data;
- the agent can summarize the clinical content if allowed;
- the embedded instruction is not followed;
- broad export or cross-patient access is denied.

### Bulk Export Denied

A user asks the agent to export every patient record.

Expected result:

- no broad export capability exists, or the configured policy denies it;
- the denial is visible in trace/audit output;
- the agent can explain the allowed alternatives.

### Unsafe File Write

The `BriefExporter` attempts to write outside `./exports`.

Expected result:

- runtime security emits a `security.event`;
- the operation is denied or reported according to the effective policy;
- the event includes node attribution and reason, such as
  `fs_root_not_allowed`.

### Network Egress Denied

A node attempts to call an unapproved external host.

Expected result:

- runtime security emits a denied `net.egress` event;
- the operation is attributed to the node;
- the UI/scenario log shows the denial.

### Node Request Clipped

A node requests broad file or network access that exceeds the model envelope.

Expected result:

- the effective policy is no broader than the model envelope;
- the scenario output explains the model envelope and node request;
- the denied or clipped behavior is visible.

## Local Developer Workflow

The example should run locally with a small number of commands. The exact
commands depend on the architecture decision and should be documented after the
project split is chosen.

The local workflow should support:

- starting the server-side authority and any browser workspaces;
- using sensible default ports without manual configuration;
- opening the clinical and governance views side by side;
- running scripted scenarios from the governance UI;
- running a shorter command-line scenario path for verification.

The final README should include one command path for normal users and one
shorter path for scripted scenarios.

## Scenario Runner

The scenario runner can be server-side, client-side or both, but the server
should own the authoritative scenario actions.

A simple first version can expose:

```bash
npm run scenario normal-use
npm run scenario prompt-injection
npm run scenario bulk-export-denied
```

The runner should output:

- scenario step;
- actor;
- capability request;
- broker decision;
- audit entry;
- security event when present;
- final result.

The admin browser UI should include a scenario panel that triggers the same
flows. The clinical client should only show the effects that are appropriate for
the active clinician session.

## UI Direction

The clinical client should feel like a clinical operations workspace. The admin
client should feel like an operations console for security and governance.

Design qualities:

- professional, dense and clear;
- patient list and selected-patient details visible together on desktop;
- concise badges for role, session and policy state;
- timeline view for visits/labs/notes;
- AI overlay available without hiding the main record;
- clear denial/warning states.

Admin design qualities:

- scenario controls visible near live audit and security streams;
- compact policy and capability trace panels;
- clear severity, decision and reason badges;
- side-by-side evidence and explanation views for demos.

Avoid:

- marketing-style landing pages;
- cartoonish medical imagery;
- oversized hero sections;
- fake complexity that does not map to real workflows.

## Implementation Constraints

- Work in the `vmblu-examples` repository.
- Depend on published `@vizualmodel/*` packages, not local `file:` links.
- Use synthetic data only.
- Keep browser and server responsibilities separate.
- Keep the node graph readable, with meaningful node and pin names.
- Keep the first version small enough to inspect in one sitting.
- Add focused scripted verification where practical.

## Initial Decisions To Revisit

AI provider integration:

The example should work without requiring a real LLM provider key. The default
path should use a local mock provider that produces deterministic visit briefs
and scenario responses. This keeps the example easy to run, makes scripted
scenarios repeatable and avoids making the public beta demo depend on an
external account.

A real provider bridge can be documented as an optional upgrade. That optional
path is useful because it demonstrates realistic AI integration and gives the
runtime security model a meaningful `net.egress` story: the summarizer may be
allowed to call only the configured provider endpoint, while calls to other
hosts are denied or reported.

Scenario driving:

Scenarios should be UI-first. The admin browser client should include a clear
scenario panel with actions such as `Normal use`, `Prompt injection`,
`Front-desk denied` and `Unsafe export`. This is the clearest public demo
because users can show the clinical client next to the admin console: the
patient UI and AI overlay change in one browser, while the audit trail, security
events and policy trace change in the other.

A CLI scenario runner can still be added as a secondary verification path, but
the primary experience should be visible in the UI.

Database:

Postgres would be realistic, but it adds setup burden and can distract from the
vmblu story. The first public beta version should use a local JSON database or
JSON-backed repository with realistic seed data. The repository node should be
designed behind a clean interface so a later Postgres-backed version is
straightforward.

Agent gateway:

The better first option is a small purpose-built gateway that uses the same
vmblu capability manifest and routes every call through the `ToolBroker`. This
keeps the browser/client flow easy to understand.

The example should also generate adapter projections with `make-agent-adapter`
for inspection, especially the HTTP projection. The generated adapter should be
shown as the public shape of the agent surface, while the first implementation
can keep the runtime gateway small and explicit.

Default demo role:

The default demo user should be `clinician`.

## Architecture Review Checklist

Before implementation, the architecture proposal should answer these questions:

- Can a new reader explain the graph after one careful pass?
- Are the product surfaces and runtime boundaries justified?
- Are transport concerns duplicated, or intentionally separated?
- Is login/session handling represented as one coherent concept?
- Is policy evaluation centralized enough to be trustworthy?
- Are audit events, security events and access denials unified where they should
  be, and separated only where the distinction matters?
- Are UI nodes mostly presentational?
- Are domain decisions kept out of visual panels and transport adapters?
- Is every agent-facing tool, probe and event routed through the intended
  capability policy path?
- Are sensitive payloads clearly marked in pin contracts?
- Are scenario flows visible enough for a side-by-side public demo?
- Are shared helpers distinguished from vmblu model nodes?
- Is the first implementation slice small, but still representative of the
  final architecture?

## Architecture Workshop Outputs

The next design pass should produce these artifacts before any code is written:

- a context map showing clinical workflow, governance workflow, server-side
  authority, agent capability surface and scenario orchestration;
- a responsibility matrix that assigns authentication, sessions, records,
  policy, audit, security, capability routing, scenario control and UI rendering;
- one or more candidate vmblu model graphs with clear runtime boundaries;
- a pin and interface catalog with payload contracts and policy assumptions;
- sequence diagrams for normal use, prompt injection, denied access and unsafe
  file/network behavior;
- an implementation slice plan that names the smallest useful first build and
  the tests that prove it works.

## First Implementation Slice Planning

After the architecture is accepted, the first implementation slice should be
chosen by risk, not by UI convenience. It should prove the core claim of the
example:

```text
An agent can help with realistic patient-record workflows, but only through a
controlled, inspectable and policy-governed capability surface.
```

The slice should include:

- one authenticated clinical workflow;
- one agent-assisted visit brief or summary;
- one policy denial;
- one audit/security trace visible in the governance experience;
- one scripted scenario that can be repeated in a side-by-side demo;
- focused tests around the policy and capability boundary.
