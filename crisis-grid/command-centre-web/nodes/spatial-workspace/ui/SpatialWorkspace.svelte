<script lang="ts">
  import type { Readable } from "svelte/store";
  import type {
    SpatialLayerKey,
    SpatialWorkspaceViewModel,
  } from "../view-model";

  export let viewModelStore: Readable<SpatialWorkspaceViewModel>;
  export let onMapHostReady: (element: HTMLElement) => void | (() => void);
  export let onToggleLayerPanel: () => void;
  export let onToggleLayer: (key: SpatialLayerKey) => void;
  export let onResetView: () => void;
  export let onProposeApproval: () => void;

  function attachMap(element: HTMLElement) {
    const dispose = onMapHostReady(element);
    return { destroy: () => dispose?.() };
  }
</script>

<div class="workspace">
  <header class="panel-header">
    <div>
      <span class="eyebrow">{$viewModelStore.incidentTitle} · synthetic</span>
      <h1>Spatial Workspace</h1>
    </div>
    <div class="tools">
      <button
        class:active={$viewModelStore.showLayers}
        type="button"
        aria-pressed={$viewModelStore.showLayers}
        onclick={onToggleLayerPanel}
      >
        Layers
      </button>
      <button type="button" title="Return to the Antwerp operational extent" onclick={onResetView}>2D</button>
    </div>
  </header>

  <div class="map-stage">
    <div
      class="map"
      use:attachMap
      role="application"
      aria-label="Interactive map of the synthetic Antwerp flood scenario"
    ></div>

    {#if $viewModelStore.showLayers}
      <aside class="layer-panel" aria-label="Operational map layers">
        <div class="layer-heading">
          <span>Operational layers</span>
          <small>{$viewModelStore.featureCount} shared</small>
        </div>
        {#each $viewModelStore.layers as layer (layer.key)}
          <button
            class="layer-toggle"
            class:muted={!layer.visible}
            type="button"
            aria-pressed={layer.visible}
            onclick={() => onToggleLayer(layer.key)}
          >
            <span class={`swatch ${layer.key}`} aria-hidden="true"></span>
            {layer.label}
            <span class="visibility">{layer.visible ? "On" : "Off"}</span>
          </button>
        {/each}
        <p>Fictional data delivered through the shared projection. Click a feature for status and provenance.</p>
      </aside>
    {/if}

    {#if $viewModelStore.selection}
      <aside class="selection-panel" aria-label="Selected operational object">
        <span>{$viewModelStore.selection.kind}</span>
        <strong>{$viewModelStore.selection.title}</strong>
        <em>{$viewModelStore.selection.status}</em>
        <p>{$viewModelStore.selection.detail}</p>
        <small>Source: {$viewModelStore.selection.source}</small>
        {#if $viewModelStore.selection.kind === "evacuation" && $viewModelStore.selection.status.startsWith("Proposed")}
          <button type="button" onclick={onProposeApproval}>Send to Action review</button>
        {/if}
      </aside>
    {/if}

    <div class="map-status"><span></span>{$viewModelStore.mapStatus}</div>
    <div class="coordinates">{$viewModelStore.coordinates}</div>
  </div>
</div>

<style>
  .workspace {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    color: #e7edf0;
  }

  .panel-header {
    min-height: 69px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 15px;
    border-bottom: 1px solid #293840;
    background: #142028;
  }

  .eyebrow {
    display: block;
    margin-bottom: 3px;
    color: #71c2c5;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: 16px;
    font-weight: 650;
  }

  .tools {
    display: flex;
    gap: 5px;
  }

  button {
    font: inherit;
  }

  .tools button {
    height: 28px;
    padding: 0 9px;
    border: 1px solid #3a505a;
    background: #19272f;
    color: #b6c5cb;
    cursor: pointer;
    font-size: 10px;
  }

  .tools button:hover,
  .tools button:focus-visible,
  .tools button.active {
    border-color: #65bec2;
    color: #dffbfb;
    outline: 0;
  }

  .map-stage,
  .map {
    position: relative;
    min-width: 0;
    min-height: 0;
  }

  .map-stage {
    overflow: hidden;
    background: #101a20;
  }

  .map {
    position: absolute;
    inset: 0;
  }

  .layer-panel {
    position: absolute;
    z-index: 3;
    top: 12px;
    left: 12px;
    width: 205px;
    padding: 9px;
    border: 1px solid rgb(93 119 130 / 72%);
    background: rgb(15 27 34 / 94%);
    box-shadow: 0 8px 26px rgb(0 0 0 / 28%);
  }

  .layer-heading {
    display: flex;
    justify-content: space-between;
    padding: 2px 3px 8px;
    color: #dce8ec;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .layer-heading small {
    color: #748993;
    font-size: 8px;
  }

  .layer-toggle {
    width: 100%;
    display: grid;
    grid-template-columns: 13px 1fr auto;
    align-items: center;
    gap: 7px;
    padding: 7px 4px;
    border: 0;
    border-top: 1px solid #2a3c44;
    background: transparent;
    color: #bfccd1;
    cursor: pointer;
    font-size: 10px;
    text-align: left;
  }

  .layer-toggle:hover,
  .layer-toggle:focus-visible {
    background: #1c3039;
    outline: 1px solid #52737e;
  }

  .layer-toggle.muted {
    opacity: 0.48;
  }

  .swatch {
    width: 11px;
    height: 11px;
    border: 2px solid;
  }

  .swatch.flood {
    border-color: #73d3f2;
    background: rgb(54 169 214 / 45%);
  }

  .swatch.closure {
    height: 4px;
    border: 0;
    background: #ff6668;
  }

  .swatch.unit {
    border-color: #09251f;
    border-radius: 50%;
    background: #65d2b3;
  }

  .swatch.evacuation {
    border-color: #ffd36f;
    border-style: dashed;
    background: rgb(241 189 80 / 18%);
  }

  .visibility {
    color: #738791;
    font-size: 8px;
    text-transform: uppercase;
  }

  .layer-panel p {
    margin: 8px 3px 2px;
    color: #78909a;
    font-size: 8px;
    line-height: 1.45;
  }

  .map-status,
  .coordinates {
    position: absolute;
    z-index: 2;
    bottom: 8px;
    padding: 5px 7px;
    background: rgb(15 27 34 / 88%);
    color: #8fa1a9;
    font-size: 8px;
  }

  .map-status {
    left: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .map-status span {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #d4a72c;
  }

  .coordinates {
    right: 36px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .selection-panel {
    position: absolute;
    z-index: 3;
    top: 12px;
    right: 48px;
    width: 230px;
    padding: 12px;
    border: 1px solid rgb(225 178 79 / 75%);
    background: rgb(15 27 34 / 96%);
    box-shadow: 0 8px 26px rgb(0 0 0 / 30%);
  }

  .selection-panel span,
  .selection-panel strong,
  .selection-panel em,
  .selection-panel small {
    display: block;
  }

  .selection-panel span {
    color: #d3a932;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .selection-panel strong {
    margin: 5px 0;
    font-size: 12px;
  }

  .selection-panel em,
  .selection-panel p,
  .selection-panel small {
    color: #8ea0a8;
    font-size: 9px;
    font-style: normal;
    line-height: 1.45;
  }

  .selection-panel p {
    margin: 8px 0;
  }

  .selection-panel button {
    width: 100%;
    margin-top: 10px;
    padding: 7px;
    border: 1px solid #d3a932;
    background: #3b331f;
    color: #ffe6a3;
    cursor: pointer;
    font-size: 9px;
  }
</style>
