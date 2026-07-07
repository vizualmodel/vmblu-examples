# PatientLedger Example Spec

## Purpose

PatientLedger is a public beta example for vmblu. It demonstrates how a realistic
application can expose a controlled agent-facing capability surface while also
using Node.js runtime security settings to report and block unsafe behavior.

The example is a synthetic health records workspace. It runs locally on a
developer machine and should include a clinical user experience, a governance
or administration experience and a server-side authority for records, policy,
audit and security.

The first architecture pass has now been completed for the server-side
authority. The repository currently uses three application folders:

- `server`: vmblu model for authentication, data, policy and event recording;
- `client`: clinical workspace, still to be designed;
- `admin`: governance workspace, still to be designed.

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

## Current Architecture Status

The project has moved from an unresolved architecture brief to an accepted first
server model. The server architecture is represented in:

- `server/server.blu`: vmblu entrypoint;
- `server/model/server.mod.blu`: semantic server model;
- `server/model/server.mod.viz`: editor-maintained visual layout;
- `server/model/prompts/*.md`: model-owned node and pin prompts.

The model is intentionally still design-level. The nodes and pins are detailed
enough to guide implementation, but source code for the server nodes has not
been written yet.

Do not edit `server/model/server.mod.viz` by hand. It is maintained by the
vmblu editor. Architecture and implementation work should focus on
`server.mod.blu`, prompt files and later the source files under `server/nodes`.

## Product Surfaces

The physical project split has been chosen:

- `client`: clinical workspace: patient search, patient detail, timeline, labs,
  medications, notes, visit brief and access denial feedback;
- `admin`: governance workspace: scenarios, audit stream, security events, policy
  explanation, capability trace and reset controls;
- `server`: server-side authority: authentication, sessions, records, policy decisions,
  audit/security recording and runtime security enforcement;
- agent capability surface: declared tools, probes and events exposed through
  vmblu, with no direct database access;
- scenario orchestration: visible demo flows that can drive or observe the
  clinical and governance workspaces.

## Accepted Server Model

The server model root is the group node `PatientLedger server`. It currently
contains six source nodes:

- `Transport`: server boundary adapter for authentication, patient-data and
  admin-data traffic. It routes login/logout, data requests and responses, and
  emits event records for transport-level activity.
- `Authentication`: owns login, logout and session verification. Every
  `patient-data.request` and `admin-data.request` passes through this node so
  invalid session keys are blocked before policy or data access.
- `PatientDataPolicy`: evaluates patient-data authorization. It is separate
  from admin policy to avoid mixing patient data and admin data concerns in one
  node.
- `Admin`: evaluates admin access. Admin is modeled as a simpler role gate:
  an actor is allowed as admin or denied.
- `DataCenter`: local JSON-backed data authority for patient data, policy facts
  and admin operations. This example is simple enough that the data center is a
  source node rather than a complex external database boundary.
- `EventRecorder`: authoritative event store for audit, access-denial,
  security and governance events.

Important server message routes:

- `Transport.auth.*` connects to `Authentication.auth.*`.
- `Transport.patient-data.request` goes to `Authentication`, then valid
  requests go to `PatientDataPolicy`; denials and approved responses return to
  `Transport`.
- `Transport.admin-data.request` goes to `Authentication`, then valid requests
  go to `Admin`; denials and approved responses return to `Transport`.
- `PatientDataPolicy.policy.query` requests policy facts from
  `DataCenter.policy.query`.
- `PatientDataPolicy.data.query` requests patient data from
  `DataCenter.data.query`.
- `PatientDataPolicy.data.operation` sends non-query data operations to
  `DataCenter.data.operation`.
- `Admin.admin.query` and `Admin.admin.operation` connect to matching
  `DataCenter.admin.*` pins.
- `Admin.event.query` connects to `EventRecorder.event.query`.
- `event.record` outputs from server nodes connect to
  `EventRecorder.event.record`.

The main server interfaces are:

- `auth`: login, logout and authentication result traffic;
- `patient-data`: patient data requests, approvals and denials;
- `admin-data`: admin requests, approvals and denials;
- `policy`: data-center facts needed for patient-data policy decisions;
- `data`: patient data queries and operations;
- `admin`: admin data queries and operations;
- `event`: event recording and admin event query access.

## Server Prompt Files

The server model uses external prompt repositories. Each non-dock server node
has a prompt file under `server/model/prompts/`:

- `PatientLedger-server.md`;
- `Transport.md`;
- `Authentication.md`;
- `PatientDataPolicy.md`;
- `Admin.md`;
- `DataCenter.md`;
- `EventRecorder.md`.

These prompt files are part of the model. They contain one node-level prompt
and pin-level prompts for implementation guidance. They should be read by a
coding agent after the structural model has been read.

The prompt files are design-time guidance, not executable truth. During the
implementation phase, keep them useful while they guide coding. Once node code
exists, the current model and source code become the stronger sources of truth
if an old prompt has drifted.

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
commands still need to be documented after the client, admin and server
implementation choices are made.

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

## Open Decisions To Carry Forward

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

The first server architecture pass has answered the server-side responsibility
split. Before broad implementation starts, the remaining architecture work
should answer these questions:

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

## Architecture Work Completed

Completed:

- created `server`, `client` and `admin` application folders;
- initialized the server vmblu project;
- created the first server model with six source nodes;
- separated patient-data policy from admin policy;
- routed patient-data and admin-data requests through authentication for
  session verification before policy evaluation;
- added request/reply pins for policy facts, patient data, admin data and event
  queries;
- added model-owned prompt files for the server root and all server source
  nodes;
- updated vmblu `0.9.8` schema/annex guidance so coding agents understand
  prompt repositories and external prompt files.

## Remaining Architecture Work

The next design pass should produce these artifacts before server source code
is written:

- client and admin vmblu models with clear runtime boundaries;
- a context map showing how the clinical workflow, governance workflow,
  server-side authority, agent capability surface and scenario orchestration
  interact;
- a responsibility matrix for remaining concerns: capability routing, scenario
  control, UI rendering, visit-brief generation and runtime security reporting;
- a reviewed pin and interface catalog for client/server and admin/server
  transport payloads;
- sequence diagrams for normal use, prompt injection, denied access and unsafe
  file/network behavior;
- an implementation slice plan that names the smallest useful first build and
  the tests that prove it works.

## First Implementation Slice Planning

After the client/admin models are sketched, the first implementation slice
should be chosen by risk, not by UI convenience. It should prove the core claim
of the example:

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
