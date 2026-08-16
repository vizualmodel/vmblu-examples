# CrisisGrid Conceptual Architecture Flows

> **Status:** Provisional design input  
> **Purpose:** Preserve cross-application and cross-group flow direction until
> reviewed vmblu boundaries and contracts make it structural.

These flows establish responsibility and direction. They are not vmblu
interfaces, contracts, transport choices, or implementation designs. The
canonical model and its model-owned prompt repositories remain authoritative
for accepted node-local structure and intent.

## First Cross-Application Contract Direction

- The command centre requests an authorized operational snapshot when a
  session starts or reconnects.
- The operational core publishes canonical operational events and state
  changes to subscribed clients.
- The command centre submits explicit commands and governed proposals; it does
  not directly mutate canonical state.
- A command carries a stable operation identity, incident, expected version,
  opaque action, and optional reason. OCS establishes trusted actor context
  from the session rather than accepting browser role claims.
- Live updates identify their subscription and incident and carry sequence,
  resulting version, and either a delta or an invalidation. Detailed records
  carry provenance and sensitivity where needed.
- Health and synchronization signals make stale, degraded, or disconnected
  state visible.
- Agent-facing API or MCP adapters expose only capabilities declared by the
  operational-core model and remain subject to the same policy and approval
  flow.

Transport and capability metadata remain open. Accepted session, picture, and
live-update structure belongs to the semantic models; this document preserves
only the cross-application flow.

## CCW First Operator Flow

1. Application Shell sends opaque authentication material to Operational Core
   Connection. The result is established, rejected, or unavailable. An
   established result carries only session identity, operator identity, roles,
   and expiry for browser use.
2. Operational Core Connection retains the secret token. It reports later
   expiry, invalidation, or sign-out as the end of the session. Connection loss
   is reported separately and does not by itself end the session.
3. When the operator opens an incident, Operational Picture requests that
   incident through Operational Core Connection. An available result contains
   one coherent picture, its authoritative version, the next live-update
   sequence, and any visible warnings.
4. Operational Picture replaces its disposable local projection with that
   picture, publishes it to the workspaces, and requests live delivery after
   the returned sequence. OCS assigns the subscription identity and reports
   active, rejected, unavailable, or reload-required.
5. Application Shell determines which installed visual workspaces are active
   for the current operator and application context, then sends explicit
   activation changes. This is browser presentation policy, not OCS
   authorization.
6. Each active workspace independently requests its screen region from
   Application Shell. Application Shell creates and owns each container and
   returns only a serializable mount identity. An inactive or unknown
   workspace receives an unavailable result as defensive validation.
7. Operational Picture distributes the same browser projection to the four
   operator workspaces after they can mount their presentation. Talk Workspace
   presents field conversations from that projection; outbound communication
   remains unmodelled.
8. Spatial Workspace handles map navigation and already-buffered layers
   locally. When the selected area, layers, time, or detail level is missing,
   it sends `projection.detail-request` to Operational Picture. Operational
   Picture either confirms that the detail is available or retrieves it
   through Operational Core Connection and republishes the coherent
   projection.
9. Ordered live delivery carries subscription, incident, sequence, resulting
   version, and either a delta or an invalidation. Operational Picture applies
   the expected next sequence, ignores an already applied sequence, and loads
   a new picture after a gap. An invalidation reloads its affected scope.
10. A consequential map interaction sends `operational-command.proposal` from
   Spatial Workspace to Action Workspace. Delivery queues a draft and is not
   held open across human interaction. For an approved proposal, Action
   Workspace creates one stable operation
   identity and submits the reviewed command with its incident, the operational
   version on which the operator acted, and an optional reason. Operational
   Core Connection attaches the retained session token.
11. The result is committed, rejected, conflict, unavailable, or uncertain.
   A retry reuses the same operation identity. A committed result is displayed,
   but the shared browser projection changes only through canonical snapshot or
   live-update flow. The current executable slice reloads the snapshot after a
   commit; live synchronization remains deferred.

Operational Core Connection is the only CCW group that communicates with OCS.
The presentation workspaces neither retain session credentials nor retrieve
operational, resource, or spatial data independently. Live DOM elements do not
cross vmblu contracts.

## OCS Flow 1: Login and Session Establishment

1. A user or agent sends credentials or an identity assertion to an OCS
   instance selected by the load balancer.
