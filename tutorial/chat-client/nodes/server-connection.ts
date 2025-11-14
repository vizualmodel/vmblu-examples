const DEFAULT_API_BASE = 'http://localhost:4000';
const DEFAULT_WS_PATH = '/socket';

interface LoginRequestPayload {
  displayName: string;
}

interface LoginResponse {
  sessionId: string;
  userId: string;
  displayName: string;
  history?: any[];
}

interface SendChatMessagePayload {
  text: string;
}

interface SessionSnapshot {
  sessionId: string;
  userId: string;
  displayName: string;
}

interface EndSessionPayload {
  sessionId?: string;
  reason?: string;
}

interface ConnectionErrorDetail {
  scope: 'login' | 'messages' | 'socket' | string;
  message: string;
  detail?: unknown;
}

const sanitizeBaseUrl = (value: string | undefined): string => {
  try {
    if (!value) {
      return DEFAULT_API_BASE;
    }
    const url = new URL(value);
    url.pathname = url.pathname.replace(/\/+$/, '');
    return url.toString().replace(/\/+$/, '');
  } catch {
    return DEFAULT_API_BASE;
  }
};

const toWebSocketUrl = (apiBase: string, path: string, session: SessionSnapshot): string => {
  const base = new URL(apiBase);
  base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  base.pathname = normalizedPath;
  base.searchParams.set('sessionId', session.sessionId);
  base.searchParams.set('userId', session.userId);
  base.searchParams.set('displayName', session.displayName);
  return base.toString();
};

const readJson = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * @node ServerConnection
 */
export function createServerConnection(
  tx: any,
  sx: { apiBase?: string; wsPath?: string } = {}
) {
  const options = sx && typeof sx === 'object' ? sx : {};

  const apiBase = sanitizeBaseUrl(options.apiBase);
  const wsPath = options.wsPath ?? DEFAULT_WS_PATH;

  let session: SessionSnapshot | null = null;
  let socket: WebSocket | null = null;
  let socketReady: Promise<void> | null = null;

  const emitConnectionError = async (detail: ConnectionErrorDetail): Promise<void> => {
    await tx.send('connectionError', detail);
  };

  const attachSocket = (instance: WebSocket) => {
    instance.addEventListener('message', async (event) => {
      try {
        const payload = JSON.parse(typeof event.data === 'string' ? event.data : '');
        if (payload?.type === 'message' && payload?.payload) {
          await tx.send('incomingBroadcast', payload.payload);
        }
      } catch (error) {
        await emitConnectionError({
          scope: 'socket',
          message: 'Received malformed broadcast payload.',
          detail: error instanceof Error ? error.message : String(error)
        });
      }
    });

    instance.addEventListener('error', async () => {
      await emitConnectionError({
        scope: 'socket',
        message: 'WebSocket connection experienced an error.'
      });
    });

    instance.addEventListener('close', async (event) => {
      socket = null;
      socketReady = null;
      if (!event.wasClean) {
        await emitConnectionError({
          scope: 'socket',
          message: 'WebSocket connection closed unexpectedly.'
        });
      }
    });
  };

  const ensureSocket = async (snapshot: SessionSnapshot): Promise<void> => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;
    }

    if (socketReady) {
      return socketReady;
    }

    const url = toWebSocketUrl(apiBase, wsPath, snapshot);

    socket = new WebSocket(url);
    socketReady = new Promise<void>((resolve, reject) => {
      const handleOpen = () => {
        socketReady = null;
        resolve();
      };
      const handleError = async () => {
        socketReady = null;
        await emitConnectionError({
          scope: 'socket',
          message: 'WebSocket connection failed to open.'
        });
        reject(new Error('WebSocket connection failed.'));
      };
      socket?.addEventListener('open', handleOpen, { once: true });
      socket?.addEventListener('error', handleError, { once: true });
    });

    attachSocket(socket);
    return socketReady;
  };

  const teardownSocket = () => {
    socketReady = null;
    if (socket) {
      socket.close();
      socket = null;
    }
  };

  return {
    async onAuthenticateUser(payload: LoginRequestPayload): Promise<void> {
      const displayName = payload?.displayName?.trim();
      if (!displayName) {
        const message = 'Display name must not be empty.';
        void emitConnectionError({ scope: 'login', message });
        throw new Error(message);
      }

      try {
        const response = await fetch(`${apiBase}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName })
        });

        const data = await readJson(response);

        if (!response.ok) {
          const message =
            typeof data?.message === 'string'
              ? data.message
              : `Authentication failed with status ${response.status}.`;
          void emitConnectionError({ scope: 'login', message, detail: data });
          throw new Error(message);
        }

        if (
          !data ||
          typeof data.sessionId !== 'string' ||
          typeof data.userId !== 'string'
        ) {
          throw new Error('Server returned an invalid login response.');
        }

        session = {
          sessionId: data.sessionId,
          userId: data.userId,
          displayName: data.displayName ?? displayName
        };

        await ensureSocket(session);

        await tx.reply({
          sessionId: session.sessionId,
          userId: session.userId,
          displayName: session.displayName,
          history: Array.isArray(data.history) ? data.history : []
        });
      } catch (error: any) {
        const message =
          typeof error?.message === 'string'
            ? error.message
            : 'Unable to reach the chat server.';
        void emitConnectionError({ scope: 'login', message, detail: error });
        throw new Error(message);
      }
    },

    async onSendChatMessage(payload: SendChatMessagePayload): Promise<void> {
      if (!session) {
        const message = 'No active session. Log in before sending messages.';
        void emitConnectionError({ scope: 'messages', message });
        await tx.reply({ ok: false, reason: message });
        return;
      }

      const text = payload?.text?.trim();
      if (!text) {
        await tx.reply({ ok: false, reason: 'Message must contain text.' });
        return;
      }

      try {
        const response = await fetch(`${apiBase}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.sessionId,
            text
          })
        });

        const data = await readJson(response);
        if (!response.ok) {
          const message =
            typeof data?.message === 'string'
              ? data.message
              : `Server rejected the message (status ${response.status}).`;
          void emitConnectionError({ scope: 'messages', message, detail: data });
          throw new Error(message);
        }

        await tx.reply(data ?? { ok: true });
      } catch (error: any) {
        const message =
          typeof error?.message === 'string'
            ? error.message
            : 'Network error while sending the message.';
        void emitConnectionError({ scope: 'messages', message, detail: error });
        throw new Error(message);
      }
    },

    async onEndSession(payload: EndSessionPayload = {}): Promise<void> {
      const currentSession = session;
      const targetSessionId = payload.sessionId ?? currentSession?.sessionId;

      if (currentSession && targetSessionId) {
        try {
          await fetch(`${apiBase}/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: targetSessionId })
          });
        } catch (error: any) {
          const message =
            typeof error?.message === 'string'
              ? error.message
              : 'Network error while ending the session.';
          void emitConnectionError({ scope: 'messages', message, detail: error });
        }
      }

      teardownSocket();
      session = null;
      await tx.reply({ ok: true });
    },
    dispose(): void {
      teardownSocket();
    }
  };
}








