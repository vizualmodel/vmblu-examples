import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const nodeModules = path.join(root, "..", "node_modules");
const tasks = [
  {
    name: "server",
    cwd: path.join(root, "chat-server"),
    script: path.join(root, "chat-server", "model", "chat-server.app.js"),
    args: [],
  },
  {
    name: "client",
    cwd: path.join(root, "chat-client"),
    script: path.join(nodeModules, "vite", "bin", "vite.js"),
    args: ["--host", "127.0.0.1"],
  },
  {
    name: "bridge",
    cwd: path.join(root, "chat-client"),
    script: path.join(root, "chat-client", ".vmblu", "llm-bridge", "proxy.js"),
    args: [],
  },
];

const children = tasks.map((task) => {
  const child = spawn(process.execPath, [task.script, ...task.args], {
    cwd: task.cwd,
    stdio: "inherit",
  });
  child.on("error", (error) => {
    console.error(`[${task.name}] ${error.message}`);
    shutdown(1);
  });
  child.on("exit", (code, signal) => {
    if (!stopping && code !== 0) {
      console.error(`[${task.name}] exited with ${signal || code}`);
      shutdown(code || 1);
    }
  });
  return child;
});

let stopping = false;

function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  setTimeout(() => process.exit(code), 100);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("Chat server: ws://127.0.0.1:8080");
console.log("Chat client: http://127.0.0.1:5173");
console.log("LLM bridge: http://127.0.0.1:8787/health");
