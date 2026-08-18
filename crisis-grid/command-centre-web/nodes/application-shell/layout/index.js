import { mount } from "svelte";
import ShellLayout from "./ShellLayout.svelte";

const regions = {
  situation: { regionId: "situation", mountId: "ccw-region-situation" },
  spatial: { regionId: "spatial", mountId: "ccw-region-spatial" },
  talk: { regionId: "talk", mountId: "ccw-region-talk" },
  action: { regionId: "action", mountId: "ccw-region-action" },
};

/**
 * @node Layout
 */
class LayoutNode {
  constructor(tx) {
    this.tx = tx;
    this.activeWorkspaces = new Set();

    const root = document.createElement("div");
    root.id = "ccw-root";
    document.body.append(root);
    mount(ShellLayout, { target: root });
  }

  /**
   * @param {{ workspaceId: string, state: "active" | "inactive" }} payload
   */
  onWorkspaceActivationChange(payload) {
    const workspaceId = payload?.workspaceId;
    if (!workspaceId || !(workspaceId in regions)) return;

    if (payload.state === "active") {
      this.activeWorkspaces.add(workspaceId);
    } else {
      this.activeWorkspaces.delete(workspaceId);
      document.getElementById(regions[workspaceId].mountId)?.replaceChildren();
    }
  }

  /**
   * @param {{ workspaceId: string, regionRole: string }} payload
   */
  onLayoutAcquireRegion(payload) {
    const workspaceId = payload?.workspaceId;
    const regionRole = payload?.regionRole;
    const region = regions[workspaceId];

    if (!region || regionRole !== region.regionId || !this.activeWorkspaces.has(workspaceId)) {
      this.tx.reply({
        status: "unavailable",
        workspaceId: workspaceId || "unknown",
        regionRole: regionRole || "unknown",
        failureCategory: "inactive-or-unknown-workspace",
      });
      return;
    }

    this.tx.reply({
      status: "allocated",
      workspaceId,
      regionRole,
      regionId: region.regionId,
      mountId: region.mountId,
      layoutMode: "command-centre-desktop",
    });
  }
}

export function createLayoutNode(tx) {
  return new LayoutNode(tx);
}
