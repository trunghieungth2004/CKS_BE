# CKS_BE - Central Kitchen Software Backend

Firebase Cloud Functions backend built with **Layered Architecture** pattern for separation of concerns and maintainability.

## Documentation

- [System Flow](functions/documentation/SYSTEM_FLOW.md) - Complete daily workflow from order creation to delivery
- [Status Codes](functions/documentation/STATUS_CODES.md) - Order, authentication, and authorization status codes
- [Dispute System](functions/documentation/DISPUTE.md) - Post-delivery dispute handling and resolution

## Quick Start

```bash
# Install dependencies
cd functions
npm install

# Initialize database with roles, statuses, and sample data
node -e "require('./utils/initDatabase').initializeDatabase()"

# Start Firebase emulators
firebase emulators:start --only functions
```

**Default Test Users** (password: `password123`):
- admin@cks.com (Admin - Role 0)
- ckstaff@cks.com (CK Staff - Role 1)
- cksupply@cks.com (CK Supply - Role 2)
- manager@cks.com (Manager - Role 3)
- storestaff@store1.com (Store Staff - Role 4)

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

### Layer Responsibilities

**1. Presentation Layer (Controllers + Routes)**
- Receive HTTP requests
- Validate request format (using validators)
- Call appropriate service layer methods
- Format and send HTTP responses
- Handle HTTP-specific errors

**2. Business Logic Layer (Services)**
- Implement business rules
- Validate business constraints
- Transform data according to business needs
- Coordinate between repositories
- Handle business-level errors

**3. Data Access Layer (Repositories)**
- Execute database queries
- Map database results to application objects
- Handle database-specific errors
- Provide abstraction over database operations

## Core Features

### Role-Based Access Control
- **Admin (0)**: Full system access
- **CK Staff (1)**: Kitchen operations, QC, production
- **CK Supply (2)**: Dispatch and delivery
- **Manager (3)**: Product and recipe management
- **Store Staff (4)**: Order creation and tracking

### Order Management
- **6:00 PM cutoff** for daily order submissions
- **6 status flow**: PENDING → IN_PRODUCTION → STAGED → DISPATCHED → DELIVERED/CANCELLED
- **Automated material calculation** at 7:00 PM with 10% buffer
- **5kg batch system** for quality control
- See [System Flow](functions/documentation/SYSTEM_FLOW.md) for complete workflow

### Quality Control System
- Production batches divided into **5kg maximum**
- CK Staff performs QC: PASS → Inventory, FAIL → Waste + Auto-replacement
- Failed batches trigger automatic replacement from different supplier
- Orders proceed only when **all batches pass QC**

### Dispute System
- **1-hour filing window** after delivery confirmation
- **5 dispute types**: MISSING, SPOILED, DAMAGED, WRONG_ITEM, QUANTITY_MISMATCH
- **Multiple dispute tracking** prevents over-disputing
- Resolution: APPROVED (deduct inventory + issue credits) or REJECTED
- See [Dispute System](functions/documentation/DISPUTE.md) for details

## API Response Format

**Success Response:**
```json
{
  "statusCode": 200,
  "status": "OR104",
  "message": "Order delivered successfully",
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "statusCode": 400,
  "status": "ERROR",
  "message": "Error description"
}
```

**Status Field Values:**
- `OR100-OR105` - Order statuses (see [Status Codes](functions/documentation/STATUS_CODES.md))
- `AUTH100-AUTH107` - Authentication statuses
- `AUTHZ100-AUTHZ104` - Authorization statuses
- `SUCCESS/ERROR` - Generic responses

## Database Collections

**Core Collections:**
- `users`, `roles`, `statuses` - User management and system statuses
- `orders`, `order_history`, `order_disputes` - Order lifecycle and disputes
- `products`, `recipes`, `recipe_ingredients` - Product catalog
- `raw_materials`, `raw_material_supplies`, `suppliers` - Materials and suppliers
- `production_batches`, `cooked_batches`, `batch_consumption` - Production batching
- `ck_inventory`, `store_inventory` - Inventory management
- `waste_logs`, `store_credits`, `risk_pool_transfers` - QC and credit system
- `store_staff` - Store staff information

Creates sample roles, statuses, products, materials, suppliers, and test users.

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
