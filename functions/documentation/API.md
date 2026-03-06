# API Endpoints

## Test Accounts

All test accounts use password: **CKS@12345**

| Email | Role ID | Role Name | Store Code | Description |
|-------|---------|-----------|------------|-------------|
| admin@cks.com | 0 | Admin | - | Administrator account |
| ckstaff@cks.com | 1 | CK Staff | - | Central Kitchen staff |
| cksupply@cks.com | 2 | CK Supply | - | Supply chain manager |
| manager@cks.com | 3 | Manager | - | General manager |
| storestaff@store1.com | 4 | Store Staff | STORE001 | Main Branch Store (empty inventory) |
| storestaff@store2.com | 4 | Store Staff | STORE002 | Secondary Branch Store (100 units/product, risk pool) |

---

## Auth Routes

### POST /auth/register
**Authorization:** Role 0 (Admin)  
**Body:** `email`, `password`, `username`, `role_id`, `store_code`, `store_name`

### POST /auth/login
**Authorization:** None  
**Body:** `email`, `password`

### POST /auth/verify
**Authorization:** None  
**Body:** `token`

---

## Order Routes

### POST /orders/create
**Authorization:** Role 4 (Store Staff)  
**Body:** `delivery_date`, `items` (array of `{product_id, quantity}`), `store_staff_id` (optional), `credits_to_use` (optional), `notes` (optional)

### POST /orders/update-status
**Authorization:** Roles 1, 2, 4 (CK Staff, CK Supply, Store Staff)  
**Body:** `order_id`, `order_status_id`

### POST /orders/one
**Authorization:** Authenticated  
**Body:** `order_id`

### POST /orders/my-orders
**Authorization:** Role 4 (Store Staff)  
**Body:** (none)

### POST /orders/all
**Authorization:** Roles 1, 2, 3 (CK Staff, CK Supply, Manager)  
**Body:** `order_status_id` (optional)

---

## User Routes

### POST /users/all
**Authorization:** Role 0 (Admin)  
**Body:** `userId` (optional)

### POST /users/one
**Authorization:** Authenticated  
**Body:** `userId`

### PUT /users
**Authorization:** Authenticated  
**Body:** `userId`, `username`

### DELETE /users/users
**Authorization:** Role 0 (Admin)  
**Body:** `userId`

### POST /users/store-info
**Authorization:** Role 4 (Store Staff)  
**Body:** (none)

---

## Product Routes

### POST /products/create
**Authorization:** Role 3 (Manager)  
**Body:** `product_name`, `product_description`, `price`, `weight_per_unit`, `shelf_life_days`, `recipe`, `ingredients`

### GET /products/all
**Authorization:** Authenticated  
**Body:** (none)

### POST /products/one
**Authorization:** Authenticated  
**Body:** `productId`

### PUT /products/one
**Authorization:** Role 3 (Manager)  
**Body:** `productId`, `product_name`, `product_description`, `price`, `shelf_life_days`

### DELETE /products/one
**Authorization:** Role 3 (Manager)  
**Body:** `productId`

---

## Raw Material Routes

### GET /raw-material/all
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** (none)

### POST /raw-material/one
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** `material_id`

### POST /raw-material/create
**Authorization:** Role 3 (Manager)  
**Body:** `material_name`, `unit`, `price`, `description` (optional)

### PUT /raw-material/one
**Authorization:** Role 3 (Manager)  
**Body:** `material_id`, `material_name` (optional), `unit` (optional), `price` (optional), `description` (optional)

### DELETE /raw-material/one
**Authorization:** Role 3 (Manager)  
**Body:** `material_id`

---

## Supplier Routes

### GET /supplier/all
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** (none)

### POST /supplier/one
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** `supplier_id`

### POST /supplier/create
**Authorization:** Role 3 (Manager)  
**Body:** `supplier_name`, `phone`, `contact_person` (optional), `email` (optional), `address` (optional)

### PUT /supplier/one
**Authorization:** Role 3 (Manager)  
**Body:** `supplier_id`, `supplier_name` (optional), `contact_person` (optional), `phone` (optional), `email` (optional), `address` (optional)

