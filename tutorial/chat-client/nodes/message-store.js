/**
 * @node MessageStore
 */
export function createMessageStore(tx) {
    const messages = [];
    const knownIds = new Set();
    const normalize = (value) => {
        if (!value || typeof value !== 'object') {
            return null;
        }
        const id = typeof value.id === 'string' && value.id.trim().length > 0 ? value.id.trim() : null;
        const text = typeof value.text === 'string' ? value.text : null;
        const timestamp = typeof value.timestamp === 'string' ? value.timestamp : new Date().toISOString();
        const userId = typeof value.userId === 'string' ? value.userId : 'unknown';
        const displayName = typeof value.displayName === 'string' ? value.displayName : 'Anonymous';
        if (!id || !text) {
            return null;
        }
        return {
            id,
            userId,
            displayName,
            text,
            timestamp
        };
    };
    const publish = async () => {
        await tx.send('messagesUpdated', {
            messages: messages.map((message) => ({ ...message }))
        });
    };
    return {
        async onHistoryLoaded(payload) {
            messages.length = 0;
            knownIds.clear();
            const items = Array.isArray(payload?.messages) ? payload.messages : [];
            for (const item of items) {
                const normalized = normalize(item);
                if (normalized && !knownIds.has(normalized.id)) {
                    messages.push(normalized);
                    knownIds.add(normalized.id);
                }
            }
            await publish();
        },
        async onMessageAppended(payload) {
            const normalized = normalize(payload);
            if (!normalized || knownIds.has(normalized.id)) {
                return;
            }
            messages.push(normalized);
            knownIds.add(normalized.id);
            await publish();
        }
    };
}
//# sourceMappingURL=message-store.js.map