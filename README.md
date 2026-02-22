# CKS_BE - Central Kitchen Software Backend

Firebase Cloud Functions backend built with **Layered Architecture** pattern for separation of concerns and maintainability.

## Quick Links
- 📋 [Status Codes Reference](functions/documentation/STATUS_CODES.md) - Complete status code documentation with final status indicators

## Response Format

After submitting an API request, you'll receive a response. Handle based on HTTP status code:

- **2xx**: Request successful
- **4xx**: Client error (check your request)
- **5xx**: Server error

Additionally, the `status` field contains specific status codes:
- **OR100-OR105**: Order statuses (PENDING to DELIVERED/CANCELLED)
- **AUTH100-AUTH107**: Authentication statuses
- **SUCCESS/ERROR**: Generic responses

## Features

### Order Management System
- **Hierarchical order status flow** with role-based permissions
- **6:00 PM daily cut-off** for order submissions
- **Real-time order tracking** from PENDING to COMPLETED
- **Status code system** for consistent state management

### Role-Based Access Control
- **Admin (0)**: Full system access
- **CK Staff (1)**: Kitchen operations, QC/QA, update orders to STAGED
- **CK Supply (2)**: Dispatch and delivery operations
- **Manager (3)**: Product management, recipe creation
- **Store Staff (4)**: Create and view own orders

### Product & Recipe Management
- **Manager** creates products and recipes
- Each product has a recipe with ingredients
- Ingredients are linked to raw materials
- Automatic material calculation based on orders

### Raw Material Supply Flow
1. **Store Staff** creates orders with products (before 6 PM)
2. **7:00 PM**: Automated function calculates raw materials needed (with 10% buffer)
3. **System** creates RawMaterialSupply records and ProductionBatches
4. **CK Staff** performs QC/QA on production batches
5. **Batch PASS**: Materials added to CK inventory
6. **Batch FAIL**: Materials logged as waste, replacement batch auto-created from different supplier
7. **All batches PASS**: Orders → OR101 (CONFIRMED)

### QC/QA System
- Materials received from suppliers are divided into production batches
- **Max batch size: 5 kg** - larger orders split into multiple batches
- Each batch includes 10% buffer for material loss (cooking, QC, etc.)
- CK Staff can PASS or FAIL each batch independently
- **On FAIL**: System automatically creates replacement batch(es) from different supplier
- Orders only update to OR101 when ALL batches for the day pass QC
- Failed batches automatically logged in WasteLog
- Passed batches added to CK inventory with "RAW" status

**Example**: 9.9 kg raw chicken needed:
- Batch 1: 5 kg (PENDING QC)
- Batch 2: 4.9 kg (PENDING QC)
- Both must PASS for orders to proceed

### Status Management
- **Order Statuses**: 6 states (OR100-OR105) with defined transitions
- **Auth Statuses**: 8 states for authentication flows
- **API Response Codes**: Standardized response status IDs

## Architecture Overview

This project follows a **3-Layer Architecture** pattern:

```
┌─────────────────────────────────────────────┐
│          Client (HTTP Requests)             │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│     Middleware Layer (Auth & Security)      │
│  - authMiddleware: JWT verification         │
│  - roleMiddleware: Role-based access        │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│   Presentation Layer (Controllers/Routes)   │
│  - HTTP request/response handling           │
│  - Input validation (schema validation)     │
│  - Response formatting                      │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│      Business Logic Layer (Services)        │
│  - Business rules enforcement               │
│  - Domain logic                             │
│  - Data transformation                      │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│   Data Access Layer (Repositories)          │
│  - Database operations (CRUD)               │
│  - Query execution                          │
│  - Data mapping                             │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│         Database (Firebase Firestore)       │
└─────────────────────────────────────────────┘
```

## Local Development

```bash
# Install dependencies
cd functions
npm install

# Start Firebase emulators for functions
firebase emulators:start --only functions
```

## Layer Responsibilities

### 1. Presentation Layer (Controllers + Routes)
- Receive HTTP requests
- Validate request format (using validators)
- Call appropriate service layer methods
- Format and send HTTP responses
- Handle HTTP-specific errors

### 2. Business Logic Layer (Services)
- Implement business rules (e.g., age >= 18)
- Validate business constraints (e.g., unique email)
- Transform data according to business needs
- Coordinate between repositories
- Handle business-level errors

### 3. Data Access Layer (Repositories)
- Execute database queries
- Map database results to application objects
- Handle database-specific errors
- Provide abstraction over database operations

## API Documentation

All endpoints follow the standardized request/response format detailed in the "Request/Response Structure" section.

## Request/Response Structure

### Request Format
All requests use `POST`, `PUT`, or `DELETE` methods with data in `req.body`:

```javascript
// Headers
{
  "Authorization": "Bearer <firebase_token>",
  "Content-Type": "application/json"
}

// Body
{
  "userId": "user_id_here",
  "email": "user@example.com",
  "username": "johndoe",
  // ... other fields
}
```

### Response Format
All responses follow this standardized structure with status codes:

**Success Response:**
```json
{
  "statusCode": 200,
  "status": "OR100",
  "message": "Order created successfully",
  "data": {
    "order_id": "abc123",
    "order_status_id": "OR100",
    "status_name": "PENDING"
  }
}
```

**Auth Success Response:**
```json
{
  "statusCode": 200,
  "status": "AUTH100",
  "message": "Login successful",
  "data": {
    "user_id": "user123",
    "token": "eyJhbGc..."
  }
}
```

**Error Response:**
```json
{
  "statusCode": 401,
  "status": "AUTH102",
  "message": "Invalid email or password"
}
```

**Generic Error:**
```json
{
  "statusCode": 400,
  "status": "ERROR",
  "message": "Validation error description"
}
```

