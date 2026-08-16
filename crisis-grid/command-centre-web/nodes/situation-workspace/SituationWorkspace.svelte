<script lang="ts">
  import type { Readable } from "svelte/store";
  import type { CommandCentreProjection } from "../../shared/operational-picture/types";

  export let projectionStore: Readable<CommandCentreProjection | null>;

  $: projection = $projectionStore;
  $: situation = projection?.picture.situation;

  function displayTime(value?: string): string {
    if (!value) return "Unknown";
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    }).format(new Date(value));
  }
</script>

<div class="workspace">
  <header>
    <span>{projection?.picture.incidentTitle ?? "Situation"}</span>
    <h1>Situation Dashboard</h1>
  </header>

  <div class="content">
    {#if projection?.degradation}
      <section class="degradation" aria-label="Projection degradation">
        <strong>Connection degraded</strong>
        <span>{(projection.degradation as { reason?: string }).reason ?? "The displayed projection may be stale."}</span>
      </section>
    {/if}
    {#if situation}
      <section class="assessment" aria-label="Current operational assessment">
        <div class="assessment-heading">
          <span>{situation.severity}</span>
          <time datetime={situation.observedAt}>{displayTime(situation.observedAt)}</time>
        </div>
        <strong>{situation.phase}</strong>
        <p>{situation.headline}</p>
      </section>

      <section class="metrics" aria-label="Situation counts">
        <article><strong>{situation.activeUnitCount}</strong><span>Active units</span></article>
        <article><strong>{situation.closedRouteCount}</strong><span>Closed routes</span></article>
        <article><strong>{situation.proposedZoneCount}/{situation.approvedZoneCount}</strong><span>Proposed / approved</span></article>
      </section>

      {#if projection?.picture.tasks?.length}
        <section class="operational-update" aria-label="Resulting operational task">
          <span>Assigned task</span>
          <strong>{projection.picture.tasks[0].title}</strong>
          <small>{projection.picture.tasks[0].status} · {projection.picture.tasks[0].owner}</small>
        </section>
      {/if}

      {#if projection?.picture.auditTrail?.length}
        <section class="operational-update" aria-label="Latest audit record">
          <span>Latest audit</span>
          <strong>{projection.picture.auditTrail[0].action}</strong>
          <small>{projection.picture.auditTrail[0].actorId} · {projection.picture.auditTrail[0].reason}</small>
        </section>
      {/if}

      <section class="provenance">
        <span>Projection source</span>
        <strong>Operational Core service · {projection?.version ?? "unversioned"}</strong>
        <small>Synthetic exercise data — not an operational authority</small>
      </section>
    {:else}
      <div class="empty-state">
        <span class="signal" aria-hidden="true"></span>
        <strong>Awaiting projection</strong>
        <p>Incident status will appear when Operational Picture publishes a shared projection.</p>
      </div>
    {/if}
  </div>

  <footer>
    {projection ? `Incident ${projection.incidentId} · shared projection` : "Workspace allocated · no incident open"}
  </footer>
</div>

<style>
  .workspace {
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr auto;
    color: #e7edf0;
  }

  header {
    padding: 13px 14px 12px;
    border-bottom: 1px solid #293840;
    background: #142028;
  }

  header span {
    color: #d3a932;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  h1 {
    margin: 4px 0 0;
    font-size: 15px;
    font-weight: 650;
  }

  .content {
    min-height: 0;
    overflow: auto;
    padding: 14px;
  }

  .empty-state {
    padding: 16px 13px;
    border: 1px solid #304049;
    background: #101a20;
  }

  .degradation {
    margin-bottom: 8px;
    padding: 9px 10px;
    border: 1px solid #8c633b;
    background: #2a2118;
  }

  .degradation strong,
  .degradation span {
    display: block;
  }

  .degradation strong {
    color: #f0bd78;
    font-size: 9px;
    text-transform: uppercase;
  }

  .degradation span {
    margin-top: 3px;
    color: #baa68e;
    font-size: 9px;
  }

  .assessment,
  .provenance,
  .operational-update {
    padding: 13px;
    border: 1px solid #304049;
    background: #101a20;
  }

  .assessment-heading {
    display: flex;
    justify-content: space-between;
    color: #d3a932;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .assessment-heading time {
    color: #748892;
    font-weight: 500;
  }

  .assessment strong {
    display: block;
    margin: 12px 0 6px;
    font-size: 13px;
  }

  .assessment p,
  .provenance small {
    color: #8ea0a8;
    font-size: 10px;
    line-height: 1.5;
  }

  .assessment p {
    margin: 0;
  }

  .metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    margin: 8px 0;
  }

  .metrics article {
    min-width: 0;
    padding: 10px 7px;
    border: 1px solid #293a42;
    background: #142128;
  }

  .metrics strong,
  .metrics span {
    display: block;
  }

  .metrics strong {
    color: #75c8c8;
    font-size: 18px;
  }

  .metrics span {
    margin-top: 3px;
    color: #7d9099;
    font-size: 8px;
  }

  .provenance span,
  .provenance strong,
  .provenance small,
  .operational-update span,
  .operational-update strong,
  .operational-update small {
    display: block;
  }

  .provenance span {
    color: #72858e;
    font-size: 8px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .provenance strong {
    margin: 5px 0 4px;
    font-size: 10px;
  }

  .operational-update {
    margin-bottom: 8px;
  }

  .operational-update span {
    color: #74c9b1;
    font-size: 8px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .operational-update strong {
    margin: 5px 0 3px;
    font-size: 10px;
  }

  .operational-update small {
    color: #7f929a;
    font-size: 9px;
    line-height: 1.4;
  }

  .empty-state strong {
    display: block;
    margin: 10px 0 5px;
    font-size: 12px;
  }

  .empty-state p {
    margin: 0;
    color: #7f919a;
    font-size: 10px;
    line-height: 1.5;
  }

  .signal {
    display: block;
    width: 34px;
    height: 12px;
    border-top: 1px solid #d3a932;
    border-bottom: 1px solid #d3a932;
    opacity: 0.8;
  }

  footer {
    padding: 9px 13px;
    border-top: 1px solid #26353d;
    color: #62747d;
    font-size: 9px;
  }
</style>
