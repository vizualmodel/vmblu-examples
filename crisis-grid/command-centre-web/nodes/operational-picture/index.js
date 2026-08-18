/**
 * @node Operational Picture
 */
class OperationalPictureNode {
  constructor(tx) {
    this.tx = tx;
    this.projection = null;
  }

  /** @param {{ incidentId?: string }} payload */
  async onWorkspaceOpenIncident(payload) {
    const incidentId = payload?.incidentId;
    if (!incidentId) return;

    await this.loadIncident(incidentId, "initial");
  }

  async loadIncident(incidentId, source) {
    try {
      const result = await this.tx.request("operational-picture.load", { incidentId });
      if (result?.status !== "available" || !result.picture) return;

      this.projection = {
        incidentId: result.incidentId,
        version: result.version,
        sequence: result.sequence,
        source,
        picture: result.picture,
        ...(result.warnings ? { degradation: result.warnings } : {}),
      };
      this.tx.send("projection.updated", this.projection);
    } catch (error) {
      console.error("Operational Picture could not load the incident projection", error);
    }
  }

  async onOperationalCommandCommitted(payload) {
    const incidentId = payload?.incidentId || this.projection?.incidentId;
    if (incidentId) await this.loadIncident(incidentId, "resynchronized");
  }

  onLiveUpdatesReceived() {
    // Ordered live update application is intentionally deferred to a later slice.
  }

  /** @param {{ requestId?: string, incidentId?: string }} payload */
  onProjectionDetailRequest(payload) {
    this.tx.reply({
      status: "failed",
      requestId: payload?.requestId || "unknown",
      incidentId: payload?.incidentId || this.projection?.incidentId || "unknown",
      failureCategory: "detail-loading-not-implemented",
    });
  }

  onConnectionStatusChanged(payload) {
    if (!this.projection || payload?.status !== "disconnected") return;
    this.projection = {
      ...this.projection,
      source: "degraded",
      degradation: { reason: payload.reason || "Operational Core connection lost." },
    };
    this.tx.send("projection.updated", this.projection);
  }
}

export function createOperationalPictureNode(tx) {
  return new OperationalPictureNode(tx);
}
