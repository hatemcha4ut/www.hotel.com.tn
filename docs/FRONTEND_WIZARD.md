# Frontend Booking Wizard Documentation

## Overview

This document describes the complete booking wizard flow implemented in `www.hotel.com.tn`, including session management, WhatsApp collection, myGO integration, and payment status handling.

## Architecture

### Router
- **Type**: Hash-based routing (no React Router)
- **Implementation**: `App.tsx` using `useState<Page>` + `window.location.hash`
- **Pages**: HomePage, SearchResultsPage, HotelDetailsPage, BookingPage, ConfirmationPage, LoginPage, RegisterPage, ForgotPasswordPage, UpdatePasswordPage, AdminDashboard, ContactPage, TermsPage, PrivacyPage

### Build Configuration
- **Tool**: Vite 7.x
- **Base Path**: `/`
- **Deploy**: `gh-pages -d dist` (GitHub Pages)
- **Alias**: `@` → `src/`

### Services

#### Security-Compliant Services
Most API calls go through Supabase Edge Functions to prevent credential exposure, with exceptions for public endpoints:

1. **`searchHotels.ts`** - Hotel search via Supabase EF `inventory-sync` (action: `search`)
2. **`inventorySync.ts`** - Core service for all myGO operations:
   - `fetchCities()` - Get available cities from **public API** (`https://api.hotel.com.tn/static/cities`)
     - **Primary**: Direct HTTPS GET to public endpoint (no authentication)
     - **Fallback 1**: Supabase Edge Function `inventory-sync` (action: `cities`)
     - **Fallback 2**: Static `tunisianCities` array
     - Supports ETag/Cache-Control headers for efficient caching
     - Returns format: `{ items: City[], source, cached, fetchedAt }`
   - `fetchHotelsByCity()` - Get hotels in a city
   - `searchInventory()` - Search hotels with availability
   - `prebookRoom()` - Pre-book a room (NEW)
   - `initiateCheckout()` - Initiate checkout with credit check (NEW)
   - `bookInventory()` - Complete booking
3. **`guestBooking.ts`** - Booking creation with anonymous/authenticated sessions
4. **`clicToPayService.ts`** - Payment integration (server-side only)

#### Removed Services (Security Fix)
- ~~`hotelService.ts`~~ - **DELETED** (contained hardcoded myGO credentials)

### Authentication
- **Provider**: Supabase Auth via `AuthContext.tsx`
- **Sessions**:
  - **Guest Mode**: Anonymous sessions via `signInAnonymously()`
  - **Registered Users**: Email/password authentication
  - **Account Creation**: Optional during checkout

## Booking Flow

### 1. Search Phase
**Pages**: HomePage → SearchResultsPage

- User enters:
  - Destination (city or hotel name)
  - Check-in/check-out dates
  - Number of rooms with adults/children
- Calls `searchInventory()` from `inventorySync.ts`
- Results displayed in SearchResultsPage

### 2. Hotel Selection
**Page**: HotelDetailsPage

- Display hotel details, images, amenities
- Show available rooms with:
  - Room types
  - Boarding options (Logement seul, Petit-déjeuner, Demi-pension, Pension complète, All Inclusive)
  - Pricing
  - Cancellation policies
- User selects room(s) and boarding type(s)

### 3. Pre-Booking (NEW - Backend Implementation Required)
**Trigger**: After room selection, before guest details

**Function**: `prebookRoom()` in `inventorySync.ts`

**Request Payload**:
```typescript
{
  action: 'prebook',
  hotelId: string,
  roomId: string,
  searchParams: {
    checkIn: Date,
    checkOut: Date,
    rooms: Array<{ adults: number, children: number[] }>
  },
  selectedBoarding: string,
  supplements?: Array<string>
}
```

**Response**:
```typescript
interface PrebookResponse {
  success: boolean
  confirmedPrice: number
  cancellationPolicy: string
  cancellationDeadline?: string
  notRefundable?: boolean
  error?: string
}
```

**UI Behavior**:
- Success: Display confirmed price and cancellation terms
- Failure: Show error and redirect back to room selection
- Handle "NotRefundable" policies explicitly

### 4. Guest Details
**Page**: BookingPage (Step 1)

