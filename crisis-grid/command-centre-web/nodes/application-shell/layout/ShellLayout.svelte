<script lang="ts">
  import { onMount } from "svelte";

  const HANDLE_SIZE = 8;
  const MIN_SITUATION = 210;
  const MIN_SPATIAL = 420;
  const MIN_RIGHT = 260;
  const MIN_STACK = 170;
  const KEYBOARD_STEP = 16;

  type Divider = "situation" | "right" | "stack";

  type DragState = {
    divider: Divider;
    startX: number;
    startY: number;
    startSituation: number;
    startRight: number;
    startTalkRatio: number;
  };

  let workspaceGrid: HTMLElement;
  let rightColumn: HTMLElement;
  let situationWidth = 296;
  let rightWidth = 350;
  let talkRatio = 0.5;
  let drag: DragState | null = null;

  const clamp = (value: number, minimum: number, maximum: number) =>
    Math.min(Math.max(value, minimum), maximum);

  function availableRegionWidth(): number {
    return Math.max(0, (workspaceGrid?.clientWidth ?? 0) - HANDLE_SIZE * 2);
  }

  function setSituationWidth(value: number): void {
    const maximum = Math.max(
      MIN_SITUATION,
      availableRegionWidth() - rightWidth - MIN_SPATIAL,
    );
    situationWidth = clamp(value, MIN_SITUATION, maximum);
  }

  function setRightWidth(value: number): void {
    const maximum = Math.max(
      MIN_RIGHT,
      availableRegionWidth() - situationWidth - MIN_SPATIAL,
    );
    rightWidth = clamp(value, MIN_RIGHT, maximum);
  }

  function stackRatioBounds(): { minimum: number; maximum: number } {
    const height = Math.max(1, (rightColumn?.clientHeight ?? 0) - HANDLE_SIZE);
    const minimum = Math.min(0.45, MIN_STACK / height);
    return { minimum, maximum: 1 - minimum };
  }

  function setTalkRatio(value: number): void {
    const bounds = stackRatioBounds();
    talkRatio = clamp(value, bounds.minimum, bounds.maximum);
  }

  function constrainLayout(): void {
    setRightWidth(rightWidth);
    setSituationWidth(situationWidth);
    setTalkRatio(talkRatio);
  }

  function startDrag(divider: Divider, event: PointerEvent): void {
    event.preventDefault();
    drag = {
      divider,
      startX: event.clientX,
      startY: event.clientY,
      startSituation: situationWidth,
      startRight: rightWidth,
      startTalkRatio: talkRatio,
    };
    document.body.style.cursor = divider === "stack" ? "row-resize" : "col-resize";
    document.body.style.userSelect = "none";
  }

  function moveDivider(event: PointerEvent): void {
    if (!drag) return;

    if (drag.divider === "situation") {
      setSituationWidth(drag.startSituation + event.clientX - drag.startX);
      return;
    }

    if (drag.divider === "right") {
      setRightWidth(drag.startRight - (event.clientX - drag.startX));
      return;
    }

    const height = Math.max(1, rightColumn.clientHeight - HANDLE_SIZE);
    const startTalkHeight = drag.startTalkRatio * height;
    setTalkRatio((startTalkHeight + event.clientY - drag.startY) / height);
  }

  function stopDrag(): void {
    if (!drag) return;
    drag = null;
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
  }

  function resizeWithKeyboard(divider: Divider, event: KeyboardEvent): void {
    let handled = true;

    if (divider === "situation" && event.key === "ArrowLeft") {
      setSituationWidth(situationWidth - KEYBOARD_STEP);
    } else if (divider === "situation" && event.key === "ArrowRight") {
      setSituationWidth(situationWidth + KEYBOARD_STEP);
    } else if (divider === "right" && event.key === "ArrowLeft") {
      setRightWidth(rightWidth + KEYBOARD_STEP);
    } else if (divider === "right" && event.key === "ArrowRight") {
      setRightWidth(rightWidth - KEYBOARD_STEP);
    } else if (divider === "stack" && event.key === "ArrowUp") {
      setTalkRatio(talkRatio - KEYBOARD_STEP / Math.max(1, rightColumn.clientHeight));
    } else if (divider === "stack" && event.key === "ArrowDown") {
      setTalkRatio(talkRatio + KEYBOARD_STEP / Math.max(1, rightColumn.clientHeight));
    } else {
      handled = false;
    }

    if (handled) event.preventDefault();
  }

  onMount(() => {
    window.addEventListener("pointermove", moveDivider);
    window.addEventListener("pointerup", stopDrag);
    window.addEventListener("pointercancel", stopDrag);
    window.addEventListener("resize", constrainLayout);
    constrainLayout();

    return () => {
      window.removeEventListener("pointermove", moveDivider);
      window.removeEventListener("pointerup", stopDrag);
      window.removeEventListener("pointercancel", stopDrag);
      window.removeEventListener("resize", constrainLayout);
      stopDrag();
    };
  });
</script>

<svelte:head>
  <meta
    name="description"
    content="CrisisGrid Command Centre workspace layout preview"
  />
</svelte:head>

