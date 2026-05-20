import * as d3 from "d3";

const WINDOW_DAYS = 365.25;
const CHART_HEIGHT = 300;
const SERIES_ORDER = ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune"];
const SERIES_COLORS = {
  mercury: "#c7ccd6",
  venus: "#f0c27d",
  mars: "#f28a68",
  jupiter: "#f4d7a0",
  saturn: "#f4e48d",
  uranus: "#a9ecf4",
  neptune: "#78a0ff"
};

/**
 * @node DistanceChart
 */
class DistanceChartNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx ?? {};
    this.visible = false;
    this.chartType = "earth-distance";
    this.selectedBodies = new Set(["mars"]);
    this.bodyPoses = new Map();
    this.bodyNames = new Map();
    this.history = new Map();
    this.currentJulianDay = null;
    this.paneWidth = Number(this.sx.width ?? 420);
    this.root = null;
    this.pane = null;
    this.resizeHandle = null;
    this.chartSelect = null;
    this.legendEl = null;
    this.svg = null;
    this.plotWrap = null;
    this.emptyLabel = null;
    this.hoverInfo = null;
    this.innerPlot = null;
    this.xAxisG = null;
    this.yAxisG = null;
    this.pathsG = null;
    this.hoverG = null;
    this.hoverRule = null;
    this.hoverDotsG = null;
    this.hoverCapture = null;
    this.hoverPointerX = null;
    this._resizeHandler = null;

    this._initDom();
    this._emitOverlay();
  }

  _initDom() {
    if (typeof document === "undefined" || this.root) return;

    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: `${this.paneWidth}px`,
      height: "100vh",
      zIndex: "18",
      pointerEvents: "none"
    });

    this.pane = document.createElement("section");
    Object.assign(this.pane.style, {
      width: "100%",
      height: "100%",
      boxSizing: "border-box",
      position: "relative",
      padding: "16px 16px 20px",
      background: "rgba(18, 67, 84, 0.22)",
      borderRight: "1px solid rgba(140, 220, 240, 0.28)",
      backdropFilter: "blur(4px)",
      color: "#eaf9ff",
      font: "13px/1.4 monospace",
      pointerEvents: "auto",
      display: "none",
      overflowY: "auto",
      overflowX: "hidden"
    });

    this.resizeHandle = document.createElement("div");
    Object.assign(this.resizeHandle.style, {
      position: "absolute",
      top: "0",
      right: "0",
      width: "12px",
      height: "100%",
      cursor: "ew-resize",
      background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(170,230,245,0.12))"
    });
    this.resizeHandle.title = "Resize chart pane";
    this.resizeHandle.addEventListener("mousedown", (event) => this._startResize(event));

    const title = document.createElement("div");
    title.textContent = "Charts";
    Object.assign(title.style, {
      fontSize: "15px",
      fontWeight: "700",
      marginBottom: "12px"
    });
    this.pane.appendChild(title);

    const selectRow = document.createElement("label");
    Object.assign(selectRow.style, {
      display: "block",
      marginBottom: "14px"
    });
    const selectLabel = document.createElement("div");
    selectLabel.textContent = "Chart Type";
    Object.assign(selectLabel.style, {
      marginBottom: "6px"
    });
    this.chartSelect = document.createElement("select");
    Object.assign(this.chartSelect.style, inputStyle());
    this.chartSelect.innerHTML = `<option value="earth-distance">Earth to Planet Distance</option>`;
    this.chartSelect.value = this.chartType;
    this.chartSelect.addEventListener("change", () => {
      this.chartType = this.chartSelect.value;
      this._renderChart();
    });
    selectRow.appendChild(selectLabel);
    selectRow.appendChild(this.chartSelect);
    this.pane.appendChild(selectRow);

    this.plotWrap = document.createElement("div");
    Object.assign(this.plotWrap.style, {
      position: "relative",
      width: "100%",
      height: `${CHART_HEIGHT}px`,
      marginBottom: "14px",
      border: "1px solid rgba(140, 220, 240, 0.24)",
      borderRadius: "10px",
      background: "rgba(4, 18, 24, 0.38)"
    });
    this.pane.appendChild(this.plotWrap);

    this.svg = d3.create("svg").style("width", "100%").style("height", "100%");
    this.plotWrap.appendChild(this.svg.node());
    this.innerPlot = this.svg.append("g");
    this.pathsG = this.innerPlot.append("g");
    this.xAxisG = this.innerPlot.append("g");
    this.yAxisG = this.innerPlot.append("g");
    this.hoverG = this.innerPlot.append("g").style("display", "none");
    this.hoverRule = this.hoverG
      .append("line")
      .attr("stroke", "rgba(234,249,255,0.45)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 4");
    this.hoverDotsG = this.hoverG.append("g");
    this.hoverCapture = this.innerPlot
      .append("rect")
      .attr("fill", "transparent")
      .style("pointer-events", "all");

    this.emptyLabel = this.plotWrap.appendChild(document.createElement("div"));
    this.emptyLabel.textContent = "Collecting one-year rolling distance samples...";
    Object.assign(this.emptyLabel.style, {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      color: "rgba(234,249,255,0.7)",
      padding: "20px",
      pointerEvents: "none"
    });

    this.hoverInfo = this.plotWrap.appendChild(document.createElement("div"));
    Object.assign(this.hoverInfo.style, {
      position: "absolute",
      top: "10px",
      right: "10px",
      minWidth: "140px",
      maxWidth: "calc(100% - 20px)",
      padding: "8px 10px",
      borderRadius: "8px",
      background: "rgba(2, 10, 14, 0.82)",
      border: "1px solid rgba(180,230,240,0.18)",
      color: "#eaf9ff",
      font: "11px/1.45 monospace",
      pointerEvents: "none",
      display: "none",
      whiteSpace: "pre-line"
    });

    const legendTitle = document.createElement("div");
    legendTitle.textContent = "Planets";
    Object.assign(legendTitle.style, {
      fontSize: "13px",
      fontWeight: "700",
      marginBottom: "8px"
    });
    this.pane.appendChild(legendTitle);

    this.legendEl = document.createElement("div");
    Object.assign(this.legendEl.style, {
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: "8px 12px",
      width: "100%",
      boxSizing: "border-box"
    });
    this.pane.appendChild(this.legendEl);

    this.pane.appendChild(this.resizeHandle);
    this.root.appendChild(this.pane);
    document.body.appendChild(this.root);

    this._resizeHandler = () => this._renderChart();
    window.addEventListener("resize", this._resizeHandler);

    this._renderLegend();
    this._syncVisibility();
    this._renderChart();
  }

  _syncVisibility() {
    if (this.pane) {
      this.pane.style.display = this.visible ? "block" : "none";
    }
    if (this.root) {
      this.root.style.width = `${this.paneWidth}px`;
    }
  }

  _emitOverlay() {
    /** @type {ChartOverlay} */
    const payload = {
      visible: this.visible,
      payload: {
        chartType: this.chartType,
        selectedBodies: Array.from(this.selectedBodies)
      }
    };
    this.tx.send("chart.overlay", payload);
  }

  _renderLegend() {
    if (!this.legendEl) return;
    this.legendEl.replaceChildren();

    for (const bodyId of SERIES_ORDER) {
      const row = document.createElement("button");
      row.type = "button";
      Object.assign(row.style, {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        cursor: "pointer",
        userSelect: "none",
        padding: "4px 6px",
        borderRadius: "8px",
        width: "100%",
        border: "0",
        textAlign: "left"
      });

      const swatch = document.createElement("span");
      Object.assign(swatch.style, {
        width: "10px",
        height: "10px",
        borderRadius: "999px",
        background: SERIES_COLORS[bodyId] ?? "#ffffff",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.15)"
      });

      const label = document.createElement("span");
      label.textContent = this.bodyNames.get(bodyId) ?? capitalize(bodyId);

      const active = this.selectedBodies.has(bodyId);
      swatch.style.background = active ? SERIES_COLORS[bodyId] ?? "#ffffff" : "rgba(170, 178, 190, 0.45)";
      label.style.color = active ? "#eaf9ff" : "rgba(190, 198, 210, 0.7)";
      row.style.background = active ? "rgba(170, 230, 245, 0.08)" : "rgba(255,255,255,0.02)";
      row.addEventListener("click", (event) => {
        event.preventDefault();
        if (this.selectedBodies.has(bodyId)) {
          this.selectedBodies.delete(bodyId);
        } else {
          this.selectedBodies.add(bodyId);
        }
        this._emitOverlay();
        this._renderLegend();
        this._renderChart();
      });

      row.appendChild(swatch);
      row.appendChild(label);
      this.legendEl.appendChild(row);
    }
  }

  _sampleDistances() {
    const earth = this.bodyPoses.get("earth");
    if (!earth || !Number.isFinite(this.currentJulianDay)) return;

    for (const bodyId of SERIES_ORDER) {
      const pose = this.bodyPoses.get(bodyId);
      if (!pose) continue;
      const series = this.history.get(bodyId) ?? [];
      series.push({
        jd: this.currentJulianDay,
        distanceAu: distanceAu(earth.positionAu, pose.positionAu)
      });
      const minJd = this.currentJulianDay - WINDOW_DAYS;
      while (series.length > 1 && series[0].jd < minJd) series.shift();
      this.history.set(bodyId, series);
    }
  }

  _chartSeries() {
    const minJd = Number.isFinite(this.currentJulianDay) ? this.currentJulianDay - WINDOW_DAYS : null;
    const list = [];

    for (const bodyId of SERIES_ORDER) {
      if (!this.selectedBodies.has(bodyId)) continue;
      const raw = this.history.get(bodyId) ?? [];
      const points = raw
        .filter((p) => minJd == null || p.jd >= minJd)
        .map((p) => ({
          date: julianDayToDate(p.jd),
          distanceAu: p.distanceAu
        }));
      if (!points.length) continue;
      list.push({
        id: bodyId,
        color: SERIES_COLORS[bodyId] ?? "#ffffff",
        points
      });
    }

    return list;
  }

  _renderChart() {
    if (!this.svg || !this.innerPlot || !this.pathsG || !this.xAxisG || !this.yAxisG) return;

    const host = this.svg.node()?.parentElement;
    const width = Math.max(260, host?.clientWidth ?? 360);
    const height = Math.max(220, host?.clientHeight ?? CHART_HEIGHT);
    const margin = { top: 16, right: 18, bottom: 34, left: 58 };
    const innerWidth = Math.max(80, width - margin.left - margin.right);
    const innerHeight = Math.max(80, height - margin.top - margin.bottom);

    this.svg.attr("viewBox", `0 0 ${width} ${height}`);
    this.innerPlot.attr("transform", `translate(${margin.left},${margin.top})`);
    this.xAxisG.attr("transform", `translate(0,${innerHeight})`);

    const series = this._chartSeries();
    const hasData = series.length > 0;
    this.emptyLabel.style.display = hasData ? "none" : "flex";

    const nowDate = Number.isFinite(this.currentJulianDay) ? julianDayToDate(this.currentJulianDay) : new Date();
    const minDate = Number.isFinite(this.currentJulianDay)
      ? julianDayToDate(this.currentJulianDay - WINDOW_DAYS)
      : new Date(nowDate.getTime() - WINDOW_DAYS * 86400000);

    const maxDistance = hasData
      ? d3.max(series, (s) => d3.max(s.points, (p) => p.distanceAu)) ?? 1
      : 1;

    const x = d3.scaleTime().domain([minDate, nowDate]).range([0, innerWidth]);
    const y = d3.scaleLinear().domain([0, Math.max(1, maxDistance * 1.08)]).nice().range([innerHeight, 0]);

    const monthsPerYear = d3.timeMonth.every(1);
    const tickMonths = innerWidth >= 520 ? monthsPerYear : d3.timeMonth.every(2);
    this.xAxisG.call(
      d3
        .axisBottom(x)
        .ticks(tickMonths)
        .tickSizeOuter(0)
        .tickFormat(d3.timeFormat(innerWidth >= 520 ? "%b" : "%b"))
    );
    this.yAxisG.call(d3.axisLeft(y).ticks(6).tickSizeOuter(0));

    styleAxis(this.xAxisG);
    styleAxis(this.yAxisG);

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.distanceAu))
      .curve(d3.curveMonotoneX);

    const paths = this.pathsG.selectAll("path.distance-series").data(series, (d) => d.id);
    paths
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "distance-series")
            .attr("fill", "none")
            .attr("stroke-width", 2.2)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round"),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr("stroke", (d) => d.color)
      .attr("d", (d) => line(d.points));

    this.hoverCapture
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .on("mousemove", (event) => this._onHover(event, { x, y, series, innerHeight }))
      .on("mouseleave", () => this._clearHover());

    if (this.hoverPointerX != null && hasData) {
      this._renderHoverAtX(this.hoverPointerX, { x, y, series, innerHeight });
    } else {
      this._clearHover();
    }

    const grid = this.innerPlot.selectAll("line.y-grid").data(y.ticks(6), (d) => String(d));
    grid
      .join(
        (enter) => enter.append("line").attr("class", "y-grid"),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr("x1", 0)
      .attr("x2", innerWidth)
      .attr("y1", (d) => y(d))
      .attr("y2", (d) => y(d))
      .attr("stroke", "rgba(180,230,240,0.10)");

    const xLabel = this.svg.selectAll("text.x-label").data([null]);
    xLabel
      .join("text")
      .attr("class", "x-label")
      .attr("x", margin.left + innerWidth * 0.5)
      .attr("y", height - 8)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(234,249,255,0.85)")
      .attr("font-size", 11)
      .text("Rolling 1-year window");

    const yLabel = this.svg.selectAll("text.y-label").data([null]);
    yLabel
      .join("text")
      .attr("class", "y-label")
      .attr("transform", `translate(14, ${margin.top + innerHeight * 0.5}) rotate(-90)`)
      .attr("text-anchor", "middle")
      .attr("fill", "rgba(234,249,255,0.85)")
      .attr("font-size", 11)
      .text("Distance (AU)");
  }

  _startResize(event) {
    if (typeof window === "undefined") return;
    event.preventDefault();
    const onMove = (moveEvent) => {
      const maxWidth = Math.max(320, Math.min(window.innerWidth * 0.7, 760));
      this.paneWidth = clamp(moveEvent.clientX, 280, maxWidth);
      if (this.root) {
        this.root.style.width = `${this.paneWidth}px`;
      }
      this._renderChart();
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  _onHover(event, ctx) {
    const [px] = d3.pointer(event, this.hoverCapture.node());
    this.hoverPointerX = px;
    this._renderHoverAtX(px, ctx);
  }

  _renderHoverAtX(px, ctx) {
    const { x, y, series, innerHeight } = ctx;
    if (!series.length || !this.hoverG || !this.hoverRule || !this.hoverDotsG) {
      this._clearHover();
      return;
    }

    const hoverDate = x.invert(clamp(px, 0, x.range()[1]));
    const hovered = [];

    for (const s of series) {
      const point = nearestPointByDate(s.points, hoverDate);
      if (!point) continue;
      hovered.push({
        id: s.id,
        color: s.color,
        point
      });
    }

    if (!hovered.length) {
      this._clearHover();
      return;
    }

    const anchorDate = hovered[0]?.point?.date ?? hoverDate;
    const ruleX = x(anchorDate);

    this.hoverG.style("display", null);
    this.hoverRule
      .attr("x1", ruleX)
      .attr("x2", ruleX)
      .attr("y1", 0)
      .attr("y2", innerHeight);

    const dots = this.hoverDotsG.selectAll("circle.hover-dot").data(hovered, (d) => d.id);
    dots
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", "hover-dot")
            .attr("r", 3.5)
            .attr("stroke", "rgba(255,255,255,0.85)")
            .attr("stroke-width", 1),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr("fill", (d) => d.color)
      .attr("cx", (d) => x(d.point.date))
      .attr("cy", (d) => y(d.point.distanceAu));

    if (this.hoverInfo) {
      const lines = [formatHoverDate(anchorDate)];
      for (const item of hovered) {
        const name = this.bodyNames.get(item.id) ?? capitalize(item.id);
        lines.push(`${name}: ${item.point.distanceAu.toFixed(3)} AU`);
      }
      this.hoverInfo.textContent = lines.join("\n");
      this.hoverInfo.style.display = "block";
    }
  }

  _clearHover() {
    this.hoverPointerX = null;
    this.hoverG?.style("display", "none");
    if (this.hoverInfo) this.hoverInfo.style.display = "none";
  }

  /**
   * Receives chart requests such as show, hide, or update chart parameters.
   * @param {ChartCommand} payload
   */
  onChartCommand(payload) {
    const kind = String(payload?.kind ?? "").toLowerCase();
    const params = payload?.params ?? {};

    if (kind === "chart.toggle") {
      this.visible = params?.visible === undefined ? !this.visible : params.visible !== false;
      this._syncVisibility();
      this._emitOverlay();
      return;
    }

    if (kind === "chart.show") {
      this.visible = true;
      this._syncVisibility();
      this._emitOverlay();
      return;
    }

    if (kind === "chart.hide") {
      this.visible = false;
      this._syncVisibility();
      this._emitOverlay();
      return;
    }

    if (kind === "chart.distance") {
      this.visible = params?.visible !== false;
      this.chartType = "earth-distance";
      if (typeof params?.bodyB === "string") {
        const bodyId = String(params.bodyB).toLowerCase();
        if (SERIES_ORDER.includes(bodyId)) {
          this.selectedBodies = new Set([bodyId]);
          this._renderLegend();
        }
      }
      this._syncVisibility();
      this._emitOverlay();
      this._renderChart();
    }
  }

  /**
   * Receives body poses used to compute chart values.
   * @param {BodyPoseList} payload
   */
  onChartBodyPoses(payload) {
    const bodies = Array.isArray(payload) ? payload : [];
    let legendChanged = false;
    for (const body of bodies) {
      const id = String(body?.id ?? "").toLowerCase();
      if (!id) continue;
      this.bodyPoses.set(id, body);
      if (!id.includes("/")) {
        const nextName = String(body?.name ?? capitalize(id));
        if (this.bodyNames.get(id) !== nextName) {
          this.bodyNames.set(id, nextName);
          legendChanged = true;
        }
      }
    }
    if (legendChanged) this._renderLegend();
  }

  /**
   * Receives simulation ticks to sample chart values over time.
   * @param {SimulationTick} payload
   */
  onChartTick(payload) {
    const jd = Number(payload?.simJulianDay);
    if (!Number.isFinite(jd)) return;
    this.currentJulianDay = jd;
    this._sampleDistances();
    this._renderChart();
  }

  probe(name) {
    if (name === "chart.state") {
      return {
        visible: this.visible,
        chartType: this.chartType,
        selectedBodies: Array.from(this.selectedBodies ?? []),
        currentJulianDay: this.currentJulianDay,
        knownBodies: Array.from(this.bodyNames.entries()).map(([id, label]) => ({id, label}))
      };
    }
    return null;
  }
}

export function createDistanceChart(tx, sx) {
  return new DistanceChartNode(tx, sx);
}

function styleAxis(axis) {
  axis.selectAll("path").attr("stroke", "rgba(210,242,250,0.35)");
  axis.selectAll("line").attr("stroke", "rgba(210,242,250,0.25)");
  axis.selectAll("text").attr("fill", "rgba(234,249,255,0.85)").attr("font-size", 10);
}

function inputStyle() {
  return {
    width: "100%",
    boxSizing: "border-box",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid rgba(140,220,240,0.28)",
    background: "rgba(4,18,24,0.55)",
    color: "#eaf9ff",
    font: "inherit"
  };
}

function distanceAu(a, b) {
  const dx = Number(a?.x ?? 0) - Number(b?.x ?? 0);
  const dy = Number(a?.y ?? 0) - Number(b?.y ?? 0);
  const dz = Number(a?.z ?? 0) - Number(b?.z ?? 0);
  return Math.hypot(dx, dy, dz);
}

function julianDayToDate(jd) {
  const unixMs = (Number(jd) - 2440587.5) * 86400000;
  return new Date(unixMs);
}

function capitalize(value) {
  const s = String(value ?? "");
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function nearestPointByDate(points, hoverDate) {
  if (!Array.isArray(points) || points.length === 0) return null;
  const target = hoverDate.getTime();
  let best = points[0];
  let bestDelta = Math.abs(points[0].date.getTime() - target);
  for (let i = 1; i < points.length; i++) {
    const delta = Math.abs(points[i].date.getTime() - target);
    if (delta < bestDelta) {
      best = points[i];
      bestDelta = delta;
    }
  }
  return best;
}

function formatHoverDate(date) {
  return d3.timeFormat("%Y-%m-%d")(date);
}



