# Multi-Organization Customer Portal Implementation

## Overview

This implementation enables each restaurant (organization) to have its own branded customer portal accessible via a unique, auto-generated URL. Customers can access the portal directly without entering a restaurant code, and the portal displays organization-specific branding (logo, name, etc).

## Features Implemented

### 1. Restaurant Registration with Auto-Generated Portal URL
- **File**: `app/sysadmin/restaurants/page.tsx`
- **Changes**: Added `logo_url` field to the restaurant creation form
- **Backend**: `backend/routers/restaurants.py` - Updated to accept and store `logo_url`
- **Schema**: `backend/schemas.py` - Added `logo_url` to `RestaurantCreate`

When a SysAdmin creates a new restaurant:
- A unique customer portal URL is automatically generated (e.g., `restaurant-name-abc123`)
- The restaurant logo URL can be specified
- Both are stored in the database and used for portal access

### 2. Portal URL-Based Customer Portal Routing
- **Landing Page**: `app/[portal_url]/page.tsx`
  - Shows restaurant information with logo and address
  - Redirects to auth when customer clicks "Start Ordering"
  - Displays "Restaurant Not Found" if portal URL is invalid

- **Auth Page**: `app/[portal_url]/auth/page.tsx`
  - Portal-specific authentication (login/register)
  - Uses `/api/auth/portal/{portal_url}/login` and `/register` endpoints
  - Stores customer auth and portal URL in localStorage

- **Customer Menu**: `app/[portal_url]/customer/page.tsx`
  - Menu browsing and cart management
  - Order placement with dine-in/delivery/pickup options

- **Order Tracking**: `app/[portal_url]/customer/orders/page.tsx`
  - Real-time order status updates
  - WebSocket integration for live updates

- **Customer Layout**: `app/[portal_url]/customer/layout.tsx`
  - Organization-specific branding in header (logo, restaurant name)
  - Auth-gated access (redirects to auth if not authenticated)

### 3. Organization-Specific Branding
- Restaurant logo displays in:
  - Portal landing page header
  - Auth page (both mobile and desktop)
  - Customer portal header
  - PWA manifest and app icons
- Restaurant name displays throughout the portal
- All pages are scoped to the specific restaurant's organization

### 4. Dynamic PWA Manifest
- **Backend Endpoint**: `backend/routers/restaurants.py` - `/api/restaurants/portal/{portal_url}/manifest.json`
- **Next.js Route Handler**: `app/[portal_url]/manifest.json/route.ts`
- **Portal Layout**: `app/[portal_url]/layout.tsx`

The manifest is dynamically generated per restaurant:
- Uses restaurant's logo as app icon
- Sets start_url to portal's customer page
- Includes restaurant name in app title
- Proper scope and display settings for PWA

### 5. PWA Install Prompt (Hybrid-Web Experience)
- **Hook**: `hooks/use-install-prompt.ts`
- **Component**: `components/pwa-install-prompt.tsx`
- **Integration**: Used in `app/[portal_url]/customer/layout.tsx`

Behavior:
- **Android**: Shows "Install" button when PWA is installable
- **iOS**: Shows instructions to use "Add to Home Screen" from share menu
- Dismissible prompt with "Later" option
- Automatic detection of mobile devices

### 6. Service Worker for Offline Support
- **File**: `public/sw.js`
- **Hook**: `hooks/use-service-worker.ts`

Features:
- Network-first strategy for HTML pages
- Cache-first strategy for static assets
- Graceful fallback for offline access
- Updates cache in background
- Proper cache management with cleanup

## Architecture

### Authentication Flow
```
Customer → visits /{portal_url} 
  ↓
Fetches restaurant config from /api/restaurants/portal/{portal_url}
  ↓
Displays landing page with restaurant branding
  ↓
Clicks "Start Ordering" → redirects to /{portal_url}/auth
  ↓
Login/Register via /api/auth/portal/{portal_url}/login (or /register)
  ↓
Stores auth and portal_url in localStorage
  ↓
Access /{portal_url}/customer with organization context
```

### Multi-Tenancy
- **Restaurant ID**: Used internally in API calls (`X-Restaurant-ID` header)
- **Portal URL**: Public-facing identifier for customer portals
- Each request includes restaurant context via localStorage
- Backend enforces tenant isolation via `verify_restaurant()` dependency

## API Endpoints

### Restaurant Management
- `POST /api/restaurants` - Create new restaurant (admin only)
- `GET /api/restaurants` - List all restaurants (admin only)
- `GET /api/restaurants/{restaurant_id}` - Get restaurant by ID
- `GET /api/restaurants/portal/{portal_url}` - Get restaurant by portal URL
- `GET /api/restaurants/portal/{portal_url}/manifest.json` - Get PWA manifest
- `PATCH /api/restaurants/{restaurant_id}/logo` - Update restaurant logo

### Customer Portal Authentication
- `POST /api/auth/portal/{portal_url}/register` - Customer registration
- `POST /api/auth/portal/{portal_url}/login` - Customer login

## Testing the Implementation

### 1. Create a Test Restaurant
1. Navigate to `/sysadmin/restaurants`
2. Click "New Restaurant"
3. Fill in details:
   - Name: "Test Italian Restaurant"
   - Email: "contact@restaurant.com"
   - Phone: "+256 700 123456"
   - Address: "123 Main St, City"
   - Admin Email: "admin@restaurant.com"
   - Admin Password: "password123"
   - Admin PIN: "1234"
   - Logo URL: `https://via.placeholder.com/200x200.png?text=Logo` (or any image URL)
4. Click "Create Restaurant"
5. Wait for Airpay account to be set up (shows "Active" status)

