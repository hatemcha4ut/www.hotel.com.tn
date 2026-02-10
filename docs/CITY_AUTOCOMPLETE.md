# City Autocomplete System

## Overview

The city autocomplete system provides a reusable, performant, and user-friendly way for users to search and select cities when booking hotels. It features module-level caching for optimal performance, automatic fallback to static data, and comprehensive loading/error handling.

### Key Features

- **Module-level caching**: Cities are fetched once per session and cached in memory
- **Request deduplication**: Multiple concurrent requests are collapsed into a single HTTP call
- **Automatic fallback**: Falls back to static Tunisian cities on error
- **Loading indicators**: Visual feedback during city data loading
- **Error handling with retry**: Users can manually retry failed requests
- **Full keyboard navigation**: Arrow keys, Enter, Escape for accessibility
- **ARIA compliant**: Proper ARIA attributes for screen readers

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           Browser (Frontend)                              │
│                                                                            │
│  ┌──────────────────┐                                                    │
│  │   Hero.tsx       │                                                    │
│  │  SearchWidget    │                                                    │
│  └────────┬─────────┘                                                    │
│           │                                                               │
│           │ useCities()                                                   │
│           ▼                                                               │
│  ┌──────────────────┐        ┌──────────────────────┐                  │
│  │ hooks/           │        │ CityAutocomplete.tsx │                  │
│  │ useCities.ts     │───────▶│                      │                  │
│  │                  │        │  - Loading indicator │                  │
│  │ • Module cache   │        │  - Error message     │                  │
│  │ • Deduplication  │        │  - Retry button      │                  │
│  │ • Retry logic    │        │  - Keyboard nav      │                  │
│  └────────┬─────────┘        └──────────────────────┘                  │
│           │                                                               │
│           │ fetchCities()                                                 │
│           ▼                                                               │
│  ┌──────────────────┐                                                    │
│  │ services/        │                                                    │
│  │ inventorySync.ts │                                                    │
│  └────────┬─────────┘                                                    │
│           │                                                               │
└───────────┼───────────────────────────────────────────────────────────┘
            │
            │ HTTPS GET
            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    Public API (Cloudflare Worker)                         │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  https://api.hotel.com.tn/static/cities                          │  │
│  │  Returns: { items: City[], source, cached, fetchedAt }           │  │
│  │  Headers: ETag, Cache-Control                                     │  │
│  └──────────────────────┬───────────────────────────────────────────┘  │
│                         │                                                 │
└─────────────────────────┼─────────────────────────────────────────────┘
                          │
                          │ myGO API call
                          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         myGO API Server                                   │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  ListCity API Endpoint                                            │  │
│  │  Returns: City[]                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘

                          Fallback Path (if public API fails)
                          
┌──────────────────────────────────────────────────────────────────────────┐
│                         Supabase Edge Functions                           │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  inventory-sync                                                   │  │
│  │  { action: 'cities' }                                             │  │
│  └──────────────────────┬───────────────────────────────────────────┘  │
│                         │                                                 │
└─────────────────────────┼─────────────────────────────────────────────┘
                          │
                          │ myGO API call
                          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         myGO API Server                                   │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  ListCity API Endpoint                                            │  │
│  │  Returns: City[]                                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

## Components

### `useCities()` Hook

**Location**: `src/hooks/useCities.ts`

A custom React hook that manages city data fetching, caching, and state.

#### Module-Level State

```typescript
// Survives component unmount/remount
let cachedCities: City[] | null = null
let fetchPromise: Promise<City[]> | null = null
```

#### Return Interface

```typescript
{
  cities: City[]           // Array of city objects
  isLoading: boolean       // True during initial fetch
  error: Error | null      // Error object if fetch fails
  retry: () => void        // Function to force re-fetch
}
```

#### Caching Strategy

1. **First mount**: `cachedCities` is `null` → fetch cities from API
2. **Subsequent mounts**: `cachedCities` exists → return immediately (no HTTP call)
3. **Concurrent mounts**: `fetchPromise` deduplicates → only one HTTP call
4. **Error fallback**: On fetch failure → use `tunisianCities` from `constants/cities.ts`
5. **Manual retry**: User clicks retry → `force = true` → bypass cache

#### Usage Example

