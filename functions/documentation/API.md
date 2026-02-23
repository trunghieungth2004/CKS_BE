# API Documentation

## Authentication

Most endpoints require authentication via Firebase JWT token in the Authorization header:

```
Authorization: Bearer <FIREBASE_TOKEN>
```

Obtain token by calling the `/api/auth/login` endpoint.

## Response Format

All responses follow this structure:

```json
{
  "statusCode": 200,
  "status": "SUCCESS",
  "message": "Operation description",
  "data": { }
}
```

See [Status Codes](STATUS_CODES.md) for complete status code reference.

---

## Authentication Endpoints

### Login
**POST** `/api/auth/login`  
**Authentication:** None (Public)

Login and receive JWT token.

**Request:**
```json
{
  "email": "admin@cks.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "status": "AUTH100",
  "message": "Login successful",
  "data": {
    "user_id": "user123",
    "email": "admin@cks.com",
    "role_id": 0,
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Register User
**POST** `/api/auth/register`  
**Authentication:** Required  
**Roles:** Admin (0)

Create new user account.

**Request:**
```json
{
  "email": "newuser@cks.com",
  "password": "password123",
  "username": "New User",
  "role_id": 4,
  "store_code": "STORE001",
  "store_name": "Downtown Branch"
}
```

### Verify Token
**POST** `/api/auth/verify`  
**Authentication:** None (Public)

Verify JWT token validity.

**Request:**
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## User Management Endpoints

### Get All Users
**POST** `/api/user/all`  
**Authentication:** Required  
**Roles:** Admin (0)

Retrieve all users in the system.

**Request:**
```json
{}
```

### Get One User
**POST** `/api/user/one`  
**Authentication:** Required  
**Roles:** All

Get details of a specific user.

**Request:**
```json
{
  "user_id": "user123"
}
```

### Update User
**PUT** `/api/user`  
**Authentication:** Required  
**Roles:** All

Update user information.

**Request:**
```json
{
  "user_id": "user123",
  "username": "Updated Name",
  "email": "updated@cks.com"
}
```

### Delete User
**DELETE** `/api/user/users`  
**Authentication:** Required  
**Roles:** Admin (0)

Delete a user from the system.

**Request:**
```json
{
  "user_id": "user123"
}
```

---

## Order Management Endpoints

### Create Order
**POST** `/api/order/create`  
**Authentication:** Required  
**Roles:** Store Staff (4)

Create new order. Must be submitted before 6:00 PM daily cutoff.

**Request:**
```json
{
  "delivery_date": "2026-02-25",
  "items": [
    {
      "product_id": "PROD_KATSU_001",
      "quantity": 10
    },
    {
      "product_id": "PROD_BEEF_002",
      "quantity": 5
    }
  ],
  "notes": "Urgent delivery needed"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "status": "OR100",
  "message": "Order created successfully",
  "data": {
    "order_id": "ORD20260223001",
    "order_status_id": "OR100",
    "status_name": "PENDING",
    "delivery_date": "2026-02-25T00:00:00.000Z",
    "items": [...]
  }
}
```

### Get My Orders
**POST** `/api/order/my-orders`  
**Authentication:** Required  
**Roles:** Store Staff (4)

Retrieve all orders for the authenticated store staff.

**Request:**
```json
{}
```

### Get One Order
**POST** `/api/order/one`  
**Authentication:** Required  
**Roles:** All

Get detailed information about a specific order including history.

**Request:**
```json
{
  "order_id": "ORD20260223001"
}
```

### Get All Orders
**POST** `/api/order/all`  
**Authentication:** Required  
**Roles:** Admin (0), CK Staff (1), CK Supply (2)

Retrieve all orders in the system.

**Request:**
```json
{}
```

### Update Order Status
**POST** `/api/order/update-status`  
**Authentication:** Required  
**Roles:** Admin (0), CK Staff (1), CK Supply (2), Store Staff (4)

Update order status. See [System Flow](SYSTEM_FLOW.md) for status transitions.

**Request - OR101 → OR102 (CK Staff):**
```json
{
  "order_id": "ORD20260223001",
  "new_status_id": "OR102",
  "notes": "Cooking completed, ready for staging"
}
```

**Request - OR102 → OR103 (CK Supply):**
```json
{
  "order_id": "ORD20260223001",
  "new_status_id": "OR103",
  "notes": "Dispatched to store"
}
```

**Request - OR103 → OR104 (Store Staff):**
```json
{
  "order_id": "ORD20260223001",
  "new_status_id": "OR104",
  "notes": "Delivery confirmed"
}
```

**Request - Cancel Order:**
```json
{
  "order_id": "ORD20260223001",
  "new_status_id": "OR105",
  "notes": "Cancelled due to store closure"
}
```

---

## Product Management Endpoints

### Create Product
**POST** `/api/product/create`  
**Authentication:** Required  
**Roles:** Manager (3)

Create new product with recipe and ingredients.

**Request:**
```json
{
  "product_name": "Chicken Katsu",
  "description": "Crispy breaded chicken cutlet",
  "unit_price": 250,
  "shelf_life_days": 3,
  "recipe": {
    "instructions": "1. Bread chicken\n2. Deep fry until golden\n3. Slice and serve",
    "ingredients": [
      {
        "material_id": "MAT_CHICKEN_001",
        "quantity_per_unit": 0.15
      },
      {
        "material_id": "MAT_BREADCRUMBS_002",
        "quantity_per_unit": 0.05
      }
    ]
  }
}
```

### Get All Products
**GET** `/api/product/all`  
**Authentication:** Required  
**Roles:** All

Retrieve all products in the catalog.

### Get Product by ID
**GET** `/api/product/:productId`  
**Authentication:** Required  
**Roles:** All

Get detailed product information including recipe and ingredients.

**Example:** `GET /api/product/PROD_KATSU_001`

### Update Product
**PUT** `/api/product/:productId`  
**Authentication:** Required  
**Roles:** Manager (3)

Update product details.

**Request:**
```json
{
  "product_name": "Premium Chicken Katsu",
  "unit_price": 280,
  "description": "Premium grade chicken cutlet",
  "shelf_life_days": 4
}
```

### Delete Product
**DELETE** `/api/product/:productId`  
**Authentication:** Required  
**Roles:** Admin (0), Manager (3)

Remove product from catalog.

**Example:** `DELETE /api/product/PROD_KATSU_001`

---

## Raw Material QC Endpoints

### Get Pending Raw Material Batches
**GET** `/api/raw-qc/pending`  
**Authentication:** Required  
**Roles:** CK Staff (1)

Retrieve all raw material batches awaiting quality control.

**Response:**
```json
{
  "statusCode": 200,
  "status": "SUCCESS",
  "message": "Pending batches retrieved",
  "data": [
    {
      "batch_id": "BATCH001",
      "material_name": "Raw Chicken",
      "quantity": 5,
      "supplier_name": "Fresh Farms Co.",
      "qc_status": "PENDING"
    }
  ]
}
```

### Perform Raw Material QC
**POST** `/api/raw-qc/perform`  
**Authentication:** Required  
**Roles:** CK Staff (1)

Conduct quality control check on raw material batch.

**Request - PASS:**
```json
{
  "batch_id": "BATCH001",
  "qc_status": "PASS",
  "qc_notes": "Quality check passed. Material meets standards."
}
```

**Request - FAIL:**
```json
{
  "batch_id": "BATCH002",
  "qc_status": "FAIL",
  "qc_notes": "Material shows signs of spoilage. Rejecting batch.",
  "waste_reason": "SPOILAGE"
}
```

**Result:**
- **PASS:** Batch added to CK inventory, orders may progress to OR101
- **FAIL:** Batch logged as waste, replacement batch auto-created from different supplier

---

## Raw Batch Management Endpoints

### Get All Raw Batches
**POST** `/api/raw-batch/all`  
**Authentication:** Required  
**Roles:** Admin (0), CK Staff (1), Manager (3)

Retrieve all raw material batches.

**Request:**
```json
{}
```

### Get One Raw Batch
**POST** `/api/raw-batch/one`  
**Authentication:** Required  
**Roles:** Admin (0), CK Staff (1), Manager (3)

Get detailed information about a specific batch.

**Request:**
```json
{
  "batch_id": "BATCH001"
}
```

### Get Batch Consumption
**POST** `/api/raw-batch/consumption`  
**Authentication:** Required  
**Roles:** Admin (0), CK Staff (1), Manager (3)

View consumption records for a batch.

**Request:**
```json
{
  "batch_id": "BATCH001"
}
```

### Get Batches by Supplier
**POST** `/api/raw-batch/supplier`  
**Authentication:** Required  
**Roles:** Admin (0), CK Staff (1), Manager (3)

Retrieve all batches from a specific supplier.

**Request:**
```json
{
  "supplier_id": "SUP001"
}
```

---

## Cooked Batch Management Endpoints

### Get All Cooked Batches
**POST** `/api/cooked-batch/all`  
**Authentication:** Required  
**Roles:** Admin (0), CK Supply (2), Manager (3)

Retrieve all cooked product batches.

**Request:**
```json
{}
```

### Get One Cooked Batch
**POST** `/api/cooked-batch/one`  
**Authentication:** Required  
**Roles:** Admin (0), CK Supply (2), Manager (3)

Get details of a specific cooked batch.

**Request:**
```json
{
  "batch_id": "COOKED_BATCH001"
}
```

### Get Cooked Batches by Order
**POST** `/api/cooked-batch/by-order`  
**Authentication:** Required  
**Roles:** Admin (0), CK Supply (2), Manager (3)

View all cooked batches associated with an order.

**Request:**
```json
{
  "order_id": "ORD20260223001"
}
```

### Get Cooked Batches by Store
**POST** `/api/cooked-batch/by-store`  
**Authentication:** Required  
**Roles:** Admin (0), CK Supply (2), Manager (3)

View cooked batches for a specific store.

**Request:**
```json
{
  "store_staff_id": "SS_001"
}
```

---

## Cooked Product QC & Risk Pool Endpoints

### Get Pending Cooked Product Batches
**POST** `/api/cooked-qc/pending`  
**Authentication:** Required  
**Roles:** CK Supply (2)

Retrieve cooked batches awaiting quality control.

**Request:**
```json
{}
```

### Perform Cooked Product QC
**POST** `/api/cooked-qc/perform`  
**Authentication:** Required  
**Roles:** CK Supply (2)

Conduct quality control on cooked product batch.

**Request - PASS:**
```json
{
  "batch_id": "COOKED_BATCH001",
  "qc_status": "PASS",
  "qc_notes": "Meets quality standards"
}
```

**Request - FAIL (to Risk Pool):**
```json
{
  "batch_id": "COOKED_BATCH002",
  "qc_status": "FAIL",
  "qc_notes": "Slight quality issue - send to risk pool",
  "failure_reason": "MINOR_DEFECT"
}
```

**Result:**
- **PASS:** Batch ready for dispatch
- **FAIL:** Batch sent to risk pool, store receives credits

### Get Store Credits
**POST** `/api/cooked-qc/credits`  
**Authentication:** Required  
**Roles:** Admin (0), Manager (3), Store Staff (4)

View credit balance for a store.

**Request:**
```json
{
  "store_staff_id": "SS_001"
}
```

### Get Risk Pool Transfers
**POST** `/api/cooked-qc/risk-pool`  
**Authentication:** Required  
**Roles:** Admin (0), CK Supply (2), Manager (3)

View all risk pool transfer records.

**Request:**
```json
{}
```

### Search Risk Pool Stores
**POST** `/api/cooked-qc/risk-pool/search`  
**Authentication:** Required  
**Roles:** CK Supply (2)

Find stores with sufficient credits for risk pool transfer.

**Request:**
```json
{
  "product_id": "PROD_KATSU_001",
  "quantity": 5
}
```

**Response:**
```json
{
  "statusCode": 200,
  "status": "SUCCESS",
  "message": "Matching stores found",
  "data": [
    {
      "store_staff_id": "SS_002",
      "store_name": "North Branch",
      "available_credits": 5000
    }
  ]
}
```

### Transfer from Risk Pool
**POST** `/api/cooked-qc/risk-pool/transfer`  
**Authentication:** Required  
**Roles:** CK Supply (2)

Execute risk pool transfer from one store to another.

**Request:**
```json
{
  "from_store_staff_id": "SS_002",
  "to_store_staff_id": "SS_001",
  "product_id": "PROD_KATSU_001",
  "quantity": 3,
  "reason": "Risk pool transfer - quality issue compensation"
}
```

**Result:**
- Credits deducted from source store
- Product transferred to destination store
- Transfer record created

---

## Dispute Endpoints

See [Dispute System](DISPUTE.md) for complete documentation.

### File Dispute
**POST** `/api/dispute`  
**Authentication:** Required  
**Roles:** Store Staff (4)

File dispute for delivered order. Must be within 1 hour of delivery confirmation.

**Request - Single Item:**
```json
{
  "order_id": "ORD20260223001",
  "items": [
    {
      "product_id": "PROD_KATSU_001",
      "disputed_quantity": 3,
      "issue_type": "MISSING"
    }
  ],
  "reason": "3kg Chicken Katsu was missing from the delivery package"
}
```

**Request - Multiple Items:**
```json
{
  "order_id": "ORD20260223002",
  "items": [
    {
      "product_id": "PROD_KATSU_001",
      "disputed_quantity": 2,
      "issue_type": "SPOILED"
    },
    {
      "product_id": "PROD_BEEF_002",
      "disputed_quantity": 1.5,
      "issue_type": "DAMAGED"
    }
  ],
  "reason": "Multiple issues found during delivery inspection"
}
```

**Valid Issue Types:**
- `MISSING` - Item not included in delivery
- `SPOILED` - Item arrived spoiled or contaminated
- `DAMAGED` - Item arrived damaged
- `WRONG_ITEM` - Incorrect item delivered
- `QUANTITY_MISMATCH` - Delivered quantity differs from ordered

### Get My Disputes
**POST** `/api/disputes/my-disputes`  
**Authentication:** Required  
**Roles:** Store Staff (4)

Retrieve all disputes filed by the authenticated store staff.

**Request:**
```json
{}
```

### Get Disputes by Order
**POST** `/api/disputes/order`  
**Authentication:** Required  
**Roles:** Admin (0), Manager (3), Store Staff (4)

View all disputes for a specific order.

**Request:**
```json
{
  "order_id": "ORD20260223001"
}
```

### Get All Disputes
**POST** `/api/disputes/all`  
**Authentication:** Required  
**Roles:** Admin (0), Manager (3)

Retrieve all disputes in the system.

**Request:**
```json
{}
```

### Resolve Dispute
**POST** `/api/dispute/resolve`  
**Authentication:** Required  
**Roles:** Admin (0), Manager (3)

Approve or reject a dispute.

**Request - APPROVED:**
```json
{
  "dispute_id": "DISP_001",
  "resolution_type": "APPROVED",
  "resolution_notes": "Confirmed with delivery driver. Items were missing. Credits issued and inventory adjusted."
}
```

**Request - REJECTED:**
```json
{
  "dispute_id": "DISP_002",
  "resolution_type": "REJECTED",
  "resolution_notes": "CCTV shows complete delivery. No credits issued."
}
```

**Result - APPROVED:**
- Disputed items deducted from store inventory
- Credits issued to store (1:1 price ratio)
- Dispute status changed to APPROVED

**Result - REJECTED:**
- No inventory changes
- No credits issued
- Dispute status changed to REJECTED

---

## Testing Endpoints

### Test Daily Material Calculation
**POST** `/test/daily`  
**Authentication:** None (Public)

Manually trigger daily material calculation (normally runs at 7:00 PM).

**Request:**
```json
{}
```

**Response:**
```json
{
  "message": "Daily material calculation executed successfully",
  "result": {
    "ordersProcessed": 5,
    "materialsCalculated": 3,
    "batchesCreated": 12
  }
}
```

### Health Check
**GET** `/`  
**Authentication:** None (Public)

Basic health check endpoint.

---

## Role Reference

| Role ID | Role Name | Key Responsibilities |
|---------|-----------|---------------------|
| 0 | Admin | Full system access, user management |
| 1 | CK Staff | Kitchen operations, raw material QC, production |
| 2 | CK Supply | Dispatch, delivery, cooked product QC, risk pool |
| 3 | Manager | Product management, recipe creation, dispute resolution |
| 4 | Store Staff | Order creation, delivery confirmation, dispute filing |

## Test Credentials

Use these credentials for testing (password: `password123`):

| Email | Role |
|-------|------|
| admin@cks.com | Admin (0) |
| ckstaff@cks.com | CK Staff (1) |
| cksupply@cks.com | CK Supply (2) |
| manager@cks.com | Manager (3) |
| storestaff@store1.com | Store Staff (4) |

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - validation error |
| 401 | Unauthorized - invalid/missing token |
| 403 | Forbidden - insufficient permissions |
| 404 | Not Found |
| 500 | Server Error |

## Error Response Example

```json
{
  "statusCode": 400,
  "status": "ERROR",
  "message": "Validation error: email is required"
}
```

## Related Documentation

- [System Flow](SYSTEM_FLOW.md) - Complete daily workflow
- [Status Codes](STATUS_CODES.md) - Order and authentication status codes
- [Dispute System](DISPUTE.md) - Detailed dispute handling documentation
