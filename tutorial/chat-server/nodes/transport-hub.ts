import http, { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { URL } from 'node:url';
import type { IncomingMessage as WsIncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import type { RawData as WebSocketRawData } from 'ws';

interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  displayName: string;
  text: string;
  timestamp: string;
}

interface LoginResponse {
  sessionId: string;
  userId: string;
  displayName: string;
  history?: ChatMessage[];
}

interface SessionRecord {
  sessionId: string;
  userId: string;
  displayName: string;
}

interface SendMessagePayload {
  sessionId: string;
  text: string;
}

const DEFAULT_PORT = 4000;
const DEFAULT_HOST = '0.0.0.0';
const DEFAULT_WS_PATH = '/socket';

const setCorsHeaders = (res: ServerResponse): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
};

const readJsonBody = (req: IncomingMessage): Promise<any> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
      if (chunks.reduce((total, item) => total + item.length, 0) > 1_000_000) {
        reject(new Error('Payload too large.'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        if (chunks.length === 0) {
          resolve({});
          return;
        }
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text.length > 0 ? JSON.parse(text) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });

const sendJson = (res: ServerResponse, status: number, payload: any): void => {
  if (!res.headersSent) {
    setCorsHeaders(res);
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
  }
  res.end(JSON.stringify(payload));
};

const sanitizeText = (value: any): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 2000) : null;
};

const ensureSessionId = (value: any): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * @node TransportHub
 */
