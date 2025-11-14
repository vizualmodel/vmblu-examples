<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export interface ChatMessage {
    id: string;
    userId: string;
    displayName: string;
    text: string;
    timestamp: string;
  }

  export let messages: ChatMessage[] = [];
  export let currentUserId: string | null = null;
  export let currentUserName = '';
  export let isActive = false;
  export let statusMessage = '';

  const dispatch = createEventDispatcher<{ logout: void }>();

  function handleLogout(): void {
    if (isActive) {
      dispatch('logout');
    }
  }

  $: prepared = messages.map((message) => {
    const date = new Date(message.timestamp);
    return {
      ...message,
      isSelf: currentUserId != null && message.userId === currentUserId,
      timeLabel: Number.isNaN(date.valueOf())
        ? ''
        : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });
</script>

<div class="timeline-panel">
  <header class="panel-header">
    <div class="identity">
      {#if isActive}
        <span class="label">Signed in as</span>
        <strong>{currentUserName}</strong>
      {:else}
        <span class="label">Status</span>
        <strong>Not connected</strong>
      {/if}
    </div>
    <button
      type="button"
      class="logout"
      on:click={handleLogout}
      disabled={!isActive}
      aria-disabled={!isActive}
    >
      Log out
    </button>
  </header>

  <section class="timeline-body" aria-live="polite" aria-busy={!isActive}>
    {#if !isActive}
      <p class="empty">{statusMessage || 'Sign in to start chatting.'}</p>
    {:else if prepared.length === 0}
      <p class="empty">No messages yet. Say hi!</p>
    {:else}
      {#each prepared as message (message.id)}
        <article class:own={message.isSelf} class="bubble">
          <header>
            <span class="author">{message.displayName}</span>
            {#if message.timeLabel}
              <time datetime={message.timestamp}>{message.timeLabel}</time>
            {/if}
          </header>
          <p class="body">{message.text}</p>
        </article>
      {/each}
    {/if}
  </section>
</div>

<style>
  .timeline-panel {
    width: 100%;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.12);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(148, 163, 184, 0.2);
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid rgba(226, 232, 240, 0.9);
    background: rgba(248, 250, 252, 0.75);
  }

  .identity {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    color: #1e293b;
  }

  .identity .label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: rgba(30, 41, 59, 0.6);
  }

  .logout {
    border: none;
    border-radius: 999px;
    padding: 0.45rem 1.25rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #f87171, #ef4444);
    cursor: pointer;
    transition: transform 0.16s ease, box-shadow 0.16s ease, opacity 0.16s ease;
  }

  .logout:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(239, 68, 68, 0.25);
  }

  .logout:disabled {
    cursor: not-allowed;
    opacity: 0.5;
    box-shadow: none;
  }

  .timeline-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.2rem 1.3rem 1.4rem;
    max-height: min(60vh, 460px);
    overflow-y: auto;
    background: linear-gradient(180deg, rgba(248, 250, 252, 0.9), rgba(241, 245, 249, 0.9));
  }

  .timeline-body::-webkit-scrollbar {
    width: 8px;
  }

  .timeline-body::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.45);
    border-radius: 999px;
  }

  .empty {
    margin: 2rem auto;
    font-size: 0.95rem;
    color: #475569;
    text-align: center;
  }

  .bubble {
    align-self: flex-start;
    max-width: 70%;
    padding: 0.7rem 0.9rem;
    border-radius: 16px;
    background: rgba(59, 130, 246, 0.18);
    color: #1e293b;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
  }

  .bubble.own {
    align-self: flex-end;
    background: rgba(16, 185, 129, 0.22);
  }

  .bubble header {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.35rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: #0f172a;
  }

  .bubble.own header {
    color: #03543f;
  }

  time {
    font-weight: 500;
    color: rgba(15, 23, 42, 0.55);
  }

  .body {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 0.97rem;
    line-height: 1.5;
  }
</style>
