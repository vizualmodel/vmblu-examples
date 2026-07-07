# chat state

## Node

Maintains logged-in users and message history, and prepares outbound server events.

## Pins

### auth.login-received

Registers a user login and allocates server identity.

### auth.login-result

Returns assigned user identity for the login connection.

### chat.message-received

Stores an incoming client message into chat history.

### chat.history-deliver

Emits full history to the newly logged-in connection.

### chat.message-deliver

Emits canonical chat messages for broadcast to all clients.

### session.user-disconnected

Removes disconnected users from active session tracking.
