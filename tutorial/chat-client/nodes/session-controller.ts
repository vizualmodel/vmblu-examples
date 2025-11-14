interface LoginSubmittedPayload {
  displayName: string;
}

interface LoginResponsePayload {
  sessionId: string;
  userId: string;
  displayName: string;
  history?: ChatMessage[];
}

interface MessageComposedPayload {
  text: string;
}

interface ChatMessage {
  id: string;
  sessionId?: string;
  userId: string;
  displayName: string;
  text: string;
  timestamp: string;
}

interface ConnectionErrorPayload {
  scope?: 'login' | 'messages' | 'socket' | string;
  message?: string;
  detail?: unknown;
}

interface SessionState {
  sessionId: string;
  userId: string;
  displayName: string;
}

interface LogoutRequestedPayload {
  reason?: string;
}

interface SessionEndedPayload {
  reason?: string;
}

const isChatMessage = (value: any): value is ChatMessage => {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.userId === 'string' &&
    typeof value.displayName === 'string' &&
    typeof value.text === 'string' &&
    typeof value.timestamp === 'string'
  );
};

/**
 * @node SessionController
 */
export function createSessionController(tx: any) {
  let session: SessionState | null = null;
  let authenticating = false;

  const requireSession = (): SessionState | null => session;
  const notifySessionEnded = async (payload: SessionEndedPayload = {}): Promise<void> => {
    session = null;
    await tx.send('sessionEnded', payload);
    await tx.send('historyLoaded', { messages: [] });
  };

  return {
    async onLoginSubmitted(payload: LoginSubmittedPayload): Promise<void> {
      if (authenticating) {
        return;
      }

      const displayName = payload?.displayName?.trim();
      if (!displayName) {
        await tx.send('loginRejected', { reason: 'Please provide a display name.' });
        return;
      }

      authenticating = true;
      try {
        const response: LoginResponsePayload = await tx.request('authenticateUser', { displayName });
        if (!response || typeof response.sessionId !== 'string' || typeof response.userId !== 'string') {
          throw new Error('Server returned an invalid login response.');
        }

        session = {
          sessionId: response.sessionId,
          userId: response.userId,
          displayName: response.displayName ?? displayName
        };

        await tx.send('sessionEstablished', { ...session });

        const history = Array.isArray(response.history)
          ? response.history.filter(isChatMessage)
          : [];
        if (history.length > 0) {
          await tx.send('historyLoaded', { messages: history });
        } else {
          await tx.send('historyLoaded', { messages: [] });
        }
      } catch (error: any) {
        const reason =
          typeof error?.message === 'string'
            ? error.message
            : 'Unable to log in. Please try again.';
        await tx.send('loginRejected', { reason });
      } finally {
        authenticating = false;
      }
    },

    async onMessageComposed(payload: MessageComposedPayload): Promise<void> {
      const current = requireSession();
      if (!current) {
        await tx.send('messageDispatchFailed', {
          reason: 'You must log in before sending messages.'
        });
        return;
      }

      const text = payload?.text?.trim();
      if (!text) {
        return;
      }

      try {
        await tx.request('sendChatMessage', { text });
      } catch (error: any) {
        const reason =
          typeof error?.message === 'string'
            ? error.message
            : 'Message delivery failed. Please retry.';
        await tx.send('messageDispatchFailed', { reason });
      }
    },

    async onIncomingBroadcast(message: ChatMessage): Promise<void> {
      if (!isChatMessage(message)) {
        return;
      }
      await tx.send('messageAppended', message);
    },

    async onLogoutRequested(payload: LogoutRequestedPayload): Promise<void> {
      const current = requireSession();
      if (!current) {
        await notifySessionEnded({ reason: payload?.reason });
        return;
      }

      try {
        await tx.request('endSession', { sessionId: current.sessionId });
      } catch (error: any) {
        const reason =
          typeof error?.message === 'string'
            ? error.message
            : 'Unable to reach the server to end the session.';
        await tx.send('messageDispatchFailed', { reason });
      } finally {
        await notifySessionEnded({ reason: payload?.reason });
      }
    },

    async onConnectionError(payload: ConnectionErrorPayload): Promise<void> {
      if (payload?.scope === 'login') {
        await tx.send('loginRejected', {
          reason: payload?.message ?? 'Login failed due to a connection issue.'
        });
        return;
      }

      if (payload?.scope === 'socket') {
        await notifySessionEnded({ reason: payload?.message });
        return;
      }

      await tx.send('messageDispatchFailed', {
        reason: payload?.message ?? 'Connection lost. Message not delivered.'
      });
    }
  };
}



