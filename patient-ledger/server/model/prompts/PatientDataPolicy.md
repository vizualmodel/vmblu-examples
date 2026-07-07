# PatientDataPolicy

## Node



## Pins

### patient-data.request

Receives session-verified patient-data requests that must still be authorized before records are accessed.

### patient-data.denied

Emits a patient-data denial when role, capability or data-owned facts do not allow the request.

### patient-data.approved

Emits the final approved patient-data response after policy accepts the data result.

### policy.query

Requests data-owned authorization facts before deciding whether a patient-data request is allowed.

### data.query

Requests approved patient data when policy needs a direct result to complete the response.

### data.operation

Emits an approved, narrow data operation after policy allows the request.

### event.record

Emits patient-data policy evidence for allowed decisions, denied decisions and capability checks.
