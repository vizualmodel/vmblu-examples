const isChatMessage = (value) => {
    return (value &&
        typeof value === 'object' &&
        typeof value.id === 'string' &&
        typeof value.userId === 'string' &&
        typeof value.displayName === 'string' &&
        typeof value.text === 'string' &&
        typeof value.timestamp === 'string');
};
/**
 * @node SessionController
 */
export function createSessionController(tx) {
    let session = null;
    let authenticating = false;
    const requireSession = () => session;
    const notifySessionEnded = async (payload = {}) => {
        session = null;
        await tx.send('sessionEnded', payload);
        await tx.send('historyLoaded', { messages: [] });
    };
    return {
        async onLoginSubmitted(payload) {
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
                const response = await tx.request('authenticateUser', { displayName });
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
                }
                else {
                    await tx.send('historyLoaded', { messages: [] });
                }
            }
            catch (error) {
                const reason = typeof error?.message === 'string'
                    ? error.message
                    : 'Unable to log in. Please try again.';
                await tx.send('loginRejected', { reason });
            }
            finally {
                authenticating = false;
            }
        },
        async onMessageComposed(payload) {
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
            }
            catch (error) {
                const reason = typeof error?.message === 'string'
                    ? error.message
                    : 'Message delivery failed. Please retry.';
                await tx.send('messageDispatchFailed', { reason });
            }
        },
        async onIncomingBroadcast(message) {
            if (!isChatMessage(message)) {
                return;
            }
            await tx.send('messageAppended', message);
        },
        async onLogoutRequested(payload) {
            const current = requireSession();
            if (!current) {
                await notifySessionEnded({ reason: payload?.reason });
                return;
            }
            try {
                await tx.request('endSession', { sessionId: current.sessionId });
            }
            catch (error) {
                const reason = typeof error?.message === 'string'
                    ? error.message
                    : 'Unable to reach the server to end the session.';
                await tx.send('messageDispatchFailed', { reason });
            }
            finally {
                await notifySessionEnded({ reason: payload?.reason });
            }
        },
        async onConnectionError(payload) {
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
//# sourceMappingURL=session-controller.js.map