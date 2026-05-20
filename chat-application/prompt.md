# Chat Application Tutorial Prompt

Build a small two-project chat application in `examples/chat-application`.

The application consists of:

- `chat-client`: a browser application generated from `chat-client.blu`.
- `chat-server`: a Node.js WebSocket application generated from `chat-server.blu`.

Use the vmblu workflow:

1. Read each project's `.vmblu/vmblu.prompt.md`.
2. Use the root `.blu` entrypoint to find the model in `model/`.
3. Design or update the architecture in the model before changing node code.
4. Keep all implementation code allocated to nodes under `nodes/`.
5. Generate profiles and apps with `npm run vm:profile` and `npm run vm:app`.

Client requirements:

- The browser UI uses Svelte.
- The login popup, message history and message composer are separate vmblu source nodes.
- If a node has UI, its Svelte component lives in that node's folder.
- Do not create a shared UI folder or UI bridge.
- The client controller owns screen composition. It requests each UI node's view over request/reply pins and decides which views are visible.
- The user can log in with a name, send messages, see message history, and log out.

Server requirements:

- The server is a Node.js ESM application.
- It accepts WebSocket clients.
- It tracks logged-in users and message history in memory.
- It sends history after login and broadcasts new chat messages.

Useful commands:

```bash
cd examples/chat-application/chat-client
npm run vm:profile
npm run vm:app
npm run build

cd ../chat-server
npm run vm:profile
npm run vm:app
npm run check
```

To run both projects together:

```bash
bash examples/chat-application/run.sh
```
