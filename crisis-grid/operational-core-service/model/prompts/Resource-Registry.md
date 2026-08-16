# Resource Registry

## Node

### Prompt

Owns the meaning and rules of people, teams, units, facilities, and operational
assets. It decides what capabilities they have, whether they are available,
what they are assigned to, and whether a proposed assignment or resource-state
change is valid.

It returns authorized resource views and prepares opaque, validated resource
change plans for a later atomic commit. It does not decide incident actions,
store records, create map projections, or deliver external traffic.

### Status

The first Operations-facing boundary is accepted and connected. Resource
Registry owns one exchange for an incident-relevant resource view and one for
preparing a resource-owned change. The combined repository commit can carry
the prepared change and its version context. Resource structures, the
repository read boundary, internal responsibilities, and implementation
technology remain undesigned.

### Decisions

- Resource identity, capability, availability, and resource-specific state
  have one canonical owner.
- Resource records are persisted through Operational Repository; Resource
  Registry is not a separate database.
- A resource view carries the record versions on which it is based so later
  decisions can detect changed resource state.
- Operations proposes a resource change, but Resource Registry validates it
  and produces the exact opaque mutation that may be committed.
- Preparing a change does not make it authoritative and does not reserve or
  mutate a resource.
- Incident changes and prepared resource changes must eventually commit as one
  transaction when both are required by the same operation.
- Operations may carry a prepared change plan to the repository but does not
  modify or reinterpret it.
- Spatial projections reference authorized resource facts rather than creating
  independent copies.

### Open

- Define the minimum resource concepts and lifecycle required by the first
  operational-picture and flood-to-evacuation slice.
- Define availability, reservation, assignment, release, conflict, and
  versioning semantics.
- Define information sensitivity, provenance, confidence, staleness, and audit
  requirements for resource data.
- Define the narrow resource persistence-read boundary with Operational
  Repository.
- Review the Geospatial boundary after the persistence-read boundary is
  accepted.
- Design internal nodes and implementation units only after the external
  boundaries and first resource lifecycle are accepted.

## Pins

### resource-state.get-view

Returns the authorized resource information and version context needed for an
incident decision or operational picture.

### resource-state.prepare-change

Evaluates a proposed resource change and returns an approved change plan or a
rejection, conflict, or failure.
