/**
 * @node IconMenu
 */
class IconMenuNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx ?? {};
    this.settingsVisible = false;
    this.chartVisible = false;
    this.baseAmbientIntensity = Number(this.sx.baseAmbientIntensity ?? 1.35);
    this.baseSunIntensity = Number(this.sx.baseSunIntensity ?? 180);
    this.ambientIntensity = Number(this.sx.ambientIntensity ?? this.baseAmbientIntensity);
    this.sunIntensity = Number(this.sx.sunIntensity ?? this.baseSunIntensity);
    this.simSecondsPerSec = Number(this.sx.simSecondsPerSec ?? 24 * 3600);
    this.ambientExp = intensityToExp(this.ambientIntensity, this.baseAmbientIntensity, 1);
    this.sunExp = intensityToExp(this.sunIntensity, this.baseSunIntensity, 2);
    this.simSpeedExp = intensityToExp(this.simSecondsPerSec, 1, 1);
    this.sunRadiusMultiplier = Number(this.sx.sunRadiusMultiplier ?? 10);
    this.planetRadiusMultiplier = Number(this.sx.planetRadiusMultiplier ?? 200);
    this.moonOrbitRadiusMultiplier = Number(this.sx.moonOrbitRadiusMultiplier ?? 20);
    this.showEcliptic = this.sx.showEcliptic !== false;
    this.showAxes = this.sx.showAxes === true;
    this.showStars = this.sx.showStars === true;
    this.showConstellations = this.sx.showConstellations === true;
    this.cameraOptions = [{ cameraId: "default", label: "Default", mode: "orbit" }];
    this.activeCameraId = "default";
    this.simState = {
      simTimeIsoUtc: "",
      timeScale: this.simSecondsPerSec,
      paused: false
    };
    this.timeScrubValue = 0;

    this.root = null;
    this.settingsPane = null;
    this.cameraSelect = null;
    this.simTimeValueEl = null;
    this.stopTimeValueEl = null;
    this.clockActionButton = null;
    this.speedValueEl = null;
    this.speedSlider = null;
    this.seekValueEl = null;
    this.seekSlider = null;

    this._initDom();
  }

  _initDom() {
    if (typeof document === "undefined") return;
    if (this.root) return;

    this.root = document.createElement("div");
    Object.assign(this.root.style, {
      position: "fixed",
      top: "12px",
      right: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      zIndex: "20"
    });

    const chartButton = document.createElement("button");
    chartButton.type = "button";
    chartButton.textContent = "\u25A4";
    Object.assign(chartButton.style, buttonStyle("16px"));
    chartButton.title = "Toggle charts";
    chartButton.addEventListener("click", () => {
      this.chartVisible = !this.chartVisible;
      this._emitChartToggle();
    });
    this.root.appendChild(chartButton);

    const gearButton = document.createElement("button");
    gearButton.type = "button";
    gearButton.textContent = "\u2699";
    Object.assign(gearButton.style, buttonStyle("16px"));
    gearButton.title = "Toggle settings";
    gearButton.addEventListener("click", () => {
      this.settingsVisible = !this.settingsVisible;
      this._syncPanelVisibility();
      this._emitPanelVisibility();
    });
    this.root.appendChild(gearButton);

    this.settingsPane = this._buildSettingsPane();
    this.root.appendChild(this.settingsPane);
    document.body.appendChild(this.root);
    this._syncPanelVisibility();
    this._syncSimulationState();
    this._emitInitialSettings();
  }

  _buildSettingsPane() {
    const pane = document.createElement("div");
    Object.assign(pane.style, {
      position: "fixed",
      top: "0",
      right: "0",
      width: "320px",
      height: "100vh",
      padding: "16px",
      boxSizing: "border-box",
      background: "rgba(255, 136, 0, 0.22)",
      borderLeft: "1px solid rgba(255, 191, 128, 0.6)",
      backdropFilter: "blur(3px)",
      color: "#fff",
      font: "13px/1.4 monospace",
      overflowY: "auto"
    });

    const title = document.createElement("div");
    title.textContent = "Renderer Settings";
    Object.assign(title.style, {
      fontSize: "14px",
      fontWeight: "700",
      marginBottom: "14px"
    });
    pane.appendChild(title);

    pane.appendChild(this._buildSimulationTimeControl());
    pane.appendChild(this._buildClockTransportControl());
    pane.appendChild(this._buildLightControlPanel());

    pane.appendChild(this._buildHelperToggleControls());
    pane.appendChild(this._buildSizeControlPanel());

    pane.appendChild(this._buildCameraSelectControl());

    return pane;
  }

  _buildSimulationTimeControl() {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      marginBottom: "14px"
    });

    wrapper.appendChild(this._buildEditableDateField({
      label: "Simulation Time",
      refName: "simTimeValueEl",
      getIsoValue: () => this.simState?.simTimeIsoUtc,
      onCommit: (iso) => this._emitSetTimeCommand(iso)
    }));
    wrapper.appendChild(this._buildEditableDateField({
      label: "Stop At",
      refName: "stopTimeValueEl",
      getIsoValue: () => this.simState?.stopTimeIsoUtc,
      onCommit: (iso) => this._emitSetStopTimeCommand(iso),
      extraStyles: { marginTop: "8px" }
    }));
    return wrapper;
  }

  _buildClockTransportControl() {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      marginBottom: "14px",
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(20,24,40,0.28)"
    });

    const header = document.createElement("div");
    Object.assign(header.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
      marginBottom: "10px"
    });

    const label = document.createElement("span");
    label.textContent = "Time Control";
    header.appendChild(label);

    this.clockActionButton = document.createElement("button");
    this.clockActionButton.type = "button";
    Object.assign(this.clockActionButton.style, {
      padding: "6px 10px",
      borderRadius: "8px",
      border: "1px solid rgba(255,255,255,0.18)",
      background: "rgba(20,24,40,0.65)",
      color: "#fff",
      font: "inherit",
      cursor: "pointer"
    });
    this.clockActionButton.addEventListener("click", () => this._emitClockToggleCommand());
    header.appendChild(this.clockActionButton);
    wrapper.appendChild(header);

    const top = document.createElement("div");
    Object.assign(top.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px"
    });
    const seekLabel = document.createElement("span");
    seekLabel.textContent = "Seek Time";
    this.seekValueEl = document.createElement("span");
    top.appendChild(seekLabel);
    top.appendChild(this.seekValueEl);
    wrapper.appendChild(top);

    this.seekSlider = document.createElement("input");
    this.seekSlider.type = "range";
    this.seekSlider.min = "-1";
    this.seekSlider.max = "1";
    this.seekSlider.step = "0.002";
    this.seekSlider.value = "0";
    this.seekSlider.style.width = "100%";
    this.seekSlider.addEventListener("input", () => this._handleSeekSliderInput());
    this.seekSlider.addEventListener("change", () => this._resetSeekSlider());
    wrapper.appendChild(this.seekSlider);

    wrapper.appendChild(this._buildSpeedSliderControl({
      label: "Simulation Speed",
      value: this.simSpeedExp,
      onChange: (exp) => {
        this.simSpeedExp = exp;
        this.simSecondsPerSec = clamp(Math.round(expToIntensity(exp, 1, 1)), 1, SPEED_MAX_SECONDS_PER_SEC);
        this._emitSpeedCommand();
      }
    }));

    return wrapper;
  }

  _buildEditableDateField({ label, refName, getIsoValue, onCommit, extraStyles = {} }) {
    const wrapper = document.createElement("div");

    const top = document.createElement("div");
    Object.assign(top.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px"
    });
    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    top.appendChild(labelEl);
    wrapper.appendChild(top);

    const valueEl = document.createElement("input");
    valueEl.type = "text";
    valueEl.placeholder = "Type a date/time";
    Object.assign(valueEl.style, {
      width: "100%",
      boxSizing: "border-box",
      padding: "8px 10px",
      borderRadius: "8px",
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(20,24,40,0.36)",
      color: "#f6f3d6",
      minHeight: "35px",
      font: "inherit",
      ...extraStyles
    });
    valueEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        valueEl.blur();
      } else if (event.key === "Escape") {
        valueEl.value = formatSimulationDate(getIsoValue()) || "";
        valueEl.blur();
      }
    });
    valueEl.addEventListener("blur", () => {
      const previousIso = getIsoValue();
      const parsed = parseFlexibleDateInput(valueEl.value, previousIso ?? this.simState?.simTimeIsoUtc ?? new Date().toISOString());
      if (!parsed) {
        valueEl.value = formatSimulationDate(previousIso) || "";
        return;
      }
      onCommit(parsed);
      valueEl.value = formatSimulationDate(parsed);
    });
    wrapper.appendChild(valueEl);
    this[refName] = valueEl;
    return wrapper;
  }

  _buildControlPanel(titleText) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      marginBottom: "14px",
      padding: "10px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.14)",
      background: "rgba(20,24,40,0.28)"
    });

    const title = document.createElement("div");
    title.textContent = titleText;
    Object.assign(title.style, {
      fontWeight: "700",
      marginBottom: "10px"
    });
    wrapper.appendChild(title);
    return wrapper;
  }

  _buildLightControlPanel() {
    const wrapper = this._buildControlPanel("Light Control");
    wrapper.appendChild(this._buildExponentialSliderControl({
      label: "Ambient Light",
      value: this.ambientExp,
      exponentFactor: 1,
      onChange: (exp) => {
        this.ambientExp = exp;
        this.ambientIntensity = expToIntensity(exp, this.baseAmbientIntensity, 1);
        this._emitLightingCommand();
      }
    }));
    wrapper.appendChild(this._buildExponentialSliderControl({
      label: "Sun Intensity",
      value: this.sunExp,
      exponentFactor: 2,
      onChange: (exp) => {
        this.sunExp = exp;
        this.sunIntensity = expToIntensity(exp, this.baseSunIntensity, 2);
        this._emitLightingCommand();
      }
    }));
    return wrapper;
  }

  _buildSizeControlPanel() {
    const wrapper = this._buildControlPanel("Size Control");
    wrapper.appendChild(this._buildLinearSliderControl({
      label: "Sun Radius",
      min: 1,
      max: 100,
      step: 0.1,
      value: this.sunRadiusMultiplier,
      onChange: (v) => {
        this.sunRadiusMultiplier = v;
        this._emitRadiusCommand();
      }
    }));
    wrapper.appendChild(this._buildLinearSliderControl({
      label: "Planet Radius",
      min: 1,
      max: 1000,
      step: 0.1,
      value: this.planetRadiusMultiplier,
      onChange: (v) => {
        this.planetRadiusMultiplier = v;
        this._emitRadiusCommand();
      }
    }));
    wrapper.appendChild(this._buildLinearSliderControl({
      label: "Moon Orbit Radius",
      min: 1,
      max: 1000,
      step: 0.1,
      value: this.moonOrbitRadiusMultiplier,
      onChange: (v) => {
        this.moonOrbitRadiusMultiplier = v;
        this._emitRadiusCommand();
      }
    }));
    return wrapper;
  }

  _buildHelperToggleControls() {
    const wrapper = this._buildControlPanel("Helpers");
    const options = document.createElement("div");
    Object.assign(options.style, {
      display: "flex",
      flexDirection: "column",
      gap: "8px"
    });

    options.appendChild(this._buildCheckboxControl({
      label: "Ecliptic",
      checked: this.showEcliptic,
      onChange: (checked) => {
        this.showEcliptic = checked;
        this._emitEclipticCommand();
      }
    }));

    options.appendChild(this._buildCheckboxControl({
      label: "Axes",
      checked: this.showAxes,
      onChange: (checked) => {
        this.showAxes = checked;
        this._emitAxesCommand();
      }
    }));
    options.appendChild(this._buildCheckboxControl({
      label: "Stars",
      checked: this.showStars,
      onChange: (checked) => {
        this.showStars = checked;
        this._emitStarsCommand();
      }
    }));
    options.appendChild(this._buildCheckboxControl({
      label: "Constellations",
      checked: this.showConstellations,
      onChange: (checked) => {
        this.showConstellations = checked;
        this._emitConstellationsCommand();
      }
    }));

    wrapper.appendChild(options);
    return wrapper;
  }

  _buildCameraSelectControl() {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      marginTop: "14px"
    });

    const top = document.createElement("div");
    Object.assign(top.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px"
    });
    const labelEl = document.createElement("span");
    labelEl.textContent = "Active Camera";
    top.appendChild(labelEl);
    wrapper.appendChild(top);

    this.cameraSelect = document.createElement("select");
    Object.assign(this.cameraSelect.style, {
      width: "100%",
      boxSizing: "border-box",
      padding: "8px 10px",
      borderRadius: "8px",
      border: "1px solid rgba(255,255,255,0.25)",
      background: "rgba(20,24,40,0.55)",
      color: "#fff",
      font: "inherit"
    });
    this.cameraSelect.addEventListener("change", () => {
      this.activeCameraId = String(this.cameraSelect.value || "default");
      this._emitCameraSelectCommand();
    });
    this._syncCameraSelect();
    wrapper.appendChild(this.cameraSelect);
    return wrapper;
  }

  _buildExponentialSliderControl({ label, value, exponentFactor, onChange }) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      marginBottom: "14px"
    });

    const top = document.createElement("div");
    Object.assign(top.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px"
    });
    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    const valueEl = document.createElement("span");
    valueEl.textContent = formatExpLabel(value, exponentFactor);
    top.appendChild(labelEl);
    top.appendChild(valueEl);
    wrapper.appendChild(top);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "-3";
    slider.max = "3";
    slider.step = "0.02";
    slider.value = String(value);
    slider.style.width = "100%";
    slider.addEventListener("input", () => {
      const exp = Number(slider.value);
      valueEl.textContent = formatExpLabel(exp, exponentFactor);
      onChange(exp);
    });
    wrapper.appendChild(slider);
    return wrapper;
  }

  _buildCheckboxControl({ label, checked, onChange }) {
    const row = document.createElement("label");
    Object.assign(row.style, {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      userSelect: "none",
      cursor: "pointer"
    });

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!checked;
    checkbox.addEventListener("change", () => onChange(checkbox.checked));

    const text = document.createElement("span");
    text.textContent = label;

    row.appendChild(checkbox);
    row.appendChild(text);
    return row;
  }

  _buildSpeedSliderControl({ label, value, onChange }) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      marginTop: "12px"
    });

    const top = document.createElement("div");
    Object.assign(top.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px"
    });
    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    this.speedValueEl = document.createElement("span");
    this.speedValueEl.textContent = formatSpeedLabel(value);
    top.appendChild(labelEl);
    top.appendChild(this.speedValueEl);
    wrapper.appendChild(top);

    this.speedSlider = document.createElement("input");
    this.speedSlider.type = "range";
    this.speedSlider.min = "0";
    this.speedSlider.max = String(Math.log2(SPEED_MAX_SECONDS_PER_SEC));
    this.speedSlider.step = "0.05";
    this.speedSlider.value = String(value);
    this.speedSlider.style.width = "100%";
    this.speedSlider.addEventListener("input", () => {
      const exp = Number(this.speedSlider.value);
      this.speedValueEl.textContent = formatSpeedLabel(exp);
      onChange(exp);
    });
    wrapper.appendChild(this.speedSlider);
    return wrapper;
  }

  _buildLinearSliderControl({ label, min, max, step, value, onChange }) {
    const wrapper = document.createElement("div");
    Object.assign(wrapper.style, {
      marginTop: "12px"
    });

    const top = document.createElement("div");
    Object.assign(top.style, {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "6px"
    });
    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    const valueEl = document.createElement("span");
    valueEl.textContent = `${Number(value).toFixed(1)}x`;
    top.appendChild(labelEl);
    top.appendChild(valueEl);
    wrapper.appendChild(top);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = String(min);
    slider.max = String(max);
    slider.step = String(step);
    slider.value = String(value);
    slider.style.width = "100%";
    slider.addEventListener("input", () => {
      const v = Number(slider.value);
      valueEl.textContent = `${v.toFixed(1)}x`;
      onChange(v);
    });
    wrapper.appendChild(slider);
    return wrapper;
  }

  _syncPanelVisibility() {
    if (this.root) {
      this.root.style.right = this.settingsVisible ? "332px" : "12px";
    }
    if (!this.settingsPane) return;
    this.settingsPane.style.display = this.settingsVisible ? "block" : "none";
  }

  _syncCameraSelect() {
    if (!this.cameraSelect) return;
    const options = Array.isArray(this.cameraOptions) && this.cameraOptions.length
      ? this.cameraOptions
      : [{ cameraId: "default", label: "Default", mode: "orbit" }];
    this.cameraSelect.replaceChildren();
    for (const item of options) {
      const option = document.createElement("option");
      option.value = String(item.cameraId ?? "default");
      option.textContent = String(item.label ?? item.cameraId ?? "Camera");
      this.cameraSelect.appendChild(option);
    }
    const selected = options.some((item) => String(item.cameraId) === this.activeCameraId)
      ? this.activeCameraId
      : String(options[0].cameraId);
    this.activeCameraId = selected;
    this.cameraSelect.value = selected;
  }

  _syncSimulationState() {
    if (this.simTimeValueEl && document.activeElement !== this.simTimeValueEl) {
      this.simTimeValueEl.value = formatSimulationDate(this.simState?.simTimeIsoUtc) || "";
    }
    if (this.stopTimeValueEl && document.activeElement !== this.stopTimeValueEl) {
      this.stopTimeValueEl.value = this.simState?.stopTimeIsoUtc
        ? formatSimulationDate(this.simState.stopTimeIsoUtc)
        : "";
    }
    if (this.clockActionButton) {
      this.clockActionButton.textContent = this.simState?.paused ? "Restart" : "Stop";
      this.clockActionButton.title = this.simState?.paused ? "Resume simulation" : "Pause simulation";
    }
    if (this.speedSlider && Number.isFinite(this.simState?.timeScale)) {
      this.simSecondsPerSec = clamp(Math.round(this.simState.timeScale), 1, SPEED_MAX_SECONDS_PER_SEC);
      this.simSpeedExp = intensityToExp(this.simSecondsPerSec, 1, 1);
      this.speedSlider.value = String(this.simSpeedExp);
      if (this.speedValueEl) this.speedValueEl.textContent = formatSpeedLabel(this.simSpeedExp);
    }
    if (this.seekValueEl && Math.abs(this.timeScrubValue) < 0.001) {
      this.seekValueEl.textContent = "Current";
    }
  }

  _emitPanelVisibility() {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "ui.panel",
      source: "icon-menu",
      params: {
        panel: "settings",
        visible: this.settingsVisible
      }
    };
    this.tx.send("ui.command", payload);
  }

  _emitChartToggle() {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "chart.toggle",
      source: "icon-menu",
      params: {
        visible: this.chartVisible
      }
    };
    this.tx.send("ui.command", payload);
  }

  _emitLightingCommand() {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "render.light",
      source: "icon-menu",
      params: {
        ambientIntensity: this.ambientIntensity,
        sunIntensity: this.sunIntensity
      }
    };
    this.tx.send("ui.command", payload);
  }

  _emitInitialSettings() {
    // Push the menu's startup values into the app so runtime state matches
    // the settings-pane defaults before the user touches any controls.
    this._emitLightingCommand();
    this._emitEclipticCommand();
    this._emitAxesCommand();
    this._emitStarsCommand();
    this._emitConstellationsCommand();
    this._emitRadiusCommand();
  }

  _emitEclipticCommand() {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "render.ecliptic",
      source: "icon-menu",
      params: {
        enabled: !!this.showEcliptic
      }
    };
    this.tx.send("ui.command", payload);
  }

  _emitAxesCommand() {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "render.axes",
      source: "icon-menu",
      params: {
        enabled: !!this.showAxes
      }
    };
    this.tx.send("ui.command", payload);
  }

  _emitStarsCommand() {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "solar.stars",
      source: "icon-menu",
      params: {
        enabled: !!this.showStars
      }
    };
    this.tx.send("ui.command", payload);
  }

  _emitConstellationsCommand() {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "solar.constellations",
      source: "icon-menu",
      params: {
        enabled: !!this.showConstellations
      }
    };
    this.tx.send("ui.command", payload);
  }

  _emitRadiusCommand() {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "solar.radius",
      source: "icon-menu",
      params: {
        sunMultiplier: this.sunRadiusMultiplier,
        planetMultiplier: this.planetRadiusMultiplier,
        moonOrbitMultiplier: this.moonOrbitRadiusMultiplier
      }
    };
    this.tx.send("ui.command", payload);
  }

  _emitSpeedCommand() {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "clock.speed",
      source: "icon-menu",
      params: {
        value: this.simSecondsPerSec
      }
    };
    this.tx.send("ui.command", payload);
  }

  _emitSetTimeCommand(timeIsoUtc) {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "clock.set-time",
      source: "icon-menu",
      params: {
        timeIsoUtc
      }
    };
    this.tx.send("ui.command", payload);
  }

  _emitSetStopTimeCommand(stopIsoUtc) {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "clock.set-stop-time",
      source: "icon-menu",
      params: {
        stopIsoUtc
      }
    };
    this.tx.send("ui.command", payload);
  }

  _emitClockToggleCommand() {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: this.simState?.paused ? "clock.resume" : "clock.pause",
      source: "icon-menu",
      params: {}
    };
    this.tx.send("ui.command", payload);
  }

  _handleSeekSliderInput() {
    const scrub = Number(this.seekSlider?.value ?? 0);
    this.timeScrubValue = scrub;
    if (this.seekValueEl) {
      this.seekValueEl.textContent = formatSeekOffsetLabel(scrub);
    }
    if (!this.simState?.simTimeIsoUtc || Math.abs(scrub) < 0.001) return;

    const currentMs = Date.parse(this.simState.simTimeIsoUtc);
    if (!Number.isFinite(currentMs)) return;
    const nextMs = currentMs + seekSliderToOffsetMs(scrub);

    /** @type {CommandEnvelope} */
    const payload = {
      kind: "clock.set-time",
      source: "icon-menu",
      params: {
        value: nextMs
      }
    };
    this.tx.send("ui.command", payload);
  }

  _resetSeekSlider() {
    this.timeScrubValue = 0;
    if (this.seekSlider) this.seekSlider.value = "0";
    if (this.seekValueEl) this.seekValueEl.textContent = "Current";
  }

  _emitCameraSelectCommand() {
    /** @type {CommandEnvelope} */
    const payload = {
      kind: "camera.select",
      source: "icon-menu",
      params: {
        cameraId: this.activeCameraId
      }
    };
    this.tx.send("ui.command", payload);
  }

  /**
   * Receives commands that show or hide a user interface panel.
   * @param {UiPanelCommand} payload
   */
  onUiPanel(payload) {
    const panel = String(payload?.panel ?? "").toLowerCase();
    if (panel === "settings") {
      this.settingsVisible = payload?.visible !== false;
    } else if (panel === "chart" || panel === "charts") {
      this.chartVisible = payload?.visible !== false;
    } else {
      return;
    }
    this._syncPanelVisibility();
  }

  /**
   * Receives the active camera state for context or view-dependent behavior.
   * @param {CameraState} payload
   */
  onCameraState(payload) {
    const list = Array.isArray(payload?.availableCameras) ? payload.availableCameras : null;
    if (list && list.length) {
      this.cameraOptions = list.map((item) => ({
        cameraId: String(item?.cameraId ?? "camera"),
        label: String(item?.label ?? item?.cameraId ?? "Camera"),
        mode: String(item?.mode ?? "custom")
      }));
    }
    this.activeCameraId = String(payload?.cameraId ?? this.activeCameraId ?? "default");
    this._syncCameraSelect();
  }

  /**
   * Receives the current simulation state for display or controls.
   * @param {SimulationState} payload
   */
  onSimState(payload) {
    this.simState = payload ?? this.simState;
    this._syncSimulationState();
  }
}

