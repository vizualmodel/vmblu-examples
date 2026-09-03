# message history

## Node

Owns the displayed message collection and exposes a read-only `chat.history`
probe so a permitted operating agent can inspect the same history as the user.


## Pins

### auth.logout-request

Emits when the user clicks logout.

### chat.connection-state

Updates visible connection status in the history panel.

### chat.message-list

Updates the visible message list for the chat history panel.

### chat.append-message

Adds one new message to the displayed history.

### chat.current-user

Sets the current user so own messages can be aligned right.

### ui.get-view

Returns the UI element managed by this node.

## Agent capability

`chat.history` returns the currently displayed messages without changing state.