export function createTransportHub(
  tx: any,
  sx: { port?: number; host?: string; wsPath?: string } = {}
) {
  const options = sx && typeof sx === 'object' ? sx : {};
  const port = typeof options.port === 'number' ? options.port : DEFAULT_PORT;
  const host =
    typeof options.host === 'string' && options.host.length > 0 ? options.host : DEFAULT_HOST;
  const wsPath =
    typeof options.wsPath === 'string' && options.wsPath.length > 0
      ? options.wsPath
      : DEFAULT_WS_PATH;

  const sessions = new Map<string, SessionRecord>();
  const clients = new Map<WebSocket, SessionRecord>();

  const endSessionLocally = (sessionId: string): void => {
    sessions.delete(sessionId);
    for (const [socket, record] of clients) {
      if (record.sessionId === sessionId) {
        clients.delete(socket);
        try {
          socket.close(1000, 'Session ended');
        } catch {
          // ignore socket close issues
        }
      }
    }
  };

  const server = http.createServer(async (req, res) => {
    try {
      setCorsHeaders(res);

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const requestUrl = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
      if (req.method === 'POST' && requestUrl.pathname === '/login') {
        await handleLogin(req, res);
        return;
      }

      if (req.method === 'POST' && requestUrl.pathname === '/messages') {
        await handleMessageSubmission(req, res);
        return;
      }

      if (req.method === 'POST' && requestUrl.pathname === '/logout') {
        await handleLogout(req, res);
        return;
      }

      if (req.method === 'GET' && requestUrl.pathname === '/health') {
        sendJson(res, 200, { ok: true });
        return;
      }

      sendJson(res, 404, { message: 'Not found.' });
    } catch (error: any) {
      sendJson(res, 500, {
        message: 'Internal server error.',
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const wss = new WebSocketServer({ server, path: wsPath });

  wss.on('connection', (socket: WebSocket, request: WsIncomingMessage) => {
    try {
      const link = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
      const sessionId = link.searchParams.get('sessionId');
      const record = sessionId ? sessions.get(sessionId) : undefined;

      if (!record) {
        socket.close(1008, 'Invalid or expired session.');
        return;
      }

      clients.set(socket, record);

      socket.on('message', async (data: WebSocketRawData) => {
        try {
          const parsed =
            typeof data === 'string'
              ? JSON.parse(data)
              : JSON.parse(data.toString('utf8'));
          if (parsed?.type === 'send-message') {
            const text = sanitizeText(parsed?.text);
            if (!text) {
              socket.send(
                JSON.stringify({ type: 'error', message: 'Message must contain text.' })
              );
              return;
            }
        const message = createChatMessage(record, text);
        try {
          await tx.send('messageReceived', message);
          socket.send(JSON.stringify({ type: 'ack', messageId: message.id }));
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: 'error',
              message: 'Failed to persist message.',
              detail: error instanceof Error ? error.message : String(error)
            })
          );
        }
      }
        } catch (error) {
          socket.send(
            JSON.stringify({
              type: 'error',
              message: 'Malformed payload received.',
              detail: error instanceof Error ? error.message : String(error)
            })
          );
        }
      });

      socket.on('close', () => {
        clients.delete(socket);
        endSessionLocally(record.sessionId);
      });
    } catch {
      socket.close(1008, 'Unable to process connection request.');
    }
  });

  const createChatMessage = (session: SessionRecord, text: string): ChatMessage => ({
    id: randomUUID(),
    sessionId: session.sessionId,
    userId: session.userId,
    displayName: session.displayName,
    text,
    timestamp: new Date().toISOString()
  });

  const handleLogin = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await readJsonBody(req);
      const displayName = sanitizeText(body?.displayName);
      if (!displayName) {
        sendJson(res, 400, { message: 'Display name is required.' });
        return;
      }

      const result: LoginResponse = await tx.request('authenticateUser', { displayName });
      if (
        !result ||
        typeof result.sessionId !== 'string' ||
        typeof result.userId !== 'string'
      ) {
        throw new Error('Session service returned an invalid response.');
      }

      const record: SessionRecord = {
        sessionId: result.sessionId,
        userId: result.userId,
        displayName: result.displayName ?? displayName
      };
      sessions.set(record.sessionId, record);

      sendJson(res, 200, {
        sessionId: record.sessionId,
        userId: record.userId,
        displayName: record.displayName,
        history: Array.isArray(result.history) ? result.history : []
      });
    } catch (error: any) {
      console.error('TransportHub: failed to authenticate user', error);
      sendJson(res, 500, {
        message: 'Unable to authenticate user.',
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const handleMessageSubmission = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body: SendMessagePayload = await readJsonBody(req);
      const sessionId = ensureSessionId(body?.sessionId);
      const text = sanitizeText(body?.text);

      if (!sessionId) {
        sendJson(res, 401, { message: 'Session is required to send messages.' });
        return;
      }

      if (!text) {
        sendJson(res, 400, { message: 'Message must contain text.' });
        return;
      }

      const session = sessions.get(sessionId);
      if (!session) {
        sendJson(res, 401, { message: 'Unknown or expired session.' });
        return;
      }

      const message = createChatMessage(session, text);
      await tx.send('messageReceived', message);
      sendJson(res, 200, { ok: true, message });
    } catch (error: any) {
      console.error('TransportHub: failed to process message submission', error);
      sendJson(res, 500, {
        message: 'Unable to process message submission.',
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const handleLogout = async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await readJsonBody(req);
      const sessionId = ensureSessionId(body?.sessionId);

      if (!sessionId) {
        sendJson(res, 400, { message: 'Session is required to log out.' });
        return;
      }

      if (!sessions.has(sessionId)) {
        sendJson(res, 200, { ok: true });
        return;
      }

      endSessionLocally(sessionId);
      sendJson(res, 200, { ok: true });
    } catch (error: any) {
      console.error('TransportHub: failed to process logout request', error);
      sendJson(res, 500, {
        message: 'Unable to process logout request.',
        detail: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const broadcastMessage = (message: ChatMessage) => {
    const payload = JSON.stringify({ type: 'message', payload: message });
    for (const [socket] of clients) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
      } else {
        clients.delete(socket);
      }
    }
  };

  server.listen(port, host);

  return {
    async onBroadcastMessage(message: ChatMessage): Promise<void> {
      broadcastMessage(message);
    },
    dispose(): void {
      for (const [socket] of clients) {
        try {
          socket.close();
        } catch {
          // ignore socket close issues
        }
      }
      clients.clear();
      sessions.clear();
      wss.close();
      server.close();
    }
  };
}
