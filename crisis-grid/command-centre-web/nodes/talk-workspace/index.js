import { mount, unmount } from "svelte";
import TalkWorkspace from "./TalkWorkspace.svelte";

/**
 * @node Talk Workspace
 */
class TalkWorkspaceNode {
  constructor(tx) {
    this.tx = tx;
    this.component = null;
  }

  /**
   * @param {{ workspaceId: string, state: "active" | "inactive" }} payload
   */
  onWorkspaceActivationChange(payload) {
    if (payload?.workspaceId !== "talk") return;
    if (payload.state === "active") window.setTimeout(() => void this.acquireAndMount(), 0);
    else this.removeView();
  }

  /** @param {unknown} payload */
  onProjectionUpdated(payload) {
    void payload;
  }

  async acquireAndMount() {
    if (this.component) return;
    const allocation = await this.tx.request("layout.acquire-region", {
      workspaceId: "talk",
      regionRole: "talk",
    });
    if (allocation.status !== "allocated" || !allocation.mountId) return;
    const target = document.getElementById(allocation.mountId);
    if (target) this.component = mount(TalkWorkspace, { target });
  }

  removeView() {
    if (!this.component) return;
    void unmount(this.component);
    this.component = null;
  }
}

export function createTalkWorkspaceNode(tx) {
  return new TalkWorkspaceNode(tx);
}
