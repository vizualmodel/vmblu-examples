<script lang="ts">
  import type { Writable } from "svelte/store";

  type ReviewState = {
    proposal: null | { title: string; expectedVersion: string; evidence: string; reason: string };
    status: "idle" | "review" | "submitting" | "committed" | "rejected" | "conflict" | "unavailable" | "uncertain";
    message: string;
  };

  export let reviewStore: Writable<ReviewState>;
  export let onSubmit: (reason: string) => void;
  export let onCancel: () => void;

  let reason = "";
  $: if ($reviewStore.proposal && !reason) reason = $reviewStore.proposal.reason;
  $: busy = $reviewStore.status === "submitting";
</script>

<div class="workspace">
  <header>
    <div><span>Governed operations</span><h1>Action Workspace</h1></div>
    <span class:active={Boolean($reviewStore.proposal)} class="count">{$reviewStore.proposal ? 1 : 0}</span>
  </header>

  {#if $reviewStore.proposal}
    <div class="review">
      <span class="state">Review required · {$reviewStore.proposal.expectedVersion}</span>
      <strong>{$reviewStore.proposal.title}</strong>
      <dl><dt>Evidence</dt><dd>{$reviewStore.proposal.evidence}</dd></dl>
      <label for="action-reason">Decision reason</label>
      <textarea id="action-reason" bind:value={reason} rows="4" disabled={busy}></textarea>
      {#if $reviewStore.message}
        <p class:success={$reviewStore.status === "committed"} class="outcome">{$reviewStore.message}</p>
      {/if}
    </div>
  {:else}
    <div class="empty">
      <div class="review-mark" aria-hidden="true"><span></span><span></span><span></span></div>
      <strong>{$reviewStore.status === "committed" ? "Action committed" : "No actions awaiting review"}</strong>
      <p>{$reviewStore.message || "Select the proposed evacuation zone on the map and send it here for governed review."}</p>
    </div>
  {/if}

  <footer>
    <button type="button" onclick={onCancel} disabled={!$reviewStore.proposal || busy}>Cancel</button>
    <button class="primary" type="button" onclick={() => onSubmit(reason)} disabled={!$reviewStore.proposal || !reason.trim() || busy}>
      {busy ? "Submitting…" : "Approve zone"}
    </button>
  </footer>
</div>

<style>
  .workspace { height: 100%; display: grid; grid-template-rows: auto 1fr auto; color: #e7edf0; }
  header { display: flex; align-items: center; justify-content: space-between; padding: 12px 13px; border-bottom: 1px solid #293840; background: #142028; }
  header div span, .state, dt, label { color: #d49b7c; font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
  h1 { margin: 3px 0 0; font-size: 14px; font-weight: 650; }
  .count { display: grid; width: 25px; height: 25px; place-items: center; border: 1px solid #42515a; border-radius: 50%; color: #7f919a; font-size: 10px; }
  .count.active { border-color: #d49b7c; color: #ffd0b5; }
  .review { min-height: 0; overflow: auto; padding: 14px; }
  .review strong { display: block; margin: 8px 0 12px; font-size: 13px; }
  dl { margin: 0 0 12px; padding: 10px; border: 1px solid #314149; background: #101a20; }
  dt { color: #7c9099; }
  dd { margin: 5px 0 0; color: #b9c6cb; font-size: 10px; line-height: 1.45; }
  label { display: block; margin-bottom: 5px; color: #8ea0a8; }
  textarea { width: 100%; resize: vertical; border: 1px solid #3b4d56; background: #101a20; color: #e7edf0; padding: 8px; font: inherit; font-size: 10px; line-height: 1.45; }
  textarea:focus { border-color: #d49b7c; outline: 0; }
  .outcome { margin: 9px 0 0; color: #ffaaa2; font-size: 9px; line-height: 1.45; }
  .outcome.success { color: #74d1b4; }
  .empty { align-self: center; padding: 22px; text-align: center; }
  .empty strong { display: block; margin-top: 12px; font-size: 12px; }
  .empty p { max-width: 245px; margin: 6px auto 0; color: #788b94; font-size: 10px; line-height: 1.5; }
  .review-mark { display: inline-grid; width: 39px; gap: 4px; padding: 8px; border: 1px solid #4a4b49; }
  .review-mark span { height: 2px; background: #bd8262; }
  .review-mark span:nth-child(2) { width: 74%; }
  footer { display: flex; justify-content: flex-end; gap: 6px; padding: 10px 11px; border-top: 1px solid #26353d; }
  button { height: 29px; padding: 0 10px; border: 1px solid #3d5059; background: #17232a; color: #a8b7bd; cursor: pointer; font-size: 9px; }
  button.primary { border-color: #a7775e; background: #523627; color: #ffe2d2; }
  button:disabled { cursor: default; opacity: .42; }
</style>