### 2. Get the Portal URL
- From the restaurants list, note the generated portal URL (shown in navigation)
- Or check the database: `SELECT customer_portal_url FROM restaurants LIMIT 1;`
- Format: `http://localhost:3000/{portal_url}`

### 3. Test the Portal Flow
1. Visit the portal URL (e.g., `http://localhost:3000/test-italian-restaurant`)
2. Verify:
   - Restaurant name and logo display on landing page
   - "Start Ordering" button works
   - Address and contact info show (if provided)

### 4. Test Customer Authentication
1. Click "Start Ordering"
2. Register as a new customer:
   - Name: "John Doe"
   - Email: "customer@example.com"
   - Password: "password123"
   - Phone: "+256 700 000000" (optional)
3. Verify:
   - Portal URL is stored in localStorage as `customer_portal_url`
   - Restaurant ID is stored as `customer_restaurant_id`
   - Auth token is stored as `customer_auth`
4. Test login with another browser/incognito:
   - Use existing customer email and password

### 5. Test Customer Menu and Ordering
1. After login, verify:
   - Restaurant logo and name display in header
   - Menu items load correctly
   - Categories filter works
   - Search functionality works
2. Add items to cart
3. Place an order:
   - Select order type (dine-in, delivery, pickup)
   - Fill required fields
   - Confirm order submission

### 6. Test Order Tracking
1. Navigate to "My Orders"
2. Verify:
   - Current orders display
   - Real-time status updates via WebSocket
   - Order details show items, totals, and timestamps

### 7. Test PWA/Mobile Experience
1. Open the portal on a mobile device (or use Chrome DevTools device emulation)
2. **Android**:
   - Should show "Install" prompt
   - Tap "Install" and app should be added to home screen
   - Manifest from `/{portal_url}/manifest.json` should have correct name/logo
3. **iOS**:
   - Should show "Add to Home Screen" instructions
   - Users can manually add via Safari share menu
4. Test offline access:
   - Go online and browse portal
   - Turn off network (or use DevTools throttling)
   - Previously visited pages should still load from cache

### 8. Test Multiple Portals
1. Create a second restaurant with different details and logo
2. Get its portal URL (different from the first)
3. Visit both portals in different browser tabs
4. Verify:
   - Each portal shows its own branding (different logos, names)
   - Each portal maintains separate customer authentication
   - Switching between portals maintains correct context
   - No cross-portal data leakage

### 9. Test PWA Manifest
1. Visit `/{portal_url}/manifest.json`
2. Verify JSON contains:
   - Correct restaurant `name` and `short_name`
   - Correct `start_url`: `/{portal_url}/customer`
   - Correct `scope`: `/{portal_url}/`
   - Correct `icons` (logo_url if set)
   - Correct `theme_color` and `background_color`

### 10. Test Service Worker
1. Open browser DevTools → Application → Service Workers
2. Verify:
   - Service worker is registered with scope `/`
   - Shows as "activated and running"
3. Go to Application → Cache Storage
4. Verify:
   - `restoflow-customer-portal-v1` cache exists
   - `restoflow-runtime-v1` cache exists
   - Static assets are cached
5. Test offline:
   - Turn off network
   - Navigate to previously visited pages
   - Should load from cache

## Backward Compatibility

The original customer portal routes (`/order`, `/customer`, `/customer/auth`, etc.) still work with restaurant ID:
- `/order` - Entry point for restaurant code
- `/customer/auth?restaurant={restaurantId}` - Auth with restaurant ID
- These routes maintain the original functionality

New portal URL-based routes are available alongside for better UX.

## Security Considerations

1. **Tenant Isolation**: Backend enforces tenant context via `verify_restaurant()` dependency
2. **Portal URL Uniqueness**: Auto-generated portal URLs are guaranteed unique
3. **Auth Validation**: Portal-based auth requires matching portal URL
4. **CORS**: Configured to allow customer portal cross-origin requests
5. **Data Filtering**: API endpoints filter data by restaurant_id to prevent cross-tenant access

## Future Enhancements

1. Custom domain support (map custom domain to portal URL)
2. Portal theme customization (colors, fonts, accent colors)
3. Portal branding templates
4. Analytics and customer insights per portal
5. SMS/Email notifications per portal
6. Integration with restaurant's existing website

## Implementation Files

### Frontend
- `app/[portal_url]/page.tsx` - Portal landing page
- `app/[portal_url]/auth/page.tsx` - Portal authentication
- `app/[portal_url]/layout.tsx` - Portal root layout
- `app/[portal_url]/customer/page.tsx` - Customer menu
- `app/[portal_url]/customer/orders/page.tsx` - Order tracking
- `app/[portal_url]/customer/layout.tsx` - Customer portal layout
- `app/[portal_url]/manifest.json/route.ts` - Dynamic manifest
- `app/sysadmin/restaurants/page.tsx` - Updated with logo field
- `hooks/use-install-prompt.ts` - PWA install detection
- `hooks/use-service-worker.ts` - Service worker registration
- `components/pwa-install-prompt.tsx` - Install prompt component
- `public/sw.js` - Service worker

### Backend
- `backend/routers/restaurants.py` - Updated with manifest endpoint
- `backend/schemas.py` - Updated with logo_url field
- `backend/models.py` - Restaurant model with logo_url
- `backend/routers/auth.py` - Portal-based auth endpoints

## Verification Checklist

- [x] SysAdmin can create restaurant with logo URL
- [x] Portal URL is auto-generated and unique
- [x] Portal landing page shows restaurant branding
- [x] Customer authentication works via portal URL
- [x] Customer portal shows organization-specific branding
- [x] PWA manifest is dynamically generated per restaurant
- [x] Install prompt shows on mobile devices
- [x] Service worker caches and enables offline access
- [x] Multiple portals maintain separate contexts
- [x] Backward compatibility maintained with old routes
