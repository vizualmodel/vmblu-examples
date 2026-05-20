import MessageHistory from "./MessageHistory.svelte";
import { mount } from "svelte";
import { writable } from "svelte/store";

/**
 * @node message history
 */
class MessageHistoryNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx;
    this.messagesStore = writable([]);
    this.localUserIdStore = writable("");
    this.connectionStateStore = writable("disconnected");
    this.element = document.createElement("section");

    this.component = mount(MessageHistory, {
      target: this.element,
      props: {
        messagesStore: this.messagesStore,
        localUserIdStore: this.localUserIdStore,
        connectionStateStore: this.connectionStateStore,
      },
      events: {
        logout: () => {
          this.tx.send("auth.logout-request", {});
        },
      },
    });
  }

  /**
   * @param {{ messages: Array<{ id: string, userId: string, userName: string, text: string, sentAt: string }> }} payload
   */
  onChatMessageList(payload) {
    this.messagesStore.set(Array.isArray(payload?.messages) ? payload.messages : []);
  }

  /**
   * @param {{ id: string, userId: string, userName: string, text: string, sentAt: string }} payload
   */
  onChatAppendMessage(payload) {
    if (!payload) return;
    this.messagesStore.update((messages) => [...messages, payload]);
  }

  /**
   * @param {string} payload
   */
  onChatConnectionState(payload) {
    const state = payload || "disconnected";
    this.connectionStateStore.set(state);
    if (state === "disconnected" || state === "error") {
      this.messagesStore.set([]);
    }
  }

  /**
   * @param {string} payload
   */
  onChatCurrentUser(payload) {
    this.localUserIdStore.set(payload || "");
  }

  /**
   * @param {any} payload
   */
  onUiGetView(payload) {
    void payload;
    this.tx.reply({
      slot: "history",
      element: this.element,
    });
  }
}

export function createMessageHistoryNode(tx, sx) {
  return new MessageHistoryNode(tx, sx);
}
