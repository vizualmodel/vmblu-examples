import { orbitalData } from "./orbital-data.js";

const KM_PER_AU = 149597870.7;
const TWO_PI = Math.PI * 2;
const OBLIQUITY_RAD = 23.4392911 * (Math.PI / 180);

/**
 * @node EphemerisEngine
 */
class EphemerisEngineNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx ?? {};
    this._catalog = buildCatalog(orbitalData);
    this._emitCatalogScheduled = false;
    this._lastTick = null;

    this._scheduleCatalogEmit();
  }

  _scheduleCatalogEmit() {
    if (this._emitCatalogScheduled) return;
    this._emitCatalogScheduled = true;
    setTimeout(() => {
      this._emitCatalogScheduled = false;
      /** @type {BodyCatalog} */
      const payload = this._catalog;
      this.tx.send("orb.body-catalog", payload);
    }, 0);
  }

  _emitBodyPoses(simJulianDay) {
    /** @type {BodyPoseList} */
    const poses = computeAllPoses(orbitalData, simJulianDay);
    this.tx.send("orb.body-poses", poses);
  }

  /**
   * Receives simulation ticks used to update local state.
   * @param {SimulationTick} payload
   */
  onSimTick(payload) {
    this._lastTick = payload ?? null;
    const jd = Number(payload?.simJulianDay);
    if (!Number.isFinite(jd)) return;
    this._emitBodyPoses(jd);
  }

  /**
   * Receives solar-system related commands such as scaling, labels, or scene options.
   * @param {CommandEnvelope} payload
   */
  onSolarCommand(payload) {
    const kind = String(payload?.kind ?? "").toLowerCase();
    if (kind === "solar.refresh-catalog" || kind === "refresh-catalog") {
      this._scheduleCatalogEmit();
      return;
    }
    if ((kind === "solar.refresh-poses" || kind === "refresh-poses") && Number.isFinite(this._lastTick?.simJulianDay)) {
      this._emitBodyPoses(this._lastTick.simJulianDay);
    }
  }
}

export function createEphemerisEngine(tx, sx) {
  return new EphemerisEngineNode(tx, sx);
}

function buildCatalog(data) {
  const catalog = [
    {
      id: "sun",
      name: data.Sun.name,
      parentId: null,
      kind: "star"
    }
  ];

  for (const planet of data.planets || []) {
    const planetId = toId(planet.name);
    catalog.push({
      id: planetId,
      name: planet.name,
      parentId: "sun",
      kind: "planet"
    });
    for (const moon of planet.moons || []) {
      catalog.push({
        id: `${planetId}/${toId(moon.name)}`,
        name: moon.name,
        parentId: planetId,
        kind: "moon"
      });
    }
  }
  return catalog;
}

function computeAllPoses(data, jd) {
  const poses = [];

  poses.push({
    id: "sun",
    name: data.Sun.name,
    parentId: null,
    positionAu: { x: 0, y: 0, z: 0 },
    radiusAu: kmToAu(data.Sun.radius ?? 0),
    spinAxisEcl: spinAxisEcliptic(data.Sun),
    rotationRad: spinRotationRad(data.Sun, jd)
  });

  for (const planet of data.planets || []) {
    const planetId = toId(planet.name);
    const planetPos = orbitalPositionAu(planet.orbit, jd);
    poses.push({
      id: planetId,
      name: planet.name,
      parentId: "sun",
      positionAu: planetPos,
      radiusAu: kmToAu(planet.radius ?? 0),
      spinAxisEcl: spinAxisEcliptic(planet),
      rotationRad: spinRotationRad(planet, jd)
    });

    for (const moon of planet.moons || []) {
      const moonRelAu = orbitalPositionAu(moon.orbit, jd);
      poses.push({
        id: `${planetId}/${toId(moon.name)}`,
        name: moon.name,
        parentId: planetId,
        positionAu: addVec3(planetPos, moonRelAu),
        radiusAu: kmToAu(moon.radius ?? 0),
        spinAxisEcl: spinAxisEcliptic(moon),
        rotationRad: spinRotationRad(moon, jd)
      });
    }
  }

  return poses;
}