## Database Initialization

Initialize system with roles, statuses, and sample data:

```bash
node -e "require('./functions/utils/initDatabase').initializeDatabase()"
```

This creates:
- **5 Roles**: Admin (0), CK Staff (1), CK Supply (2), Manager (3), Store Staff (4)
- **6 Order Statuses**: OR100-OR105 (PENDING through DELIVERED/CANCELLED)
- **8 Auth Statuses**: AUTH100-AUTH107 (authentication states)
- **Sample Products**: Fried Chicken, Pork Adobo with recipes
- **Sample Raw Materials**: Raw Chicken, Raw Pork, Rice
- **Sample Suppliers**: Fresh Farms Co., Premium Meats Inc.
- **Sample Users**:
  - admin@cks.com (Admin - Role 0)
  - ckstaff@cks.com (CK Staff - Role 1)
  - cksupply@cks.com (CK Supply - Role 2)
  - manager@cks.com (Manager - Role 3)
  - storestaff@store1.com (Store Staff - Role 4, Store: Main Branch)
  - All passwords: `password123`
- **CK Inventory**: Initialized for all raw materials (0 quantity)
- **Store Inventory**: Initialized for Main Branch Store (0 quantity)

**Batch Division Example**:
```
Total needed: 12 kg raw chicken (10.9 kg base + 10% buffer = 12 kg)
Divided into batches:
- Batch 1: 5 kg
- Batch 2: 5 kg  
- Batch 3: 2 kg
All 3 batches must pass QC for orders to proceed
```

### Database Collections

| Collection | Purpose | Key Fields |
|---|---|---|
| **users** | User accounts | user_id, email, role_id, username |
| **roles** | Role definitions | role_id (0-4), role_name |
| **statuses** | Status codes | status_id, status_name, category |
| **orders** | Customer orders | order_id, items[], order_status_id |
| **store_staff** | Store staff info | user_id, store_code, store_name |
| **store_inventory** | Store inventory | store_staff_id, material_id, quantity |
| **products** | Product catalog | product_id, product_name |
| **recipes** | Product recipes | recipe_id, product_id, instructions |
| **recipe_ingredients** | Recipe materials | material_id, quantity_per_unit |
| **raw_materials** | Material catalog | material_id, material_name, unit |
| **raw_material_supplies** | Material deliveries | supply_id, base_quantity, buffer_quantity |
| **production_batches** | QC batches | batch_id, supply_id, qc_status, quantity |
| **suppliers** | Supplier info | supplier_id, supplier_name, contact |
| **ck_inventory** | CK inventory | material_id, quantity, status |
| **waste_logs** | Failed QC materials | material_id, quantity, reason, batch_id |
## Order Management & Material Flow

### Daily Flow Overview

### Daily Flow Overview

**Before 6:00 PM** - Order Collection
- Store Staff creates orders with products and quantities
- Orders enter PENDING status (OR100)

**7:00 PM (GMT+7)** - Material Calculation
- Automated function analyzes TODAY's orders only
- Calculates raw material requirements with 10% buffer
- Creates supplier orders divided into 5kg batches
- Orders remain OR100 (awaiting batch QC approval)

**7:00 PM - Midnight** - Quality Control
- CK Staff performs QC on each 5kg production batch
- **PASS**: Batch → CK Inventory
- **FAIL**: Batch → WasteLog, Replacement batch(es) auto-created from different supplier
- **All batches PASS**: Orders → OR101 (CONFIRMED)
- **Any batch FAIL**: Orders stay OR100, replacement batch enters QC queue

**Midnight - 5:00 AM** - Production
- CK Staff cooks using approved materials
- Orders: OR101 → OR102 (PREPARING complete)

**5:00 AM** - Dispatch
- CK Supply dispatches to stores
- Orders: OR102 → OR103 → OR104/OR105 (FINAL)

### Order Status Flow
```
PENDING (OR100) ──[before cutoff]──> IN_PRODUCTION (OR101) → STAGED (OR102) → DISPATCHED (OR103) → DELIVERED (OR104)
   ↓                                                                                   ↓
CANCELLED (OR105)                                                              CANCELLED (OR105)
```

### Role-Based Status Updates
- **CK Staff**: OR101 → OR102 (cooking complete, materials deducted)
- **CK Supply**: OR102 → OR103 (dispatch after all batches pass QC)
- **Store Staff**: OR103 → OR104 (confirm delivery, adds to inventory), OR100/OR103 → OR105 (cancel)
- **Admin**: Can update any status

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Orders
- `POST /api/order/create` - Create order (Store Staff only)
- `POST /api/order/my-orders` - Get my orders
- `POST /api/order/update-status` - Update order status

### Products
- `POST /api/product/create` - Create product with recipe (Manager only)
- `GET /api/product/all` - Get all products
- `GET /api/product/:productId` - Get product details with recipe
- `PUT /api/product/:productId` - Update product (Manager only)
- `DELETE /api/product/:productId` - Delete product (Admin/Manager only)

### Quality Control
- `GET /api/qc/pending` - Get pending QC batches (CK Staff only)
- `POST /api/qc/:batchId/perform` - Perform QC check on batch (CK Staff only)

## Project Structure

```
functions/
├── config/              # Firebase configuration
├── controllers/         # Request handlers (auth, order, product, qc)
├── documentation/       # API documentation
├── middleware/          # Auth and role middleware
├── repositories/        # Database operations (13 collections)
├── routes/              # API routes (auth, order, product, qc)
├── services/            # Business logic (auth, order, material, qc)
├── utils/               # Helper functions & initialization
└── validators/          # Input validation (Joi schemas)
```

## License

MIT
