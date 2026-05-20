import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import helvetikerFont from "three/examples/fonts/helvetiker_regular.typeface.json";

const POSITION_SCALE = 14;
const AXIS_LOCAL = new THREE.Vector3(0, 1, 0);
const AXIS_FALLBACK = new THREE.Vector3(0, 0, 1);
const DEFAULT_CAMERA_NEAR = 0.01;
const FOLLOW_CAMERA_NEAR = 0.0001;
const CAMERA_FAR = 5000;

/**
 * @node Renderer
 */
class RendererNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx ?? {};
    this.layout = { fullScreen: true, overlays: {} };
    this.cameraState = {
      cameraId: "default",
      mode: "orbit",
      state: {
        positionAu: { x: 1, y: 0, z: 0.2 },
        targetAu: { x: 0, y: 0, z: 0 }
      }
    };
    this.visualState = {
      bodies: [],
      visualScale: 1500,
      labelsVisible: true,
      sunRadiusMultiplier: 10,
      planetRadiusMultiplier: 200,
      moonOrbitRadiusMultiplier: 20
    };
    this.host = null;
    this.infoEl = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.ambientLight = null;
    this.sunLight = null;
    this.axesHelper = null;
    this.eclipticGrid = null;
    this.skyGroup = null;
    this.skyRadius = 2500;
    this.skyTextureLoader = null;
    this.starMesh = null;
    this.constellationMesh = null;
    this.starTextureUrl = "";
    this.constellationTextureUrl = "";
    this.showStars = false;
    this.showConstellations = false;
    this.bodyVisuals = new Map();
    this.textFont = null;
    this.bodyTextureDefs = [];
    this.bodyTextures = new Map();
    this._animating = false;
    this._lastFollowCameraId = null;
    this._lastFollowAuthPos = null;

    this._initThree();
  }

  _initThree() {
    if (typeof document === "undefined") return;
    if (this.renderer) return;

    this.host = document.createElement("div");
    this.host.className = "vmblu-solar-renderer";
    Object.assign(this.host.style, {
      position: "fixed",
      inset: "0",
      overflow: "hidden",
      zIndex: "0"
    });
    document.body.appendChild(this.host);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#02040b");

    this.camera = new THREE.PerspectiveCamera(55, 1, DEFAULT_CAMERA_NEAR, CAMERA_FAR);
    // Use Z-up so the ecliptic (XY plane) starts as the horizontal reference plane.
    this.camera.up.set(0, 0, 1);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio((typeof window !== "undefined" && window.devicePixelRatio) || 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.host.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.065;
    this.controls.screenSpacePanning = true;
    this.controls.minDistance = 2;
    this.controls.maxDistance = 4000;

    this.ambientLight = new THREE.AmbientLight(0x404040, 1.35);
    this.sunLight = new THREE.PointLight(0xffe7aa, 180, 0, 2);
    this.scene.add(this.ambientLight);
    this.scene.add(this.sunLight);
    this.axesHelper = new THREE.AxesHelper(POSITION_SCALE * 2.5);
    this.scene.add(this.axesHelper);
    this.eclipticGrid = createEclipticGrid();
    this.scene.add(this.eclipticGrid);
    this.skyTextureLoader = new THREE.TextureLoader();

    this.infoEl = document.createElement("div");
    Object.assign(this.infoEl.style, {
      position: "absolute",
      top: "8px",
      left: "8px",
      color: "#c6d6ff",
      font: "12px monospace",
      background: "rgba(0,0,0,0.35)",
      padding: "4px 6px",
      borderRadius: "4px",
      pointerEvents: "none"
    });
    this.host.appendChild(this.infoEl);

    const onResize = () => this._resize();
    this._resize();
    if (typeof window !== "undefined") window.addEventListener("resize", onResize);

    this._applyCamera();
    this._syncBodyMeshes();
    this._initFont();
    this._startRenderLoop();
  }

  _initFont() {
    if (this.textFont) return;
    const loader = new FontLoader();
    this.textFont = loader.parse(helvetikerFont);
    this._syncBodyMeshes();
  }

  _syncBodyTextures(textureDefs) {
    const defs = Array.isArray(textureDefs) ? textureDefs.map(normalizeTextureDef).filter(Boolean) : [];
    this.bodyTextureDefs = defs;
    if (!defs.length) {
      this.bodyTextures.clear();
      this._updateViewDependentVisuals();
      return;
    }

    const loader = new THREE.TextureLoader();
    const maxAnisotropy = Math.min(8, this.renderer?.capabilities?.getMaxAnisotropy?.() ?? 1);
    const activeKeys = new Set();

    for (const def of defs) {
      const key = textureDefKey(def);
      activeKeys.add(key);
      if (this.bodyTextures.has(key)) continue;

      const texture = loader.load(def.url, (loaded) => {
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.anisotropy = maxAnisotropy;
        this._updateViewDependentVisuals();
      });
      texture.colorSpace = THREE.SRGBColorSpace;
      this.bodyTextures.set(key, texture);
    }

    for (const [key, texture] of this.bodyTextures.entries()) {
      if (activeKeys.has(key)) continue;
      texture.dispose?.();
      this.bodyTextures.delete(key);
    }
    this._updateViewDependentVisuals();
  }

  _resize() {
    if (!this.renderer || !this.camera || !this.host) return;
    const w = Math.max(1, this.host.clientWidth);
    const h = Math.max(1, this.host.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  _startRenderLoop() {
    if (this._animating || typeof requestAnimationFrame === "undefined") return;
    this._animating = true;
    const tick = () => {
      if (!this._animating || !this.renderer || !this.scene || !this.camera) return;
      this.controls?.update();
      this._updateViewDependentVisuals();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  _applyCamera() {
    if (!this.camera) return;
    const pos = this.cameraState?.state?.positionAu ?? { x: 1, y: 0, z: 0.2 };
    const target = this.cameraState?.state?.targetAu ?? { x: 0, y: 0, z: 0 };
    const nextPos = new THREE.Vector3(pos.x * POSITION_SCALE, pos.y * POSITION_SCALE, pos.z * POSITION_SCALE);
    const nextTarget = new THREE.Vector3(target.x * POSITION_SCALE, target.y * POSITION_SCALE, target.z * POSITION_SCALE);
    const isFollowMode = this.cameraState?.mode === "body-follow";
    if (this.controls) {
      this.controls.object.up.set(0, 0, 1);
      if (isFollowMode && this._lastFollowCameraId === this.cameraState?.cameraId) {
        const authBase = this._lastFollowAuthPos ?? nextPos;
        const currentOffset = this.camera.position.clone().sub(authBase);
        this.camera.position.copy(nextPos.clone().add(currentOffset));
      } else {
        this.camera.position.copy(nextPos);
      }
      this.controls.target.copy(nextTarget);
      this.controls.update();
    } else {
      this.camera.position.copy(nextPos);
      this.camera.lookAt(nextTarget);
    }
    if (isFollowMode) {
      this._lastFollowCameraId = this.cameraState?.cameraId ?? null;
      this._lastFollowAuthPos = nextPos.clone();
    } else {
      this._lastFollowCameraId = null;
      this._lastFollowAuthPos = null;
    }
    this._updateControlLimits();
    this._updateCameraClipping();
  }

  _updateCameraClipping() {
    if (!this.camera) return;
    const nextNear = this.cameraState?.mode === "body-follow" ? FOLLOW_CAMERA_NEAR : DEFAULT_CAMERA_NEAR;
    if (Math.abs(this.camera.near - nextNear) <= 1e-12 && Math.abs(this.camera.far - CAMERA_FAR) <= 1e-9) return;
    this.camera.near = nextNear;
    this.camera.far = CAMERA_FAR;
    this.camera.updateProjectionMatrix();
  }

  _updateControlLimits() {
    if (!this.controls) return;

    if (this.cameraState?.mode !== "body-follow") {
      this.controls.minDistance = 2;
      this.controls.maxDistance = 4000;
      return;
    }

    const target = this.controls.target;
    const nearestVisual = Array.from(this.bodyVisuals.values())
      .map((visual) => ({
        visual,
        distance: visual.root.position.distanceTo(target)
      }))
      .sort((a, b) => a.distance - b.distance)[0]?.visual;

    const radius = nearestVisual?.sphere?.scale?.x ?? 0;
    this.controls.minDistance = Math.max(0.002, radius * 0.9);
    this.controls.maxDistance = 4000;
  }

  _ensureVisual(body) {
    const key = String(body.id ?? body.name);
    let visual = this.bodyVisuals.get(key);
    if (visual) return visual;

    const sphereGeometry = new THREE.SphereGeometry(1, 24, 24);
    const bodyVisual = body?.visual ?? {};
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(bodyVisual.color ?? "#c8d2ea"),
      emissive: new THREE.Color(bodyVisual.emissive ?? "#000000"),
      emissiveIntensity: Number(bodyVisual.emissiveIntensity ?? 0) || 0
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    const markerGeometry = new THREE.BufferGeometry();
    markerGeometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
    const markerMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(bodyVisual.color ?? "#c8d2ea"),
      size: Number(bodyVisual.markerSize ?? 4) || 4,
      sizeAttenuation: false
    });
    const marker = new THREE.Points(markerGeometry, markerMaterial);

    const lod = new THREE.LOD();
    lod.addLevel(sphere, 0);
    lod.addLevel(marker, 120);

    const root = new THREE.Object3D();
    root.name = key;
    root.add(lod);

    visual = {
      root,
      lod,
      sphere,
      marker,
      sphereGeometry,
      sphereMaterial,
      markerGeometry,
      markerMaterial,
      label: null,
      labelPivot: null
    };
    this.bodyVisuals.set(key, visual);
    this.scene?.add(root);
    return visual;
  }

  _syncBodyMeshes() {
    if (!this.scene) return;
    const bodies = Array.isArray(this.visualState.bodies) ? this.visualState.bodies : [];
    const bodyById = new Map(bodies.map((body) => [String(body.id ?? body.name), body]));
    const displayPositions = new Map();
    const active = new Set();

    for (const body of bodies) {
      const key = String(body.id ?? body.name);
      const visual = this._ensureVisual(body);
      active.add(key);

      const displayPos = this._displayPositionForBody(body, bodyById, displayPositions);
      visual.root.position.copy(displayPos);
      visual.sphere.rotation.y = Number(body.rotationRad ?? 0);

      this._applyBodyVisualStyle(visual, body);

      if (body?.visual?.lightSource === true && this.sunLight) {
        this.sunLight.position.copy(visual.root.position);
      }

      const radiusScene = this._scaledBodyRadius(body);
      visual.sphere.scale.setScalar(Math.max(1e-7, radiusScene));
      this._applyBodySpinOrientation(visual, body);
      this._updatePlanetLabel(visual, body, radiusScene);

      const switchDistance = lodSwitchDistance(radiusScene, body);
      if (visual.lod.levels?.[1]) {
        visual.lod.levels[1].distance = switchDistance;
      }
      visual.root.visible = true;
    }

    for (const [key, visual] of this.bodyVisuals.entries()) {
      if (!active.has(key)) {
        this.scene.remove(visual.root);
        visual.sphereGeometry.dispose();
        visual.sphereMaterial.dispose();
        visual.markerGeometry.dispose();
        visual.markerMaterial.dispose();
        if (visual.label) {
          visual.label.geometry.dispose();
          visual.label.material.dispose();
        }
        this.bodyVisuals.delete(key);
      }
    }

    if (this.infoEl) {
      this.infoEl.textContent = `THREE.js | camera=${this.cameraState?.cameraId ?? "default"} | bodies=${bodies.length}`;
    }
  }

  _displayPositionForBody(body, bodyById, displayPositions) {
    const key = String(body.id ?? body.name);
    const cached = displayPositions.get(key);
    if (cached) return cached;

    const physicalPos = vecAuToScene(body.positionAu);
    const parentId = String(body.parentId ?? "");
    if (!parentId) {
      displayPositions.set(key, physicalPos);
      return physicalPos;
    }

    const parent = bodyById.get(parentId);
    if (!parent) {
      displayPositions.set(key, physicalPos);
      return physicalPos;
    }

    const parentPos = this._displayPositionForBody(parent, bodyById, displayPositions);
    const parentPhysicalPos = vecAuToScene(parent.positionAu);
    const relative = physicalPos.clone().sub(parentPhysicalPos);
    if (relative.lengthSq() <= 1e-18) {
      const fallback = parentPos.clone();
      displayPositions.set(key, fallback);
      return fallback;
    }

    const orbitScale = isMoonBody(body)
      ? Math.max(1, Number(this.visualState.moonOrbitRadiusMultiplier ?? this.visualState.planetRadiusMultiplier ?? 1))
      : 1;
    const displayPos = parentPos.clone().add(relative.multiplyScalar(orbitScale));
    displayPositions.set(key, displayPos);
    return displayPos;
  }

  _applyPatch(patch) {
    if (!patch || typeof patch !== "object") return;
    if (patch.kind === "sky.settings") {
      this._applySkySettings(patch.payload ?? {});
      return;
    }
    if (patch.kind === "solar.body-poses") {
      const payload = patch.payload ?? {};
      this.visualState = {
        ...this.visualState,
        bodies: Array.isArray(payload.bodies) ? payload.bodies : [],
        visualScale: Number(payload.visualScale ?? this.visualState.visualScale) || this.visualState.visualScale,
        labelsVisible: !!payload.labelsVisible,
        sunRadiusMultiplier:
          Number(payload.sunRadiusMultiplier ?? this.visualState.sunRadiusMultiplier) || this.visualState.sunRadiusMultiplier,
        planetRadiusMultiplier:
          Number(payload.planetRadiusMultiplier ?? this.visualState.planetRadiusMultiplier) || this.visualState.planetRadiusMultiplier,
        moonOrbitRadiusMultiplier:
          Number(payload.moonOrbitRadiusMultiplier ?? this.visualState.moonOrbitRadiusMultiplier) ||
          this.visualState.moonOrbitRadiusMultiplier
      };
      this._syncBodyMeshes();
      this._updateControlLimits();
      return;
    }
    if (patch.kind === "body.textures") {
      this._syncBodyTextures(patch.payload?.textures);
      return;
    }
    if (patch.kind === "solar.settings") {
      const payload = patch.payload ?? {};
      if (Number.isFinite(payload.visualScale)) this.visualState.visualScale = Number(payload.visualScale);
      if (typeof payload.labelsVisible === "boolean") this.visualState.labelsVisible = payload.labelsVisible;
      if (Number.isFinite(payload.sunRadiusMultiplier) && payload.sunRadiusMultiplier >= 1) {
        this.visualState.sunRadiusMultiplier = Number(payload.sunRadiusMultiplier);
      }
      if (Number.isFinite(payload.planetRadiusMultiplier) && payload.planetRadiusMultiplier >= 1) {
        this.visualState.planetRadiusMultiplier = Number(payload.planetRadiusMultiplier);
      }
      if (Number.isFinite(payload.moonOrbitRadiusMultiplier) && payload.moonOrbitRadiusMultiplier >= 1) {
        this.visualState.moonOrbitRadiusMultiplier = Number(payload.moonOrbitRadiusMultiplier);
      }
      this._syncBodyMeshes();
      this._updateControlLimits();
    }
  }

  _updateViewDependentVisuals() {
    this._syncSkyToCamera();
    for (const def of this.bodyTextureDefs) {
      this._updateBodyTextureUsage(def.ids, this.bodyTextures.get(textureDefKey(def)));
    }
  }

  _applySkySettings(payload) {
    const nextRadius = Number(payload?.radius ?? this.skyRadius);
    const nextStarTextureUrl = String(payload?.starMapUrl ?? this.starTextureUrl);
    const nextConstellationTextureUrl = String(payload?.constellationUrl ?? this.constellationTextureUrl);
    const needsRebuild =
      !this.skyGroup ||
      Math.abs(nextRadius - this.skyRadius) > 1e-6 ||
      nextStarTextureUrl !== this.starTextureUrl ||
      nextConstellationTextureUrl !== this.constellationTextureUrl;

    this.skyRadius = Number.isFinite(nextRadius) && nextRadius > 0 ? nextRadius : this.skyRadius;
    this.starTextureUrl = nextStarTextureUrl;
    this.constellationTextureUrl = nextConstellationTextureUrl;
    this.showStars = payload?.showStars === true;
    this.showConstellations = payload?.showConstellations === true;

    if (needsRebuild) this._rebuildSkySphere();
    this._syncSkyVisibility();
    this._syncSkyToCamera();
  }

  _rebuildSkySphere() {
    this._disposeSkySphere();
    if (!this.scene) return;

    this.skyGroup = new THREE.Group();
    this.skyGroup.quaternion.copy(createCelestialSphereQuaternion());
    this.skyGroup.renderOrder = -10;

    if (this.starTextureUrl) {
      this.starMesh = createSkyMesh(this.skyTextureLoader, this.starTextureUrl, this.skyRadius, false, this.renderer);
      this.skyGroup.add(this.starMesh);
    }
    if (this.constellationTextureUrl) {
      this.constellationMesh = createSkyMesh(
        this.skyTextureLoader,
        this.constellationTextureUrl,
        this.skyRadius * 0.998,
        true,
        this.renderer
      );
      this.skyGroup.add(this.constellationMesh);
    }

    this.scene.add(this.skyGroup);
  }

  _disposeSkySphere() {
    if (this.skyGroup?.parent) this.skyGroup.parent.remove(this.skyGroup);
    disposeSkyMesh(this.starMesh);
    disposeSkyMesh(this.constellationMesh);
    this.skyGroup = null;
    this.starMesh = null;
    this.constellationMesh = null;
  }

  _syncSkyVisibility() {
    if (this.starMesh) this.starMesh.visible = this.showStars;
    if (this.constellationMesh) this.constellationMesh.visible = this.showConstellations;
  }

  _syncSkyToCamera() {
    if (!this.skyGroup || !this.camera) return;
    this.skyGroup.position.copy(this.camera.position);
  }

  _updateBodyTextureUsage(bodyIds, texture) {
    const ids = Array.isArray(bodyIds) ? bodyIds : [bodyIds];
    const visual = ids.map((id) => this.bodyVisuals.get(id)).find(Boolean);
    if (!visual?.sphereMaterial || !this.camera) return;
    const switchDistance = Number(visual.lod?.levels?.[1]?.distance ?? Number.POSITIVE_INFINITY);
    const shouldUseTexture = !!texture && this.camera.position.distanceTo(visual.root.position) <= switchDistance;
    const nextMap = shouldUseTexture ? texture : null;
    const nextEmissiveMap = shouldUseTexture && visual.textureRole === "emissive" ? texture : null;
    if (visual.sphereMaterial.map === nextMap && visual.sphereMaterial.emissiveMap === nextEmissiveMap) return;
    visual.sphereMaterial.map = nextMap;
    visual.sphereMaterial.emissiveMap = nextEmissiveMap;
    visual.sphereMaterial.needsUpdate = true;
  }

  _scaledBodyRadius(body) {
    const id = String(body?.id ?? "").toLowerCase();
    const isSun = id === "sun" || String(body?.name ?? "").toLowerCase() === "sun";
    const sunMul = Math.max(1, Number(this.visualState.sunRadiusMultiplier ?? 1));
    const planetMul = Math.max(1, Number(this.visualState.planetRadiusMultiplier ?? 1));
    const radiusAu = Math.max(0, Number(body?.radiusAu ?? 0));
    const mul = isSun ? sunMul : planetMul;
    // Physical mapping: multiplier 1 means real radius in AU converted to scene units.
    return radiusAu * POSITION_SCALE * mul;
  }

  _updatePlanetLabel(visual, body, radiusScene) {
    if (!isPlanet(body)) {
      if (visual.label) visual.label.visible = false;
      return;
    }
    if (!this.textFont) return;
    const labelText = String(body?.name ?? "");
    const labelStyle = planetLabelStyle(radiusScene);
    const currentStyle = visual.label?.userData?.style;
    const needsLabelRebuild =
      !visual.label ||
      visual.label.userData?.text !== labelText ||
      !currentStyle ||
      Math.abs(currentStyle.size - labelStyle.size) > 1e-6;

    if (needsLabelRebuild) {
      if (visual.label) {
        visual.label.parent?.remove(visual.label);
        visual.label.geometry.dispose();
        visual.label.material.dispose();
      }
      visual.label = createPlanetLabelMesh(labelText, this.textFont, labelStyle);
    }
    if (!visual.labelPivot) {
      visual.labelPivot = new THREE.Object3D();
      visual.root.add(visual.labelPivot);
    }
    if (visual.label.parent !== visual.labelPivot) {
      visual.labelPivot.add(visual.label);
    }
    // Spin with the planet around the same body axis, while staying outside sphere scale.
    visual.labelPivot.quaternion.copy(visual.sphere.quaternion);
    // Attach label at 1.5 radii from center as requested.
    visual.label.position.set(0, 1.5 * Math.max(1e-7, radiusScene), 0);
    visual.label.visible = !!this.visualState.labelsVisible;
  }

  _applyBodySpinOrientation(visual, body) {
    const spin = Number(body?.rotationRad ?? 0);
    const axis = this._readBodySpinAxis(body);
    const qAxis = new THREE.Quaternion().setFromUnitVectors(AXIS_LOCAL, axis);
    const qSpin = new THREE.Quaternion().setFromAxisAngle(AXIS_LOCAL, spin);
    visual.sphere.quaternion.copy(qAxis.multiply(qSpin));
  }

  _readBodySpinAxis(body) {
    const x = Number(body?.spinAxisEcl?.x);
    const y = Number(body?.spinAxisEcl?.y);
    const z = Number(body?.spinAxisEcl?.z);
    const len = Math.hypot(x, y, z);
    if (!Number.isFinite(len) || len <= 1e-9) return AXIS_FALLBACK;
    return new THREE.Vector3(x / len, y / len, z / len);
  }

  _applyBodyVisualStyle(visual, body) {
    const bodyVisual = body?.visual ?? {};
    visual.textureRole = String(bodyVisual.textureRole ?? "surface").toLowerCase();
    if (bodyVisual.color) {
      visual.sphereMaterial.color.set(bodyVisual.color);
      visual.markerMaterial.color.set(bodyVisual.color);
    }
    if (bodyVisual.emissive) visual.sphereMaterial.emissive.set(bodyVisual.emissive);
    if (Number.isFinite(bodyVisual.emissiveIntensity)) {
      visual.sphereMaterial.emissiveIntensity = Number(bodyVisual.emissiveIntensity);
    }
    if (Number.isFinite(bodyVisual.markerSize)) {
      visual.markerMaterial.size = Number(bodyVisual.markerSize);
    }
  }

  /**
   * Applies incoming scene patch batches to the renderer scene.
   * @param {ScenePatchList} payload
   */
  onRenderScenePatches(payload) {
    if (!Array.isArray(payload)) return;
    for (const patch of payload) this._applyPatch(patch);
  }

  /**
   * Receives layout state updates that affect canvas size or overlays.
   * @param {LayoutState} payload
   */
  onRenderLayout(payload) {
    this.layout = payload ?? this.layout;
    const lighting = this.layout?.overlays?.rendererLighting;
    if (lighting && this.ambientLight && this.sunLight) {
      if (Number.isFinite(lighting.ambientIntensity)) this.ambientLight.intensity = Number(lighting.ambientIntensity);
      if (Number.isFinite(lighting.sunIntensity)) this.sunLight.intensity = Number(lighting.sunIntensity);
    }
    const helpers = this.layout?.overlays?.rendererHelpers;
    if (helpers) {
      if (this.eclipticGrid) this.eclipticGrid.visible = helpers.showEcliptic !== false;
      if (this.axesHelper) this.axesHelper.visible = helpers.showAxes !== false;
    }
    this._resize();
  }

  /**
   * Receives the active camera state used by the render loop.
   * @param {CameraState} payload
   */
  onRenderCamera(payload) {
    this.cameraState = payload ?? this.cameraState;
    this._applyCamera();
  }
}

export function createRenderer(tx, sx) {
  return new RendererNode(tx, sx);
}

function createEclipticGrid() {
  // 1 AU cell size, extending to +/-50 AU around origin.
  const size = POSITION_SCALE * 100;
  const divisions = 100;
  const grid = new THREE.GridHelper(size, divisions, 0x4b5f8a, 0x2c3650);
  // Default GridHelper is XZ plane (Y up); rotate so grid lies in XY (Z is up).
  grid.rotation.x = Math.PI / 2;
  const mats = Array.isArray(grid.material) ? grid.material : [grid.material];
  for (const mat of mats) {
    mat.opacity = 0.35;
    mat.transparent = true;
    mat.depthWrite = false;
  }
  grid.renderOrder = -1;
  return grid;
}

function lodSwitchDistance(radiusScene, body) {
  const id = String(body?.id ?? "").toLowerCase();
  if (id === "sun") return Number.POSITIVE_INFINITY;
  const r = Math.max(1e-7, radiusScene);
  // Larger bodies keep sphere LOD farther away; tiny bodies switch to markers sooner.
  return Math.min(3000, Math.max(5, 40 + r * 12000));
}

function isPlanet(body) {
  const id = String(body?.id ?? "").toLowerCase();
  if (!id) return false;
  if (id === "sun") return false;
  return !id.includes("/");
}

function isMoonBody(body) {
  const id = String(body?.id ?? "").toLowerCase();
  return id.includes("/");
}

function normalizeTextureDef(def) {
  const ids = Array.isArray(def?.ids) ? def.ids.map((id) => String(id).trim()).filter(Boolean) : [];
  const url = String(def?.url ?? "").trim();
  if (!ids.length || !url) return null;
  return { ids, url };
}

function textureDefKey(def) {
  return `${def.ids.join("|")}::${def.url}`;
}

function vecAuToScene(v) {
  return new THREE.Vector3(
    Number(v?.x ?? 0) * POSITION_SCALE,
    Number(v?.y ?? 0) * POSITION_SCALE,
    Number(v?.z ?? 0) * POSITION_SCALE
  );
}

function createPlanetLabelMesh(text, font, style) {
  const shapes = font.generateShapes(text, style.size, 6);
  const geometry = new THREE.ShapeGeometry(shapes, 6);
  geometry.computeBoundingBox();
  const bb = geometry.boundingBox;
  if (bb) {
    // Anchor at left-middle so the first letter connects to the planet axis like a flag.
    const midY = (bb.min.y + bb.max.y) * 0.5;
    geometry.translate(-bb.min.x, -midY, -bb.min.z);
  }
  const material = new THREE.MeshBasicMaterial({
    color: 0xf2f4ff,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.text = text;
  mesh.userData.style = style;
  return mesh;
}

function planetLabelStyle(radiusScene) {
  const r = Math.max(1e-7, Number(radiusScene) || 0);
  // Flat labels: size should keep tracking the scaled planet radius.
  const size = Math.max(0.01, r * 0.6);
  return { size };
}

function createSkyMesh(loader, url, radius, transparent, renderer) {
  const geometry = new THREE.SphereGeometry(radius, 64, 64);
  const texture = loader.load(url, (loaded) => {
    loaded.colorSpace = THREE.SRGBColorSpace;
    loaded.anisotropy = Math.min(8, renderer?.capabilities?.getMaxAnisotropy?.() ?? 1);
    loaded.minFilter = THREE.LinearFilter;
    loaded.magFilter = THREE.LinearFilter;
    loaded.generateMipmaps = false;
  });
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = -1;
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.BackSide,
    transparent,
    depthWrite: false,
    toneMapped: false
  });
  return new THREE.Mesh(geometry, material);
}

function disposeSkyMesh(mesh) {
  if (!mesh) return;
  mesh.parent?.remove(mesh);
  mesh.geometry?.dispose?.();
  mesh.material?.map?.dispose?.();
  mesh.material?.dispose?.();
}

function createCelestialSphereQuaternion() {
  const obliquityAngle = THREE.MathUtils.degToRad(23.44);
  const initialRotationQuaternion = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    Math.PI / 2
  );
  const tiltQuaternion = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(1, 0, 0),
    -obliquityAngle
  );
  return new THREE.Quaternion()
    .multiply(initialRotationQuaternion)
    .multiply(tiltQuaternion);
}