export function createIconMenu(tx, sx) {
  return new IconMenuNode(tx, sx);
}

function expToIntensity(exp, base, exponentFactor) {
  return base * Math.pow(2, exp * exponentFactor);
}

function intensityToExp(intensity, base, exponentFactor) {
  if (!Number.isFinite(intensity) || intensity <= 0 || !Number.isFinite(base) || base <= 0) return 0;
  return Math.log2(intensity / base) / exponentFactor;
}

function formatExpLabel(exp, exponentFactor) {
  const mul = Math.pow(2, exp * exponentFactor);
  return `${mul.toFixed(2)}x`;
}

const SPEED_MAX_SECONDS_PER_SEC = 10000 * 3600;
const SEEK_MAX_SECONDS = 200 * 365.25 * 86400;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatSpeedLabel(exp) {
  const sps = clamp(Math.round(Math.pow(2, exp)), 1, SPEED_MAX_SECONDS_PER_SEC);
  if (sps < 60) return `1s = ${sps}s`;
  if (sps < 3600) return `1s = ${round1(sps / 60)} min`;
  if (sps < 86400) return `1s = ${round1(sps / 3600)} h`;
  if (sps < 7 * 86400) return `1s = ${round1(sps / 86400)} days`;
  if (sps < 365.25 * 86400) return `1s = ${round1(sps / (7 * 86400))} weeks`;
  return `1s = ${round1(sps / (365.25 * 86400))} years`;
}

