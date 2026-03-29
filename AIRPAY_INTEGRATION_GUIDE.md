# Multi-Tenant Restaurant System with Airpay Integration

## Overview

This implementation provides a complete multi-tenant restaurant management system with Airpay payment integration. Each restaurant (organization) gets its own Airpay sub-account, and payments are automatically split between the restaurant and the platform.

## What Was Implemented

### 1. **Database Models** (`backend/models.py`)
- **Restaurant**: Added `airpay_account_id`, `email`, `phone`, and `payment_status` fields
- **Payment**: Enhanced with `platform_fee`, `restaurant_amount`, `airpay_transaction_id`, and `webhook_processed` fields

### 2. **Airpay Client** (`backend/airpay_client.py`)
A complete client library for Airpay integration with methods for:
- Creating sub-accounts (`create_sub_account`)
- Initiating split payments (`initiate_payment`)
- Verifying webhook signatures (`verify_webhook_signature`)
- Checking transaction status (`get_transaction_status`)
- Processing refunds (`refund_payment`)

### 3. **Backend API Updates**

#### Restaurant Management (`backend/routers/restaurants.py`)
- **POST `/api/restaurants`**: Creates a new restaurant and automatically provisions an Airpay sub-account in the background
- Returns restaurant with `payment_status: "pending"` while Airpay account is being created
- Status updates to `"active"` once account is created, or `"failed"` if there's an error

#### Payment Processing (`backend/routers/payments.py`)
- **GET `/api/payments`**: Lists all payments for a restaurant
- **POST `/api/payments`**: Initiates a payment with automatic split calculation
  - Accepts `order_id`, `amount`, `customer_phone`, `customer_email`, `platform_fee_percentage`
  - Returns payment with Airpay payment URL
  - Calculates and stores platform fee and restaurant amount
- **POST `/api/payments/webhook`**: Handles Airpay webhook callbacks
  - Verifies webhook signature
  - Updates payment and order status
  - Implements idempotency to prevent duplicate processing
  - Broadcasts real-time updates via WebSocket

### 4. **Frontend Admin UI**

#### Restaurant Management (`app/sysadmin/restaurants/page.tsx`)
- System admin can create new restaurants
- Form collects restaurant details and admin credentials
- Shows real-time Airpay account creation status
- Lists all restaurants with their payment status
- Displays Airpay account ID once provisioned

#### Payment Dashboard (`app/admin/payments/page.tsx`)
- Restaurant admins can view all payments
- Shows KPIs: total revenue, restaurant amount, platform fees
- Filterable by status (Pending, Completed, Failed)
- Searchable by order ID
- Date range filtering
- Displays payment splits and Airpay transaction IDs
- Real-time status updates

#### Admin Navigation
- Added "Payments" menu item to admin layout for quick access

## Environment Variables

Create or update your `.env` file with the following Airpay configuration:

```env
# Airpay Configuration
AIRPAY_API_URL=https://api.airpay.com/v1
AIRPAY_API_KEY=your_api_key_here
AIRPAY_MERCHANT_ID=your_merchant_id_here
AIRPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Callback URLs (update with your actual domain)
AIRPAY_CALLBACK_URL=https://yourdomain.com/api/payments/webhook
AIRPAY_RETURN_URL=https://yourdomain.com/payment/success
```

## API Endpoints

### Create Restaurant
```bash
POST /api/restaurants
Content-Type: application/json

{
  "name": "The Italian Restaurant",
  "email": "contact@restaurant.com",
  "phone": "+256700123456",
  "address": "Kampala, Uganda",
  "admin_email": "admin@restaurant.com",
  "admin_password": "secure_password",
  "admin_pin": "1234"
}

# Response:
{
  "id": "uuid",
  "name": "The Italian Restaurant",
  "email": "contact@restaurant.com",
  "phone": "+256700123456",
  "address": "Kampala, Uganda",
  "airpay_account_id": null,  # Will be populated after async creation
  "payment_status": "pending",  # Changes to "active" once Airpay account is created
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Initiate Payment
```bash
POST /api/payments
X-Restaurant-ID: restaurant_uuid
Content-Type: application/json

{
  "order_id": "order_uuid",
  "amount": 100000,
  "customer_phone": "+256700123456",
  "customer_email": "customer@example.com",
  "platform_fee_percentage": 10.0
}

