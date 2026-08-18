import { mount, unmount } from "svelte";
import { writable } from "svelte/store";
import SituationWorkspace from "./SituationWorkspace.svelte";

/**
 * @node Situation Workspace
 */
class SituationWorkspaceNode {
  constructor(tx) {
    this.tx = tx;
    this.component = null;
    this.projectionStore = writable(null);
  }

  /**
   * @param {{ workspaceId: string, state: "active" | "inactive" }} payload
   */
  onWorkspaceActivationChange(payload) {
    if (payload?.workspaceId !== "situation") return;
    if (payload.state === "active") window.setTimeout(() => void this.acquireAndMount(), 0);
    else this.removeView();
  }

  /** @param {unknown} payload */
  onProjectionUpdated(payload) {
    this.projectionStore.set(payload);
  }

  async acquireAndMount() {
    if (this.component) return;
    const allocation = await this.tx.request("layout.acquire-region", {
      workspaceId: "situation",
      regionRole: "situation",
    });
    if (allocation.status !== "allocated" || !allocation.mountId) return;
    const target = document.getElementById(allocation.mountId);
    if (target) {
      this.component = mount(SituationWorkspace, {
        target,
        props: { projectionStore: this.projectionStore },
      });
    }
  }

  removeView() {
    if (!this.component) return;
    void unmount(this.component);
    this.component = null;
  }
}

export function createSituationWorkspaceNode(tx) {
  return new SituationWorkspaceNode(tx);
}
