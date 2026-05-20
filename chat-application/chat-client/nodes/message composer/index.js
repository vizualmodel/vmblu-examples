import MessageComposer from "./MessageComposer.svelte";
import { mount } from "svelte";
import { writable } from "svelte/store";

/**
 * @node message composer
 */
class MessageComposerNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx;
    this.disabledStore = writable(true);
    this.connectionState = "disconnected";
    this.element = document.createElement("section");

    this.component = mount(MessageComposer, {
      target: this.element,
      props: {
        disabledStore: this.disabledStore,
      },
      events: {
        send: (event) => {
          const text = (event.detail?.text || "").trim();
          if (!text) return;
          this.tx.send("chat.send-message", text);
        },
      },
    });
  }

  /**
   * @param {string} payload
   */
  onChatConnectionState(payload) {
    this.connectionState = (payload || "disconnected").toLowerCase();
    this.disabledStore.set(this.connectionState !== "connected");
  }

  /**
   * @param {any} payload
   */
  onUiGetView(payload) {
    void payload;
    this.tx.reply({
      slot: "composer",
      element: this.element,
    });
  }
}

export function createMessageComposerNode(tx, sx) {
  return new MessageComposerNode(tx, sx);
}
