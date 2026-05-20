/**
 * @node ScreenLayout
 */
class ScreenLayoutNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx ?? {};
    const ambientIntensity = Number(this.sx.ambientIntensity ?? 1.35);
    const sunIntensity = Number(this.sx.sunIntensity ?? 180);
    const showEcliptic = this.sx.showEcliptic !== false;
    const showAxes = this.sx.showAxes === true;
    this.state = {
      fullScreen: true,
      overlays: {
        chart: { visible: false, payload: null },
        rendererLighting: {
          ambientIntensity,
          sunIntensity
        },
        rendererHelpers: {
          showEcliptic,
          showAxes
        }
      }
    };
    this._emitState();
  }

  _emitState() {
    /** @type {LayoutState} */
    const payload = {
      fullScreen: !!this.state.fullScreen,
      overlays: this.state.overlays
    };
    this.tx.send("layout.state", payload);
  }

  /**
   * Receives layout commands for canvas and overlay arrangement.
   * @param {RenderCommand} payload
   */
  onLayoutCommand(payload) {
    const kind = String(payload?.kind ?? "").toLowerCase();
    const params = payload?.params ?? {};

    if (kind === "layout.fullscreen" || kind === "render.fullscreen") {
      this.state.fullScreen = params?.enabled !== false;
      this._emitState();
      return;
    }

    if (kind === "render.light" || kind === "render.lighting") {
      if (Number.isFinite(params?.ambientIntensity)) {
        this.state.overlays.rendererLighting.ambientIntensity = Number(params.ambientIntensity);
      }
      if (Number.isFinite(params?.sunIntensity)) {
        this.state.overlays.rendererLighting.sunIntensity = Number(params.sunIntensity);
      }
      this._emitState();
      return;
    }

    if (kind === "render.ecliptic") {
      if (typeof params?.enabled === "boolean") {
        this.state.overlays.rendererHelpers.showEcliptic = params.enabled;
      }
      this._emitState();
      return;
    }

    if (kind === "render.axes") {
      if (typeof params?.enabled === "boolean") {
        this.state.overlays.rendererHelpers.showAxes = params.enabled;
      }
      this._emitState();
    }
  }

  /**
   * Receives chart overlay data and visibility state.
   * @param {ChartOverlay} payload
   */
  onLayoutChartOverlay(payload) {
    this.state.overlays.chart = {
      visible: !!payload?.visible,
      payload: payload ?? null
    };
    this._emitState();
  }
}

export function createScreenLayout(tx, sx) {
  return new ScreenLayoutNode(tx, sx);
}
