/**
 * @node SimulationClock
 */
class SimulationClockNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx ?? {};
    this.tickMs = Number(this.sx.tickMs ?? 50);
    this.timeScale = Number(this.sx.timeScale ?? 86400);
    this.paused = false;
    this._realLastMs = Date.now();
    const nowIso = new Date(this._realLastMs).toISOString();
    this._simTimeMs = parseFlexibleTimeValue(this.sx.startIsoUtc, nowIso) ?? this._realLastMs;
    this._stopTimeMs = parseFlexibleTimeValue(this.sx.stopIsoUtc, new Date(this._simTimeMs).toISOString());

    this._timer = setInterval(() => this._onInterval(), this.tickMs);
    this._emitState();
  }

  _onInterval() {
    const now = Date.now();
    const realDeltaMs = Math.max(0, now - this._realLastMs);
    this._realLastMs = now;

    if (!this.paused) {
      this._simTimeMs += realDeltaMs * this.timeScale;
      if (Number.isFinite(this._stopTimeMs) && this.timeScale >= 0 && this._simTimeMs >= this._stopTimeMs) {
        this._simTimeMs = this._stopTimeMs;
        this.paused = true;
      }
    }

    this._emitState();
    this._emitTick(now, realDeltaMs);
  }

  _emitTick(realTimeMs, realDeltaMs) {
    const simDate = new Date(this._simTimeMs);
    const tick = {
      realTimeMs,
      simTimeIsoUtc: simDate.toISOString(),
      simJulianDay: unixMsToJulianDay(this._simTimeMs),
      deltaSimSeconds: this.paused ? 0 : (realDeltaMs * this.timeScale) / 1000
    };
    /** @type {SimulationTick} */
    const payload = tick;
    this.tx.send("clock.tick", payload);
  }

  _emitState() {
    /** @type {SimulationState} */
    const payload = {
      simTimeIsoUtc: new Date(this._simTimeMs).toISOString(),
      timeScale: this.timeScale,
      paused: this.paused,
      ...(Number.isFinite(this._stopTimeMs) ? { stopTimeIsoUtc: new Date(this._stopTimeMs).toISOString() } : {})
    };
    this.tx.send("clock.state", payload);
  }

  /**
   * Applies a new simulation start time and time scale configuration.
   * @param {ClockConfig} payload
   */
  onClockConfigure(payload) {
    if (payload && typeof payload.startIsoUtc === "string") {
      const parsed = parseFlexibleTimeValue(payload.startIsoUtc, new Date(this._simTimeMs).toISOString());
      if (Number.isFinite(parsed)) this._simTimeMs = parsed;
    }
    if (payload && Number.isFinite(payload.timeScale)) {
      this.timeScale = Number(payload.timeScale);
    }
    this._stopTimeMs = parseFlexibleTimeValue(payload?.stopIsoUtc, new Date(this._simTimeMs).toISOString());
    this._realLastMs = Date.now();
    if (Number.isFinite(this._stopTimeMs) && this._simTimeMs >= this._stopTimeMs) {
      this._simTimeMs = this._stopTimeMs;
      this.paused = true;
    } else {
      this.paused = false;
    }
    this._emitState();
    this._emitTick(this._realLastMs, 0);
  }

  /**
   * Handles clock actions such as pause, resume, and speed changes.
   * @param {ClockControl} payload
   */
  onClockControl(payload) {
    const action = String(payload?.action ?? "").toLowerCase();
    if (!action) return;

    if (action === "pause") {
      this.paused = true;
    } else if (action === "resume") {
      this.paused = false;
    } else if (action === "toggle-pause") {
      this.paused = !this.paused;
    } else if ((action === "set-speed" || action === "speed") && Number.isFinite(payload?.value)) {
      this.timeScale = Number(payload.value);
    } else if ((action === "multiply-speed" || action === "speed-mul") && Number.isFinite(payload?.value)) {
      this.timeScale *= Number(payload.value);
    } else if (action === "set-stop-time") {
      this._stopTimeMs = parseTimeValue(payload);
      if (Number.isFinite(this._stopTimeMs) && this._simTimeMs >= this._stopTimeMs) {
        this._simTimeMs = this._stopTimeMs;
        this.paused = true;
      }
    } else if (action === "clear-stop-time") {
      this._stopTimeMs = null;
    } else if (action === "seek" || action === "set-time") {
      const nextTimeMs = parseTimeValue(payload);
      if (Number.isFinite(nextTimeMs)) {
        this._simTimeMs = nextTimeMs;
      }
    }

    this._realLastMs = Date.now();
    this._emitState();
    this._emitTick(this._realLastMs, 0);
  }

  probe(name) {
    if (name === "simulation.state") {
      return {
        simTimeIsoUtc: new Date(this._simTimeMs).toISOString(),
        simJulianDay: unixMsToJulianDay(this._simTimeMs),
        timeScale: this.timeScale,
        paused: this.paused,
        stopTimeIsoUtc: Number.isFinite(this._stopTimeMs) ? new Date(this._stopTimeMs).toISOString() : null
      };
    }
    return null;
  }
}

