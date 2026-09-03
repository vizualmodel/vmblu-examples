# vmblu chat application

This vmblu 1.12 example combines a Svelte browser client, a Node.js WebSocket
server, formal node tests, a Sysblu system map and an embedded operating agent.

Install dependencies from the `vmblu-examples` repository root:

```bash
npm install
```

For the embedded agent, put the provider key in
`chat-client/.env.local`:

```text
OPENAI_API_KEY=your-key
```

Then start the server, client and local LLM bridge together:

```bash
cd chat-application
npm run dev
```

Open `http://127.0.0.1:5173`, log in, and use the assistant launcher to inspect
the current history or send a requested message. The chat itself works without
an API key; only the embedded assistant needs the bridge and provider access.

Run all formal model tests with:

```bash
npm run test:model
```

Open `system/active.sys.blu` to inspect the complete system and its references.