2. Client Access validates the request and authenticates the actor. Identity
   records may initially come through Operational Repository; a dedicated
   external identity provider may be introduced later.
3. Client Access resolves roles and permitted information scope and creates
   trusted session context.
4. Operational Repository durably records shared session state when required
   and records the attributable login outcome.
5. Client Access returns an opaque session token that any interchangeable OCS
   instance can validate. Operational Core Connection retains that token and
   gives Application Shell only the minimal non-secret session context.

Essential session state must not exist only in one OCS process. A failed login
creates no session. For the first CCW contract, a refused login is `rejected`
and a login that cannot be completed because OCS is unavailable is
`unavailable`; more detailed categories remain internal for now.

## OCS Flow 2: Retrieve the Operational Picture

1. A client requests an operational picture using the incident identity.
   Operational Core Connection attaches its retained session token and any
   external correlation required by the transport.
2. Client Access validates the session, request shape, and coarse access scope,
   then forwards trusted actor and incident context to Operations.
3. Operations coordinates the authoritative view and loads relevant incident
   state through Operational Repository.
4. Operations requests relevant people, teams, units, facilities, and
   availability state from Resource Registry. Resource Registry uses
   Operational Repository for canonical persisted data.
5. Operations requests spatial analysis or a map-ready projection from
   Geospatial. Geospatial combines base geography with authorized operational
   and resource references supplied by Operations, without loading or creating
   independent operational facts.
6. Operations returns available, not-found, rejected, or unavailable. An
   available result contains one coherent picture with basic incident
   information, current operational events, tasks and decisions, relevant
   resources, and the initial map projection. It also carries the
   authoritative version, the sequence after which live delivery begins, and
   warnings for usable but missing or stale content.
7. A live request identifies the incident and the last sequence applied by the
   client. OCS assigns a subscription identity and either activates delivery,
   rejects it, reports temporary unavailability, or requires a fresh picture
   when replay cannot continue. After reconnection the client repeats this
   request using the last sequence it successfully applied.

There is no separate partial outcome. A usable picture is available with
warnings; an unusable picture is unavailable. Detailed record fields,
provenance, freshness, and confidence are added when a concrete item requires
them.

## OCS Flow 3: Submit an Operational Command or Update

1. A client submits a command with a stable operation identity, incident,
   expected version, opaque action, and optional reason. Operational Core
   Connection adds its retained session token.
2. Client Access validates the session and request, applies coarse access
   checks, and attaches trusted actor context.
3. Operations validates the interaction against current incident state,
   domain rules, authority requirements, and approval state.
4. When resource state is affected, Operations asks Resource Registry to
   validate and prepare the resource-owned change. Preparation changes no
   authoritative state. Geospatial may derive a new projection but does not
   authorize the change.
5. Operational Repository checks the incident and resource versions and
   commits the incident change, prepared resource change, attribution, audit
   evidence, and durable notification intent as one transaction.
6. Only after successful commit does Operations return `committed`. A repeated
   operation identity returns the original committed result instead of applying
   the command twice. Other external outcomes are `rejected`, `conflict`,
   `unavailable`, and `uncertain`; uncertain is never presented as success.
7. The committed change is distributed to relevant OCS instances so connected
   clients can be updated and derived projections refreshed.

The shared update-distribution mechanism remains undecided. A transactional
outbox with shared publish/subscribe is a candidate, not an accepted component
or contract.

An unavailable operation is known not to have committed and may be retried with
the same identity. An uncertain operation may or may not have committed and is
reconciled using that same identity. A new identity represents a new action.

## Flow Invariants

- Every external request enters through Client Access.
- OCS instances remain interchangeable from a client's perspective.
- Client Access establishes trusted actor context; domain-owning groups enforce
  state-dependent rules and authority requirements.
- Operations owns crisis workflows and operational meaning.
- Resource Registry owns resource identity, capability, availability, and
  resource-specific state.
- Geospatial owns spatial queries and projections, not operational facts.
- Operational Repository owns persistence mechanics, not domain decisions.
- A state-changing result is authoritative only after durable commit.
- Retries do not duplicate consequential actions.

## Review Rule

Review and revise each flow as its participating boundaries become concrete.
Do not translate a conceptual arrow into a vmblu connection until both
participating node boundaries and contract ownership have been reviewed.
