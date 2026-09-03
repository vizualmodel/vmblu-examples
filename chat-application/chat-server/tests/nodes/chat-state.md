# Chat state tests

## Accepts a user login

- Purpose: verify that a valid login receives a stable identity and the current empty history.
- Send: `auth.login-received` = `{"connectionId":"connection-1","userName":"Alice"}`
- Expect send: `auth.login-result` = `{"connectionId":"connection-1","userId":"u-1","userName":"Alice"}`
- Expect send: `chat.history-deliver` = `{"connectionId":"connection-1","messages":[]}`

## Allocates a distinct identity for each login

- Purpose: verify that consecutive connections do not share a user identity.
- Send: `auth.login-received` = `{"connectionId":"connection-1","userName":"Alice"}`
- Send: `auth.login-received` = `{"connectionId":"connection-2","userName":"Bob"}`
- Expect send: `auth.login-result` = `{"connectionId":"connection-1","userId":"u-1","userName":"Alice"}`
- Expect send: `chat.history-deliver` = `{"connectionId":"connection-1","messages":[]}`
- Expect send: `auth.login-result` = `{"connectionId":"connection-2","userId":"u-2","userName":"Bob"}`
- Expect send: `chat.history-deliver` = `{"connectionId":"connection-2","messages":[]}`
