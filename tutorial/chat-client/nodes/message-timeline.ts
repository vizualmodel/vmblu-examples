import { mount } from 'svelte';
import type { MountTarget } from './dom-helpers';
import { resolveMountPoint } from './dom-helpers';
import MessageTimeline from './MessageTimeline.svelte';

export interface ChatMessage {
  id: string;
  userId: string;
  displayName: string;
  text: string;
  timestamp: string;
}

export interface MessagesUpdatedPayload {
  messages?: ChatMessage[];
}

export interface SessionEstablishedPayload {
  sessionId: string;
  userId: string;
  displayName: string;
}

export interface SessionEndedPayload {
  reason?: string;
}

/**
 * @node MessageTimeline
 */
export function createMessageTimeline(tx: any, sx: { target?: MountTarget } = {}) {
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
  }) as any;

  component.$on('logout', () => {
    void tx.send('logoutRequested', {});
  });

  return {
    onMessagesUpdated(payload: MessagesUpdatedPayload): void {
      const nextMessages = Array.isArray(payload?.messages) ? payload.messages : [];
      component.$set({ messages: nextMessages });
    },
    onSessionEstablished(payload: SessionEstablishedPayload): void {
      component.$set({
        currentUserId: payload?.userId ?? null,
        currentUserName: payload?.displayName ?? 'You',
        isActive: true,
        statusMessage: ''
      });
    },
    onSessionEnded(payload: SessionEndedPayload): void {
      component.$set({
        isActive: false,
        currentUserId: null,
        currentUserName: '',
        statusMessage: payload?.reason ?? 'Signed out.'
      });
    },
    dispose(): void {
      component.$destroy();
    }
  };
}
