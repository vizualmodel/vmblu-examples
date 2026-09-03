# Message history tests

## Replaces the displayed history

- Purpose: verify that a history response becomes the complete ordered message list.
- Mount: `ui.get-view`
- Send: `chat.message-list` = `{"messages":[{"id":"m1","userId":"u1","userName":"Alice","text":"Hello","sentAt":"2026-08-31T10:00:00Z"},{"id":"m2","userId":"u2","userName":"Bob","text":"Hi","sentAt":"2026-08-31T10:01:00Z"}]}`
- Expect view: `{"css":".msg","count":2,"text":["Alice","Bob"]}`
- Expect view: `{"css":".text","count":2,"text":["Hello","Hi"]}`

## Appends a new message

- Purpose: verify that a live message is added without replacing existing history.
- Mount: `ui.get-view`
- Send: `chat.message-list` = `{"messages":[{"id":"m1","userId":"u1","userName":"Alice","text":"Existing message","sentAt":"2026-08-31T10:00:00Z"}]}`
- Send: `chat.append-message` = `{"id":"m2","userId":"u2","userName":"Bob","text":"A new message","sentAt":"2026-08-31T10:01:00Z"}`
- Expect view: `{"css":".msg","count":2}`
- Expect view: `{"css":".text","count":2,"text":["Existing message","A new message"]}`

## Clears messages after disconnection

- Purpose: avoid showing stale history after the chat connection is lost.
- Mount: `ui.get-view`
- Send: `chat.message-list` = `{"messages":[{"id":"m1","userId":"u1","userName":"Alice","text":"Stale message","sentAt":"2026-08-31T10:00:00Z"}]}`
- Send: `chat.connection-state` = `"disconnected"`
- Expect view: `{"css":".msg","count":0}`
- Expect view: `{"css":".empty","count":1,"text":"No messages yet."}`
- Expect view: `{"css":".state","count":1,"text":"disconnected","class":"disconnected"}`

## Marks messages from the current user

- Purpose: distinguish the current user's messages from messages sent by others.
- Mount: `ui.get-view`
- Send: `chat.message-list` = `{"messages":[{"id":"m1","userId":"u1","userName":"Alice","text":"Other message","sentAt":"2026-08-31T10:00:00Z"},{"id":"m2","userId":"u2","userName":"Bob","text":"My message","sentAt":"2026-08-31T10:01:00Z"}]}`
- Send: `chat.current-user` = `"u2"`
- Expect view: `{"css":".msg.other","count":1,"text":"Other message"}`
- Expect view: `{"css":".msg.mine","count":1,"text":"My message"}`

## Requests logout

- Purpose: verify that the history view exposes the user's logout action.
- Mount: `ui.get-view`
- Click: `{"role":"button","name":"Logout"}`
- Expect send: `auth.logout-request` = `{}`
