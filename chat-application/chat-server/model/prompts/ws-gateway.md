# ws gateway

## Node

Hosts websocket endpoints and maps socket events to vmblu messages.

## Pins

### auth.login-received

Emits when a client requests login.

### auth.login-result

Applies successful login result for a pending connection.

### chat.message-received

Emits when a connected client sends a chat message.

### chat.history-deliver

Sends message history to one target connection.

### chat.message-deliver

Broadcasts a stored chat message to connected clients.

### session.user-disconnected

Emits when an authenticated user disconnects.
