# www.hotel.com.tn

Frontend for hotel search + booking.

## Development notes (smoke test)

- **Search**: verify search-hotels returns results without any token in the response.
- **Booking (guest)**: trigger booking as guest; the app will call `supabase.auth.signInAnonymously()` if needed and send `Authorization: Bearer <access_token>` to `create-booking`.
- **Booking (logged-in)**: confirm booking uses the active Supabase session JWT and `create-booking` succeeds without a supplier token in the browser.

## Contracts

- `search-hotels` is public and token-free.
- `create-booking` is protected and requires a Supabase JWT.

## Cities Loading (Option A)

The frontend fetches city data from a **public API endpoint** instead of Supabase edge functions:

### Endpoint
- **URL**: `https://api.hotel.com.tn/static/cities`
- **Method**: GET
- **Auth**: None (public endpoint)

### Response Format
```json
{
  "items": [
    {
      "id": "1",
      "name": "Tunis",
      "region": "Tunis Governorate",
      "country": "Tunisia"
    }
  ],
  "source": "mygo-api",
  "cached": true,
  "fetchedAt": "2026-02-09T20:30:00Z"
}
```

### Cache Headers
- **ETag**: Unique identifier for response version (e.g., `"abc123"`)
- **Cache-Control**: Browser caching directives (e.g., `public, max-age=3600`)

### Error Handling
1. **Primary**: Fetch from `https://api.hotel.com.tn/static/cities`
2. **Fallback 1**: If public API fails, try Supabase edge function `inventory-sync` with `action: 'cities'`
3. **Fallback 2**: If both fail, use static `tunisianCities` array from `src/constants/cities.ts`

### Dependencies
- **Public API** (`api.hotel.com.tn`): Hosted on Cloudflare Worker
- **Supabase Edge Function** (fallback): `inventory-sync` function
- **MyGO API** (backend): Ultimate data source
- No additional environment variables required for public API access