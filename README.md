# www.hotel.com.tn

Frontend for hotel search + booking.

## Development notes (smoke test)

- **Search**: verify search-hotels returns results without any token in the response.
- **Booking (guest)**: trigger booking as guest; the app will call `supabase.auth.signInAnonymously()` if needed and send `Authorization: Bearer <access_token>` to `create-booking`.
- **Booking (logged-in)**: confirm booking uses the active Supabase session JWT and `create-booking` succeeds without a supplier token in the browser.

## Contracts

- `search-hotels` is public and token-free.
- `create-booking` is protected and requires a Supabase JWT.