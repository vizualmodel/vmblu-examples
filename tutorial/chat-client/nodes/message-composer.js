import { mount } from 'svelte';
import { resolveMountPoint } from './dom-helpers';
import MessageComposer from './MessageComposer.svelte';
/**
 * @node MessageComposer
 */
export function createMessageComposer(tx, sx = {}) {
    const options = sx && typeof sx === 'object' ? sx : {};
    const component = mount(MessageComposer, {
        target: resolveMountPoint(options.target),
        props: {
            disabled: true,
            errorMessage: ''
        }
    });
    component.$on('send', (event) => {
        const payload = event.detail;
        void tx.send('messageComposed', { text: payload.text.trim() });
        component.$set({ errorMessage: '' });
    });
    return {
        onSessionEstablished(_payload) {
            component.$set({ disabled: false, errorMessage: '' });
        },
        onMessageDispatchFailed(payload) {
            component.$set({
                errorMessage: payload?.reason ?? 'Unable to send the message.',
                disabled: false
            });
        },
        onSessionEnded() {
            component.$set({
                disabled: true,
                errorMessage: ''
            });
        },
        dispose() {
            component.$destroy();
        }
    };
}
//# sourceMappingURL=message-composer.js.map