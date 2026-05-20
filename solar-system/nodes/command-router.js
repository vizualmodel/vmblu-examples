/**
 * @node CommandRouter
 */
class CommandRouterNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx ?? {};
  }

  _routeCommand(payload) {
    const kind = String(payload?.kind ?? "").toLowerCase();
    const params = payload?.params ?? {};
    if (!kind) return false;

    if (kind.startsWith("clock.") || kind.startsWith("simulation.")) {
      if (kind === "clock.configure" || kind === "simulation.configure" || kind === "simulation.start") {
        /** @type {ClockConfig} */
        const cfg = {
          startIsoUtc: String(params.startIsoUtc ?? params.date ?? new Date().toISOString()),
          timeScale: Number(params.timeScale ?? params.speed ?? 3600),
          ...(typeof params.stopIsoUtc === "string" ? { stopIsoUtc: params.stopIsoUtc } : {})
        };
        this.tx.send("clock.config", cfg);
        return true;
      }

      /** @type {ClockControl} */
      const ctl = {
        action: mapClockAction(kind),
        ...(Number.isFinite(params.value) ? { value: Number(params.value) } : {}),
        ...(!Number.isFinite(params.value) && Number.isFinite(params.timeScale) ? { value: Number(params.timeScale) } : {}),
        ...(!Number.isFinite(params.value) && !Number.isFinite(params.timeScale) && Number.isFinite(params.speed)
          ? { value: Number(params.speed) }
          : {}),
        ...(typeof params.timeIsoUtc === "string" ? { timeIsoUtc: params.timeIsoUtc } : {}),
        ...(typeof params.stopIsoUtc === "string" ? { stopIsoUtc: params.stopIsoUtc } : {})
      };
      this.tx.send("clock.control", ctl);
      return true;
    }

    if (kind.startsWith("solar.") || kind.startsWith("visual.")) {
      this.tx.send("solar.command", payload);
      if (kind === "solar.radius" || kind === "visual.radius") {
        /** @type {CameraCommand} */
        const cam = {
          kind: "camera.radius-scale",
          params: {
            sunMultiplier: params?.sunMultiplier,
            planetMultiplier: params?.planetMultiplier
          }
        };
        this.tx.send("render.camera", cam);
      }
      return true;
    }

    if (kind.startsWith("camera.")) {
      /** @type {CameraCommand} */
      const cam = { kind: payload.kind, params };
      this.tx.send("render.camera", cam);
      return true;
    }

    if (kind.startsWith("render.") || kind.startsWith("layout.")) {
      /** @type {RenderCommand} */
      const render = { kind: payload.kind, params };
      this.tx.send("render.view", render);
      return true;
    }

    if (kind.startsWith("chart.")) {
      /** @type {ChartCommand} */
      const chart = { kind: payload.kind, params };
      this.tx.send("chart.command", chart);
      return true;
    }

    if (kind.startsWith("ui.") || kind.startsWith("panel.")) {
      if (kind === "ui.panel" || kind === "panel.show") {
        /** @type {UiPanelCommand} */
        const panel = {
          panel: String(params.panel ?? "settings"),
          visible: params.visible !== false
        };
        this.tx.send("ui.panel", panel);
        return true;
      }
      /** @type {RenderCommand} */
      const render = { kind: payload.kind, params };
      this.tx.send("render.view", render);
      return true;
    }

    return false;
  }

  /**
   * Receives a normalized command from UI nodes for routing.
   * @param {CommandEnvelope} payload
   */
  onUiCommand(payload) {
    const handled = this._routeCommand(payload);
    if (!handled) {
      console.warn(`Unknown command: ${payload?.kind ?? "(missing kind)"}`);
    }
  }
}

export function createCommandRouter(tx, sx) {
  return new CommandRouterNode(tx, sx);
}

function mapClockAction(kind) {
  if (kind === "clock.pause" || kind === "simulation.pause") return "pause";
  if (kind === "clock.resume" || kind === "simulation.resume") return "resume";
  if (kind === "clock.speed" || kind === "simulation.speed" || kind === "simulation.set-speed") return "set-speed";
  if (kind === "clock.set-stop-time" || kind === "simulation.set-stop-time") return "set-stop-time";
  if (kind === "clock.clear-stop-time" || kind === "simulation.clear-stop-time") return "clear-stop-time";
  return kind.replace(/^clock\./, "").replace(/^simulation\./, "");
}