**Fields**:
- First Name, Last Name (required)
- Email (required)
- Phone with country code (required)
- Nationality (required)
- **WhatsApp Number (optional)**:
  - Format: E.164 (`/^\+[1-9]\d{1,14}$/`)
  - Example: `+21612345678`
  - Validation error: "Format invalide. Exemple: +21612345678"
  - If provided, requires consent checkbox
- Special Requests (optional)

**WhatsApp Consent**:
- Checkbox: "J'accepte d'être contacté(e) par WhatsApp concernant ma réservation"
- Stored in `GuestDetails.whatsappConsent`
- Only shown if WhatsApp number is provided

**Session Handling**:
Three modes supported:

1. **Guest Mode** (Anonymous):
   - Click "Continuer en tant qu'invité"
   - Calls `signInAnonymously()` from Supabase Auth
   - Booking associated with anonymous session

2. **Login** (Registered Users):
   - Click "Se connecter"
   - Opens `AuthDialog` component
   - After login, guest details pre-filled from user profile

3. **Register** (New Account):
   - Click "Créer un compte"
   - Opens `AuthDialog` in register mode
   - Account created, then proceeds as logged-in user

**Optional Account Creation During Checkout** (Planned - Not Yet Implemented):
- After entering guest details, show "Créer un compte" section
- Email field pre-filled from guest details
- Password + confirm password fields
- On submit: call `signUp()` from AuthContext
- Associate booking with new user_id
- If skipped, continue as guest

### 5. Review
**Page**: BookingPage (Step 2)

- Display:
  - Hotel details
  - Room(s) with selected boarding types
  - Pricing breakdown
  - Guest details
  - Total amount with taxes
- User reviews all information before proceeding

### 6. Checkout Initiate with Credit Check (NEW - Backend Implementation Required)
**Trigger**: After review, before payment

**Function**: `initiateCheckout()` in `inventorySync.ts`

**Request Payload**:
```typescript
{
  action: 'checkout-initiate',
  hotelId: string,
  rooms: Array<Room>,
  searchParams: SearchParams,
  guestDetails: GuestDetails,
  totalAmount: number
}
```

**Response**:
```typescript
interface CheckoutInitiateResponse {
  blocked: boolean
  reason?: string
  formUrl?: string
  preauth?: boolean
  bookingId?: string
  orderId?: string
}
```

**Credit Check Logic**:

1. **STRICT Mode + Insufficient Credit**:
   ```json
   { "blocked": true, "reason": "Crédit insuffisant" }
   ```
   - Show blocking message
   - Display CTA: "Changer dates/hôtel" (navigate back to search)

2. **ON_HOLD_PREAUTH Mode**:
   ```json
   { "blocked": false, "formUrl": "https://...", "preauth": true }
   ```
   - Show "Pré-autorisation en cours" message
   - Redirect to ClicToPay via `formUrl`

3. **Normal Flow**:
   ```json
   { "blocked": false }
   ```
   - Proceed to standard ClicToPay payment

### 7. Payment
**Page**: BookingPage (Step 3) → External ClicToPay

**Integration**: `clicToPayService.ts`

**Environment Variables** (Vite format):
- `VITE_CTP_MERCHANT_ID`
- `VITE_CTP_ACTION_URL`
- `VITE_CTP_RETURN_URL`
- `VITE_CTP_FAIL_URL`
- ~~`VITE_CTP_PASSWORD`~~ - **NEVER expose in frontend** (server-side only)

**Security Note**:
- `generatePaymentParams()` is **deprecated**
- All payment initiation must go through backend `checkout-initiate` endpoint
- Frontend should NEVER have access to payment credentials

**Process**:
1. Call backend to create booking (via `guestBooking.ts`)
2. Backend returns payment URL
3. Redirect user to ClicToPay form
4. After payment, ClicToPay redirects to confirmation page with token

### 8. Confirmation
**Page**: ConfirmationPage

**URL Parameters**:
- `?confirmation_token=<token>` (query string)
- `#/confirmation?confirmation_token=<token>` (hash-based)

**Data Loading**:
- Calls Supabase EF `get-confirmation` with token
- Loads booking data including:
  - Reference number
  - Hotel and room details
  - Guest information
  - Dates and pricing

**Status Display** (NEW):

Two distinct status sections:

#### 1. myGO State
Shows hotel confirmation status:

| State | Icon | Label | Description |
|-------|------|-------|-------------|
| `OnRequest` | ⏰ Yellow | En attente | Réservation en cours de traitement par l'hôtel |
| `Validated` | ✓ Green | Validée | Réservation validée par l'hôtel |
| `Cancelled` | ✗ Red | Annulée | Réservation annulée |

#### 2. Payment Status
Shows payment processing state:

| Status | Icon | Label | Description |
|--------|------|-------|-------------|
| `pending` | ⚠️ Yellow | En attente | Paiement en cours de traitement |
| `preauth` | ⏰ Blue | Pré-autorisation | Pré-autorisation bancaire en cours |
| `captured` | ✓ Green | Confirmé | Paiement confirmé avec succès |
| `reversed` | ↻ Orange | Annulé | Paiement annulé et remboursé |
| `failed` | ✗ Red | Échec | Paiement non traité |

**Polling**:
- Auto-refresh every 30 seconds (optimized for server load)
- Stops when `myGoState` is `Validated` or `Cancelled`
- Updates UI in real-time
- Does not stop on temporary network errors

**Voucher Actions**:
- View voucher (modal)
- Download voucher (HTML file)
- Print voucher
- Add to Apple Wallet (`.pkpass.json`)
- Add to Google Wallet (JSON)

## Type Definitions

### Core Types (`src/types/index.ts`)

```typescript
export interface Hotel {
  id: string
  name: string
  city: string
  address: string
  stars: number
  rating: number
  reviewCount: number
  description: string
  image: string
  images: string[]
  price: number
  amenities: string[]
  boardingType: string[]
  latitude?: number
  longitude?: number
  checkInTime?: string
  checkOutTime?: string
}

export interface Room {
  id: string
  name: string
  bedConfig: string
  maxOccupancy: number
  size: number
  boardingType: string
  boardingOptions?: Array<{
    type: string
    pricePerNight: number
    totalPrice: number
  }>
  amenities: string[]
  cancellationPolicy: string
  cancellationDeadline?: string  // ISO date (NEW)
  pricePerNight: number
  totalPrice: number
  image: string
  selectedBoarding?: string
  roomIndex?: number
}

export interface GuestDetails {
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  nationality: string
  specialRequests?: string
  bookingForOther?: boolean
  guestFirstName?: string
  guestLastName?: string
  guestWhatsAppNumber?: string
  whatsappConsent?: boolean  // NEW
}

export interface Booking {
  id: string
  reference: string
  hotel: Hotel
  room: Room
  checkIn: string
  checkOut: string
  guests: GuestDetails
  totalPrice: number
  status: 'confirmed' | 'pending' | 'cancelled'
  myGoState?: 'OnRequest' | 'Validated' | 'Cancelled'  // NEW
  paymentStatus?: 'preauth' | 'captured' | 'reversed' | 'failed' | 'pending'  // NEW
  createdAt: string
}

export interface PrebookResponse {  // NEW
  success: boolean
  confirmedPrice: number
  cancellationPolicy: string
  cancellationDeadline?: string
  notRefundable?: boolean
  error?: string
}

export interface CheckoutInitiateResponse {  // NEW
  blocked: boolean
  reason?: string
  formUrl?: string
  preauth?: boolean
  bookingId?: string
  orderId?: string
}
```

## Version Management

### Version File
**Location**: `public/version.json` (generated at build time)

**Contents**:
```json
{
  "sha": "6e03bc5",
  "branch": "copilot/implement-booking-wizard",
  "timestamp": "2026-02-08T21:16:31.716Z",
  "buildDate": "08/02/2026",
  "buildTime": "21:16:31"
}
```

**Generation**: Vite plugin in `vite.config.ts`
- Runs at `buildStart` hook
- Executes `git rev-parse --short HEAD` for SHA
- Executes `git rev-parse --abbrev-ref HEAD` for branch
- Captures build timestamp

**Access**:
```typescript
// Fetch version info
const response = await fetch('/version.json')
const version = await response.json()
console.log(`Build: ${version.sha} on ${version.branch}`)
```

### Debug Mode (Planned)
- Enable via URL parameter: `?debug=true`
- Show version info in footer
- Display API call logs in console
- Add performance metrics overlay

## Security Best Practices

