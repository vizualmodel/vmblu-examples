import LoginPopup from "./LoginPopup.svelte";
import { mount } from "svelte";

/**
 * @node login popup
 */
class LoginPopupNode {
  constructor(tx, sx) {
    this.tx = tx;
    this.sx = sx;
    this.element = document.createElement("section");
    this.element.style.display = "none";

    this.component = mount(LoginPopup, {
      target: this.element,
      props: {},
      events: {
        login: (event) => {
          const name = (event.detail?.name || "").trim();
          if (!name) return;
          this.tx.send("auth.login-submitted", { name });
        },
      },
    });
  }

  /**
   * @param {any} payload
   */
  onUiGetView(payload) {
    void payload;
    this.tx.reply({
      slot: "overlay",
      element: this.element,
    });
  }
}

export function createLoginPopupNode(tx, sx) {
  return new LoginPopupNode(tx, sx);
}
