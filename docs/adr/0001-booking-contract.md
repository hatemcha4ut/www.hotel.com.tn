# ADR-0001: Token-Free Booking Contract

## Status
Accepted

## Context
The application needs to integrate with api.hotel.com.tn for hotel search and booking functionality. The backend communicates with multiple hotel suppliers, each requiring their own authentication tokens and booking protocols. We need to decide how to handle supplier tokens in the booking flow while maintaining security and simplicity in the frontend.

### Key Considerations
- Exposing supplier tokens in the browser creates security risks
- Different suppliers have different token formats and expiration policies
- Frontend should remain simple and supplier-agnostic
- Booking flow must be seamless for users

## Decision
We will use a **token-free architecture** where:

1. **`search-hotels` returns token-free results**
   - The public search endpoint returns clean hotel offers without any supplier-specific tokens
   - Results include hotel details, pricing, availability, and offer identifiers
   - Frontend displays results without needing to understand supplier protocols

2. **`create-booking` generates supplier tokens server-side**
   - The private booking endpoint receives search parameters, selected offer, and guest information
   - Backend generates the necessary supplier token internally
   - Backend handles all supplier-specific authentication and protocols
   - Frontend never sees or handles supplier tokens

3. **Booking flow data contract**
   - Frontend sends to `create-booking`:
     - Original search parameters (dates, location, guest count)
     - Selected offer identifier
     - Guest contact information
   - Backend reconstructs the booking context and generates supplier token
   - Backend completes booking with supplier and returns confirmation

## Consequences

### Positive
- **Enhanced Security**: Supplier tokens never exposed to browser/client
- **Simplified Frontend**: No need to manage tokens, expirations, or supplier-specific logic
- **Supplier Flexibility**: Can change suppliers without frontend changes
- **Clean Separation**: Clear boundary between presentation and integration layers
- **Token Management**: All token lifecycle (generation, refresh, expiration) handled server-side

### Negative
- **Backend Complexity**: Backend must maintain search context or reconstruct it from parameters
- **Stateless Challenge**: Cannot rely on server-side session state for offer details
- **Potential Race Conditions**: Offer might become unavailable between search and booking

### Code Implications

#### Frontend Must:
- Call `search-hotels` without authentication (public endpoint)
- Display results based on offer identifiers, not tokens
- Submit bookings with complete search parameters + selected offer + guest info
- Handle booking failures gracefully (offer no longer available, validation errors)

#### Backend Must:
- Return clean, token-free results from `search-hotels`
- Accept full booking context in `create-booking` request
- Generate supplier token internally based on offer identifier and search params
- Validate that offer is still available at booking time
- Return clear error messages if booking fails

#### Example Flow
```
1. User searches: POST /search-hotels { destination, dates, guests }
2. API returns: { offers: [{ offerId, hotelId, price, ... }] } // No tokens!
3. User selects offer and books: POST /create-booking { 
     searchParams: { destination, dates, guests },
     selectedOffer: { offerId, hotelId },
     guestInfo: { name, email, ... }
   }
4. Backend generates token, books with supplier, returns confirmation
```

## Alternatives Considered

### 1. Token-Based Approach
Return supplier tokens from `search-hotels` and require frontend to send them back in booking.
- **Rejected**: Security risk of exposing tokens; frontend complexity; supplier coupling

### 2. Session-Based State
Store search results in server-side session and reference by session ID.
- **Rejected**: Stateful backend harder to scale; session management complexity; mobile app challenges

## References
- Related: ADR-0002 (Authentication for guest and logged-in users)
- Related: ADR-0003 (Error handling for booking failures)
