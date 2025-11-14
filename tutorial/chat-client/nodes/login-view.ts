import type { MountTarget } from './dom-helpers';
import { resolveMountPoint } from './dom-helpers';
import LoginView from './LoginView.svelte';

export interface LoginSubmittedPayload {
  displayName: string;
}

export interface SessionEstablishedPayload {
  sessionId: string;
  userId: string;
  displayName: string;
}

export interface LoginRejectedPayload {
  reason?: string;
}

export interface SessionEndedPayload {
  reason?: string;
}

/**
 * @node LoginView
 */
export function createLoginView(tx: any, sx: { target?: MountTarget; initialName?: string } = {}) {
  const options = sx && typeof sx === 'object' ? sx : {};
  const host = resolveMountPoint(options.target) ?? document.getElementById('modal-root');

  if (!host) {
    throw new Error('Unable to mount login view: modal root not found.');
  }

  let modal: any = null;

  const showHost = () => {
    host.style.pointerEvents = 'auto';
  };

  const hideHost = () => {
    host.style.pointerEvents = 'none';
  };

  const render = (props: Record<string, unknown>) => {
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

  const handleSubmit = (payload: LoginSubmittedPayload) => {
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
    onSessionEstablished(_payload: SessionEstablishedPayload): void {
      destroy();
    },
    onLoginRejected(payload: LoginRejectedPayload): void {
      render({
        disabled: false,
        errorMessage: payload?.reason ?? 'Login failed. Please try again.',
        initialName: options.initialName ?? '',
        onSubmit: handleSubmit
      });
    },
    onSessionEnded(payload: SessionEndedPayload = {}): void {
      render({
        disabled: false,
        errorMessage: '',
        initialName: options.initialName ?? '',
        statusMessage: payload?.reason ?? '',
        onSubmit: handleSubmit
      });
    },
    dispose(): void {
      destroy();
    }
  };
}





