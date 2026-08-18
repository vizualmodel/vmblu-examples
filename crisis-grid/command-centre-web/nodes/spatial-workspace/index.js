import { mount, unmount } from "svelte";
import { writable } from "svelte/store";
import { SpatialMap } from "./map/spatial-map.ts";
import SpatialWorkspace from "./ui/SpatialWorkspace.svelte";
import { createInitialSpatialWorkspaceViewModel } from "./view-model.ts";

/**
 * @node Spatial Workspace
 */
class SpatialWorkspaceNode {
  constructor(tx) {
    this.tx = tx;
    this.component = null;
    this.map = null;
    this.projection = null;
    this.viewModelStore = writable(createInitialSpatialWorkspaceViewModel());
  }

  /**
   * @param {{ workspaceId: string, state: "active" | "inactive" }} payload
   */
  onWorkspaceActivationChange(payload) {
    if (payload?.workspaceId !== "spatial") return;
    if (payload.state === "active") {
      window.setTimeout(() => void this.acquireAndMount(), 0);
    } else {
      this.removeView();
    }
  }

  /** @param {unknown} payload */
  onProjectionUpdated(payload) {
    this.projection = payload;
    const picture = payload?.picture;
    const version = payload?.version || "unversioned";
    this.viewModelStore.update((viewModel) => {
      const selectedFeature = picture?.spatialFeatures?.features?.find(
        (feature) => String(feature.id) === viewModel.selection?.featureId,
      );
      const selection = selectedFeature
        ? { featureId: String(selectedFeature.id), ...selectedFeature.properties }
        : viewModel.selection;
      return {
        ...viewModel,
        incidentTitle: picture?.incidentTitle || "No incident projection",
        projectionVersion: version,
        featureCount: picture?.spatialFeatures?.features?.length || 0,
        selection,
      };
    });
    if (picture?.spatialFeatures) {
      this.map?.updateProjection(picture.spatialFeatures, version);
    }
  }

  async acquireAndMount() {
    if (this.component) return;
    const allocation = await this.tx.request("layout.acquire-region", {
      workspaceId: "spatial",
      regionRole: "spatial",
    });
    if (allocation.status !== "allocated" || !allocation.mountId) return;
    const target = document.getElementById(allocation.mountId);
    if (target) {
      this.component = mount(SpatialWorkspace, {
        target,
        props: {
          viewModelStore: this.viewModelStore,
          onMapHostReady: (element) => this.mountMap(element),
          onToggleLayerPanel: () => this.toggleLayerPanel(),
          onToggleLayer: (key) => this.toggleLayer(key),
          onResetView: () => this.map?.resetView(),
          onProposeApproval: () => this.proposeSelectedApproval(),
        },
      });
    }
  }

  mountMap(element) {
    this.map?.destroy();
    const spatialMap = new SpatialMap(element, {
      onStatusChange: (mapStatus) => {
        this.viewModelStore.update((viewModel) => ({ ...viewModel, mapStatus }));
      },
      onCoordinatesChange: (coordinates) => {
        this.viewModelStore.update((viewModel) => ({ ...viewModel, coordinates }));
      },
      onFeatureSelected: (selection) => {
        this.viewModelStore.update((viewModel) => ({ ...viewModel, selection }));
      },
    });
    this.map = spatialMap;

    const picture = this.projection?.picture;
    if (picture?.spatialFeatures) {
      spatialMap.updateProjection(
        picture.spatialFeatures,
        this.projection?.version || "unversioned",
      );
    }

    return () => {
      spatialMap.destroy();
      if (this.map === spatialMap) this.map = null;
    };
  }

  toggleLayerPanel() {
    this.viewModelStore.update((viewModel) => ({
      ...viewModel,
      showLayers: !viewModel.showLayers,
    }));
  }

  toggleLayer(key) {
    let visible = true;
    this.viewModelStore.update((viewModel) => ({
      ...viewModel,
      layers: viewModel.layers.map((layer) => {
        if (layer.key !== key) return layer;
        visible = !layer.visible;
        return { ...layer, visible };
      }),
    }));
    this.map?.setLayerVisibility(key, visible);
  }

  proposeSelectedApproval() {
    let selection = null;
    this.viewModelStore.update((viewModel) => {
      selection = viewModel.selection;
      return viewModel;
    });
    if (!selection || selection.kind !== "evacuation" || !selection.status.startsWith("Proposed")) return;

    const expectedVersion = this.projection?.version || "unversioned";
    this.tx.send("operational-command.proposal", {
      proposalId: `approve-${selection.featureId}-${expectedVersion}`,
      incidentId: this.projection?.incidentId,
      expectedVersion,
      title: `Approve ${selection.title}`,
      featureId: selection.featureId,
      command: { kind: "approve-evacuation-zone", featureId: selection.featureId },
      evidence: selection.source,
      reason: "Forecast extent and access restrictions justify evacuation preparation.",
    });
  }

  removeView() {
    if (!this.component) return;
    this.map?.destroy();
    this.map = null;
    void unmount(this.component);
    this.component = null;
  }
}

export function createSpatialWorkspaceNode(tx) {
  return new SpatialWorkspaceNode(tx);
}
