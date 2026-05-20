/**
 * @node CelestialSphere
 */
class CelestialSphereNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx ?? {};
    this.radius = Number(this.sx.radius ?? 2500);
    this.starMapFile = String(this.sx.starMapFile ?? "");
    this.constellationFile = String(this.sx.constellationFile ?? "");
    this.showStars = this.sx.showStars === true;
    this.showConstellations = this.sx.showConstellations === true;

    queueMicrotask(() => this._emitSkyPatch());
  }

  _emitSkyPatch() {
    /** @type {ScenePatchList} */
    const patches = [
      {
        kind: "sky.settings",
        target: "solar.sky",
        payload: {
          radius: this.radius,
          starMapUrl: resolveSkyAssetUrl(this.starMapFile),
          constellationUrl: resolveSkyAssetUrl(this.constellationFile),
          showStars: this.showStars,
          showConstellations: this.showConstellations
        }
      }
    ];
    this.tx.send("sky.scene-updates", patches);
  }

  /**
   * Receives configuration commands for the celestial sphere background.
   * @param {CommandEnvelope} payload
   */
  onSkyCommand(payload) {
    const kind = String(payload?.kind ?? "").toLowerCase();
    const params = payload?.params ?? {};

    if (kind === "solar.stars" || kind === "visual.stars") {
      this.showStars = params?.enabled === true;
      this._emitSkyPatch();
      return;
    }

    if (kind === "solar.constellations" || kind === "visual.constellations") {
      this.showConstellations = params?.enabled === true;
      this._emitSkyPatch();
    }
  }

  /**
   * Receives camera state for view-dependent sky behavior.
   * @param {CameraState} payload
   */
  onSkyCamera(payload) {
    void payload;
  }
}

export function createCelestialSphere(tx, sx) {
  return new CelestialSphereNode(tx, sx);
}

function resolveSkyAssetUrl(fileName) {
  const normalized = String(fileName ?? "").replace(/\\/g, "/").trim();
  if (!normalized) return "";
  const target = normalized.startsWith("./") ? normalized.slice(2) : normalized;
  return `./assets/${target}`;
}