function orbitalPositionAu(orbit, jd) {
  if (!orbit) return { x: 0, y: 0, z: 0 };

  const a = Number(orbit.semi_major_axis ?? 0) / KM_PER_AU;
  const e = Number(orbit.eccentricity ?? 0);
  const inc = degToRad(orbit.inclination ?? 0);
  const omega = degToRad(orbit.argument_of_periapsis ?? 0);
  const node = degToRad(orbit.longitude_of_ascending_node ?? 0);
  const epoch = Number(orbit.epoch ?? 2451545.0);
  const periodDays = Number(orbit.orbital_period ?? 1);

  if (!Number.isFinite(a) || a <= 0 || !Number.isFinite(periodDays) || periodDays <= 0) {
    return { x: 0, y: 0, z: 0 };
  }

  const meanMotion = TWO_PI / periodDays;
  const m0 = degToRad(orbit.mean_anomaly ?? 0);
  const m = normalizeAngle(m0 + meanMotion * (jd - epoch));
  const E = solveKepler(m, e);

  const cosE = Math.cos(E);
  const sinE = Math.sin(E);
  const r = a * (1 - e * cosE);
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const arg = omega + nu;

  const cosNode = Math.cos(node);
  const sinNode = Math.sin(node);
  const cosArg = Math.cos(arg);
  const sinArg = Math.sin(arg);
  const cosInc = Math.cos(inc);
  const sinInc = Math.sin(inc);

  return {
    x: r * (cosNode * cosArg - sinNode * sinArg * cosInc),
    y: r * (sinNode * cosArg + cosNode * sinArg * cosInc),
    z: r * (sinArg * sinInc)
  };
}

function solveKepler(M, e) {
  let E = e < 0.8 ? M : Math.PI;
  for (let i = 0; i < 12; i++) {
    const f = E - e * Math.sin(E) - M;
    const fp = 1 - e * Math.cos(E);
    if (Math.abs(fp) < 1e-12) break;
    const next = E - f / fp;
    if (Math.abs(next - E) < 1e-10) return normalizeAngle(next);
    E = next;
  }
  return normalizeAngle(E);
}

function spinRotationRad(body, jd) {
  const periodSec = Number(body?.rotation_axis?.rotation_period);
  if (!Number.isFinite(periodSec) || periodSec <= 0) return 0;
  const epoch = Number(body?.orbit?.epoch ?? 2451545.0);
  const elapsedSec = (jd - epoch) * 86400;
  return normalizeAngle((elapsedSec / periodSec) * TWO_PI);
}

function spinAxisEcliptic(body) {
  const raDeg = Number(body?.rotation_axis?.ra);
  const decDeg = Number(body?.rotation_axis?.dec);
  if (Number.isFinite(raDeg) && Number.isFinite(decDeg)) {
    const ra = degToRad(raDeg);
    const dec = degToRad(decDeg);

    // J2000 equatorial unit vector from right ascension / declination.
    const xEq = Math.cos(dec) * Math.cos(ra);
    const yEq = Math.cos(dec) * Math.sin(ra);
    const zEq = Math.sin(dec);

    // Convert equatorial -> ecliptic frame by rotating around X.
    const x = xEq;
    const y = yEq * Math.cos(OBLIQUITY_RAD) + zEq * Math.sin(OBLIQUITY_RAD);
    const z = -yEq * Math.sin(OBLIQUITY_RAD) + zEq * Math.cos(OBLIQUITY_RAD);
    return normalizeVec3({ x, y, z });
  }

  const tiltDeg = Number(body?.rotation_axis?.axial_tilt ?? 0);
  const tilt = degToRad(tiltDeg);
  return normalizeVec3({ x: 0, y: Math.sin(tilt), z: Math.cos(tilt) });
}

function addVec3(a, b) {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function normalizeVec3(v) {
  const x = Number(v?.x ?? 0);
  const y = Number(v?.y ?? 0);
  const z = Number(v?.z ?? 0);
  const len = Math.hypot(x, y, z);
  if (!Number.isFinite(len) || len <= 1e-12) return { x: 0, y: 0, z: 1 };
  return { x: x / len, y: y / len, z: z / len };
}

function kmToAu(km) {
  return Number(km ?? 0) / KM_PER_AU;
}

function degToRad(deg) {
  return Number(deg ?? 0) * (Math.PI / 180);
}

function normalizeAngle(rad) {
  const x = rad % TWO_PI;
  return x < 0 ? x + TWO_PI : x;
}

function toId(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
