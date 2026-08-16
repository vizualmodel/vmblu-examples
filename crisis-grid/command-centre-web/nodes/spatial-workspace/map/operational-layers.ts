import type { Map as MapLibreMap } from "maplibre-gl";
import type { OperationalSpatialFeatures } from "../../../shared/operational-picture/types";
import type { SpatialLayerKey } from "../view-model";

export const OPERATIONAL_SOURCE = "shared-operational-picture";

export const layerIds: Record<SpatialLayerKey, string[]> = {
  flood: ["flood-extent", "flood-outline"],
  closure: ["road-closure-casing", "road-closure"],
  unit: ["unit-marker", "unit-label"],
  evacuation: ["evacuation-zone", "evacuation-outline"],
};

export function addOperationalLayers(
  map: MapLibreMap,
  features: OperationalSpatialFeatures,
): void {
  map.addSource(OPERATIONAL_SOURCE, { type: "geojson", data: features });

  map.addLayer({
    id: "flood-extent",
    type: "fill",
    source: OPERATIONAL_SOURCE,
    filter: ["==", ["get", "kind"], "flood"],
    paint: { "fill-color": "#36a9d6", "fill-opacity": 0.35 },
  });
  map.addLayer({
    id: "flood-outline",
    type: "line",
    source: OPERATIONAL_SOURCE,
    filter: ["==", ["get", "kind"], "flood"],
    paint: { "line-color": "#73d3f2", "line-width": 2 },
  });
  map.addLayer({
    id: "evacuation-zone",
    type: "fill",
    source: OPERATIONAL_SOURCE,
    filter: ["==", ["get", "kind"], "evacuation"],
    paint: { "fill-color": "#f1bd50", "fill-opacity": 0.18 },
  });
  map.addLayer({
    id: "evacuation-outline",
    type: "line",
    source: OPERATIONAL_SOURCE,
    filter: ["==", ["get", "kind"], "evacuation"],
    paint: {
      "line-color": "#ffd36f",
      "line-width": 2.5,
      "line-dasharray": [2, 2],
    },
  });
  map.addLayer({
    id: "road-closure-casing",
    type: "line",
    source: OPERATIONAL_SOURCE,
    filter: ["==", ["get", "kind"], "closure"],
    paint: { "line-color": "#40191b", "line-width": 8 },
  });
  map.addLayer({
    id: "road-closure",
    type: "line",
    source: OPERATIONAL_SOURCE,
    filter: ["==", ["get", "kind"], "closure"],
    paint: { "line-color": "#ff6668", "line-width": 4, "line-dasharray": [1, 1.4] },
  });
  map.addLayer({
    id: "unit-marker",
    type: "circle",
    source: OPERATIONAL_SOURCE,
    filter: ["==", ["get", "kind"], "unit"],
    paint: {
      "circle-radius": 8,
      "circle-color": "#65d2b3",
      "circle-stroke-color": "#09251f",
      "circle-stroke-width": 3,
    },
  });
  map.addLayer({
    id: "unit-label",
    type: "symbol",
    source: OPERATIONAL_SOURCE,
    filter: ["==", ["get", "kind"], "unit"],
    layout: {
      "text-field": ["get", "title"],
      "text-size": 11,
      "text-offset": [0, 1.5],
      "text-anchor": "top",
    },
    paint: {
      "text-color": "#e8fff8",
      "text-halo-color": "#102027",
      "text-halo-width": 1.5,
    },
  });
}
