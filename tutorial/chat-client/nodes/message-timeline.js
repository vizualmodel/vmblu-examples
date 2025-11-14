import { mount } from 'svelte';
import { resolveMountPoint } from './dom-helpers';
import MessageTimeline from './MessageTimeline.svelte';
/**
 * @node MessageTimeline
 */
export function createMessageTimeline(tx, sx = {}) {
    const options = sx && typeof sx === 'object' ? sx : {};
    const component = mount(MessageTimeline, {
        target: resolveMountPoint(options.target),
        props: {
            messages: [],
            currentUserId: null,
            currentUserName: '',
            isActive: false,
            statusMessage: 'Sign in to start chatting.'
        }
    });
    component.$on('logout', () => {
        void tx.send('logoutRequested', {});
    });
    return {
        onMessagesUpdated(payload) {
            const nextMessages = Array.isArray(payload?.messages) ? payload.messages : [];
            component.$set({ messages: nextMessages });
        },
        onSessionEstablished(payload) {
            component.$set({
                currentUserId: payload?.userId ?? null,
                currentUserName: payload?.displayName ?? 'You',
                isActive: true,
                statusMessage: ''
            });
        },
        onSessionEnded(payload) {
            component.$set({
                isActive: false,
                currentUserId: null,
                currentUserName: '',
                statusMessage: payload?.reason ?? 'Signed out.'
            });
        },
        dispose() {
            component.$destroy();
        }
    };
}
//# sourceMappingURL=message-timeline.js.map