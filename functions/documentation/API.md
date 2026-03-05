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
**Body:** `email`, `password`, `username`, `role_id`, `store_code`, `store_name`

### POST /auth/login
**Body:** `email`, `password`

### POST /auth/verify
**Body:** `token`

---

## Order Routes

### POST /orders/create
**Body:** `delivery_date`, `items` (array of `{product_id, quantity}`), `store_staff_id` (optional), `credits_to_use` (optional), `notes` (optional)

### POST /orders/update-status
**Body:** `order_id`, `order_status_id`

### POST /orders/one
**Body:** `order_id`

### POST /orders/my-orders
**Body:** (none)

### POST /orders/all
**Body:** `order_status_id` (optional)

---

## User Routes

### POST /users/all
**Body:** `userId` (optional)

### POST /users/one
**Body:** `userId`

### PUT /users
**Body:** `userId`, `username`

### DELETE /users/users
**Body:** `userId`

### POST /users/store-info
**Body:** (none)

---

## Product Routes

### POST /products/create
**Body:** `product_name`, `product_description`, `price`, `weight_per_unit`, `shelf_life_days`, `recipe`, `ingredients`

### GET /products/all
**Body:** (none)

### POST /products/one
**Body:** `productId`

### PUT /products/one
**Body:** `productId`, `product_name`, `product_description`, `price`, `shelf_life_days`

### DELETE /products/one
**Body:** `productId`

---

## Cooked QC Routes

### POST /qc/pending
**Body:** (none)

### POST /qc/perform
**Body:** `batch_id`, `qc_result`, `notes` (optional)

### POST /qc/credits
**Body:** `store_staff_id`

### POST /qc/risk-pool
**Body:** `order_id` (optional), `store_staff_id` (optional)

### POST /qc/risk-pool/search
**Body:** `batch_id`, `exclude_store_staff_id` (optional)

### POST /qc/risk-pool/transfer
**Body:** `batch_id`, `from_store_staff_id`, `notes` (optional)

---

## Cooked Batch Routes

### POST /cookedBatch/all
**Body:** `qc_status` (optional), `cook_date` (optional)

### POST /cookedBatch/one
**Body:** `batch_id`

### POST /cookedBatch/by-order
**Body:** `order_id`

### POST /cookedBatch/by-store
**Body:** `store_id`

---

## Raw Batch Routes

### POST /rawBatch/all
**Body:** `qc_status` (optional), `batch_date` (optional)

### POST /rawBatch/one
**Body:** `batch_id`

### POST /rawBatch/consumption
**Body:** `order_id` (optional), `material_id` (optional), `start_date` (optional), `end_date` (optional)

### POST /rawBatch/supplier
**Body:** `supplier_id`

---

## Raw QC Routes

### GET /rawQC/pending
**Body:** (none)

### POST /rawQC/perform
**Body:** `batch_id`, `qc_result`, `notes` (optional)

---

## Inventory Routes

### POST /inventory/store
**Body:** (none)

### POST /inventory/ck
**Body:** (none)

### POST /inventory/store/risk-pool
**Body:** (none)

---

## Dispute Routes

### POST /disputes
**Body:** `order_id`, `items` (array), `reason`

### POST /disputes/order
**Body:** `order_id`

### POST /disputes/all
**Body:** (none)

### POST /disputes/my-disputes
**Body:** (none)

### POST /disputes/resolve
**Body:** `dispute_id`, `resolution_type`, `resolution_notes`
