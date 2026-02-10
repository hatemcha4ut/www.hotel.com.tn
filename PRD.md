# Planning Guide

www.hotel.com.tn - A comprehensive hotel booking platform to search, compare, and book accommodations across popular destinations in Tunisia with real-time availability and secure payment processing.

**Experience Qualities**:
1. **Effortless** - Intuitive search and booking flow that guides users from discovery to confirmation without friction
2. **Trustworthy** - Professional design with clear pricing, secure payment badges, and transparent booking policies that instill confidence
3. **Aspirational** - Beautiful imagery and elegant presentation that makes users excited about their upcoming travel

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This is a full-featured e-commerce platform with multiple user journeys (guest booking, authenticated user management), real-time search with filters, multi-step forms, payment integration, state management across pages, and external API integration for hotel data and bookings.

## Essential Features

### Homepage Hero Search Widget
- **Functionality**: Dynamic search form with toggle between city and hotel name search modes, optional date pickers, guest configuration builder
- **Purpose**: Primary conversion point - allows users to immediately begin their hotel search journey
- **Trigger**: Page load (auto-focused), user interaction with search parameters
- **Progression**: Select search mode → Choose location/hotel → Optionally select dates (check-in validates check-out minimum) → Configure guests (adults/children/rooms) → Click search → Navigate to results page with query parameters
- **Success criteria**: Search executes with location/hotel and guest parameters (dates optional), invalid states are prevented when dates are provided (can't select check-out before check-in), guest configuration accurately captures party composition. If dates not selected, displays prices for next-day check-in by default.

### Hotel Search & Filtering
- **Functionality**: Display paginated hotel results with sidebar filters (price, stars, amenities, boarding type) and sort controls
- **Purpose**: Help users narrow down options from potentially hundreds of hotels to their perfect match
- **Trigger**: Homepage search submission or direct navigation with search params
- **Progression**: Results load with skeletons → Hotels display in grid → User applies filters (instant filter without page reload) → User sorts results → Click hotel card → Navigate to hotel details
- **Success criteria**: Filters work in combination, results update smoothly, filters persist during navigation, "no results" state appears when appropriate

### Multi-Step Booking Process
- **Functionality**: Four-step wizard (Guest Details → Review → Payment → Confirmation) with progress indicator and validation at each step. Includes option to create account or continue as guest. Voucher generation includes hotel name, check-in date/time, check-out date/time, number of guests, booker name, and main occupant name.
- **Purpose**: Collect necessary information while breaking complex form into digestible chunks, with comprehensive voucher for hotel presentation
- **Trigger**: User clicks "Select Room" on hotel details page (after confirming dates if needed)
- **Progression**: Guest form with validation → Review summary (shows booking details first, then choice to create account or continue as guest, then personal info) → Payment via ClicToPay.com.tn integration → Success confirmation with booking reference and downloadable/viewable voucher compatible with Apple Wallet and Google Wallet
- **Success criteria**: Cannot proceed with invalid data, can navigate backward without losing data, booking reference generated on completion, voucher includes all required information (hotel name, check-in date & time from hotel, check-out date & time from hotel, guest count, booker name, main occupant), wallet passes properly formatted with barcode

### Hotel Details Deep Dive
- **Functionality**: Comprehensive hotel page with image gallery, amenities grid, location map, reviews, and available rooms table with boarding type selection. When user selects a boarding type and clicks to book without having selected dates in initial search, a date selection dialog appears requesting check-in/check-out dates (defaulting to next day for check-in).
- **Purpose**: Provide all information needed to make booking decision and ensure dates are confirmed before proceeding to payment
- **Trigger**: Click hotel card from search results
- **Progression**: Page loads with hotel data → User views images (lightbox gallery) → Scrolls through amenities and reviews → Selects boarding type per room → Checks available rooms for selected dates → Clicks "Select Room" → If dates not yet selected, date picker dialog appears with default next-day check-in → User confirms dates → Proceeds to booking
- **Success criteria**: All hotel information displayed clearly, images load properly in gallery, boarding type selection updates pricing correctly, date dialog appears when needed, dates are validated before booking proceeds, pricing matches selected boarding options and dates

### User Account & Booking Management
- **Functionality**: Authentication system (login/register/reset) and dashboard showing upcoming/past/cancelled bookings with voucher downloads
- **Purpose**: Allow users to track their bookings and manage reservations
- **Trigger**: Click "Sign In" in navbar or attempt to view bookings page
- **Progression**: Open auth modal → Enter credentials or register → Access account dashboard → View booking history with status badges → Download voucher or cancel booking if applicable
- **Success criteria**: Authentication persists across sessions, booking history accurate, cancellation updates status, vouchers contain correct information

## Edge Case Handling

- **Invalid Date Ranges**: Prevent check-out before check-in, disable past dates, show validation messages
- **API Failures**: Display friendly error messages, retry mechanisms, fallback to cached data where possible
- **No Search Results**: Show helpful "No hotels found" message with suggestions to modify filters
- **Session Expiry**: Detect token expiration, prompt re-authentication, preserve booking-in-progress
- **Payment Failures**: Clear error messaging, allow retry without re-entering details, rollback booking if payment fails
- **Mobile Navigation**: Hamburger menu with smooth slide-in, touch-friendly target sizes, collapsible filters
- **Slow Networks**: Skeleton loaders, optimistic UI updates, image lazy loading with placeholders
- **Browser Back Button**: Preserve search state, booking progress saved to recover partial forms

## Design Direction

The design should evoke luxury travel and Mediterranean elegance - warm, inviting, sophisticated. Think boutique hotel aesthetic meets modern tech platform. Users should feel they're interacting with a premium service while experiencing the ease of contemporary web applications. The interface balances aspiration (beautiful hotel imagery, elegant typography) with functionality (clear CTAs, efficient forms, trustworthy UI patterns).

## Color Selection

A sophisticated palette inspired by Tunisian coastal landscapes - deep Mediterranean blue paired with golden sand accents.

- **Primary Color**: Deep Azure Blue (oklch(0.55 0.15 245)) - Evokes trust, professionalism, and the Mediterranean Sea. Used for primary CTAs, navigation, and key interactive elements.
- **Secondary Colors**: 
  - Soft Sand (oklch(0.95 0.02 85)) - Warm neutral background evoking Tunisian beaches
  - Warm Terracotta (oklch(0.88 0.08 50)) - Subtle accent for secondary actions and highlights
- **Accent Color**: Golden Amber (oklch(0.75 0.15 75)) - Used for star ratings, special offers, premium badges. Suggests value and quality.
- **Foreground/Background Pairings**: 
  - Primary Azure (oklch(0.55 0.15 245)): White text (oklch(1 0 0)) - Ratio 7.2:1 ✓
  - Background Sand (oklch(0.95 0.02 85)): Dark Slate text (oklch(0.25 0.01 245)) - Ratio 11.8:1 ✓
  - Accent Golden (oklch(0.75 0.15 75)): Dark text (oklch(0.2 0.02 75)) - Ratio 8.5:1 ✓
  - Card White (oklch(1 0 0)): Foreground Slate (oklch(0.25 0.01 245)) - Ratio 14.2:1 ✓

## Font Selection

Typography should feel modern yet approachable - combining a geometric sans-serif for headlines with a humanist sans for body text to balance sophistication with readability across languages (French, English, Arabic).

- **Primary Typeface**: Outfit (Display/Headings) - Modern geometric sans-serif with distinctive character that feels contemporary and premium
- **Secondary Typeface**: Inter (Body/UI) - Highly legible humanist sans optimized for interfaces, excellent for multilingual content
- **Typographic Hierarchy**:
  - H1 (Hero Title): Outfit Bold/48px/tight (-0.02em) - Large, impactful hero headlines
  - H2 (Section Headers): Outfit SemiBold/36px/tight - Major section divisions
  - H3 (Card Titles): Outfit Medium/24px/normal - Hotel names, subsection headers
  - Body Large (Descriptions): Inter Regular/18px/relaxed (1.6) - Hotel descriptions, important content
  - Body (Standard): Inter Regular/16px/normal (1.5) - General content, form labels
  - Small (Meta): Inter Regular/14px/normal - Dates, prices, secondary information
  - Button Text: Inter SemiBold/16px/normal/uppercase tracking - Clear action labels

## Animations

Animations should enhance the luxury feel while maintaining performance - smooth, purposeful micro-interactions that provide feedback without delay. Focus on elegant transitions during page navigation, subtle hover states on interactive elements, and satisfying confirmation animations for bookings. Use framer-motion for page transitions and search result filtering, CSS transitions for hover states. Key moments: successful booking gets celebratory animation, image galleries smoothly transition, filters apply with gentle fade, loading states use sophisticated skeletons rather than spinners.

## Component Selection

- **Components**: 
  - Dialog for authentication modals and image lightbox
  - Card for hotel results, booking summary, and destination features
  - Button with variants (default primary azure, secondary terracotta outline, ghost for mobile menu)
  - Input and Textarea with focus states using ring color in azure
  - Select for dropdowns (city, nationality, currency) with search capabilities
  - Calendar (react-day-picker) for date range selection with custom styling
  - Slider for price range filter with azure track
  - Checkbox for amenities and terms acceptance with azure check color
  - Badge for star ratings (golden), booking status, availability indicators
  - Tabs for My Bookings page (Upcoming/Past/Cancelled)
  - Progress indicator for booking steps (custom component with azure active state)
  - Carousel (embla) for popular hotels and hotel image galleries
  - Popover for guest selector configuration (adults/children/rooms builder)
  - Breadcrumb for navigation context on results and details pages
  - Separator for visual section divisions
  - Skeleton for loading states throughout
  - Toast (sonner) for notifications (booking confirmed, errors, etc.)
  
- **Customizations**: 
  - Custom guest selector component (Popover with stepper buttons for adults/children/rooms)
  - Custom date range picker that links check-in/check-out with validation
  - Search mode toggle (segmented control style)
  - Hotel image gallery with lightbox navigation
  - Price breakdown accordion
  - Booking progress stepper component
  - Filter sidebar with collapsible sections on mobile
  
- **States**: 
  - Buttons: default/hover (scale 1.02 + shadow)/active (scale 0.98)/disabled (opacity 50%)
  - Inputs: default border/focus (azure ring + border)/error (destructive border + ring)/filled (subtle background)
  - Cards: default/hover (elevate shadow + subtle scale)
  - Checkboxes/Radio: unchecked/checked (azure background)/indeterminate
  
- **Icon Selection**: 
  - MagnifyingGlass for search
  - Calendar for date pickers
  - MapPin for locations
  - Users for guest selector
  - Star (filled/outline) for ratings
  - Bed for room type
  - Wifi, SwimmingPool, Barbell for amenities
  - CreditCard for payment
  - CheckCircle for confirmation
  - XCircle for cancellation
  - CaretDown for dropdowns
  - List/SquaresFour for view toggle
  - FunnelSimple for filters
  - ArrowLeft/ArrowRight for carousel navigation
  
- **Spacing**: 
  - Container padding: px-4 (mobile) → px-6 (tablet) → px-8 (desktop)
  - Section gaps: gap-8 (mobile) → gap-12 (tablet) → gap-16 (desktop)
  - Card padding: p-4 (mobile) → p-6 (desktop)
  - Form field gaps: gap-4 (consistent)
  - Grid gaps: gap-4 (cards) → gap-6 (features)
  
- **Mobile**: 
  - Hamburger menu slides from right with overlay
  - Search widget stacks vertically on mobile with collapsible advanced options
  - Filter sidebar becomes bottom sheet on mobile
  - Hotel cards stack single column on mobile, 2 columns tablet, 3-4 desktop
  - Sticky booking widget becomes bottom bar on mobile
  - Image gallery: swipeable on mobile, grid with lightbox on desktop
  - Guest selector: full-screen modal on mobile, popover on desktop
  - Booking steps: vertical progress indicator on mobile, horizontal on desktop

## Technical Architecture

### Backend Services & Dependencies

#### 1. Public API (`api.hotel.com.tn`)
**Hosting**: Cloudflare Worker
**Purpose**: Static city data endpoint

- **Endpoint**: `https://api.hotel.com.tn/static/cities`
- **Method**: GET
- **Auth**: None (public)
- **Response Format**:
  ```json
  {
    "items": [{"id": "1", "name": "Tunis", "region": "...", "country": "Tunisia"}],
    "source": "mygo-api",
    "cached": true,
    "fetchedAt": "2026-02-09T20:30:00Z"
  }
  ```
- **Headers**:
  - `ETag`: Response version identifier
  - `Cache-Control`: Browser caching directives (e.g., `public, max-age=3600`)
- **Fallback**: Supabase Edge Function `inventory-sync`

#### 2. Supabase Edge Functions
**Purpose**: Secure proxy for authenticated operations and fallback for cities

- **`inventory-sync`**:
  - `action: 'cities'` - Fallback city data (when public API fails)
  - `action: 'hotels'` - Hotels by city
  - `action: 'search'` - Hotel search with availability
  - `action: 'prebook'` - Pre-booking confirmation
  - `action: 'checkout-initiate'` - Credit check and checkout
  - `action: 'booking'` - Complete booking
- **`search-hotels`**: Public search endpoint
- **`create-booking`**: Protected booking creation (requires JWT)
- **`get-confirmation`**: Booking confirmation retrieval

#### 3. MyGO API (Backend)
**Purpose**: Ultimate source of hotel inventory data
**Access**: Via Cloudflare Worker or Supabase Edge Functions only (never direct from frontend)

- ListCity API - City data
- SearchHotels API - Hotel availability
- Booking APIs - Reservation management

#### 4. Supabase Database & Auth
**Purpose**: User accounts, booking records, session management

- **Auth**: Email/password, anonymous sessions
- **Tables**: `profiles`, `bookings`
- **Row-level security**: User isolation

#### 5. ClicToPay (Payment Gateway)
**Purpose**: Secure payment processing
**Integration**: Server-side only

- Payment parameter generation: Backend endpoint only
- Pre-authorization support
- Success/failure redirect URLs

#### 6. Cloudflare (Hosting & CDN)
**Purpose**: Frontend hosting, caching, CDN

- Static site hosting (GitHub Pages)
- API endpoint hosting (Cloudflare Worker)
- DDoS protection via Zero Trust

### Data Flow: City Loading (Option A)

```
Browser → Public API (api.hotel.com.tn/static/cities)
          ↓
        Success → Parse response (items, source, cached, fetchedAt)
 copilot/update-city-loading-api
                  Check ETag/Cache-Control headers

                  Rely on browser HTTP cache (ETag/Cache-Control) and optionally log headers
 main
                  Cache in memory
          ↓
        Failure → Try Supabase Edge Function (inventory-sync, action: cities)
                  ↓
                Success → Cache cities
                  ↓
                Failure → Use static tunisianCities array
```

### Environment Variables

#### Required (Vite format)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_CLIC_TO_PAY_URL=https://www.clictopay.com.tn
VITE_CLIC_TO_PAY_PARAMS_ENDPOINT=https://api.hotel.com.tn/payment/params
VITE_CTP_MERCHANT_ID=AMERICAN-TOURS
VITE_CTP_ACTION_URL=https://test.clictopay.com.tn/payment/rest/register.do
VITE_CTP_RETURN_URL=https://www.hotel.com.tn/payment/success
VITE_CTP_FAIL_URL=https://www.hotel.com.tn/payment/fail
```

#### Not Required
- No env vars needed for public API (`https://api.hotel.com.tn/static/cities`)
- Payment credentials (e.g., `VITE_CTP_PASSWORD`) must NEVER be in frontend

### Security Considerations

1. **Credential Protection**:
   - MyGO API credentials: Server-side only (Supabase/Cloudflare)
   - Payment credentials: Backend only
   - Frontend only has public Supabase anon key

2. **CORS & Public Access**:
   - Public API endpoint has CORS enabled for browser access
   - Supabase Edge Functions handle CORS for protected operations

3. **Rate Limiting**:
   - Cloudflare Worker implements rate limiting
   - Supabase has built-in rate limiting

4. **Data Privacy**:
   - City data: Public (no PII)
   - Booking data: Row-level security in Supabase
   - Payment data: Never stored in frontend

### Third-Party Service Matrix

| Service | Purpose | Access Method | Auth Required | Fallback |
|---------|---------|---------------|---------------|----------|
| Public API (Cloudflare) | City data | Direct HTTPS | No | Supabase EF |
| Supabase Edge Functions | Protected operations | Supabase client | JWT (for bookings) | N/A |
| MyGO API | Hotel inventory | Via proxy only | Server-side only | N/A |
| Supabase Database | User/booking data | Supabase client | JWT | N/A |
| ClicToPay | Payment | Server-side redirect | Merchant credentials | N/A |
| Cloudflare Zero Trust | Security | Automatic | N/A | N/A |

### Caching Strategy

1. **City Data**:
   - **Level 1**: Module-level cache in `useCities` hook (session duration)
   - **Level 2**: Browser cache via `Cache-Control` header (1 hour)
   - **Level 3**: Cloudflare Worker cache (configurable)
   - **Level 4**: Static fallback (`tunisianCities`)

2. **Hotel Search**:
   - No caching (real-time availability)

3. **Static Assets**:
   - Vite build hash in filenames
   - Browser cache with long TTL
