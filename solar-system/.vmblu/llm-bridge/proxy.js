import fs from 'fs';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';
import path from 'path';

const CONFIG_PATH = new URL('./config.json', import.meta.url);
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const { provider, proxy, publicBaseUrl } = config;
const BRIDGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

loadDotEnv(path.join(BRIDGE_ROOT, '.env'));
loadDotEnv(path.join(BRIDGE_ROOT, '.env.local'));

const apiKey = () => process.env[proxy.apiKeyEnv];
const allowedMethods = new Set(['GET', 'POST', 'OPTIONS']);
const allowedPaths = new Set(proxy.allowedPaths || []);

const server = http.createServer((req, res) => {
  const origin = String(req.headers.origin || '');

  if (!isAllowedOrigin(origin)) {
    res.writeHead(403, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Origin not allowed by local bridge.' }));
    return;
  }

  writeCorsHeaders(res, origin);

  if (!allowedMethods.has(req.method || '')) {
    res.writeHead(405, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed.' }));
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const localUrl = new URL(req.url || '/', `http://${proxy.bindHost}:${proxy.port}`);
  if (localUrl.pathname === '/health') {
    const status = getBridgeStatus();
    res.writeHead(status.apiKeyConfigured ? 200 : 503, { 'content-type': 'application/json' });
    res.end(JSON.stringify(status));
    return;
  }

  if (!allowedPaths.has(localUrl.pathname)) {
    res.writeHead(404, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Path not allowed by local bridge.' }));
    return;
  }

  if (!apiKey()) {
    res.writeHead(503, { 'content-type': 'application/json' });
    res.end(JSON.stringify(getBridgeStatus()));
    return;
  }

  const upstreamUrl = new URL(localUrl.pathname + localUrl.search, proxy.upstreamBaseUrl);
  const upstreamReq = https.request(upstreamUrl, {
    method: req.method,
    headers: buildUpstreamHeaders(req.headers, apiKey())
  }, (upstreamRes) => {
    const headers = buildDownstreamHeaders(upstreamRes.headers, origin);
    res.writeHead(upstreamRes.statusCode || 502, headers);
    upstreamRes.pipe(res);
  });

  upstreamReq.on('error', (error) => {
    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'Upstream request failed.', detail: error.message }));
  });

  req.pipe(upstreamReq);
});

server.listen(proxy.port, proxy.bindHost, () => {
  console.log(`Local ${provider} bridge listening on ${publicBaseUrl}`);
  console.log(`Allowed browser origin: ${proxy.allowedOrigin}`);
  console.log(`Bridge health endpoint: http://${proxy.bindHost}:${proxy.port}/health`);
  if (proxy.allowedOrigin === 'any') {
    console.warn('Warning: this bridge accepts requests from any browser origin.');
  }
  if (!apiKey()) {
    console.warn(`Missing ${proxy.apiKeyEnv}. The bridge is up, but requests to the provider will return 503 until the key is configured.`);
  }
});

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (proxy.allowedOrigin === 'any') return true;
  return origin === proxy.allowedOrigin;
}

function writeCorsHeaders(res, origin) {
  if (proxy.allowedOrigin === 'any') {
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (origin && origin === proxy.allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, OpenAI-Beta');
}

function buildUpstreamHeaders(incomingHeaders, apiKeyValue) {
  const headers = {
    authorization: `Bearer ${apiKeyValue}`
  };

  const forwardedHeaders = ['accept', 'content-type', 'content-length', 'openai-beta'];
  for (const name of forwardedHeaders) {
    const value = incomingHeaders[name];
    if (value != null) {
      headers[name] = value;
    }
  }

  return headers;
}

function buildDownstreamHeaders(upstreamHeaders, origin) {
  const blocked = new Set([
    'access-control-allow-origin',
    'access-control-allow-methods',
    'access-control-allow-headers',
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailers',
    'transfer-encoding',
    'upgrade'
  ]);

  const headers = {};
  for (const [key, value] of Object.entries(upstreamHeaders)) {
    if (blocked.has(key) || value == null) continue;
    headers[key] = value;
  }

  if (proxy.allowedOrigin === 'any') {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (origin && origin === proxy.allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  headers.Vary = 'Origin';

  return headers;
}

function getBridgeStatus() {
  return {
    provider,
    mode: config.mode,
    publicBaseUrl,
    healthUrl: `http://${proxy.bindHost}:${proxy.port}/health`,
    apiKeyEnv: proxy.apiKeyEnv,
    apiKeyConfigured: Boolean(apiKey()),
    allowedOrigin: proxy.allowedOrigin,
    reason: apiKey()
      ? 'Connected to the local LLM bridge.'
      : `The local bridge is running, but ${proxy.apiKeyEnv} is not configured. Add it to .env.local or the shell before starting the bridge.`
  };
}

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex < 1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    if (!key) continue;

    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
