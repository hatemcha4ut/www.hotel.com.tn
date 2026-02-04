# ADR-0003: Error Handling and User Experience

## Status
Accepted

## Context
The booking flow integrates with external APIs (api.hotel.com.tn) and authentication services (Supabase). Multiple failure modes can occur:
- Authentication failures (401/403)
- Validation errors (400)
- Supplier availability changes
- Network timeouts
- Rate limiting
- Backend service failures (500/502/503)

Users need clear, actionable feedback when errors occur. The system must handle transient failures gracefully while preventing invalid bookings.

### Key Considerations
- Booking involves money - errors must be communicated clearly
- Users may not be technical - avoid jargon
- Some errors are transient (network issues) - retry may succeed
- Some errors are permanent (invalid date range) - retry won't help
- Must prevent double-booking on retry
- Must maintain user trust during failures

## Decision
We will implement a **comprehensive error handling strategy** with clear user messaging and intelligent retry policies:

### 1. Error Classification

#### Authentication Errors (401/403)
- **User Message**: "Your session has expired. Please log in again to continue."
- **Action**: Prompt re-authentication
- **Retry Policy**: After successful re-auth, auto-retry booking
- **UX**: Modal dialog with login form; preserve booking data

#### Validation Errors (400)
- **User Message**: Specific field-level errors (e.g., "Check-in date must be in the future")
- **Action**: Highlight invalid fields; show inline error messages
- **Retry Policy**: No auto-retry; user must fix input
- **UX**: Red border on invalid fields; error text below field; focus first error

#### Supplier Availability Errors
- **User Message**: "This room is no longer available. Would you like to see alternative options?"
- **Action**: Show similar hotels or rooms
- **Retry Policy**: No retry; offer alternatives
- **UX**: Modal with alternative suggestions; "Search Again" button

#### Network/Timeout Errors
- **User Message**: "Connection issue. Checking your booking status..."
- **Action**: Verify booking status; auto-retry with exponential backoff
- **Retry Policy**: 3 attempts (1s, 3s, 9s delays)
- **UX**: Loading state with retry count; don't close modal

#### Server Errors (500/502/503)
- **User Message**: "Our booking system is temporarily unavailable. Your payment was not processed. Please try again in a few minutes."
- **Action**: Log error details; suggest waiting
- **Retry Policy**: Manual retry only; no auto-retry for 5xx
- **UX**: Error page with "Try Again" button; show support contact

#### Rate Limiting (429)
- **User Message**: "Too many requests. Please wait a moment before trying again."
- **Action**: Show countdown timer
- **Retry Policy**: Auto-retry after specified delay (from Retry-After header)
- **UX**: Progress indicator with countdown

### 2. User Messaging Patterns

#### Toast Notifications
- Use for non-critical errors (e.g., failed to load hotel images)
- Auto-dismiss after 5 seconds
- Include action button if relevant ("Retry")

#### Inline Validation
- Use for form field errors
- Show immediately on blur or submit attempt
- Clear when user corrects input

#### Modal Dialogs
- Use for blocking errors requiring user action (e.g., auth expired)
- Cannot dismiss without action
- Preserve user's work when possible

#### Error Pages
- Use for catastrophic failures
- Show friendly illustration
- Provide clear next steps
- Include support contact information

### 3. Idempotency and Retry Safety

#### Booking Submission
- Generate unique idempotency key (UUID) when user clicks "Book Now"
- Include key in all booking requests: `X-Idempotency-Key: <uuid>`
- Backend uses key to prevent duplicate bookings on retry
- Frontend stores key until confirmation received

#### Payment Safety
- Never auto-retry payment failures (user must explicitly retry)
- Clear messaging: "Payment not processed" vs "Payment pending verification"
- Verify booking status before retry if response unclear

## Consequences

### Positive
- **User Trust**: Clear communication reduces frustration and builds confidence
- **Fewer Support Requests**: Self-service error resolution
- **Higher Conversion**: Graceful handling of transient failures
- **Better Debugging**: Structured error logging helps diagnose issues
- **Payment Safety**: Idempotency prevents double-charges

### Negative
- **Implementation Complexity**: Many error cases to handle
- **Testing Overhead**: Must test error scenarios thoroughly
- **UI Complexity**: Multiple error display mechanisms
- **Logging Volume**: Detailed error logs increase storage needs

### Code Implications

#### Frontend Must:
- Wrap all API calls in try-catch with error handlers
- Implement error classification logic based on status codes
- Generate and track idempotency keys for bookings
- Display appropriate UI for each error type
- Preserve form data during error states
- Implement exponential backoff for retries
- Log errors to monitoring service (with sensitive data removed)

#### Error Handling Utilities:
```typescript
// Example error handler interface
interface ErrorHandler {
  handle(error: ApiError): void
  classify(error: ApiError): ErrorType
  getMessage(errorType: ErrorType): string
  shouldRetry(errorType: ErrorType): boolean
  getRetryDelay(attemptNumber: number): number
}

// Error types
enum ErrorType {
  AUTH_EXPIRED,
  VALIDATION,
  AVAILABILITY,
  NETWORK,
  SERVER_ERROR,
  RATE_LIMIT,
  UNKNOWN
}
```

#### Backend Must:
- Return standardized error responses with error codes
- Include `error_code`, `message`, and `details` fields
- For validation errors, include field-specific errors
- Implement idempotency key checking for bookings
- Set appropriate HTTP status codes
- Include `Retry-After` header for rate limiting
- Log errors with request context for debugging

#### Example Error Response:
```json
{
  "error_code": "VALIDATION_ERROR",
  "message": "Invalid booking parameters",
  "details": {
    "check_in_date": "Check-in date must be in the future",
    "guest_email": "Invalid email format"
  }
}
```

#### Monitoring and Alerting:
- Track error rates by type
- Alert on spike in authentication failures
- Alert on supplier availability errors (may indicate API issues)
- Dashboard showing error trends over time

#### User-Facing Error Messages Must:
- Be written in clear, non-technical language
- Explain what went wrong
- Tell user what they can do next
- Never expose technical details (stack traces, internal IDs)
- Be translated for internationalization

#### Testing Requirements:
- Unit tests for error classification logic
- Integration tests for retry behavior
- E2E tests for user-facing error flows
- Mock API to simulate each error scenario
- Load testing for rate limiting behavior

## Alternatives Considered

### 1. Generic Error Messages
Show same message for all errors: "Something went wrong. Please try again."
- **Rejected**: Frustrating for users; doesn't help them resolve issue; reduces trust

### 2. Auto-Retry Everything
Automatically retry all failed requests.
- **Rejected**: Risk of double-booking; user confusion; wasted API calls for permanent errors

### 3. No Idempotency Keys
Rely on backend to detect duplicate bookings.
- **Rejected**: Complex backend logic; race conditions; no client control over retries

### 4. Silent Failures
Log errors but don't show user any feedback.
- **Rejected**: Users don't know what happened; can't take corrective action; trust issues

## References
- Related: ADR-0001 (Booking contract may fail if offer unavailable)
- Related: ADR-0002 (Authentication errors from expired tokens)
- [MDN HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Idempotency Keys - Stripe Best Practices](https://stripe.com/docs/api/idempotent_requests)
