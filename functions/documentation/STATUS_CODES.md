# Status Codes Reference

## General Response Format

All API responses follow this standardized structure:

**Success Response:**
```json
{
  "statusCode": 200,
  "status": "OR100",
  "message": "Order created successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "statusCode": 401,
  "status": "AUTH107",
  "message": "Invalid or expired token"
}
```

### Response Fields
- **statusCode**: HTTP status code (200, 201, 400, 401, 403, 404, 500)
- **status**: Custom status code for specific operations (see categories below)
- **message**: Human-readable description
- **data**: Response data (only present in success responses)

---

## Status Code Categories

### Order Status Codes (OR100-OR199)
- **OR100** - PENDING (Order submitted, awaiting processing)
- **OR101** - IN_PRODUCTION (Order in kitchen production)
- **OR102** - STAGED (Kitchen cooking complete, staged for dispatch)
- **OR103** - DISPATCHED (Order loaded on truck and dispatched to store)
- **OR104** - DELIVERED (Order received and confirmed by store staff, added to inventory - Final)
- **OR105** - CANCELLED (Order cancelled before or after dispatch - Final)

### Authentication Status Codes (AUTH100-AUTH199)
- **AUTH100** - LOGIN_SUCCESS
- **AUTH101** - REGISTER_SUCCESS
- **AUTH102** - INVALID_CREDENTIALS
- **AUTH103** - USER_NOT_FOUND
- **AUTH104** - DUPLICATE_EMAIL
- **AUTH105** - REGISTERED
- **AUTH106** - EMAIL_EXISTS
- **AUTH107** - VERIFIED

### Authorization Status Codes (AUTHZ100-AUTHZ199)
- **AUTHZ100** - AUTHENTICATION_REQUIRED (no token provided)
- **AUTHZ101** - INSUFFICIENT_PERMISSIONS (wrong role for resource)
- **AUTHZ102** - ACCESS_DENIED (general access denied)
- **AUTHZ103** - TOKEN_EXPIRED (authentication token expired)
- **AUTHZ104** - TOKEN_INVALID (invalid authentication token)

### User Management Status Codes (USER100-USER199)
- **USER100** - USER_RETRIEVED
- **USER101** - USER_UPDATED
- **USER102** - USER_DELETED
- **USER103** - USER_NOT_FOUND
- **USER104** - VALIDATION_ERROR

### Product Status Codes (PROD100-PROD199)
- **PROD100** - PRODUCT_CREATED
- **PROD101** - PRODUCT_UPDATED
- **PROD102** - PRODUCT_DELETED
- **PROD103** - PRODUCT_NOT_FOUND
- **PROD104** - PRODUCT_RETRIEVED

### Quality Control Status Codes (QC100-QC199)
- **QC100** - QC_PASSED
- **QC101** - QC_FAILED
- **QC102** - QC_PENDING
- **QC103** - BATCH_NOT_FOUND
- **QC104** - REPLACEMENT_BATCH_CREATED

### Validation Error Codes (VAL100-VAL199)
- **VAL100** - MISSING_REQUIRED_FIELD
- **VAL101** - INVALID_FORMAT
- **VAL102** - INVALID_RANGE
- **VAL103** - INVALID_ENUM_VALUE

### Dispute Type Codes (DISP100-DISP199)
- **DISP100** - MISSING (Item was not included in delivery)
- **DISP101** - SPOILED (Item arrived spoiled or contaminated)
- **DISP102** - DAMAGED (Item arrived damaged or broken)
- **DISP103** - WRONG_ITEM (Wrong item delivered instead of ordered item)
- **DISP104** - QUANTITY_MISMATCH (Delivered quantity does not match ordered quantity)

### Database Error Codes (DB100-DB199)
- **DB100** - DATABASE_ERROR
- **DB101** - DOCUMENT_NOT_FOUND
- **DB102** - DUPLICATE_ENTRY
- **DB103** - UPDATE_FAILED

### System Error Codes (SYS100-SYS199)
- **SYS100** - INTERNAL_SERVER_ERROR
- **SYS101** - CUTOFF_TIME_EXCEEDED
- **SYS102** - SERVICE_UNAVAILABLE

### Security & Rate Limiting Codes (SEC100-SEC199)
- **SEC100** - LOGIN_RATE_LIMIT_EXCEEDED (5 login attempts per 15 minutes)
- **SEC101** - GENERAL_RATE_LIMIT_EXCEEDED (100 requests per 15 minutes)
- **SEC102** - STRICT_RATE_LIMIT_EXCEEDED (10 requests per minute)
- **SEC103** - PAYLOAD_TOO_LARGE (request body exceeds 10MB limit)
- **SEC104** - SUSPICIOUS_ACTIVITY_DETECTED

### Inventory Status Codes (INV100-INV199)
- **INV100** - STORE_STAFF_NOT_FOUND (no store staff record found for user)
- **INV101** - STORE_INVENTORY_RETRIEVED (store inventory retrieved successfully)
- **INV102** - CK_INVENTORY_RETRIEVED (central kitchen inventory retrieved successfully)

