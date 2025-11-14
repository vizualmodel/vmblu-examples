interface ChatMessage {
  id: string;
  sessionId?: string;
  userId: string;
  displayName: string;
  text: string;
  timestamp: string;
}

interface LoadHistoryRequest {
  limit?: number;
}

interface LoadHistoryResponse {
  messages: ChatMessage[];
}

interface PersistMessageRequest extends ChatMessage {}

const DEFAULT_MAX_MESSAGES = 500;

const isValidMessage = (value: any): value is PersistMessageRequest => {
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
 * @node MessageStore
 */
export function createMessageStore(tx: any, sx: { maxMessages?: number } = {}) {
  const options = sx && typeof sx === 'object' ? sx : {};
  const maxMessages =
    typeof options.maxMessages === 'number' && options.maxMessages > 0
      ? options.maxMessages
      : DEFAULT_MAX_MESSAGES;
  const messages: ChatMessage[] = [];

  const addMessage = (message: PersistMessageRequest): void => {
    messages.push({ ...message });
    if (messages.length > maxMessages) {
      messages.splice(0, messages.length - maxMessages);
    }
  };

  return {
    async onLoadHistory(payload: LoadHistoryRequest): Promise<void> {
      const limit =
        typeof payload?.limit === 'number' && payload.limit > 0 ? Math.floor(payload.limit) : null;
      const history = limit ? messages.slice(-limit) : [...messages];
      await tx.reply({
        messages: history.map((entry) => ({ ...entry }))
      });
    },

    async onPersistMessage(payload: PersistMessageRequest): Promise<void> {
      if (!isValidMessage(payload)) {
        throw new Error('Cannot persist invalid chat message payload.');
      }
      addMessage(payload);
      await tx.reply({ ok: true });
    }
  };
}
