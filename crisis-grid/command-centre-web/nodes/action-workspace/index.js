import { mount, unmount } from "svelte";
import { writable } from "svelte/store";
import ActionWorkspace from "./ActionWorkspace.svelte";

const emptyReview = (message = "", status = "idle") => ({ proposal: null, status, message });

/** @node Action Workspace */
class ActionWorkspaceNode {
  constructor(tx) {
    this.tx = tx;
    this.component = null;
    this.proposal = null;
    this.reviewStore = writable(emptyReview());
  }

  onWorkspaceActivationChange(payload) {
    if (payload?.workspaceId !== "action") return;
    if (payload.state === "active") window.setTimeout(() => void this.acquireAndMount(), 0);
    else this.removeView();
  }

  onProjectionUpdated() {}

  onOperationalCommandProposal(payload) {
    if (!payload?.proposalId || !payload?.incidentId || !payload?.command) return;
    this.proposal = payload;
    this.reviewStore.set({ proposal: payload, status: "review", message: "" });
  }

  async submit(reason) {
    if (!this.proposal) return;
    const proposal = this.proposal;
    this.reviewStore.set({ proposal, status: "submitting", message: "Submitting governed command…" });
    try {
      const result = await this.tx.request("operational-command.submit", {
        operationId: proposal.proposalId,
        incidentId: proposal.incidentId,
        expectedVersion: proposal.expectedVersion,
        reason,
        command: proposal.command,
      });
      const message = result?.status === "committed"
        ? result.outcome?.summary || "The action was committed."
        : result?.reason || "The command did not complete.";
      this.reviewStore.set({ proposal, status: result?.status || "unavailable", message });
      if (result?.status === "committed") {
        this.proposal = null;
        this.tx.send("operational-command.committed", result);
        window.setTimeout(() => this.reviewStore.set(emptyReview(message, "committed")), 700);
      }
    } catch (error) {
      this.reviewStore.set({ proposal, status: "uncertain", message: "The outcome is uncertain; retry with the same operation identity." });
      console.error("Operational command outcome is uncertain", error);
    }
  }

  cancel() {
    this.proposal = null;
    this.reviewStore.set(emptyReview());
  }

  async acquireAndMount() {
    if (this.component) return;
    const allocation = await this.tx.request("layout.acquire-region", { workspaceId: "action", regionRole: "action" });
    if (allocation.status !== "allocated" || !allocation.mountId) return;
    const target = document.getElementById(allocation.mountId);
    if (target) this.component = mount(ActionWorkspace, { target, props: { reviewStore: this.reviewStore, onSubmit: (reason) => void this.submit(reason), onCancel: () => this.cancel() } });
  }

  removeView() {
    if (!this.component) return;
    void unmount(this.component);
    this.component = null;
  }
}

export function createActionWorkspaceNode(tx) {
  return new ActionWorkspaceNode(tx);
}
