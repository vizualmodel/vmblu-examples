import type { StyleSpecification } from "maplibre-gl";

export const ANTWERP_CENTER: [number, number] = [4.3978, 51.2297];

// The public OSM raster service is suitable only for this modest interactive
// prototype. A configured style can later point at bounded self-hosted tiles.
export const prototypeBasemapStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>',
    },
  },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "#101a20" } },
    {
      id: "osm-basemap",
      type: "raster",
      source: "osm",
      paint: {
        "raster-opacity": 0.68,
        "raster-saturation": -0.72,
        "raster-contrast": 0.16,
        "raster-brightness-max": 0.68,
      },
    },
  ],
};
