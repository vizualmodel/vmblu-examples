import { randomUUID } from 'node:crypto';

interface ChatMessage {
  id: string;
  sessionId?: string;
  userId: string;
  displayName: string;
  text: string;
  timestamp: string;
}

interface AuthenticateUserRequest {
  displayName: string;
}

interface LoadHistoryResponse {
  messages?: ChatMessage[];
}

interface AuthenticateUserResponse {
  sessionId: string;
  userId: string;
  displayName: string;
  history: ChatMessage[];
}

const sanitizeDisplayName = (value: any): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed.slice(0, 60);
};

const isMessage = (value: any): value is ChatMessage => {
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
 * @node SessionService
 */
export function createSessionService(tx: any) {
  return {
    async onAuthenticateUser(payload: AuthenticateUserRequest): Promise<void> {
      const displayName = sanitizeDisplayName(payload?.displayName);
      if (!displayName) {
        throw new Error('Display name is required.');
      }

      const sessionId = randomUUID();
      const userId = randomUUID();

      const historyResponse: LoadHistoryResponse = await tx.request('loadHistory', { limit: 200 });
      const historySource = Array.isArray(historyResponse?.messages)
        ? historyResponse.messages
        : Array.isArray(historyResponse)
        ? historyResponse
        : [];
      const history = historySource.filter(isMessage).map((entry) => ({ ...entry }));

      await tx.reply({
        sessionId,
        userId,
        displayName,
        history
      });
    }
  };
}
