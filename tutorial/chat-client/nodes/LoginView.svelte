<script lang="ts">
  export interface SubmitPayload {
    displayName: string;
  }

  export let disabled = false;
  export let errorMessage = '';
  export let initialName = '';
  export let statusMessage = '';
  export let onSubmit: (payload: SubmitPayload) => void = () => {};

  let displayName = initialName;
  let localError = '';

  $: visibleError = errorMessage || localError;

  function handleSubmit(): void {
    localError = '';
    const trimmed = displayName.trim();
    if (!trimmed) {
      localError = 'Please enter a display name.';
      return;
    }

    onSubmit({ displayName: trimmed });
  }
</script>

<div class="backdrop" role="dialog" aria-modal="true">
  <form class="modal" autocomplete="off" on:submit|preventDefault={handleSubmit}>
    <header class="modal-header">
      <h1>Welcome back</h1>
      <p class="status">
        {#if statusMessage}
          {statusMessage}
        {:else}
          Choose a display name to join the conversation.
        {/if}
      </p>
    </header>

    <label>
      Display name
      <input
        type="text"
        bind:value={displayName}
        placeholder="Alice"
        {disabled}
        aria-label="Display name"
        aria-required="true"
      />
    </label>

    {#if visibleError}
      <p class="error" role="alert">{visibleError}</p>
    {/if}

    <button type="submit" class="primary" {disabled}>
      {disabled ? 'Joining…' : 'Enter chat'}
    </button>
  </form>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.45);
    z-index: 30;
    padding: 1.5rem;
  }

  .modal {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: min(360px, 92vw);
    padding: clamp(1.5rem, 4vw, 2.2rem);
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 24px 55px rgba(15, 23, 42, 0.2);
    border: 1px solid rgba(226, 232, 240, 0.6);
  }

  .modal-header {
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 1.6rem;
    color: #0f172a;
  }

  .status {
    margin: 0.35rem 0 0;
    color: rgba(15, 23, 42, 0.7);
    font-size: 0.95rem;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-weight: 600;
    color: #1f2937;
  }

  input {
    border: 1px solid rgba(148, 163, 184, 0.8);
    border-radius: 10px;
    padding: 0.7rem 0.85rem;
    font-size: 1rem;
    transition: border 0.2s ease, box-shadow 0.2s ease;
  }

  input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
  }

  input:disabled {
    background: rgba(241, 245, 249, 0.85);
    cursor: not-allowed;
  }

  .error {
    margin: 0;
    font-size: 0.9rem;
    color: #dc2626;
    text-align: center;
  }

  .primary {
    border: none;
    border-radius: 999px;
    padding: 0.8rem;
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
  }

  .primary:hover:enabled {
    transform: translateY(-1px);
    box-shadow: 0 20px 35px rgba(37, 99, 235, 0.28);
  }

  .primary:disabled {
    opacity: 0.7;
    cursor: progress;
    box-shadow: none;
  }
</style>

