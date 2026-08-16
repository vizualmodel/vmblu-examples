import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createOperationalCoreServer } from "../src/server.js";
import { SYNTHETIC_INCIDENT_ID } from "../src/operational-core.js";

let server;
let baseUrl;

before(async () => {
  server = createOperationalCoreServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("HTTP boundary establishes a session and serves the authorized picture", async () => {
  const session = await fetch(`${baseUrl}/session`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ authentication: "synthetic-demo" }),
  }).then((response) => response.json());
  assert.equal(session.status, "established");

  const picture = await fetch(`${baseUrl}/incidents/${SYNTHETIC_INCIDENT_ID}/picture`, {
    headers: { authorization: `Bearer ${session.token}` },
  }).then((response) => response.json());
  assert.equal(picture.status, "available");
  assert.equal(picture.version, "ocs-1");

  const command = await fetch(`${baseUrl}/commands`, {
    method: "POST",
    headers: { authorization: `Bearer ${session.token}`, "content-type": "application/json" },
    body: JSON.stringify({
      operationId: "http-approval-001",
      incidentId: SYNTHETIC_INCIDENT_ID,
      expectedVersion: picture.version,
      reason: "Reviewed in the HTTP contract test.",
      command: { kind: "approve-evacuation-zone", featureId: "evacuation-zone-east" },
    }),
  }).then((response) => response.json());
  assert.equal(command.status, "committed");

  const refreshed = await fetch(`${baseUrl}/incidents/${SYNTHETIC_INCIDENT_ID}/picture`, {
    headers: { authorization: `Bearer ${session.token}` },
  }).then((response) => response.json());
  assert.equal(refreshed.version, "ocs-2");
  assert.equal(refreshed.picture.auditTrail[0].actorId, "demo-operator");
});
