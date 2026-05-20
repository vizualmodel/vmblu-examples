<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  let name = "";

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch("login", { name: trimmed });
  }
</script>

<div class="overlay">
  <div class="card">
    <h1>vmblu chat</h1>
    <div class="row">
      <input
        type="text"
        bind:value={name}
        placeholder="Your name"
        on:keydown={(event) => event.key === "Enter" && submit()}
      />
      <button on:click={submit}>Login</button>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 23, 42, 0.38);
    padding: 20px;
  }
  .card {
    width: min(94vw, 380px);
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 18px;
    box-shadow: 0 20px 40px rgba(15, 23, 42, 0.2);
  }
  h1 {
    margin: 0 0 8px 0;
    font-size: 24px;
    color: #0f172a;
  }
  .row {
    display: flex;
    gap: 8px;
  }
  input {
    flex: 1;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px;
  }
  button {
    border: none;
    border-radius: 8px;
    padding: 10px 14px;
    background: #0f766e;
    color: #fff;
    font-weight: 700;
    cursor: pointer;
  }
</style>
