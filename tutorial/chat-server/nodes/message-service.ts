interface ChatMessage {
  id: string;
  sessionId?: string;
  userId: string;
  displayName: string;
  text: string;
  timestamp: string;
}

const isValidMessage = (value: any): value is ChatMessage => {
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
 * @node MessageService
 */
export function createMessageService(tx: any) {
  return {
    async onMessageReceived(payload: ChatMessage): Promise<void> {
      if (!isValidMessage(payload)) {
        throw new Error('Received malformed chat message.');
      }

      await tx.request('persistMessage', payload);
      await tx.send('broadcastMessage', payload);
    }
  };
}
