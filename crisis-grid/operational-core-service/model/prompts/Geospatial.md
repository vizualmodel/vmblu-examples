# Geospatial

## Node

### Prompt

Owns spatial queries, map-ready projections, and derived geographic
relationships for the operational picture. It combines base geography with
authorized references to incident and resource state while preserving
provenance, freshness, confidence, and visible degradation where they affect
interpretation.

It does not create independent operational facts, authorize operational
changes, or become a competing source of truth. Domain-owning groups remain
authoritative for the incident and resource meaning represented spatially.

### Status

The responsibility and source-of-truth constraint are accepted. Interfaces,
pins, contracts, internal responsibilities, and implementation readiness have
not yet been designed.

### Decisions

- Spatial representations are derived projections rather than canonical
  operational facts.
- Authorized operational and resource references retain their source
  attribution when projected geographically.
- Staleness, missing inputs, uncertainty, and degraded integrations remain
  visible when they affect a spatial result.

### Open

- Define the spatial queries and projections required by the first operational
  picture and flood-to-evacuation slice.
- Define authoritative inputs from Operations and Resource Registry without
  duplicating their state.
- Decide base-geography sources, update cadence, caching, invalidation,
  provenance, confidence, and fallback behavior.
- Define information-scope enforcement for spatial detail and sensitive
  locations.
- Design interfaces, pins, contracts, internal nodes, and implementation units
  in that order.

## Pins

### spatial.analyze



### spatial.build-projection


