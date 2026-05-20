/**
 * @node CameraManager
 */
const KM_PER_AU = 149597870.7;
const CAMERA_VERTICAL_FOV_DEG = 55;
const FOLLOW_BODY_SCREEN_FRACTION = 0.28;

class CameraManagerNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx ?? {};
    this.layout = { width: 1, height: 1 };
    this.bodyPoses = [];
    this.sunRadiusMultiplier = Math.max(1, Number(this.sx.sunRadiusMultiplier ?? 10));
    this.planetRadiusMultiplier = Math.max(1, Number(this.sx.planetRadiusMultiplier ?? 200));
    this.cameraRegistry = new Map();
    this.defaultCameraState = normalizeCameraState(this.sx.defaultCameraState, {
      positionAu: { x: 1, y: 0, z: 0.2 },
      targetAu: { x: 0, y: 0, z: 0 }
    });
    this.activeCamera = {
      cameraId: "default",
      mode: "orbit",
      state: this._defaultCameraState()
    };
    this._rememberCamera(this.activeCamera);
    this._registerStartupCameras(this.sx.startupCameras);
    this._applyInitialActiveCamera(this.sx.activeCameraId);
    this._emitCamera();
  }

  _applyInitialActiveCamera(cameraId) {
    const id = String(cameraId ?? "").trim();
    if (!id || id === "default") return;
    const entry = this.cameraRegistry.get(id);
    if (!entry?.snapshot) return;
    this.activeCamera = cloneCamera(entry.snapshot);
  }

  _registerStartupCameras(items) {
    if (!Array.isArray(items)) return;
    for (const raw of items) {
      const camera = this._normalizeStartupCamera(raw);
      if (camera) this._rememberCamera(camera);
    }
  }

  _normalizeStartupCamera(raw) {
    if (!raw || typeof raw !== "object") return null;
    const cameraId = String(raw.cameraId ?? "").trim();
    if (!cameraId || cameraId === "default") return null;
    const mode = String(raw.mode ?? "custom").toLowerCase();

    if (mode === "body-follow") {
      const followBodyId = String(raw.followBodyId ?? raw.bodyId ?? "").toLowerCase();
      if (!followBodyId) return null;
      const targetBodyId = String(raw.targetBodyId ?? followBodyId).toLowerCase() || followBodyId;
      const distanceKm = Number(raw.distanceKm);
      return {
        cameraId,
        label: raw.label ? String(raw.label) : undefined,
        mode: "body-follow",
        state: {
          followBodyId,
          targetBodyId,
          distanceAu: Number.isFinite(distanceKm) && distanceKm > 0 ? distanceKm / KM_PER_AU : null,
          offsetAu: {
            x: Number(raw.offsetAu?.x ?? raw.dx ?? 0.5),
            y: Number(raw.offsetAu?.y ?? raw.dy ?? 0.5),
            z: Number(raw.offsetAu?.z ?? raw.dz ?? 0.3)
          }
        }
      };
    }

    if (mode === "body-target") {
      const bodyId = String(raw.bodyId ?? "").toLowerCase();
      const body = this._findBody(bodyId);
      if (!body) return null;
      const camera = this._makeStaticBodyCamera(body, raw);
      camera.cameraId = cameraId;
      if (raw.label) camera.label = String(raw.label);
      return camera;
    }

    const positionAu = raw.positionAu && typeof raw.positionAu === "object" ? raw.positionAu : null;
    const targetAu = raw.targetAu && typeof raw.targetAu === "object" ? raw.targetAu : null;
    return {
      cameraId,
      label: raw.label ? String(raw.label) : undefined,
      mode,
      state: {
        positionAu: positionAu ?? this._defaultCameraState().positionAu,
        targetAu: targetAu ?? this._defaultCameraState().targetAu
      }
    };
  }

  _findBody(bodyId) {
    const needle = String(bodyId ?? "").toLowerCase();
    if (!needle) return null;
    return this.bodyPoses.find((p) => String(p.id).toLowerCase() === needle || String(p.name).toLowerCase() === needle) ?? null;
  }

  _defaultCameraState() {
    return cloneJson(this.defaultCameraState);
  }

  _makeStaticBodyCamera(body, params) {
    const target = body.positionAu ?? { x: 0, y: 0, z: 0 };
    return {
      cameraId: `body-${body.id}`,
      mode: "body-target",
      state: {
        positionAu: {
          x: target.x + Number(params?.dx ?? 0.5),
          y: target.y + Number(params?.dy ?? 0.5),
          z: target.z + Number(params?.dz ?? 0.3)
        },
        targetAu: target
      }
    };
  }

  _resolveTrackedCameraState(state) {
    const followBody = this._findBody(state?.followBodyId);
    if (!followBody) return null;

    const followPos = followBody.positionAu ?? { x: 0, y: 0, z: 0 };
    const targetBody = this._findBody(state?.targetBodyId) ?? followBody;
    const targetPos = targetBody.positionAu ?? followPos;
    const dx = followPos.x - targetPos.x;
    const dy = followPos.y - targetPos.y;
    const dz = followPos.z - targetPos.z;
    const length = Math.hypot(dx, dy, dz);

    if (Number.isFinite(state?.distanceAu) && state.distanceAu > 0 && length > 1e-9) {
      const surfaceRadiusAu = this._visibleBodyRadiusAu(followBody);
      const minCenterDistanceAu = surfaceRadiusAu + state.distanceAu;
      const framingDistanceAu = this._followFramingDistanceAu(surfaceRadiusAu);
      const centerDistanceAu = Math.max(minCenterDistanceAu, framingDistanceAu);
      const ux = dx / length;
      const uy = dy / length;
      const uz = dz / length;
      return {
        ...state,
        positionAu: {
          x: followPos.x + ux * centerDistanceAu,
          y: followPos.y + uy * centerDistanceAu,
          z: followPos.z + uz * centerDistanceAu
        },
        targetAu: targetPos
      };
    }

    return {
      ...state,
      positionAu: {
        x: followPos.x + Number(state?.offsetAu?.x ?? 0.5),
        y: followPos.y + Number(state?.offsetAu?.y ?? 0.5),
        z: followPos.z + Number(state?.offsetAu?.z ?? 0.3)
      },
      targetAu: targetPos
    };
  }

  _emitResolvedTrackedCamera() {
    if (this.activeCamera?.mode !== "body-follow") return;
    const nextState = this._resolveTrackedCameraState(this.activeCamera.state);
    if (!nextState) return;
    this.activeCamera = {
      ...this.activeCamera,
      state: nextState
    };
    this._rememberCamera(this.activeCamera);
    this._emitCamera();
  }

  _emitCamera() {
    /** @type {CameraState} */
    const payload = {
      cameraId: this.activeCamera.cameraId,
      mode: this.activeCamera.mode,
      state: this.activeCamera.state,
      availableCameras: Array.from(this.cameraRegistry.values()).map((item) => ({
        cameraId: item.cameraId,
        mode: item.mode,
        label: item.label
      }))
    };
    this.tx.send("camera.active", payload);
  }

  _emitCameraEvent(reason) {
    const state = this.activeCamera?.state ?? {};
    this.tx.send("camera.event", {
      reason: String(reason ?? "changed"),
      cameraId: this.activeCamera?.cameraId ?? null,
      mode: this.activeCamera?.mode ?? null,
      followBodyId: state.followBodyId ?? null,
      targetBodyId: state.targetBodyId ?? null
    });
  }

  _cameraLabel(camera) {
    if (camera?.label) return String(camera.label);
    const id = String(camera?.cameraId ?? "camera");
    if (id === "default") return "Default";
    if (id.startsWith("follow-")) return `Follow ${capitalize(id.slice(7))}`;
    if (id.startsWith("body-")) return `${capitalize(id.slice(5))}`;
    return capitalize(id.replace(/-/g, " "));
  }

  _rememberCamera(camera) {
    if (!camera?.cameraId) return;
    this.cameraRegistry.set(String(camera.cameraId), {
      cameraId: String(camera.cameraId),
      mode: String(camera.mode ?? "custom"),
      label: this._cameraLabel(camera),
      snapshot: cloneCamera(camera)
    });
  }

  _visibleBodyRadiusAu(body) {
    const radiusAu = Math.max(0, Number(body?.radiusAu ?? 0));
    const id = String(body?.id ?? "").toLowerCase();
    const isSun = id === "sun" || String(body?.name ?? "").toLowerCase() === "sun";
    const multiplier = isSun ? this.sunRadiusMultiplier : this.planetRadiusMultiplier;
    return radiusAu * Math.max(1, Number(multiplier) || 1);
  }

  _followFramingDistanceAu(surfaceRadiusAu) {
    const radius = Math.max(0, Number(surfaceRadiusAu) || 0);
    if (radius <= 0) return 0;
    const fovRad = (CAMERA_VERTICAL_FOV_DEG * Math.PI) / 180;
    const angularDiameter = fovRad * FOLLOW_BODY_SCREEN_FRACTION;
    const halfAngle = Math.max(1e-4, angularDiameter * 0.5);
    const sinHalf = Math.sin(halfAngle);
    if (sinHalf <= 1e-6) return radius;
    return radius / sinHalf;
  }

  /**
   * Receives a camera placement or movement command.
   * @param {CameraCommand} payload
   */
  onCameraCommand(payload) {
    const kind = String(payload?.kind ?? "").toLowerCase();
    const params = payload?.params ?? {};

    if (kind === "camera.home" || kind === "camera.reset") {
      this.activeCamera = {
        cameraId: "default",
        mode: "orbit",
        state: this._defaultCameraState()
      };
      this._rememberCamera(this.activeCamera);
      this._emitCamera();
      this._emitCameraEvent("reset");
      return;
    }

    if (kind === "camera.select") {
      const cameraId = String(params?.cameraId ?? "");
      const entry = this.cameraRegistry.get(cameraId);
      if (entry?.snapshot) {
        this.activeCamera = cloneCamera(entry.snapshot);
        if (this.activeCamera.mode === "body-follow") this._emitResolvedTrackedCamera();
        else this._emitCamera();
        this._emitCameraEvent("select");
      }
      return;
    }

    if (kind === "camera.look-at-body") {
      const bodyId = String(params?.bodyId ?? "").toLowerCase();
      const body = this._findBody(bodyId);
      if (body) {
        this.activeCamera = this._makeStaticBodyCamera(body, params);
        this._rememberCamera(this.activeCamera);
        this._emitCamera();
        this._emitCameraEvent("look-at-body");
      }
      return;
    }

    if (kind === "camera.follow-body") {
      const followBodyId = String(params?.bodyId ?? "").toLowerCase();
      if (!followBodyId) return;

      const distanceKm = Number(params?.distanceKm);
      const trackedState = {
        followBodyId,
        targetBodyId: String(params?.targetBodyId ?? params?.bodyId ?? "").toLowerCase() || followBodyId,
        distanceAu: Number.isFinite(distanceKm) && distanceKm > 0 ? distanceKm / KM_PER_AU : null,
        offsetAu: {
          x: Number(params?.dx ?? 0.5),
          y: Number(params?.dy ?? 0.5),
          z: Number(params?.dz ?? 0.3)
        }
      };
      const resolved = this._resolveTrackedCameraState(trackedState);
      if (resolved) {
        this.activeCamera = {
          cameraId: `follow-${followBodyId}`,
          mode: "body-follow",
          state: resolved
        };
        this._rememberCamera(this.activeCamera);
        this._emitCamera();
        this._emitCameraEvent("follow-body");
      }
      return;
    }

    if (kind === "camera.set" && params && typeof params === "object") {
      this.activeCamera = {
        cameraId: String(params.cameraId ?? "custom"),
        mode: String(params.mode ?? "custom"),
        state: {
          positionAu: params.positionAu ?? this.activeCamera.state.positionAu,
          targetAu: params.targetAu ?? this.activeCamera.state.targetAu
        }
      };
      this._rememberCamera(this.activeCamera);
      this._emitCamera();
      this._emitCameraEvent("set");
      return;
    }

    if (kind === "camera.radius-scale") {
      const sunMul = Number(params?.sunMultiplier);
      const planetMul = Number(params?.planetMultiplier);
      if (Number.isFinite(sunMul) && sunMul >= 1) this.sunRadiusMultiplier = sunMul;
      if (Number.isFinite(planetMul) && planetMul >= 1) this.planetRadiusMultiplier = planetMul;
      this._emitResolvedTrackedCamera();
    }
  }

  /**
   * Receives body poses used to resolve body-relative cameras.
   * @param {BodyPoseList} payload
   */
  onCameraBodyPoses(payload) {
    this.bodyPoses = Array.isArray(payload) ? payload : [];
    this._emitResolvedTrackedCamera();
  }

  /**
   * Receives layout updates that can affect camera aspect or controls.
   * @param {LayoutState} payload
   */
  onCameraLayout(payload) {
    const size = payload?.size;
    if (size && Number.isFinite(size.width) && Number.isFinite(size.height)) {
      this.layout = { width: size.width, height: size.height };
    }
  }

  probe(name) {
    if (name === "camera.active") {
      return {
        cameraId: this.activeCamera?.cameraId ?? null,
        mode: this.activeCamera?.mode ?? null,
        state: this.activeCamera?.state ?? null,
        availableCameras: Array.from(this.cameraRegistry.values()).map((item) => ({
          cameraId: item.cameraId,
          mode: item.mode,
          label: item.label
        }))
      };
    }

    if (name === "camera.follow") {
      const state = this.activeCamera?.state ?? {};
      return {
        cameraId: this.activeCamera?.cameraId ?? null,
        mode: this.activeCamera?.mode ?? null,
        followBodyId: state.followBodyId ?? null,
        targetBodyId: state.targetBodyId ?? null,
        isFollowing: this.activeCamera?.mode === "body-follow"
      };
    }

    return null;
  }
}

export function createCameraManager(tx, sx) {
  return new CameraManagerNode(tx, sx);
}

function cloneCamera(camera) {
  return cloneJson(camera);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeCameraState(raw, fallback) {
  const state = raw && typeof raw === "object" ? raw : {};
  return {
    positionAu: {
      x: Number(state.positionAu?.x ?? fallback.positionAu.x),
      y: Number(state.positionAu?.y ?? fallback.positionAu.y),
      z: Number(state.positionAu?.z ?? fallback.positionAu.z)
    },
    targetAu: {
      x: Number(state.targetAu?.x ?? fallback.targetAu.x),
      y: Number(state.targetAu?.y ?? fallback.targetAu.y),
      z: Number(state.targetAu?.z ?? fallback.targetAu.z)
    }
  };
}

function capitalize(value) {
  const s = String(value ?? "");
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}




