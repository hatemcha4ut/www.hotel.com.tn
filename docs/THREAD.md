# Project Thread

## Current Objective
Build a hotel search and booking user experience for www.hotel.com.tn, connected to the api.hotel.com.tn backend service. Enable users to search for hotels across Tunisia, compare options with real-time availability, and complete secure bookings.

## Backend Contracts Used

### Public Endpoint: `search-hotels`
- **Purpose**: Search for available hotels based on user criteria
- **Access**: Public API, no authentication required
- **Returns**: Hotel search results with offers, pricing, and availability
- **Key Design**: Returns **token-free results** - no supplier-specific tokens are exposed to the browser

### Private Endpoint: `create-booking`
- **Purpose**: Create a confirmed hotel booking
- **Access**: Requires authentication (JWT)
- **Input**: Search parameters + selected offer + guest/contact information
- **Key Design**: Generates supplier tokens **server-side only** - never exposes tokens to client

## Decision Highlights

### 1. Frontend Must NOT Depend on Supplier Tokens
- The frontend receives clean, token-free results from `search-hotels`
- This design prevents token exposure in browser environments
- All supplier-specific authentication is handled server-side

### 2. Booking Flow Architecture
- User searches hotels via `search-hotels` (public)
- User selects an offer from search results
- Booking submission calls `create-booking` (private) with:
  - Original search parameters (dates, location, guests)
  - Selected offer details (hotel ID, room type, price)
  - Guest and contact information
- Backend generates supplier token internally and completes booking

### 3. Authentication Strategy
- Guest users can book using anonymous JWT authentication
- Logged-in users use their standard JWT tokens
- Both flows use the same `create-booking` endpoint
- See ADR-0002 for full authentication design

## Deployment Notes

### Environment Variables
- `VITE_SUPABASE_URL` - Supabase project URL for authentication and data storage
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public API key
- `VITE_API_BASE_URL` - Base URL for api.hotel.com.tn backend (if needed)

### Deployment Platform
- **Primary**: GitHub Pages via `gh-pages` branch
- Build command: `npm run build` (outputs to `/dist`)
- Deploy command: `npm run deploy`
- Deployment branch: `gh-pages`

### Build Process
1. TypeScript compilation: `tsc -b --noCheck`
2. Vite production build: `vite build`
3. Static assets output to `dist/`
4. GitHub Pages serves from `gh-pages` branch

## Next Actions

### Immediate Tasks
- [ ] Implement search UI with date picker and guest selector
- [ ] Integrate with `search-hotels` API endpoint
- [ ] Build hotel results page with filtering and sorting
- [ ] Create hotel details page with room selection

### Booking Flow
- [ ] Implement multi-step booking wizard
- [ ] Add guest information form with validation
- [ ] Integrate anonymous authentication for guest bookings
- [ ] Connect to `create-booking` API endpoint
- [ ] Build confirmation page with booking reference

### Testing & Quality
- [ ] Add error handling for API failures (see ADR-0003)
- [ ] Test guest vs. authenticated user flows
- [ ] Validate edge cases (date ranges, API timeouts, validation errors)
- [ ] Security review of token handling

### Documentation
- [ ] API integration guide for developers
- [ ] User flow diagrams for booking process
- [ ] Deployment runbook

### Related Issues/PRs
- PR: [Link to implementation PR] - Initial search and booking implementation
- Issue: [Link to tracking issue] - Hotel search feature development
- Issue: [Link to tracking issue] - Booking flow implementation
