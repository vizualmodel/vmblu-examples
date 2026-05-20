/**
 * @node client controller
 */
class ClientControllerNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx;
    this.currentUserId = "";
    this.currentUserName = "";
    this.loggedIn = false;
    this.connectionState = "disconnected";

    this.mountShell();

    setTimeout(() => {
      this.initializeUi();
    }, 0);
  }

  mountShell() {
    this.root = document.createElement("main");
    this.root.className = "vmblu-shell";

    this.top = document.createElement("header");
    this.top.className = "vmblu-top";
    this.title = document.createElement("h1");
    this.title.textContent = "vmblu chat";
    this.status = document.createElement("span");
    this.status.className = "vmblu-status";
    this.userBadge = document.createElement("span");
    this.userBadge.className = "vmblu-user";

    const right = document.createElement("div");
    right.className = "vmblu-top-right";
    right.append(this.userBadge, this.status);
    this.top.append(this.title, right);

    this.historySlot = document.createElement("section");
    this.historySlot.className = "vmblu-history-slot";
    this.composerSlot = document.createElement("section");
    this.composerSlot.className = "vmblu-composer-slot";
    this.overlaySlot = document.createElement("section");
    this.overlaySlot.className = "vmblu-overlay-slot";

    this.root.append(this.top, this.historySlot, this.composerSlot, this.overlaySlot);
    document.body.append(this.root);

    const style = document.createElement("style");
    style.textContent = `
      .vmblu-shell { position: relative; min-height: 100vh; max-width: 900px; margin: 0 auto; background: #f8fafc; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
      .vmblu-top { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #ffffff; border-bottom: 1px solid #e5e7eb; }
      .vmblu-top h1 { margin: 0; font-size: 20px; color: #0f172a; }
      .vmblu-top-right { display: flex; align-items: center; gap: 8px; }
      .vmblu-user { font-size: 12px; color: #1f2937; background: #e5e7eb; border-radius: 999px; padding: 4px 8px; }
      .vmblu-status { font-size: 12px; border-radius: 999px; padding: 4px 8px; background: #e2e8f0; color: #334155; }
      .vmblu-status.connected { background: #dcfce7; color: #166534; }
      .vmblu-status.connecting { background: #fef3c7; color: #92400e; }
      .vmblu-status.error { background: #fee2e2; color: #991b1b; }
      .vmblu-overlay-slot { position: absolute; inset: 0; pointer-events: none; }
      .vmblu-overlay-slot > * { pointer-events: auto; }
    `;
    document.head.appendChild(style);

    this.setStatus("disconnected");
    this.setUser("");
  }

  async initializeUi() {
    let loginView = null;
    let historyView = null;
    let composerView = null;

    try {
      loginView = await this.tx.request("ui.get-login-view", {});
    } catch (_error) {
      loginView = null;
    }

    try {
      historyView = await this.tx.request("ui.get-history-view", {});
    } catch (_error) {
      historyView = null;
    }

    try {
      composerView = await this.tx.request("ui.get-composer-view", {});
    } catch (_error) {
      composerView = null;
    }

    this.mountView(loginView);
    this.mountView(historyView);
    this.mountView(composerView);

    this.setLoggedOutLayout();
    this.tx.send("history.current-user", "");
    this.tx.send("net.connection-state", "disconnected");
  }

  mountView(view) {
    const element = view?.element;
    if (!(element instanceof HTMLElement)) return;
    const slot = (view.slot || "").toLowerCase();

    if (slot === "overlay") {
      this.loginViewElement = element;
      this.overlaySlot.replaceChildren(element);
      return;
    }
    if (slot === "composer") {
      this.composerViewElement = element;
      this.composerSlot.replaceChildren(element);
      return;
    }
    this.historyViewElement = element;
    this.historySlot.replaceChildren(element);
  }

  setLoggedInLayout() {
    if (this.loginViewElement) this.loginViewElement.style.display = "none";
    if (this.historyViewElement) this.historyViewElement.style.display = "";
    if (this.composerViewElement) this.composerViewElement.style.display = "";
  }

  setLoggedOutLayout() {
    if (this.loginViewElement) this.loginViewElement.style.display = "";
    if (this.historyViewElement) this.historyViewElement.style.display = "none";
    if (this.composerViewElement) this.composerViewElement.style.display = "none";
  }

  setStatus(value) {
    const state = (value || "disconnected").toLowerCase();
    this.connectionState = state;
    this.status.textContent = state;
    this.status.className = "vmblu-status";
    if (state === "connected" || state === "connecting" || state === "error") {
      this.status.classList.add(state);
    }
  }

  setUser(name) {
    this.currentUserName = name || "";
    this.userBadge.textContent = this.currentUserName
      ? `User: ${this.currentUserName}`
      : "User: -";
  }

  /**
   * @param {{ name: string }} payload
   */
  onAuthLoginSubmitted(payload) {
    const name = (payload?.name || "").trim();
    if (!name) return;
    this.tx.send("net.connection-state", "connecting");
    this.setStatus("connecting");
    this.tx.send("auth.connect-request", { name });
  }

  /**
   * @param {{ userId: string, userName: string }} payload
   */
  onAuthConnected(payload) {
    this.currentUserId = payload?.userId || "";
    this.loggedIn = Boolean(this.currentUserId);
    this.setUser(payload?.userName || "");
    this.tx.send("history.current-user", this.currentUserId);
    this.setLoggedInLayout();
    this.tx.send("net.connection-state", "connected");
    this.setStatus("connected");
  }

  /**
   * @param {any} payload
   */
  onAuthLogoutRequest(payload) {
    void payload;
    this.loggedIn = false;
    this.currentUserId = "";
    this.setUser("");
    this.tx.send("auth.disconnect-request", {});
    this.tx.send("history.current-user", "");
    this.tx.send("net.connection-state", "disconnected");
    this.setLoggedOutLayout();
    this.setStatus("disconnected");
  }

  /**
   * @param {{ messages: Array<{ id: string, userId: string, userName: string, text: string, sentAt: string }> }} payload
   */
  onChatHistoryReceived(payload) {
    this.tx.send("history.message-list", payload || { messages: [] });
  }

  /**
   * @param {{ id: string, userId: string, userName: string, text: string, sentAt: string }} payload
   */
  onChatIncomingMessage(payload) {
    this.tx.send("history.append-message", payload);
  }

  /**
   * @param {string} payload
   */
  onChatSendMessage(payload) {
    if (!this.loggedIn || !this.currentUserId) return;
    const text = (payload || "").trim();
    if (!text) return;
    this.tx.send("chat.outgoing-message", {
      userId: this.currentUserId,
      text,
    });
  }

  /**
   * @param {string} payload
   */
  onNetConnectionState(payload) {
    const state = (payload || "disconnected").toLowerCase();
    this.tx.send("net.connection-state", state);
    this.setStatus(state);

    if (state === "disconnected" || state === "error") {
      this.loggedIn = false;
      this.currentUserId = "";
      this.setUser("");
      this.tx.send("history.current-user", "");
      this.setLoggedOutLayout();
    }
  }
}

export function createClientControllerNode(tx, sx) {
  return new ClientControllerNode(tx, sx);
}
