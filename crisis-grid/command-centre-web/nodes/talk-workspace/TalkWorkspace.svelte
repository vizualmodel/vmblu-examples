<div class="workspace">
  <header>
    <div>
      <span>Communications</span>
      <h1>Talk Workspace</h1>
    </div>
    <button type="button" disabled aria-label="New conversation unavailable">+</button>
  </header>

  <div class="content">
    <div class="empty-icon" aria-hidden="true"><i></i><i></i><i></i></div>
    <strong>No active conversations</strong>
    <p>Field communication will be presented here from the shared operational picture.</p>
  </div>

  <footer>
    <span aria-hidden="true"></span>
    Communication controls not connected
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 13px;
    border-bottom: 1px solid #293840;
    background: #142028;
  }

  header span {
    color: #7fb6d0;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  h1 {
    margin: 3px 0 0;
    font-size: 14px;
    font-weight: 650;
  }

  button {
    width: 29px;
    height: 29px;
    border: 1px solid #33464f;
    background: #19272f;
    color: #667983;
    font-size: 17px;
  }

  .content {
    align-self: center;
    padding: 22px;
    text-align: center;
  }

  .content strong {
    display: block;
    margin-top: 12px;
    font-size: 12px;
  }

  .content p {
    max-width: 230px;
    margin: 6px auto 0;
    color: #788b94;
    font-size: 10px;
    line-height: 1.5;
  }

  .empty-icon {
    display: inline-flex;
    align-items: flex-end;
    gap: 3px;
    width: 38px;
    height: 31px;
    justify-content: center;
    border: 1px solid #3a4c55;
    padding: 8px;
  }

  .empty-icon i {
    width: 3px;
    height: 8px;
    background: #6da9c4;
  }

  .empty-icon i:nth-child(2) {
    height: 14px;
  }

  .empty-icon i:nth-child(3) {
    height: 5px;
  }

  footer {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 12px;
    border-top: 1px solid #26353d;
    color: #62747d;
    font-size: 9px;
  }

  footer span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #6a7980;
  }
</style>
