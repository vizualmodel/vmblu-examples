# Local LLM Bridge

This bridge keeps the provider API key on the user's machine.

Generated provider: openai
Default allowed origin: http://localhost:5173

## What it does

- Listens only on `127.0.0.1`
- Accepts browser requests only from the configured origin
- Reads the provider API key from the shell or the project `.env` / `.env.local`
- If both files define the same variable, `.env.local` overrides `.env`
- Forwards only an allowlisted set of API paths
- Exposes `http://127.0.0.1:8080/health` so the UI can show bridge status

## Before first use

1. Review `proxy.js` and `config.json`.
2. Put `OPENAI_API_KEY` in `.env.local` for local development, or set it in the shell that launches the bridge.
3. Change `proxy.allowedOrigin` if your app is not served from the default local dev origin.
4. If you set `proxy.allowedOrigin` to `"any"`, treat it as a temporary local-testing shortcut.

Current allowed origin: http://localhost:5173

## Run it

```bash
node ./.vmblu/llm-bridge/proxy.js
```

If this project has a package.json, the command also adds:

```bash
npm run llm-bridge
```

The existing alias below also works in this example:

```bash
npm run bridge
```

## Health

Open `http://127.0.0.1:8080/health` to confirm whether the bridge is reachable and whether `OPENAI_API_KEY` is configured.

## App and MCP configuration

Use `publicBaseUrl` from `config.json` as the LLM base URL for browser code or a local MCP server when you want both to talk through the same bridge.
