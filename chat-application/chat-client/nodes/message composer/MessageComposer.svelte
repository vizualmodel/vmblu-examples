<script>
  import { createEventDispatcher } from "svelte";

  export let disabledStore;
  let text = "";
  const dispatch = createEventDispatcher();

  function send() {
    const trimmed = text.trim();
    if (!trimmed || $disabledStore) return;
    dispatch("send", { text: trimmed });
    text = "";
  }
</script>

<div class="composer">
  <input
    type="text"
    bind:value={text}
    placeholder="Type a message..."
    disabled={$disabledStore}
    on:keydown={(event) => event.key === "Enter" && send()}
  />
  <button disabled={$disabledStore} on:click={send}>Send</button>
</div>

<style>
  .composer {
    display: flex;
    gap: 8px;
    padding: 12px;
    border-top: 1px solid #e5e7eb;
    background: #fff;
  }
  input {
    flex: 1;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px 12px;
  }
  button {
    border: none;
    border-radius: 8px;
    padding: 10px 14px;
    font-weight: 700;
    background: #2563eb;
    color: #fff;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
