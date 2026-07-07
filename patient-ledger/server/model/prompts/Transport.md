# Transport

## Node



## Pins

### auth.request

Emits login requests that must establish an authenticated session before protected data access is possible.

### auth.logout

Emits logout requests that should end an existing session.

### auth.approved

Returns successful authentication or logout results to the external caller.

### auth.denied

Returns authentication or logout denials to the external caller.

### patient-data.request

Emits protected patient-data requests. The request should carry the session reference issued by authentication.

### patient-data.denied

Returns a patient-data denial caused by invalid session state or policy rejection.

### patient-data.approved

Returns an approved patient-data response, including the allowed data requested by the caller.

### admin-data.request

Emits protected admin-data requests. The request should carry the session reference issued by authentication.

### admin-data.denied

Returns an admin-data denial caused by invalid session state or policy rejection.

### admin-data.approved

Returns approved admin information such as audit, security, policy or scenario evidence.

### event.record

Emits transport-level observations that should become part of the audit or security evidence.