<div class="shell">
  <header class="topbar">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true">CG</span>
      <div>
        <strong>CrisisGrid</strong>
        <span>Command Centre</span>
      </div>
    </div>

    <div class="preview-state" aria-label="Application state">
      <span class="state-dot" aria-hidden="true"></span>
      Operational Core
      <small>Synthetic exercise · governed service</small>
    </div>

    <button class="operator" type="button" disabled aria-label="Operator menu unavailable">
      <span>OP</span>
      Demo operator
    </button>
  </header>

  <main
    class="workspace-grid"
    aria-label="Command centre workspaces"
    bind:this={workspaceGrid}
    style={`grid-template-columns: ${situationWidth}px ${HANDLE_SIZE}px minmax(${MIN_SPATIAL}px, 1fr) ${HANDLE_SIZE}px ${rightWidth}px`}
  >
    <section id="ccw-region-situation" class="region situation" aria-label="Situation Dashboard"></section>

    <!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
    <div
      class:active={drag?.divider === "situation"}
      class="resizer vertical"
      role="separator"
      aria-label="Resize Situation Dashboard"
      aria-orientation="vertical"
      aria-valuemin={MIN_SITUATION}
      aria-valuenow={Math.round(situationWidth)}
      tabindex="0"
      title="Drag to resize Situation Dashboard"
      onpointerdown={(event) => startDrag("situation", event)}
      onkeydown={(event) => resizeWithKeyboard("situation", event)}
    ></div>

    <section id="ccw-region-spatial" class="region spatial" aria-label="Spatial Workspace"></section>

    <!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
    <div
      class:active={drag?.divider === "right"}
      class="resizer vertical"
      role="separator"
      aria-label="Resize right workspace column"
      aria-orientation="vertical"
      aria-valuemin={MIN_RIGHT}
      aria-valuenow={Math.round(rightWidth)}
      tabindex="0"
      title="Drag to resize Talk and Action Workspaces"
      onpointerdown={(event) => startDrag("right", event)}
      onkeydown={(event) => resizeWithKeyboard("right", event)}
    ></div>

    <div
      class="right-column"
      bind:this={rightColumn}
      style={`grid-template-rows: minmax(${MIN_STACK}px, calc(${talkRatio * 100}% - ${HANDLE_SIZE / 2}px)) ${HANDLE_SIZE}px minmax(${MIN_STACK}px, 1fr)`}
    >
      <section id="ccw-region-talk" class="region talk" aria-label="Talk Workspace"></section>

      <!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
      <div
        class:active={drag?.divider === "stack"}
        class="resizer horizontal"
        role="separator"
        aria-label="Resize Talk and Action Workspaces"
        aria-orientation="horizontal"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(talkRatio * 100)}
        tabindex="0"
        title="Drag to resize Talk and Action Workspaces"
        onpointerdown={(event) => startDrag("stack", event)}
        onkeydown={(event) => resizeWithKeyboard("stack", event)}
      ></div>

      <section id="ccw-region-action" class="region action" aria-label="Action Workspace"></section>
    </div>
  </main>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(html) {
    min-width: 960px;
    background: #0a1116;
  }

  :global(body) {
    margin: 0;
    min-width: 960px;
    min-height: 100vh;
    overflow: auto;
    background: #0a1116;
    color: #e8eef2;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  :global(button),
  :global(input) {
    font: inherit;
  }

  .shell {
    min-height: 100vh;
    display: grid;
    grid-template-rows: 64px minmax(620px, calc(100vh - 64px));
    background: #0d151b;
  }

  .topbar {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 24px;
    padding: 0 18px;
    border-bottom: 1px solid #26343d;
    background: #111b22;
  }

  .brand,
  .operator,
  .preview-state {
    display: flex;
    align-items: center;
  }

  .brand {
    gap: 11px;
  }

  .brand-mark {
    display: grid;
    width: 35px;
    height: 35px;
    place-items: center;
    border: 1px solid #66b9be;
    color: #8fd8da;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .brand div {
    display: grid;
    gap: 1px;
  }

  .brand strong {
    font-size: 14px;
    letter-spacing: 0.02em;
  }

  .brand div span {
    color: #83949f;
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .preview-state {
    gap: 8px;
    color: #b8c6ce;
    font-size: 12px;
  }

  .preview-state small {
    margin-left: 6px;
    padding-left: 14px;
    border-left: 1px solid #34434c;
    color: #74858f;
  }

  .state-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #d4a72c;
    box-shadow: 0 0 0 4px rgb(212 167 44 / 12%);
  }

  .operator {
    justify-self: end;
    gap: 9px;
    border: 0;
    background: transparent;
    color: #a7b5bd;
    font-size: 12px;
  }

  .operator span {
    display: grid;
    width: 30px;
    height: 30px;
    place-items: center;
    border-radius: 50%;
    background: #25343c;
    color: #dce6eb;
    font-size: 10px;
    font-weight: 700;
  }

  .workspace-grid {
    min-width: 0;
    min-height: 0;
    display: grid;
    padding: 8px;
    background: #0a1116;
  }

  .right-column {
    min-width: 0;
    min-height: 0;
    display: grid;
  }

  .region {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    border: 1px solid #26343d;
    background: #111b22;
  }

  .resizer {
    position: relative;
    z-index: 5;
    border: 0;
    outline: 0;
    background: #0a1116;
    touch-action: none;
  }

  .resizer.vertical {
    cursor: col-resize;
  }

  .resizer.horizontal {
    cursor: row-resize;
  }

  .resizer::after {
    position: absolute;
    background: #263740;
    content: "";
    transition:
      background 120ms ease,
      box-shadow 120ms ease;
  }

  .resizer.vertical::after {
    top: 0;
    bottom: 0;
    left: 3px;
    width: 2px;
  }

  .resizer.horizontal::after {
    top: 3px;
    right: 0;
    left: 0;
    height: 2px;
  }

  .resizer:hover::after,
  .resizer:focus-visible::after,
  .resizer.active::after {
    background: #70c5c8;
    box-shadow: 0 0 8px rgb(112 197 200 / 48%);
  }

  .resizer:focus-visible {
    outline: 1px solid #70c5c8;
    outline-offset: -1px;
  }
</style>
