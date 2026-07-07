# client controller

## Node



## Pins

### auth.connect-request

Requests transport to log in with the provided user name.

### auth.connected

Handles successful login/session information from transport.

### auth.disconnect-request

Requests transport to disconnect the active session.

### auth.logout-request

Handles user logout requests from the UI.

### auth.login-submitted

Starts login processing for the submitted user name.

### chat.outgoing-message

Emits outbound message payload to transport.

### chat.history-received

Receives chat history and prepares the UI state.

### chat.incoming-message

Handles new messages coming from the server.

### chat.send-message

Handles a message typed by the current user.

### net.connection-state

Broadcasts connection status to UI-facing nodes.

### net.connection-state

Broadcasts connection status to UI-facing nodes.

### history.message-list

Sends the full message list state to the history node.

### history.append-message

Requests the history node to append one message.

### history.current-user

Updates the history node with the current user id.

### ui.get-history-view

Requests the history view so the controller can mount it.

### ui.get-login-view

Requests the login view so the controller can mount it.

### ui.get-composer-view

Requests the composer view so the controller can mount it.
