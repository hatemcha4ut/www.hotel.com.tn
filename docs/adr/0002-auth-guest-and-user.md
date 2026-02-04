# ADR-0002: Authentication for Guest and Logged-In User Flows

## Status
Accepted

## Context
The hotel booking application needs to support two distinct user types:
1. **Guest users**: First-time visitors who want to book without creating an account
2. **Logged-in users**: Returning customers with accounts who want to track bookings

The `create-booking` API endpoint requires authentication (JWT token) for security and auditing. However, forcing account creation before booking creates friction that may reduce conversions.

### Key Considerations
- Reduce friction for first-time bookers (guest flow)
- Enable booking history and management for registered users
- Maintain consistent security model (all bookings require auth)
- Support future features like loyalty programs, saved preferences

## Decision
We will support **both guest and authenticated user flows** using a unified authentication approach:

1. **Guest Flow: Anonymous Sign-In**
   - Guest users trigger anonymous authentication via Supabase
   - System generates a temporary JWT token for the session
   - Guest can complete booking with this anonymous token
   - After booking, offer option to "upgrade" to full account (optional)

2. **Logged-In Flow: Standard Authentication**
   - Registered users sign in with email/password or social auth
   - Standard JWT token issued for authenticated session
   - Bookings associated with user account for history tracking

3. **Unified Backend Contract**
   - Both flows call `create-booking` with a valid JWT
   - Backend validates JWT (whether anonymous or authenticated)
   - Backend associates booking with user ID from JWT
   - For anonymous users, booking stored with anonymous user ID

## Consequences

### Positive
- **Lower Barrier**: Guests can book immediately without account creation
- **Consistent Security**: All bookings authenticated and auditable
- **Unified API**: Single `create-booking` endpoint handles both flows
- **Upgrade Path**: Anonymous bookings can be claimed when user creates account
- **Future-Proof**: Architecture supports loyalty programs, preferences, etc.

### Negative
- **Anonymous User Management**: Must handle anonymous user lifecycle
- **Booking Retrieval**: Anonymous users need email-based lookup to view bookings
- **Account Linking**: Complex logic to associate anonymous bookings with new accounts
- **Token Expiry**: Anonymous tokens may expire before booking completion

### Code Implications

#### Frontend Must:
- Detect if user is logged in or anonymous
- For anonymous users:
  - Call Supabase `signInAnonymously()` before booking
  - Store anonymous JWT token for booking request
  - Provide email-based booking lookup for returning guests
- For logged-in users:
  - Use standard Supabase auth token
  - Display booking history from user account
- Offer "Create Account" after successful guest booking
- Handle token refresh for both anonymous and authenticated sessions

#### Backend Must:
- Accept JWT from both anonymous and authenticated users
- Validate JWT signature and expiration
- Extract user ID from JWT (anonymous or authenticated)
- Store booking with user ID for later retrieval
- Support booking lookup by email for anonymous users
- Provide account upgrade flow to link anonymous bookings

#### Example Flows

**Guest Booking Flow:**
```
1. User starts booking (not logged in)
2. Frontend calls: supabase.auth.signInAnonymously()
3. Receives anonymous JWT token
4. Submits booking with Authorization: Bearer <anonymous-jwt>
5. Backend validates JWT, creates booking with anonymous user ID
6. After confirmation, show "Create account to track this booking?" option
```

**Logged-In Booking Flow:**
```
1. User logs in: supabase.auth.signInWithPassword({ email, password })
2. Receives authenticated JWT token
3. Submits booking with Authorization: Bearer <auth-jwt>
4. Backend validates JWT, creates booking linked to user account
5. User can view booking in account dashboard
```

**Account Upgrade Flow:**
```
1. Anonymous user creates account after booking
2. Frontend sends upgrade request with anonymous JWT + new credentials
3. Backend links previous anonymous bookings to new account
4. User can now access booking history
```

### Authentication Implementation Notes

#### Supabase Configuration Required:
- Enable anonymous sign-in in Supabase project settings
- Configure anonymous session expiration (recommend 24 hours minimum for booking flow)
- Set up email-based booking lookup queries

#### Error Handling:
- Handle anonymous token expiration during booking process
- Provide clear messaging if auth fails
- Allow retry without losing booking form data
- See ADR-0003 for detailed error handling patterns

## Alternatives Considered

### 1. Guest Without Auth
Allow truly unauthenticated bookings (no JWT required).
- **Rejected**: Security concerns; no audit trail; spam/fraud risk; can't implement future features

### 2. Required Account Creation
Force all users to create account before booking.
- **Rejected**: High friction; conversion rate impact; industry best practice is guest checkout

### 3. Session-Based Auth for Guests
Use traditional session cookies for guest users.
- **Rejected**: Inconsistent auth model; harder to scale; JWT is more flexible for mobile apps

## References
- Related: ADR-0001 (Booking contract design)
- Related: ADR-0003 (Error handling for auth failures)
- Supabase Docs: [Anonymous Sign-In](https://supabase.com/docs/guides/auth/auth-anonymous)
