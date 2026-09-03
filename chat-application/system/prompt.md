# Chat application prompt

Build a small chat system with two vmblu applications:

- a Svelte browser client;
- a Node.js WebSocket server.

The client owns separate login, message-history and message-composer UI nodes.
Each UI component stays with its source node, while the client controller owns
screen composition and session flow. The WebSocket transport translates only
between protocol messages and vmblu pins.

The server separates WebSocket transport from in-memory users and message
history. It sends history after login and broadcasts each accepted message.

Maintain explicit pin contracts, keep implementation under each project's
`nodes/` folder and generate application, source-profile and capability
artifacts from the model.

Add formal model tests at two deliberate boundaries: the client's message
history view and the server's chat state. Expose a minimal operating-agent
surface on the client: one tool to request a message, one probe to read visible
history and one event for messages broadcast back by the server. Keep provider
credentials outside the browser and route model calls through the local bridge.

Use `active.sys.blu` to describe the complete system, including the two vmblu
applications, local bridge, hosted model provider, WebSocket protocol and
operational/test references.