### DELETE /supplier/one
**Authorization:** Role 3 (Manager)  
**Body:** `supplier_id`

---

## Recipe Routes

### GET /recipe/all
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** (none)

### POST /recipe/one
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** `recipe_id`

### POST /recipe/by-product
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** `product_id`

### POST /recipe/create
**Authorization:** Role 3 (Manager)  
**Body:** `product_id`, `recipe_name`, `instructions` (optional), `ingredients` (array of `{material_id, material_name, quantity_per_unit, unit}`)

### PUT /recipe/one
**Authorization:** Role 3 (Manager)  
**Body:** `recipe_id`, `recipe_name` (optional), `instructions` (optional), `ingredients` (optional array of `{material_id, material_name, quantity_per_unit, unit}`)

### DELETE /recipe/one
**Authorization:** Role 3 (Manager)  
**Body:** `recipe_id`

---

## Cooked QC Routes

### POST /qc/pending
**Authorization:** Role 2 (CK Supply)  
**Body:** (none)

### POST /qc/perform
**Authorization:** Role 2 (CK Supply)  
**Body:** `batch_id`, `qc_result`, `notes` (optional)

### POST /qc/credits
**Authorization:** Role 3 (Manager)  
**Body:** `store_staff_id`

### POST /qc/risk-pool
**Authorization:** Roles 2, 3 (CK Supply, Manager)  
**Body:** `order_id` (optional), `store_staff_id` (optional)

### POST /qc/risk-pool/search
**Authorization:** Role 2 (CK Supply)  
**Body:** `batch_id`, `exclude_store_staff_id` (optional)

### POST /qc/risk-pool/transfer
**Authorization:** Role 2 (CK Supply)  
**Body:** `batch_id`, `from_store_staff_id`, `notes` (optional)

---

## Cooked Batch Routes

### POST /cookedBatch/all
**Authorization:** Roles 2, 3 (CK Supply, Manager)  
**Body:** `qc_status` (optional), `cook_date` (optional)

### POST /cookedBatch/one
**Authorization:** Roles 2, 3 (CK Supply, Manager)  
**Body:** `batch_id`

### POST /cookedBatch/by-order
**Authorization:** Roles 2, 3 (CK Supply, Manager)  
**Body:** `order_id`

### POST /cookedBatch/by-store
**Authorization:** Roles 2, 3 (CK Supply, Manager)  
**Body:** `store_id`

---

## Raw Batch Routes

### POST /rawBatch/all
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** `qc_status` (optional), `batch_date` (optional)

### POST /rawBatch/one
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** `batch_id`

### POST /rawBatch/consumption
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** `order_id` (optional), `material_id` (optional), `start_date` (optional), `end_date` (optional)

### POST /rawBatch/supplier
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** `supplier_id`

---

## Raw QC Routes

### GET /rawQC/pending
**Authorization:** Role 1 (CK Staff)  
**Body:** (none)

### POST /rawQC/perform
**Authorization:** Role 1 (CK Staff)  
**Body:** `batch_id`, `qc_result`, `notes` (optional)

---

## Inventory Routes

### POST /inventory/store
**Authorization:** Role 4 (Store Staff)  
**Body:** (none)

### POST /inventory/ck
**Authorization:** Roles 1, 3 (CK Staff, Manager)  
**Body:** (none)

### POST /inventory/store/risk-pool
**Authorization:** Role 4 (Store Staff)  
**Body:** (none)

---

## Dispute Routes

### POST /disputes
**Authorization:** Role 4 (Store Staff)  
**Body:** `order_id`, `items` (array), `reason`

### POST /disputes/order
**Authorization:** Roles 3, 4 (Manager, Store Staff)  
**Body:** `order_id`

### POST /disputes/all
**Authorization:** Role 3 (Manager)  
**Body:** (none)

### POST /disputes/my-disputes
**Authorization:** Role 4 (Store Staff)  
**Body:** (none)

### POST /disputes/resolve
**Authorization:** Role 3 (Manager)  
**Body:** `dispute_id`, `resolution_type`, `resolution_notes`
