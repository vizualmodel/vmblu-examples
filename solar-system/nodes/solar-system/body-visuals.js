/**
 * @node BodyVisuals
 */
import sunMapUrl from "../../assets/2k_sun.jpg";
import mercuryMapUrl from "../../assets/2k_mercury.jpg";
import venusMapUrl from "../../assets/2k_venus_surface.jpg";
import earthDayMapUrl from "../../assets/2k_earth_daymap.jpg";
import moonMapUrl from "../../assets/2k_moon.jpg";
import marsMapUrl from "../../assets/2k_mars.jpg";
import jupiterMapUrl from "../../assets/2k_jupiter.jpg";
import saturnMapUrl from "../../assets/2k_saturn.jpg";
import uranusMapUrl from "../../assets/2k_uranus.jpg";
import neptuneMapUrl from "../../assets/2k_neptune.jpg";

const BODY_TEXTURES = [
  { ids: ["sun"], url: sunMapUrl },
  { ids: ["mercury"], url: mercuryMapUrl },
  { ids: ["venus"], url: venusMapUrl },
  { ids: ["earth"], url: earthDayMapUrl },
  { ids: ["earth/moon", "moon"], url: moonMapUrl },
  { ids: ["mars"], url: marsMapUrl },
  { ids: ["jupiter"], url: jupiterMapUrl },
  { ids: ["saturn"], url: saturnMapUrl },
  { ids: ["uranus"], url: uranusMapUrl },
  { ids: ["neptune"], url: neptuneMapUrl }
];

class BodyVisualsNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx ?? {};
    this.visualScale = Number(this.sx.visualScale ?? 1500);
    this.sunRadiusMultiplier = Number(this.sx.sunRadiusMultiplier ?? 10);
    this.planetRadiusMultiplier = Number(this.sx.planetRadiusMultiplier ?? 200);
    this.moonOrbitRadiusMultiplier = Number(this.sx.moonOrbitRadiusMultiplier ?? 20);
    this.labelsVisible = this.sx.labelsVisible !== false;
    this.lastCamera = null;
    this._sentRegistry = false;
  }

  _emitVisualPatch(kind, payload) {
    /** @type {ScenePatchList} */
    const patches = [
      {
        kind,
        target: "solar.visuals",
        payload
      }
    ];
    this.tx.send("scene.updates", patches);
  }

  _emitSettings() {
    this._emitVisualPatch("solar.settings", {
      visualScale: this.visualScale,
      labelsVisible: this.labelsVisible,
      sunRadiusMultiplier: this.sunRadiusMultiplier,
      planetRadiusMultiplier: this.planetRadiusMultiplier,
      moonOrbitRadiusMultiplier: this.moonOrbitRadiusMultiplier
    });
  }

  /**
   * Receives current celestial body poses.
   * @param {BodyPoseList} payload
   */
  onSceneBodyPoses(payload) {
    const bodies = Array.isArray(payload) ? payload : [];
    /** @type {ScenePatchList} */
    const patches = [
      {
        kind: "body.textures",
        target: "renderer.body-textures",
        payload: {
          textures: BODY_TEXTURES
        }
      },
      {
        kind: "solar.body-poses",
        target: "solar.visuals",
        payload: {
          visualScale: this.visualScale,
          labelsVisible: this.labelsVisible,
          sunRadiusMultiplier: this.sunRadiusMultiplier,
          planetRadiusMultiplier: this.planetRadiusMultiplier,
          moonOrbitRadiusMultiplier: this.moonOrbitRadiusMultiplier,
          camera: this.lastCamera,
          bodies: bodies.map(withSolarVisuals)
        }
      }
    ];
    this.tx.send("scene.updates", patches);

    if (!this._sentRegistry) {
      this._sentRegistry = true;
      /** @type {AnimatableBatch} */
      const registry = {
        items: bodies.map((b) => ({ id: b.id, kind: "celestial-body" }))
      };
      this.tx.send("scene.animatables", registry);
    }
  }

  /**
   * Receives solar-system visual commands such as scale or label toggles.
   * @param {CommandEnvelope} payload
   */
  onSceneCommand(payload) {
    const kind = String(payload?.kind ?? "").toLowerCase();
    const params = payload?.params ?? {};

    if (kind === "solar.scale" || kind === "visual.scale") {
      const value = Number(params?.multiplier ?? params?.value ?? params);
      if (Number.isFinite(value) && value > 0) {
        this.visualScale = value;
        this._emitSettings();
      }
      return;
    }

    if (kind === "solar.labels" || kind === "visual.labels") {
      this.labelsVisible = params?.visible !== false;
      this._emitSettings();
      return;
    }

    if (kind === "solar.radius" || kind === "visual.radius") {
      const sunMul = Number(params?.sunMultiplier);
      const planetMul = Number(params?.planetMultiplier);
      const moonOrbitMul = Number(params?.moonOrbitMultiplier);
      let changed = false;
      if (Number.isFinite(sunMul) && sunMul >= 1) {
        this.sunRadiusMultiplier = sunMul;
        changed = true;
      }
      if (Number.isFinite(planetMul) && planetMul >= 1) {
        this.planetRadiusMultiplier = planetMul;
        changed = true;
      }
      if (Number.isFinite(moonOrbitMul) && moonOrbitMul >= 1) {
        this.moonOrbitRadiusMultiplier = moonOrbitMul;
        changed = true;
      }
      if (changed) this._emitSettings();
      return;
    }

    if (kind === "solar.toggle-labels") {
      this.labelsVisible = !this.labelsVisible;
      this._emitSettings();
    }
  }

  /**
   * Receives camera state used for view-dependent visual updates.
   * @param {CameraState} payload
   */
  onSceneCamera(payload) {
    this.lastCamera = payload ?? null;
  }
}

export function createBodyVisuals(tx, sx) {
  return new BodyVisualsNode(tx, sx);
}

function withSolarVisuals(body) {
  const visual = visualForBody(body);
  return {
    ...body,
    visual: {
      ...(body?.visual ?? {}),
      ...visual
    }
  };
}

function visualForBody(body) {
  const key = String(body?.name ?? body?.id ?? "").toLowerCase();
  const isSun = key.includes("sun");
  return {
    color: colorForBodyKey(key),
    emissive: isSun ? "#fffda3" : "#000000",
    emissiveIntensity: isSun ? 1.2 : 0,
    textureRole: isSun ? "emissive" : "surface",
    markerSize: markerSizeForBody(body),
    lightSource: isSun
  };
}

function colorForBodyKey(key) {
  if (key.includes("sun")) return "#ffd65c";
  if (key.includes("mercury")) return "#aeb1b5";
  if (key.includes("venus")) return "#d4b27a";
  if (key.includes("earth")) return "#5ca8ff";
  if (key.includes("moon")) return "#d8d8d8";
  if (key.includes("mars")) return "#d96b4e";
  if (key.includes("jupiter")) return "#d8b287";
  if (key.includes("saturn")) return "#dbc97b";
  if (key.includes("uranus")) return "#9fe7ef";
  if (key.includes("neptune")) return "#567cff";
  if (key.includes("pluto")) return "#b39a7d";
  return "#c8d2ea";
}

function markerSizeForBody(body) {
  const id = String(body?.id ?? "").toLowerCase();
  if (id === "sun") return 7;
  if (id.includes("/")) return 2.5;
  return 4;
}



