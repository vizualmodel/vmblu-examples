import { mount } from 'svelte';
import type { MountTarget } from './dom-helpers';
import { resolveMountPoint } from './dom-helpers';
import MessageComposer from './MessageComposer.svelte';

export interface MessageComposedPayload {
  text: string;
}

export interface SessionEstablishedPayload {
  sessionId: string;
  userId: string;
  displayName: string;
}

export interface MessageDispatchFailedPayload {
  reason?: string;
}

/**
 * @node MessageComposer
 */
export function createMessageComposer(tx: any, sx: { target?: MountTarget } = {}) {
  const options = sx && typeof sx === 'object' ? sx : {};

  const component = mount(MessageComposer, {
    target: resolveMountPoint(options.target),
    props: {
      disabled: true,
      errorMessage: ''
    }
  }) as any;

  component.$on('send', (event: CustomEvent<MessageComposedPayload>) => {
    const payload = event.detail;
    void tx.send('messageComposed', { text: payload.text.trim() });
    component.$set({ errorMessage: '' });
  });

  return {
    onSessionEstablished(_payload: SessionEstablishedPayload): void {
      component.$set({ disabled: false, errorMessage: '' });
    },
    onMessageDispatchFailed(payload: MessageDispatchFailedPayload): void {
      component.$set({
        errorMessage: payload?.reason ?? 'Unable to send the message.',
        disabled: false
      });
    },
    onSessionEnded(): void {
      component.$set({
        disabled: true,
        errorMessage: ''
      });
    },
    dispose(): void {
      component.$destroy();
    }
  };
}