```tsx
import { useCities } from '@/hooks/useCities'

function MyComponent() {
  const { cities, isLoading, error, retry } = useCities()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message} <button onClick={retry}>Retry</button></div>
  
  return <CityList cities={cities} />
}
```

### `CityAutocomplete` Component

**Location**: `src/components/CityAutocomplete.tsx`

A fully accessible autocomplete input for city selection with keyboard navigation and ARIA support.

#### Props

```typescript
interface CityAutocompleteProps {
  onSelect: (cityId: string) => void   // Callback when city selected
  selectedCityId?: string               // Currently selected city ID
  placeholder?: string                  // Input placeholder text
  cities?: City[]                       // Array of cities to search
  className?: string                    // Additional CSS classes
  isLoading?: boolean                   // Show loading indicator
  error?: Error | null                  // Show error message
  onRetry?: () => void                  // Retry callback
}
```

#### Features

- **Text normalization**: NFD normalization with diacritic removal for search matching
- **Keyboard navigation**: 
  - `ArrowDown` / `ArrowUp`: Navigate options
  - `Enter`: Select highlighted option
  - `Escape`: Close dropdown
- **ARIA attributes**: 
  - `role="combobox"` on input
  - `role="listbox"` on dropdown
  - `aria-expanded`, `aria-controls`, `aria-activedescendant`
- **Loading state**: Shows spinner with "Chargement des villes..." when `isLoading && cities.length === 0`
- **Error state**: Shows error message with retry button when `error` is present
- **Blur handling**: 100ms delay to allow click events before closing

#### Usage Example

```tsx
<CityAutocomplete
  selectedCityId={searchParams.cityId}
  placeholder="Sélectionner une ville"
  cities={cities}
  onSelect={(cityId) => setSearchParams({ ...searchParams, cityId })}
  isLoading={citiesLoading}
  error={citiesError}
  onRetry={retryCities}
/>
```

### Static Fallback: `tunisianCities`

**Location**: `src/constants/cities.ts`

Provides a static fallback list of major Tunisian cities when the API fails.

```typescript
export const tunisianCities: City[] = [
  { id: '1', name: 'Tunis', country: 'Tunisia' },
  { id: '2', name: 'Sousse', country: 'Tunisia' },
  { id: '3', name: 'Hammamet', country: 'Tunisia' },
  { id: '4', name: 'Djerba', country: 'Tunisia' },
  { id: '5', name: 'Monastir', country: 'Tunisia' },
  { id: '6', name: 'Mahdia', country: 'Tunisia' },
  { id: '7', name: 'Tozeur', country: 'Tunisia' },
  { id: '8', name: 'Sfax', country: 'Tunisia' },
]
```

## Data Flow

### 1. City Selection Flow

```
User interaction
      ↓
CityAutocomplete onChange
      ↓
onSelect(cityId) callback
      ↓
AppContext.setSearchParams({ cityId })
      ↓
searchParams.cityId updated
      ↓
Search button enabled
```

### 2. Search Request Flow

```
User clicks "Search"
      ↓
buildSearchRequest(searchParams)
      ↓
fetchSearchHotels({ cityId, dates, rooms })
      ↓
Supabase Edge Function "inventory-sync"
{ action: 'search', cityId, ... }
      ↓
myGO SearchHotels API
      ↓
Hotel results returned
```

### 3. City Fetch Flow

```
Component mounts
      ↓
useCities() hook initializes
      ↓
Check cachedCities
      ↓
If cached → return immediately
If not → fetchCities()
      ↓
inventorySync.ts → fetchCities()
      ↓
Try: HTTPS GET to https://api.hotel.com.tn/static/cities
      ↓
Success → Parse response (items, source, cached, fetchedAt)
      ↓
 copilot/update-city-loading-api
Check ETag and Cache-Control headers

Browser HTTP cache applies ETag / Cache-Control (headers logged in dev)
 main
      ↓
Cities returned & cached
      ↓
(If public API fails)
      ↓
Fallback: Supabase Edge Function "inventory-sync"
{ action: 'cities' }
      ↓
myGO ListCity API
      ↓
Cities returned & cached
      ↓
(If both fail)
      ↓
Use static tunisianCities from constants
```

## Type Reference

### `City` Type

**Location**: `src/types/index.ts`

