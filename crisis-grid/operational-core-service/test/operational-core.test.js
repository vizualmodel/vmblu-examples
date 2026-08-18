import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createOperationalCore, SYNTHETIC_INCIDENT_ID } from "../src/operational-core.js";

function establish(core) {
  return core.establishSession("synthetic-demo").token;
}

function approval(operationId = "op-evacuation-001", expectedVersion = "ocs-1") {
  return {
    operationId,
    incidentId: SYNTHETIC_INCIDENT_ID,
    expectedVersion,
    reason: "Forecast extent and access restrictions justify preparation.",
    command: { kind: "approve-evacuation-zone", featureId: "evacuation-zone-east" },
  };
}

describe("Operational Core governed command", () => {
  it("returns the initial authorized synthetic picture", () => {
    const core = createOperationalCore();
    const picture = core.loadPicture(establish(core), SYNTHETIC_INCIDENT_ID);
    assert.equal(picture.status, "available");
    assert.equal(picture.version, "ocs-1");
    assert.equal(picture.picture.situation.proposedZoneCount, 1);
  });

  it("commits approval and exposes the canonical audit and task state", () => {
    const core = createOperationalCore();
    const token = establish(core);
    const result = core.submitCommand(token, approval());
    const picture = core.loadPicture(token, SYNTHETIC_INCIDENT_ID);
    assert.equal(result.status, "committed");
    assert.equal(picture.version, "ocs-2");
    assert.equal(picture.picture.situation.proposedZoneCount, 0);
    assert.equal(picture.picture.tasks[0].taskId, "TASK-EVAC-001");
    assert.equal(picture.picture.auditTrail[0].actorId, "demo-operator");
  });

  it("returns the original result when the same operation is retried", () => {
    const core = createOperationalCore();
    const token = establish(core);
    const first = core.submitCommand(token, approval());
    const repeated = core.submitCommand(token, approval("op-evacuation-001", "ocs-stale"));
    assert.deepEqual(repeated, first);
    assert.equal(core.loadPicture(token, SYNTHETIC_INCIDENT_ID).picture.auditTrail.length, 1);
  });

  it("rejects a command prepared against a stale version", () => {
    const core = createOperationalCore();
    const result = core.submitCommand(establish(core), approval("op-stale", "ocs-0"));
    assert.equal(result.status, "conflict");
    assert.equal(result.version, "ocs-1");
  });
});
