<script>
  import { afterUpdate, createEventDispatcher } from "svelte";

  export let messagesStore;
  export let localUserIdStore;
  export let connectionStateStore;
  const dispatch = createEventDispatcher();

  let container;

  function formatTime(isoText) {
    const date = new Date(isoText);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  afterUpdate(() => {
    if (container) container.scrollTop = container.scrollHeight;
  });
</script>

<section class="history" bind:this={container}>
  {#if $messagesStore.length === 0}
    <p class="empty">No messages yet.</p>
  {/if}
  {#each $messagesStore as message (message.id)}
    <article class={`msg ${message.userId === $localUserIdStore ? "mine" : "other"}`}>
      <div class="meta">{message.userName} {formatTime(message.sentAt)}</div>
      <div class="text">{message.text}</div>
    </article>
  {/each}
</section>
<div class="footer">
  <span class={`state {$connectionStateStore}`}>{$connectionStateStore}</span>
  <button class="logout" on:click={() => dispatch("logout")}>Logout</button>
</div>

<style>
  .history {
    min-height: 360px;
    max-height: 60vh;
    overflow: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  }
  .empty {
    margin: auto;
    color: #64748b;
  }
  .msg {
    max-width: 72%;
    border-radius: 14px;
    padding: 10px 12px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    word-break: break-word;
  }
  .msg.other {
    align-self: flex-start;
    background: #bfdbfe;
    color: #0c4a6e;
    border-bottom-left-radius: 4px;
  }
  .msg.mine {
    align-self: flex-end;
    background: #bbf7d0;
    color: #14532d;
    border-bottom-right-radius: 4px;
  }
  .meta {
    font-size: 11px;
    opacity: 0.8;
    margin-bottom: 4px;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 12px;
    background: #fff;
    border-top: 1px solid #e5e7eb;
  }
  .state {
    font-size: 12px;
    color: #334155;
    background: #e2e8f0;
    border-radius: 999px;
    padding: 4px 8px;
  }
  .state.connected {
    background: #dcfce7;
    color: #166534;
  }
  .state.connecting {
    background: #fef3c7;
    color: #92400e;
  }
  .state.error {
    background: #fee2e2;
    color: #991b1b;
  }
  .logout {
    border: none;
    border-radius: 8px;
    padding: 8px 12px;
    font-weight: 700;
    background: #dc2626;
    color: #fff;
    cursor: pointer;
  }
</style>
