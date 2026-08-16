import maplibregl, { type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./maplibre-theme.css";
import {
  emptyOperationalSpatialFeatures,
  type OperationalSpatialFeatures,
  type SelectedOperationalFeature,
} from "../../../shared/operational-picture/types";
import type { SpatialLayerKey } from "../view-model";
import { ANTWERP_CENTER, prototypeBasemapStyle } from "./basemap-style";
import { addOperationalLayers, layerIds, OPERATIONAL_SOURCE } from "./operational-layers";

export type SpatialMapEvents = {
  onStatusChange(status: string): void;
  onCoordinatesChange(coordinates: string): void;
  onFeatureSelected(feature: SelectedOperationalFeature): void;
};

export class SpatialMap {
  private readonly map: MapLibreMap;
  private readonly events: SpatialMapEvents;
  private readonly configuredStyle: string;
  private features: OperationalSpatialFeatures = emptyOperationalSpatialFeatures;
  private projectionVersion = "awaiting projection";
  private readonly layerVisibility: Record<SpatialLayerKey, boolean> = {
    flood: true,
    closure: true,
    unit: true,
    evacuation: true,
  };
  private resizeObserver: ResizeObserver | null;
  private destroyed = false;
  private mapErrorReported = false;

  constructor(container: HTMLElement, events: SpatialMapEvents) {
    this.events = events;
    this.configuredStyle = import.meta.env.VITE_CGW_BASEMAP_STYLE_URL?.trim() || "";
    this.map = new maplibregl.Map({
      container,
      style: this.configuredStyle || prototypeBasemapStyle,
      center: ANTWERP_CENTER,
      zoom: 12.6,
      minZoom: 10,
      maxZoom: 18,
      attributionControl: false,
    });

    this.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    this.map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");
    this.map.on("load", () => this.onLoad());
    this.map.on("mousemove", ({ lngLat }) => this.onPointerMove(lngLat.lng, lngLat.lat));
    this.map.on("click", (event) => this.onFeatureClick(event));
    this.map.on("error", (event) => this.onError(event.error));

    this.resizeObserver = new ResizeObserver(() => this.map.resize());
    this.resizeObserver.observe(container);
  }

  updateProjection(features: OperationalSpatialFeatures, version: string): void {
    this.features = features;
    this.projectionVersion = version;
    const source = this.map.getSource(OPERATIONAL_SOURCE) as GeoJSONSource | undefined;
    source?.setData(features);
    if (this.map.loaded()) {
      this.events.onStatusChange(`Shared OCS mock projection · ${version}`);
    }
  }

  setLayerVisibility(key: SpatialLayerKey, visible: boolean): void {
    this.layerVisibility[key] = visible;
    const visibility = visible ? "visible" : "none";
    for (const layerId of layerIds[key]) {
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, "visibility", visibility);
      }
    }
  }

  resetView(): void {
    this.map.easeTo({ center: ANTWERP_CENTER, zoom: 12.6, bearing: 0, pitch: 0, duration: 500 });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.map.remove();
  }

  private onLoad(): void {
    addOperationalLayers(this.map, this.features);
    for (const [key, visible] of Object.entries(this.layerVisibility)) {
      this.setLayerVisibility(key as SpatialLayerKey, visible);
    }
    const basemap = this.configuredStyle ? "Configured basemap" : "OSM prototype basemap";
    const projection = this.features.features.length > 0
      ? `shared OCS mock projection ${this.projectionVersion}`
      : "awaiting projection";
    this.events.onStatusChange(`${basemap} · ${projection}`);
  }

  private onPointerMove(longitude: number, latitude: number): void {
    const latitudeText = Math.abs(latitude).toFixed(4);
    const longitudeText = Math.abs(longitude).toFixed(4);
    this.events.onCoordinatesChange(
      `${latitudeText}° ${latitude >= 0 ? "N" : "S"} · ${longitudeText}° ${longitude >= 0 ? "E" : "W"}`,
    );
  }

  private onFeatureClick(event: maplibregl.MapMouseEvent): void {
    const interactiveLayers = Object.values(layerIds)
      .flat()
      .filter((layerId) => this.map.getLayer(layerId));
    if (interactiveLayers.length === 0) return;

    const feature = this.map.queryRenderedFeatures(event.point, { layers: interactiveLayers })[0];
    if (!feature?.properties) return;
    this.events.onFeatureSelected({
      featureId: String(feature.id || "unknown-feature"),
      kind: feature.properties.kind,
      title: feature.properties.title,
      detail: feature.properties.detail,
      status: feature.properties.status,
      source: feature.properties.source,
    });
    new maplibregl.Popup({ closeButton: true, maxWidth: "270px" })
      .setLngLat(event.lngLat)
      .setText(
        `${feature.properties.title} — ${feature.properties.status}. ${feature.properties.detail}. Source: ${feature.properties.source}.`,
      )
      .addTo(this.map);
  }

  private onError(error: Error): void {
    if (!this.map.loaded()) {
      this.events.onStatusChange("Basemap unavailable · synthetic overlays retained");
    }
    if (!this.mapErrorReported) {
      console.warn("Spatial Workspace map resource failed to load", error);
      this.mapErrorReported = true;
    }
  }
}
