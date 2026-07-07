# ws transport

## Node



## Pins

### auth.connect-request

Starts connection and login handshake with the server.

### auth.connected

Emits when server confirms login success.

### auth.disconnect-request

Disconnects the websocket session on logout.

### chat.outgoing-message

Sends a chat message from the client to the server.

### chat.history-received

Emits initial chat history from the server.

### chat.incoming-message

Emits new message events from the server.

### net.connection-state

Emits transport lifecycle state changes.
