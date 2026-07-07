# Authentication

## Node



## Pins

### auth.request

Handles login requests and creates a session when the credentials are accepted.

### auth.logout

Handles logout requests and invalidates the referenced session when possible.

### auth.approved

Emits successful login or logout results. Login approval is where the session reference is issued.

### auth.denied

Emits an authentication denial when login or logout cannot be accepted.

### patient-data.request

Verifies the session reference on a protected patient-data request before policy sees it.

### patient-data.denied

Emits a patient-data denial when the session reference is missing, expired or invalid.

### patient-data.approved

Forwards a session-verified patient-data request to policy for authorization.

### admin-data.request

Verifies the session reference on a protected admin-data request before policy sees it.

### admin-data.denied

Emits an admin-data denial when the session reference is missing, expired or invalid.

### admin-data.approved

Forwards a session-verified admin-data request to policy for authorization.

### event.record

Emits authentication and session-verification evidence.
