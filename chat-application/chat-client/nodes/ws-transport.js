/**
 * @node ws transport
 */
class WsTransportNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx;
    this.url = sx?.url || "ws://localhost:8080";
    this.socket = null;
    this.pendingUserName = "";

    this.tx.send("net.connection-state", "disconnected");
  }

  /**
   * @param {{ name: string }} payload
   */
  onAuthConnectRequest(payload) {
    const name = (payload?.name || "").trim();
    if (!name) return;
    this.pendingUserName = name;

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.CONNECTING ||
        this.socket.readyState === WebSocket.OPEN)
    ) {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.sendMessage({ type: "login", userName: this.pendingUserName });
      }
      return;
    }

    this.connect();
  }

  /**
   * @param {any} payload
   */
  onAuthDisconnectRequest(payload) {
    void payload;
    this.pendingUserName = "";
    this.closeSocket();
    this.tx.send("net.connection-state", "disconnected");
  }

  /**
   * @param {{ userId: string, text: string }} payload
   */
  onChatOutgoingMessage(payload) {
    const userId = payload?.userId || "";
    const text = (payload?.text || "").trim();
    if (!userId || !text) return;
    this.sendMessage({ type: "chat-message", userId, text });
  }

  connect() {
    this.tx.send("net.connection-state", "connecting");
    this.socket = new WebSocket(this.url);

    this.socket.addEventListener("open", () => {
      this.tx.send("net.connection-state", "connected");
      this.sendMessage({ type: "login", userName: this.pendingUserName });
    });

    this.socket.addEventListener("message", (event) => {
      this.onServerMessage(event.data);
    });

    this.socket.addEventListener("close", () => {
      this.tx.send("net.connection-state", "disconnected");
      this.socket = null;
    });

    this.socket.addEventListener("error", () => {
      this.tx.send("net.connection-state", "error");
    });
  }

  onServerMessage(raw) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (_error) {
      return;
    }

    if (data?.type === "login-accepted") {
      this.tx.send("auth.connected", {
        userId: data.userId,
        userName: data.userName,
      });
      return;
    }

    if (data?.type === "chat-history") {
      this.tx.send("chat.history-received", {
        messages: Array.isArray(data.messages) ? data.messages : [],
      });
      return;
    }

    if (data?.type === "chat-message" && data.message) {
      this.tx.send("chat.incoming-message", data.message);
    }
  }

  sendMessage(message) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
    this.socket.send(JSON.stringify(message));
  }

  closeSocket() {
    if (!this.socket) return;
    if (
      this.socket.readyState === WebSocket.OPEN ||
      this.socket.readyState === WebSocket.CONNECTING
    ) {
      this.socket.close();
    }
    this.socket = null;
  }
}

export function createWsTransportNode(tx, sx) {
  return new WsTransportNode(tx, sx);
}