### ✅ Implemented
1. ✅ All myGO API calls go through Supabase Edge Functions
2. ✅ No hardcoded credentials in frontend code
3. ✅ Anonymous sessions for guest bookings
4. ✅ WhatsApp E.164 validation with consent
5. ✅ ClicToPay integration via backend only

### ⚠️ Critical Rules
1. **NEVER** expose API credentials in frontend
2. **NEVER** call myGO API directly from browser
3. **ALWAYS** use Supabase Edge Functions for backend operations
4. **ALWAYS** validate user input (email, phone, WhatsApp)
5. **ALWAYS** use HTTPS for production
6. **ALWAYS** sanitize data before displaying

### 🔒 Sensitive Data Handling
- Payment credentials: **Server-side only**
- User passwords: Managed by Supabase Auth (never stored in app)
- Session tokens: Automatically handled by Supabase client
- WhatsApp consent: Explicitly requested and stored

## Environment Variables

### Required (Vite format)
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

### Removed (Legacy CRA format)
```env
# ❌ DEPRECATED - Do not use
REACT_APP_CTP_MERCHANT_ID
REACT_APP_CTP_ACTION_URL
REACT_APP_CTP_RETURN_URL
REACT_APP_CTP_FAIL_URL
REACT_APP_CTP_PASSWORD  # Never expose passwords in frontend!
```

## Testing

### Build
```bash
npm run build
```

### Dev Server
```bash
npm run dev
```

### Deployment
```bash
npm run deploy  # Builds and deploys to GitHub Pages
```

## Future Enhancements

### Planned but Not Yet Implemented
1. **Prebook UI Integration**: Wire up `prebookRoom()` in BookingPage after room selection
2. **Checkout Credit Check UI**: Implement blocking/preauth states in BookingPage
3. **Account Creation During Checkout**: Add optional registration section in BookingPage
4. **Debug Mode**: Add `?debug=true` URL parameter support
5. **Booking History**: User dashboard to view past bookings
6. **Favorites**: Save hotels to favorites list
7. **Multi-language**: Full i18n support (FR, EN, AR)
8. **Offline Mode**: PWA with service worker
9. **Push Notifications**: Booking updates via web push

### Backend Requirements
The following features require backend implementation in Supabase Edge Functions:

1. **Prebook Endpoint**: `inventory-sync` with `action: 'prebook'`
2. **Checkout Initiate Endpoint**: `inventory-sync` with `action: 'checkout-initiate'`
3. **Booking Status Endpoint**: `inventory-sync` with `action: 'booking-status'`
4. **Payment Parameter Generation**: Secure ClicToPay param generation

## Troubleshooting

### Common Issues

**Issue**: "Token de confirmation manquant"
- **Cause**: Missing `confirmation_token` in URL
- **Fix**: Ensure payment redirect includes token parameter

**Issue**: "Impossible de charger la réservation"
- **Cause**: Invalid token or backend error
- **Fix**: Check Supabase Edge Function logs

**Issue**: WhatsApp validation error
- **Cause**: Invalid E.164 format
- **Fix**: Ensure number starts with `+` and country code (e.g., `+21612345678`)

**Issue**: Build fails with "git command not found"
- **Cause**: Git not installed or not in PATH
- **Fix**: Version plugin creates fallback version.json

## Changelog

### 2026-02-08
- ✅ Removed `hotelService.ts` (security fix)
- ✅ Removed hardcoded myGO credentials
- ✅ Added `PrebookResponse` and `CheckoutInitiateResponse` types
- ✅ Added `prebookRoom()` and `initiateCheckout()` functions
- ✅ Added WhatsApp E.164 validation with consent checkbox
- ✅ Replaced `process.env.REACT_APP_*` with `import.meta.env.VITE_*`
- ✅ Added version.json generation via Vite plugin
- ✅ Enhanced ConfirmationPage with myGO and payment status display
- ✅ Added auto-polling for booking status updates
- ✅ Created FRONTEND_WIZARD.md documentation

## Support

For questions or issues:
- **Email**: resamericantours@gmail.com
- **Tel/WhatsApp**: +216 51 613 888
- **GitHub**: https://github.com/hatemcha4ut/www.hotel.com.tn

---

**Last Updated**: February 8, 2026
**Version**: 1.0.0
**Author**: Development Team
