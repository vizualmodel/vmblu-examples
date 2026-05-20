/**
 * @node chat state
 */
class ChatStateNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx;
    this.maxMessages = Number(sx?.maxMessages || 500);
    this.nextUserId = 1;
    this.nextMessageId = 1;
    this.users = new Map();
    this.messages = [];
  }

  /**
   * @param {{ connectionId: string, userName: string }} payload
   */
  onAuthLoginReceived(payload) {
    const connectionId = payload?.connectionId || "";
    const userName = (payload?.userName || "").trim();
    if (!connectionId || !userName) return;

    const userId = `u-${this.nextUserId++}`;
    this.users.set(userId, { connectionId, userName });

    this.tx.send("auth.login-result", { connectionId, userId, userName });
    this.tx.send("chat.history-deliver", {
      connectionId,
      messages: [...this.messages],
    });
  }

  /**
   * @param {{ userId: string, text: string }} payload
   */
  onChatMessageReceived(payload) {
    const userId = payload?.userId || "";
    const text = (payload?.text || "").trim();
    if (!userId || !text) return;

    const user = this.users.get(userId);
    if (!user) return;

    const message = {
      id: `m-${this.nextMessageId++}`,
      userId,
      userName: user.userName,
      text,
      sentAt: new Date().toISOString(),
    };

    this.messages.push(message);
    if (this.messages.length > this.maxMessages) {
      this.messages.splice(0, this.messages.length - this.maxMessages);
    }

    this.tx.send("chat.message-deliver", message);
  }

  /**
   * @param {string} payload
   */
  onSessionUserDisconnected(payload) {
    const userId = payload || "";
    if (!userId) return;
    this.users.delete(userId);
  }
}

export function createChatStateNode(tx, sx) {
  return new ChatStateNode(tx, sx);
}

