#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$ROOT_DIR/chat-server"
CLIENT_DIR="$ROOT_DIR/chat-client"

SERVER_PID=""
CLIENT_PID=""
CREATED_INDEX=0

cleanup() {
  local exit_code=$?

  if [[ -n "${CLIENT_PID}" ]] && kill -0 "${CLIENT_PID}" 2>/dev/null; then
    kill "${CLIENT_PID}" 2>/dev/null || true
    wait "${CLIENT_PID}" 2>/dev/null || true
  fi

  if [[ -n "${SERVER_PID}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi

  if [[ "${CREATED_INDEX}" -eq 1 ]]; then
    rm -f "$CLIENT_DIR/index.html"
  fi

  exit "${exit_code}"
}

trap cleanup EXIT INT TERM

ensure_deps() {
  local dir="$1"
  if [[ ! -d "$dir/node_modules" ]]; then
    echo "[run.sh] Installing dependencies in $dir"
    (cd "$dir" && npm install)
  fi
}

prepare_client_bootstrap() {
  if [[ ! -f "$CLIENT_DIR/index.html" ]]; then
    cat >"$CLIENT_DIR/index.html" <<'HTML'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>vmblu chat client</title>
  </head>
  <body>
    <script type="module" src="./model/chat-client.app.js"></script>
  </body>
</html>
HTML
    CREATED_INDEX=1
  fi
}

ensure_deps "$SERVER_DIR"
ensure_deps "$CLIENT_DIR"
prepare_client_bootstrap

echo "[run.sh] Starting chat server..."
(cd "$SERVER_DIR" && node model/chat-server.app.js) &
SERVER_PID=$!

echo "[run.sh] Starting chat client (Vite)..."
(cd "$CLIENT_DIR" && npm run dev -- --host 127.0.0.1 --port 5173) &
CLIENT_PID=$!

echo "[run.sh] Running."
echo "[run.sh] Client URL: http://127.0.0.1:5173"
echo "[run.sh] Press Ctrl+C to stop both processes."

wait -n "$SERVER_PID" "$CLIENT_PID"
