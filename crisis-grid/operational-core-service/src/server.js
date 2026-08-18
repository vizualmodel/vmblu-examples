import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import { createOperationalCore } from "./operational-core.js";

const DEFAULT_PORT = 4310;
const core = createOperationalCore();

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "access-control-allow-headers": "authorization, content-type",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-origin": "*",
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function bearerToken(request) {
  const value = request.headers.authorization || "";
  return value.startsWith("Bearer ") ? value.slice(7) : "";
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function createOperationalCoreServer() {
  return createServer(async (request, response) => {
    if (request.method === "OPTIONS") {
      sendJson(response, 204, {});
      return;
    }

    const url = new URL(request.url || "/", "http://localhost");
    try {
      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, { status: "available", service: "crisis-grid-operational-core", mode: "synthetic-in-memory" });
        return;
      }
      if (request.method === "POST" && url.pathname === "/session") {
        const body = await readJson(request);
        sendJson(response, 200, core.establishSession(body.authentication));
        return;
      }
      const pictureMatch = url.pathname.match(/^\/incidents\/([^/]+)\/picture$/);
      if (request.method === "GET" && pictureMatch) {
        sendJson(response, 200, core.loadPicture(bearerToken(request), decodeURIComponent(pictureMatch[1])));
        return;
      }
      if (request.method === "POST" && url.pathname === "/commands") {
        sendJson(response, 200, core.submitCommand(bearerToken(request), await readJson(request)));
        return;
      }
      sendJson(response, 404, { status: "not-found", reason: "Unknown Operational Core route." });
    } catch (error) {
      sendJson(response, 400, { status: "rejected", reason: error instanceof Error ? error.message : "Invalid request." });
    }
  });
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const port = Number(process.env.CGW_OCS_PORT || DEFAULT_PORT);
  createOperationalCoreServer().listen(port, "127.0.0.1", () => {
    console.log(`CrisisGrid Operational Core listening on http://127.0.0.1:${port}`);
  });
}