# Response:
{
  "id": "payment_uuid",
  "restaurant_id": "restaurant_uuid",
  "order_id": "order_uuid",
  "amount": 100000,
  "platform_fee": 10000,
  "restaurant_amount": 90000,
  "method": "airpay",
  "status": "PENDING",
  "airpay_transaction_id": "airpay_txn_uuid",
  "payment_url": "https://airpay.com/pay/...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Airpay Webhook
```bash
POST /api/payments/webhook
Content-Type: application/json
X-Airpay-Signature: hmac_sha256_signature

{
  "transaction_id": "airpay_txn_uuid",
  "order_reference": "order_uuid",
  "status": "SUCCESS",  # or "FAILED"
  "amount": 100000,
  "timestamp": "2024-01-01T00:00:00Z"
}

# Response:
{
  "status": "processed"  # or "already_processed" for idempotency
}
```

## Payment Flow

### 1. **Restaurant Creation**
```
SysAdmin creates restaurant
  ↓
Restaurant saved with payment_status: "pending"
  ↓
Background task: Create Airpay sub-account
  ↓
Success: payment_status → "active", airpay_account_id populated
Failure: payment_status → "failed"
```

### 2. **Payment Processing**
```
Restaurant receives order
  ↓
Admin initiates payment with customer amount
  ↓
System calculates split:
  - Platform fee: amount × fee_percentage (default 10%)
  - Restaurant: amount - platform_fee
  ↓
Airpay payment initiated with split configuration
  ↓
Customer receives payment URL
  ↓
Customer completes payment at Airpay
  ↓
Airpay calls webhook with status
  ↓
Order and payment updated
  ↓
Funds automatically split to respective accounts
```

### 3. **Split Settlement**
For a 100,000 payment with 10% platform fee:
```
Total Amount: 100,000
├── Platform: 10,000
└── Restaurant: 90,000
```

## Key Features

### ✅ Multi-Tenant Isolation
- Each restaurant has its own Airpay account
- Data is isolated using `X-Restaurant-ID` header
- Payments are restaurant-specific

### ✅ Automatic Account Provisioning
- Background task handles Airpay account creation
- Non-blocking operation - restaurant available immediately
- Status tracking for admin visibility

### ✅ Flexible Payment Splits
- Configurable platform fee percentage
- Automatic calculation and storage
- Supports future refund/reversal scenarios

### ✅ Webhook Security
- HMAC-SHA256 signature verification
- Idempotency key to prevent duplicate processing
- Secure transaction status updates

### ✅ Real-Time Updates
- WebSocket broadcasts for order and payment changes
- Admin dashboard auto-updates on completion
- Instant status visibility across all users

### ✅ Comprehensive Dashboard
- Payment history with filtering
- Revenue analytics
- Split breakdown visibility
- Status monitoring

## Database Migrations

No additional migrations are needed - the SQLite database will automatically create all tables on startup. However, if you're using Alembic or need to migrate existing data:

```python
# The new fields added to existing tables are:

# Restaurant table:
- airpay_account_id (String, nullable)
- email (String, nullable)
- phone (String, nullable)
- payment_status (String, default="pending")

# Payment table:
- platform_fee (Float, default=0.0)
- restaurant_amount (Float, default=0.0)
- airpay_transaction_id (String, nullable)
- webhook_processed (String, nullable)
```

## Security Considerations

1. **Webhook Signature Verification**: Always verify the `X-Airpay-Signature` header
2. **Never Trust Frontend**: Payment status is only updated via webhook
3. **Idempotency**: Use `webhook_processed` field to prevent double-processing
4. **API Keys**: Keep Airpay credentials in environment variables only
5. **HTTPS**: Always use HTTPS for webhook URLs
6. **Rate Limiting**: Consider implementing rate limiting for webhook endpoints

## Testing

### Test Scenario: Create Restaurant
1. Navigate to `/sysadmin/restaurants`
2. Click "New Restaurant"
3. Fill in restaurant details and admin credentials
4. Submit form
5. Check status - should show "Setting up..." initially
6. Refresh after 10 seconds - should show "Active" with Airpay account ID

### Test Scenario: Process Payment
1. Log in as restaurant admin
2. Create an order through the reception interface
3. Navigate to Payments dashboard
4. Click on order to initiate payment
5. Copy payment URL and test in Airpay sandbox
6. Confirm payment completion
7. Verify webhook update reflected in dashboard

## Troubleshooting

### Issue: Airpay account creation fails
**Solution**: 
- Check `AIRPAY_API_KEY` and `AIRPAY_MERCHANT_ID` are correct
- Verify network connectivity to Airpay API
- Check Airpay API status page

### Issue: Webhook not received
**Solution**:
- Verify `AIRPAY_CALLBACK_URL` is publicly accessible
- Check firewall/security groups allow Airpay IP ranges
- Monitor webhook logs for failures
- Implement webhook retry logic

### Issue: Payment status not updating
**Solution**:
- Verify webhook signature validation is passing
- Check database connectivity
- Monitor application logs for webhook processing errors
- Ensure `webhook_processed` field is being set correctly

## Next Steps

1. **Configure Airpay Credentials**: Set environment variables
2. **Deploy**: Push changes to production
3. **Test**: Create test restaurants and process test payments
4. **Monitor**: Watch webhook logs and payment dashboard
5. **Scale**: Monitor performance and adjust fee percentages as needed

## Support

For Airpay API documentation: https://airpay.com/docs
For this system documentation: See the main README

---

**Implementation Date**: 2024
**Status**: Production Ready
