<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let disabled = true;
  export let errorMessage = '';

  const dispatch = createEventDispatcher<{ send: { text: string } }>();

  let message = '';
  let localError = '';

  $: visibleError = errorMessage || localError;

  function submit(): void {
    localError = '';
    const trimmed = message.trim();
    if (!trimmed) {
      localError = 'Write something before sending.';
      return;
    }
    dispatch('send', { text: trimmed });
    message = '';
  }
</script>

<form class="composer" on:submit|preventDefault={submit}>
  <textarea
    bind:value={message}
    placeholder="Type a message…"
    rows="3"
    {disabled}
    aria-label="Message"
  />
  <div class="actions">
    {#if visibleError}
      <span class="error" role="alert">{visibleError}</span>
    {/if}
    <button type="submit" class="primary" {disabled}>Send</button>
  </div>
</form>

<style>
  .composer {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.1rem;
    margin: 0 auto;
    /* width: 100%; */
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(10px);
    box-shadow: 0 18px 32px rgba(15, 23, 42, 0.12);
    border: 1px solid rgba(148, 163, 184, 0.2);
  }

  textarea {
    resize: none;
    border: 1px solid rgba(148, 163, 184, 0.6);
    border-radius: 12px;
    padding: 0.85rem 1rem;
    font-size: 1rem;
    font-family: inherit;
    min-height: 112px;
    transition: border 0.2s ease, box-shadow 0.2s ease;
  }

  textarea:focus {
    outline: none;
    border-color: #2c7be5;
    box-shadow: 0 0 0 3px rgba(44, 123, 229, 0.2);
  }

  textarea:disabled {
    background: rgba(241, 245, 249, 0.7);
    cursor: not-allowed;
  }

  .actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .error {
    color: #c53030;
    font-size: 0.85rem;
  }

  .primary {
    border: none;
    border-radius: 999px;
    padding: 0.6rem 1.75rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #22b679, #0ea765);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .primary:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(14, 167, 101, 0.24);
  }

  .primary:disabled {
    opacity: 0.65;
    cursor: progress;
    box-shadow: none;
  }
</style>