export function createSimulationClock(tx, sx) {
  return new SimulationClockNode(tx, sx);
}

function unixMsToJulianDay(ms) {
  return ms / 86400000 + 2440587.5;
}

function parseTimeValue(payload) {
  if (typeof payload?.value === "number" && Number.isFinite(payload.value)) {
    return Number(payload.value);
  }
  return parseFlexibleTimeValue(
    payload?.timeIsoUtc ?? payload?.stopIsoUtc,
    Number.isFinite(payload?.value) ? new Date(Number(payload.value)).toISOString() : null
  );
}

function parseFlexibleTimeValue(value, referenceIso = null) {
  if (typeof value !== "string" || !value.trim()) return null;
  const iso = parseFlexibleDateInput(value, referenceIso);
  if (!iso) return null;
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseFlexibleDateInput(text, referenceIso) {
  const raw = String(text ?? "").trim();
  if (!raw) return null;

  const direct = Date.parse(raw);
  if (Number.isFinite(direct)) return new Date(direct).toISOString();

  const referenceMs = Date.parse(String(referenceIso ?? "")) || Date.now();
  const referenceDate = new Date(referenceMs);

  const timeOnly = raw.match(/^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?\s*(am|pm)?$/i);
  if (timeOnly) {
    const parsed = applyTimeParts(new Date(referenceMs), timeOnly);
    return parsed ? parsed.toISOString() : null;
  }

  const withYear = Date.parse(`${raw} ${referenceDate.getUTCFullYear()}`);
  if (Number.isFinite(withYear)) return new Date(withYear).toISOString();

  const md = raw.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?$/);
  if (md) {
    const year = normalizeYear(md[3], referenceDate.getUTCFullYear());
    const month = Number(md[1]);
    const day = Number(md[2]);
    const candidate = buildUtcDate(
      year,
      month,
      day,
      referenceDate.getUTCHours(),
      referenceDate.getUTCMinutes(),
      referenceDate.getUTCSeconds()
    );
    return candidate ? candidate.toISOString() : null;
  }

  const dayOnly = raw.match(/^(\d{1,2})$/);
  if (dayOnly) {
    const candidate = buildUtcDate(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth() + 1,
      Number(dayOnly[1]),
      referenceDate.getUTCHours(),
      referenceDate.getUTCMinutes(),
      referenceDate.getUTCSeconds()
    );
    return candidate ? candidate.toISOString() : null;
  }

  const spaced = raw.match(/^(\d{4})\s+(\d{1,2})\s+(\d{1,2})(?:\s+(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?)?$/);
  if (spaced) {
    const candidate = buildUtcDate(
      Number(spaced[1]),
      Number(spaced[2]),
      Number(spaced[3]),
      Number(spaced[4] ?? 0),
      Number(spaced[5] ?? 0),
      Number(spaced[6] ?? 0)
    );
    return candidate ? candidate.toISOString() : null;
  }

  return null;
}

function applyTimeParts(date, match) {
  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const meridiem = String(match[4] ?? "").toLowerCase();
  if (meridiem === "pm" && hours < 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  const candidate = new Date(date.getTime());
  candidate.setUTCHours(hours, minutes, seconds, 0);
  return candidate;
}

function buildUtcDate(year, month, day, hours, minutes, seconds) {
  if (![year, month, day, hours, minutes, seconds].every(Number.isFinite)) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31 || hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
    return null;
  }
  const candidate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, 0));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }
  return candidate;
}

function normalizeYear(value, fallbackYear) {
  if (!value) return fallbackYear;
  const year = Number(value);
  if (!Number.isFinite(year)) return fallbackYear;
  if (String(value).length === 2) return year >= 70 ? 1900 + year : 2000 + year;
  return year;
}