function formatSimulationDate(iso) {
  const ms = Date.parse(String(iso ?? ""));
  if (!Number.isFinite(ms)) return "";
  const date = new Date(ms);
  return `${date.getUTCFullYear()} ${MONTHS[date.getUTCMonth()]} ${pad2(date.getUTCDate())} ${pad2(date.getUTCHours())}:${pad2(date.getUTCMinutes())}:${pad2(date.getUTCSeconds())} UTC`;
}

function parseFlexibleDateInput(text, referenceIso) {
  const raw = String(text ?? "").trim();
  if (!raw) return null;

  const direct = Date.parse(raw);
  if (Number.isFinite(direct)) return new Date(direct).toISOString();

  const refMs = Date.parse(String(referenceIso ?? "")) || Date.now();
  const ref = new Date(refMs);

  const timeOnly = raw.match(/^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?\s*(am|pm)?$/i);
  if (timeOnly) {
    const parsed = applyTimeParts(new Date(refMs), timeOnly);
    return parsed ? parsed.toISOString() : null;
  }

  const withYear = Date.parse(`${raw} ${ref.getUTCFullYear()}`);
  if (Number.isFinite(withYear)) return new Date(withYear).toISOString();

  const md = raw.match(/^(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?$/);
  if (md) {
    const year = normalizeYear(md[3], ref.getUTCFullYear());
    const month = Number(md[1]);
    const day = Number(md[2]);
    const candidate = buildUtcDate(year, month, day, ref.getUTCHours(), ref.getUTCMinutes(), ref.getUTCSeconds());
    return candidate ? candidate.toISOString() : null;
  }

  const dayOnly = raw.match(/^(\d{1,2})$/);
  if (dayOnly) {
    const candidate = buildUtcDate(
      ref.getUTCFullYear(),
      ref.getUTCMonth() + 1,
      Number(dayOnly[1]),
      ref.getUTCHours(),
      ref.getUTCMinutes(),
      ref.getUTCSeconds()
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
  if (value.length === 2) return year >= 70 ? 1900 + year : 2000 + year;
  return year;
}

function seekSliderToOffsetMs(value) {
  const amount = Math.min(1, Math.max(0, Math.abs(Number(value) || 0)));
  const seconds = Math.pow(SEEK_MAX_SECONDS + 1, amount) - 1;
  return Math.sign(Number(value) || 0) * seconds * 1000;
}

function formatSeekOffsetLabel(value) {
  const offsetMs = seekSliderToOffsetMs(value);
  if (Math.abs(offsetMs) < 1000) return "Current";
  const direction = offsetMs < 0 ? "-" : "+";
  const seconds = Math.abs(offsetMs) / 1000;
  if (seconds < 60) return `${direction}${Math.round(seconds)} sec`;
  if (seconds < 3600) return `${direction}${round1(seconds / 60)} min`;
  if (seconds < 86400) return `${direction}${round1(seconds / 3600)} h`;
  if (seconds < 365.25 * 86400) return `${direction}${round1(seconds / 86400)} days`;
  return `${direction}${round1(seconds / (365.25 * 86400))} years`;
}

function round1(v) {
  return Math.round(v * 10) / 10;
}

function pad2(v) {
  return String(v).padStart(2, "0");
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function buttonStyle(fontSize) {
  return {
    width: "38px",
    height: "38px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(20,24,40,0.7)",
    color: "#fff",
    fontSize,
    fontWeight: "700",
    cursor: "pointer"
  };
}
