# Admin

## Node



## Pins

### admin-data.request

Receives session-verified admin-data requests that must still be authorized before event or governance data is read.

### admin-data.denied

Emits an admin-data denial when the actor is not allowed to inspect governance information.

### admin-data.approved

Emits the final approved admin-data response after accepting the event recorder result.

### admin.query

Requests approved admin data center information needed to answer an admin-data request.

### admin.operation

Emits an approved admin data center operation when no immediate direct result is required.

### event.query

Requests approved audit, security or governance events needed to answer an admin-data request.

### event.record

Emits admin policy evidence for allowed or denied governance requests.
