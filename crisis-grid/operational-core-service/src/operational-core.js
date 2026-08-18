export const SYNTHETIC_INCIDENT_ID = "CG-ANT-FLOOD-001";

const DEMO_TOKEN = "cg-demo-session-token";
const DEMO_ACTOR = {
  actorId: "demo-operator",
  roles: ["command-centre-demo"],
};

function initialPicture() {
  return {
    incidentTitle: "Operation High Water",
    situation: {
      headline: "Riverside flooding is forecast to expand while access restrictions remain in force.",
      severity: "Elevated",
      phase: "Response and assessment",
      observedAt: "2026-08-05T10:20:00.000Z",
      activeUnitCount: 1,
      closedRouteCount: 1,
      proposedZoneCount: 1,
      approvedZoneCount: 0,
    },
    tasks: [],
    auditTrail: [],
    spatialFeatures: {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          id: "forecast-scheldt-12h",
          properties: {
            kind: "flood",
            title: "Projected flood extent",
            detail: "Synthetic 12-hour planning envelope",
            status: "Forecast · medium confidence",
            source: "Scenario flood model · 10:00",
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [4.3735, 51.205], [4.386, 51.209], [4.397, 51.225],
              [4.405, 51.246], [4.399, 51.267], [4.383, 51.273],
              [4.371, 51.256], [4.366, 51.232], [4.3735, 51.205],
            ]],
          },
        },
        {
          type: "Feature",
          id: "closure-riverside-01",
          properties: {
            kind: "closure",
            title: "Riverside access closed",
            detail: "Fictional closure pending field reassessment",
            status: "Observed · access blocked",
            source: "Synthetic field report · 09:00",
          },
          geometry: {
            type: "LineString",
            coordinates: [[4.3907, 51.2142], [4.393, 51.2205], [4.397, 51.2267], [4.4002, 51.2324]],
          },
        },
        {
          type: "Feature",
          id: "unit-fr-12",
          properties: {
            kind: "unit",
            title: "Unit FR-12",
            detail: "Synthetic flood reconnaissance team",
            status: "Assigned · reporting",
            source: "Scenario dispatch · 09:05",
          },
          geometry: { type: "Point", coordinates: [4.4052, 51.2296] },
        },
        {
          type: "Feature",
          id: "evacuation-zone-east",
          properties: {
            kind: "evacuation",
            title: "Evacuation assessment zone",
            detail: "Draft planning geometry — not approved",
            status: "Proposed · review required",
            source: "Synthetic command assessment · 10:20",
          },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [4.407, 51.217], [4.424, 51.216], [4.433, 51.228],
              [4.426, 51.239], [4.409, 51.237], [4.402, 51.226], [4.407, 51.217],
            ]],
          },
        },
      ],
    },
  };
}

function clone(value) {
  return structuredClone(value);
}

export function createOperationalCore() {
  let versionNumber = 1;
  const picture = initialPicture();
  const committedOperations = new Map();

  function version() {
    return `ocs-${versionNumber}`;
  }

  function isAuthorized(token) {
    return token === DEMO_TOKEN;
  }

  return {
    establishSession(authentication) {
      if (!authentication) {
        return { status: "rejected", reason: "Demo authentication material is required." };
      }

      return {
        status: "established",
        token: DEMO_TOKEN,
        session: {
          sessionId: "cg-demo-session",
          ...DEMO_ACTOR,
          expiresAt: "2099-01-01T00:00:00.000Z",
        },
      };
    },

    loadPicture(token, incidentId) {
      if (!isAuthorized(token)) {
        return { status: "rejected", incidentId, reason: "A valid demo session is required." };
      }
      if (incidentId !== SYNTHETIC_INCIDENT_ID) {
        return { status: "not-found", incidentId, reason: "The exercise exposes one synthetic incident." };
      }

      return {
        status: "available",
        incidentId,
        version: version(),
        sequence: String(versionNumber - 1),
        picture: clone(picture),
      };
    },

    submitCommand(token, request) {
      const operationId = request?.operationId || "unknown";
      const incidentId = request?.incidentId || "unknown";
      if (!isAuthorized(token)) {
        return { status: "rejected", operationId, incidentId, reason: "A valid demo session is required." };
      }

      const prior = committedOperations.get(operationId);
      if (prior) return clone(prior);

      if (incidentId !== SYNTHETIC_INCIDENT_ID) {
        return { status: "rejected", operationId, incidentId, reason: "Unknown incident." };
      }
      if (request.expectedVersion !== version()) {
        return {
          status: "conflict",
          operationId,
          incidentId,
          version: version(),
          reason: "The incident changed after this proposal was prepared.",
        };
      }
      if (request.command?.kind !== "approve-evacuation-zone" || request.command?.featureId !== "evacuation-zone-east") {
        return { status: "rejected", operationId, incidentId, reason: "This exercise accepts only the evacuation-zone approval." };
      }

      const zone = picture.spatialFeatures.features.find(({ id }) => id === "evacuation-zone-east");
      if (!zone || !zone.properties.status.startsWith("Proposed")) {
        return { status: "rejected", operationId, incidentId, reason: "The evacuation zone is no longer awaiting approval." };
      }

      versionNumber += 1;
      zone.properties.status = "Approved · activation pending";
      zone.properties.detail = "Approved for synthetic exercise coordination";
      zone.properties.source = "Demo operator decision · 10:24";
      picture.situation.proposedZoneCount = 0;
      picture.situation.approvedZoneCount = 1;
      picture.situation.phase = "Evacuation preparation";
      picture.situation.headline = "The eastern evacuation zone is approved; field preparation is now assigned.";
      picture.situation.observedAt = "2026-08-05T10:24:00.000Z";
      picture.tasks.push({
        taskId: "TASK-EVAC-001",
        title: "Prepare eastern evacuation zone",
        status: "Assigned",
        owner: "Field Coordination",
      });
      picture.auditTrail.unshift({
        auditId: `AUDIT-${operationId}`,
        action: "Evacuation zone approved",
        actorId: DEMO_ACTOR.actorId,
        reason: request.reason || "No reason supplied",
        recordedAt: "2026-08-05T10:24:00.000Z",
      });

      const result = {
        status: "committed",
        operationId,
        incidentId,
        version: version(),
        outcome: {
          summary: "Evacuation zone approved and field preparation assigned.",
          taskId: "TASK-EVAC-001",
          auditId: `AUDIT-${operationId}`,
        },
      };
      committedOperations.set(operationId, clone(result));
      return result;
    },
  };
}
