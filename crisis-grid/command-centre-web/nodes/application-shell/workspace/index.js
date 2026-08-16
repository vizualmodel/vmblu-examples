// The first vertical slice activates each installed visual workspace and opens
// the one incident exposed by the executable local Operational Core service.
const initialWorkspaces = ["situation", "spatial", "talk", "action"];
const initialIncidentId = "CG-ANT-FLOOD-001";

/**
 * @node Workspace
 */
class WorkspaceNode {
  constructor(tx) {
    this.tx = tx;
    window.setTimeout(() => this.activateInitialLayout(), 0);
  }

  activateInitialLayout() {
    const changedAt = new Date().toISOString();

    for (const workspaceId of initialWorkspaces) {
      this.tx.send("workspace.activation-change", {
        workspaceId,
        state: "active",
        reason: "initial-layout-preview",
        changedAt,
      });
    }

    this.tx.send("workspace.open-incident", { incidentId: initialIncidentId });
  }

  /**
   * @param {{ status: string, reason: string }} payload
   */
  onSessionStatusChanged(payload) {
    if (payload?.status !== "ended") return;

    const changedAt = new Date().toISOString();
    for (const workspaceId of initialWorkspaces) {
      this.tx.send("workspace.activation-change", {
        workspaceId,
        state: "inactive",
        reason: payload.reason || "session-ended",
        changedAt,
      });
    }
  }
}

export function createWorkspaceNode(tx) {
  return new WorkspaceNode(tx);
}
