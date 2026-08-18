const DEFAULT_OCS_URL = "http://127.0.0.1:4310";

/** @node Operational Core Connection */
class OperationalCoreConnectionNode {
  constructor(tx) {
    this.tx = tx;
    this.baseUrl = (import.meta.env.VITE_CGW_OCS_URL || DEFAULT_OCS_URL).replace(/\/$/, "");
    this.token = null;
    this.session = null;
  }

  async requestJson(path, options = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: { "content-type": "application/json", ...(this.token ? { authorization: `Bearer ${this.token}` } : {}), ...options.headers },
    });
    if (!response.ok) throw new Error(`Operational Core returned HTTP ${response.status}`);
    return response.json();
  }

  async establish() {
    if (this.token && this.session) return { status: "established", session: this.session };
    const result = await this.requestJson("/session", { method: "POST", body: JSON.stringify({ authentication: "synthetic-command-centre-demo" }) });
    if (result.status === "established") {
      this.token = result.token;
      this.session = result.session;
      this.tx.send("connection.status-changed", { status: "connected", service: this.baseUrl });
      return { status: "established", session: result.session };
    }
    return result;
  }

  async onSessionEstablish() {
    try { this.tx.reply(await this.establish()); }
    catch { this.tx.reply({ status: "unavailable", reason: "Operational Core is unavailable." }); }
  }

  async onOperationalPictureLoad(payload) {
    const incidentId = payload?.incidentId || "unknown";
    try {
      const session = await this.establish();
      if (session.status !== "established") {
        this.tx.reply({ status: "rejected", incidentId, reason: session.reason });
        return;
      }
      this.tx.reply(await this.requestJson(`/incidents/${encodeURIComponent(incidentId)}/picture`));
    } catch {
      this.tx.send("connection.status-changed", { status: "disconnected", reason: "Operational Core is unavailable." });
      this.tx.reply({ status: "unavailable", incidentId, reason: "Start the Operational Core service on port 4310." });
    }
  }

  onLiveUpdatesSubscribe(payload) {
    this.tx.reply({ status: "unavailable", incidentId: payload?.incidentId || "unknown", reason: "Live updates are outside this vertical slice." });
  }

  async onOperationalCommandSubmit(payload) {
    try {
      const session = await this.establish();
      if (session.status !== "established") {
        this.tx.reply({ status: "rejected", operationId: payload?.operationId, incidentId: payload?.incidentId, reason: session.reason });
        return;
      }
      this.tx.reply(await this.requestJson("/commands", { method: "POST", body: JSON.stringify(payload) }));
    } catch {
      this.tx.send("connection.status-changed", { status: "disconnected", reason: "Command outcome is uncertain." });
      this.tx.reply({ status: "uncertain", operationId: payload?.operationId, incidentId: payload?.incidentId, reason: "The command outcome could not be confirmed." });
    }
  }
}

export function createOperationalCoreConnectionNode(tx) {
  return new OperationalCoreConnectionNode(tx);
}
