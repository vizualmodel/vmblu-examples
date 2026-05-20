import { WebSocketServer } from "ws";

/**
 * @node ws gateway
 */
class WsGatewayNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx;
    this.port = Number(sx?.port || 8080);
    this.nextConnectionId = 1;
    this.connections = new Map();
    this.userByConnection = new Map();

    this.server = new WebSocketServer({ port: this.port });
    this.server.on("connection", (socket) => this.onSocketConnected(socket));
    this.server.on("listening", () => {
      console.log(`[chat-server] ws gateway listening on ws://localhost:${this.port}`);
    });
  }

  onSocketConnected(socket) {
    const connectionId = `c-${this.nextConnectionId++}`;
    this.connections.set(connectionId, socket);

    socket.on("message", (raw) => {
      this.onSocketMessage(connectionId, raw.toString());
    });

    socket.on("close", () => {
      this.connections.delete(connectionId);
      const userId = this.userByConnection.get(connectionId);
      this.userByConnection.delete(connectionId);
      if (userId) this.tx.send("session.user-disconnected", userId);
    });
  }

  onSocketMessage(connectionId, raw) {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (_error) {
      return;
    }

    if (data?.type === "login") {
      this.tx.send("auth.login-received", {
        connectionId,
        userName: (data.userName || "").trim(),
      });
      return;
    }

    if (data?.type === "chat-message") {
      this.tx.send("chat.message-received", {
        userId: data.userId || "",
        text: (data.text || "").trim(),
      });
    }
  }

  /**
   * @param {{ connectionId: string, userId: string, userName: string }} payload
   */
  onAuthLoginResult(payload) {
    const socket = this.connections.get(payload?.connectionId);
    if (!socket || socket.readyState !== 1) return;
    this.userByConnection.set(payload.connectionId, payload.userId);
    socket.send(
      JSON.stringify({
        type: "login-accepted",
        userId: payload.userId,
        userName: payload.userName,
      }),
    );
  }

  /**
   * @param {{ connectionId: string, messages: Array<{ id: string, userId: string, userName: string, text: string, sentAt: string }> }} payload
   */
  onChatHistoryDeliver(payload) {
    const socket = this.connections.get(payload?.connectionId);
    if (!socket || socket.readyState !== 1) return;
    socket.send(
      JSON.stringify({
        type: "chat-history",
        messages: Array.isArray(payload?.messages) ? payload.messages : [],
      }),
    );
  }

  /**
   * @param {{ id: string, userId: string, userName: string, text: string, sentAt: string }} payload
   */
  onChatMessageDeliver(payload) {
    const envelope = JSON.stringify({ type: "chat-message", message: payload });
    for (const socket of this.connections.values()) {
      if (socket.readyState === 1) socket.send(envelope);
    }
  }
}

export function createWsGatewayNode(tx, sx) {
  return new WsGatewayNode(tx, sx);
}

