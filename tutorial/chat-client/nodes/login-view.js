import { resolveMountPoint } from './dom-helpers';
import LoginView from './LoginView.svelte';
/**
 * @node LoginView
 */
export function createLoginView(tx, sx = {}) {
    const options = sx && typeof sx === 'object' ? sx : {};
    const host = resolveMountPoint(options.target) ?? document.getElementById('modal-root');
    if (!host) {
        throw new Error('Unable to mount login view: modal root not found.');
    }
    let modal = null;
    const showHost = () => {
        host.style.pointerEvents = 'auto';
    };
    const hideHost = () => {
        host.style.pointerEvents = 'none';
    };
    const render = (props) => {
        host.innerHTML = '';
        modal = new LoginView({ target: host, props });
        showHost();
    };
    const destroy = () => {
        if (modal?.$destroy) {
            modal.$destroy();
        }
        modal = null;
        host.innerHTML = '';
        hideHost();
    };
    const handleSubmit = (payload) => {
        destroy();
        void tx.send('loginSubmitted', { displayName: payload.displayName.trim() });
    };
    render({
        disabled: false,
        errorMessage: '',
        initialName: options.initialName ?? '',
        onSubmit: handleSubmit
    });
    return {
        onSessionEstablished(_payload) {
            destroy();
        },
        onLoginRejected(payload) {
            render({
                disabled: false,
                errorMessage: payload?.reason ?? 'Login failed. Please try again.',
                initialName: options.initialName ?? '',
                onSubmit: handleSubmit
            });
        },
        onSessionEnded(payload = {}) {
            render({
                disabled: false,
                errorMessage: '',
                initialName: options.initialName ?? '',
                statusMessage: payload?.reason ?? '',
                onSubmit: handleSubmit
            });
        },
        dispose() {
            destroy();
        }
    };
}
//# sourceMappingURL=login-view.js.map