```typescript
export interface City {
  id: string           // Unique city identifier (from myGO API)
  name: string         // City name (e.g., "Tunis")
  region?: string      // Optional region (e.g., "Tunis Governorate")
  country?: string     // Optional country (e.g., "Tunisia")
}
```

### Display Format

Cities are displayed with region/country when available:

- With region and country: `"Tunis – Tunis Governorate (Tunisia)"`
- With region only: `"Tunis – Tunis Governorate"`
- With country only: `"Tunis (Tunisia)"`
- Name only: `"Tunis"`

## Error Handling

### Error Scenarios

1. **Public API failure**: Request to `https://api.hotel.com.tn/static/cities` fails (network error, 4xx/5xx response)
2. **Supabase fallback failure**: Request to Supabase Edge Function fails
3. **Network failure**: General network connectivity issues
4. **API error**: myGO API returns error response (in fallback)
5. **CORS error**: Direct API call blocked (shouldn't happen with public endpoint)
6. **Timeout**: Request takes too long

### Error Recovery

Three-tier fallback system:

1. **Primary**: Fetch from public API at `https://api.hotel.com.tn/static/cities`
   - If successful, parse response and cache cities
   - Log source, cached status, and ETag/Cache-Control headers in dev mode
   
2. **Fallback 1**: If public API fails, try Supabase Edge Function
   - Call `inventory-sync` with `action: 'cities'`
   - Provides backward compatibility during migration
   
3. **Fallback 2**: If both fail, use static `tunisianCities`
   - `useCities()` catches errors and falls back to static cities
   - Ensures search functionality always available
   
4. **Visual feedback**: Error message displayed below autocomplete input
5. **Manual retry**: User can click "Réessayer" to retry fetch with `force = true`

### Error Display

```tsx
{error && (
  <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
    <p className="text-xs text-destructive">
      {error.message}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-1 text-xs text-destructive underline hover:no-underline"
      >
        Réessayer
      </button>
    )}
  </div>
)}
```

## Security

### Public API Endpoint (Option A)

The city data is now fetched from a **public API endpoint** instead of Supabase Edge Functions:

#### Endpoint Details
- **URL**: `https://api.hotel.com.tn/static/cities`
- **Method**: GET
- **Authentication**: None (public endpoint)
- **Hosting**: Cloudflare Worker

#### Request Format
```http
GET /static/cities HTTP/1.1
Host: api.hotel.com.tn
Accept: application/json
```

#### Response Format
```json
{
  "items": [
    {
      "id": "1",
      "name": "Tunis",
      "region": "Tunis Governorate",
      "country": "Tunisia"
    },
    {
      "id": "2",
      "name": "Sousse",
      "region": "Sousse Governorate",
      "country": "Tunisia"
    }
  ],
  "source": "mygo-api",
  "cached": true,
  "fetchedAt": "2026-02-09T20:30:00Z"
}
```

#### Response Headers
- **ETag**: Unique identifier for response version (e.g., `"abc123"`)
  - Used for conditional requests (304 Not Modified)
  - Client can cache response and use `If-None-Match` header
- **Cache-Control**: Browser caching directives
  - Example: `public, max-age=3600` (cache for 1 hour)
  - `public`: Can be cached by browsers and CDNs
  - `max-age`: How long to cache in seconds

#### Response Fields
- **items** (required): Array of City objects
- **source** (optional): Data source identifier (e.g., "mygo-api", "cache")
- **cached** (optional): Boolean indicating if response was served from cache
- **fetchedAt** (optional): ISO 8601 timestamp of when data was fetched

#### Error Responses
- **4xx**: Client error (invalid request)
- **5xx**: Server error (backend unavailable)
- **Network error**: Connection failure, timeout

#### Environment Variables
- **None required**: Public API endpoint doesn't require credentials
- **Existing vars still needed**: For fallback Supabase edge function
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

#### Dependencies
- **Primary**: `api.hotel.com.tn` (Cloudflare Worker)
- **Fallback**: Supabase Edge Function `inventory-sync`
- **Backend**: MyGO API (ultimate source of city data)
- **Static**: `tunisianCities` array (final fallback)

### Supabase Proxy (Fallback Only)

The Supabase Edge Function is now used as a **fallback** when the public API is unavailable:

#### 1. **Credential Protection**
- myGO API credentials (username, password, API key) are stored server-side
- Frontend never contains or transmits sensitive credentials
- Reduces attack surface for credential theft

#### 2. **CORS Prevention**
- myGO API may not have CORS headers configured for browser requests
- Supabase Edge Functions act as server-side proxy, bypassing CORS
- No need to configure CORS on myGO API server

#### 3. **Rate Limiting**
- Server-side rate limiting can be implemented in Edge Functions
- Protects myGO API from abuse
- Can implement backoff strategies centrally

#### 4. **Request Validation**
- Edge Functions can validate and sanitize requests before forwarding
- Prevents malicious payloads from reaching myGO API
- Can enforce business rules server-side

#### 5. **Error Handling**
- Centralized error mapping and logging
- Can hide internal error details from frontend
- Better observability and debugging

#### 6. **API Versioning**
- Edge Functions can handle API version differences
- Frontend remains stable even if myGO API changes
- Easier to migrate to new API versions

### Best Practices

1. **Never store credentials in frontend code or environment variables**
2. **Always use `inventorySync.ts` service for API calls**
3. **Never call `api.hotel.com.tn` directly from browser JavaScript**
4. **Log errors server-side, not in browser console**
5. **Validate user input before sending to Edge Functions**

## Performance Considerations

### Caching Strategy

- **Module-level cache**: Survives component unmounts, cleared only on page reload
- **Session duration**: Cache lasts entire user session (until page refresh)
- **Memory efficient**: Cities array is small (~100 items), minimal memory impact
- **No expiration**: Cities rarely change, no need for TTL

### Request Optimization

- **Deduplication**: Concurrent requests collapse into single HTTP call
- **Early return**: Cached data returns synchronously (no await)
- **Lazy loading**: Cities fetched only when component using `useCities()` mounts
- **No polling**: One-time fetch, not continuously updated

### Bundle Size

- **Static fallback**: 8 cities = ~200 bytes
- **Hook code**: ~1.5 KB
- **Component code**: ~6 KB
- **Total overhead**: < 10 KB

## Future Improvements

### Potential Enhancements

1. **Geolocation**: Auto-select nearest city based on user location
2. **Recent cities**: Remember last 3 selected cities in localStorage
3. **Popular cities**: Sort by booking frequency
4. **City images**: Show thumbnail images in dropdown
5. **Multi-language**: Translate city names based on locale
6. **Infinite scroll**: For large city lists (if needed)
7. **Search highlighting**: Highlight matching text in results
8. **Voice input**: Speech-to-text for city search

### Known Limitations

1. **No pagination**: All cities loaded at once (acceptable for ~100 cities)
2. **No server-side search**: Filtering happens client-side
3. **No fuzzy matching**: Exact substring match only

## Troubleshooting

### Common Issues

**Q: Cities not loading on first mount?**
- Check browser console for errors
- Verify Supabase Edge Function is deployed
- Check network tab for 500/400 responses

**Q: Autocomplete shows fallback cities immediately?**
- API fetch likely failed
- Check error state in component
- Verify myGO API credentials in Edge Function

**Q: Multiple fetch requests when mounting multiple components?**
- Should be prevented by `fetchPromise` deduplication
- If seeing multiple requests, check for race conditions in code

**Q: Cities reset after navigation?**
- Expected behavior: cache clears on page reload
- Not expected: cache should survive React remounts
- Check if module-level variables are being reset

**Q: Retry button not working?**
- Verify `onRetry` prop is passed to `CityAutocomplete`
- Check if `retry()` function is called correctly
- Ensure `force = true` bypasses cache

## Related Files

- `src/hooks/useCities.ts` - City data fetching hook
- `src/components/CityAutocomplete.tsx` - Autocomplete UI component
- `src/components/Hero.tsx` - Search widget using autocomplete
- `src/services/inventorySync.ts` - API service layer
- `src/constants/cities.ts` - Static fallback cities
- `src/types/index.ts` - TypeScript type definitions
- `supabase/functions/inventory-sync/index.ts` - Edge Function handler

## Support

For questions or issues with the city autocomplete system:

1. Check this documentation first
2. Review code comments in source files
3. Check browser console for errors
4. Verify API responses in network tab
5. Contact development team with reproduction steps
