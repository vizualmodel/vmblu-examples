import type { SelectedOperationalFeature } from "../../shared/operational-picture/types";

export type SpatialLayerKey = "flood" | "closure" | "unit" | "evacuation";

export type SpatialLayerViewModel = {
  key: SpatialLayerKey;
  label: string;
  visible: boolean;
};

export type SpatialWorkspaceViewModel = {
  incidentTitle: string;
  projectionVersion: string;
  featureCount: number;
  showLayers: boolean;
  layers: SpatialLayerViewModel[];
  mapStatus: string;
  coordinates: string;
  selection: SelectedOperationalFeature | null;
};

export function createInitialSpatialWorkspaceViewModel(): SpatialWorkspaceViewModel {
  return {
    incidentTitle: "No incident projection",
    projectionVersion: "awaiting projection",
    featureCount: 0,
    showLayers: true,
    selection: null,
    layers: [
      { key: "flood", label: "Flood forecast", visible: true },
      { key: "closure", label: "Road closure", visible: true },
      { key: "unit", label: "Field unit", visible: true },
      { key: "evacuation", label: "Proposed zone", visible: true },
    ],
    mapStatus: "Loading external basemap…",
    coordinates: "51.2297° N · 4.3978° E",
  };
}
