# CKS System Flow

## Complete Daily Workflow

### Phase 1: Order Collection (Morning - 6:00 PM)
```
┌─────────────┐
│ Store Staff │
│  (Role 4)   │
└──────┬──────┘
       │
       │ Creates order with products
       │ POST /api/order/create
       │ { items: [{ product_id, quantity }] }
       │
       ▼
┌─────────────────┐
│  Order Created  │
│  Status: OR100  │
│    (PENDING)    │
└─────────────────┘
```

### Phase 2: Material Calculation (7:00 PM Sharp - GMT+7)
```
┌──────────────────────┐
│ Scheduled Function   │
│ (Runs at 7 PM daily) │
└──────────┬───────────┘
           │
           │ 1. Get all OR100 orders from TODAY
           │ 2. Calculate materials needed + 10% buffer
           │    Example: 2 orders today
           │    - 3 kg Fried Chicken
           │    - 6 kg Fried Chicken
           │    = Need 9 kg Raw Chicken
           │    + 10% buffer (0.9 kg)
           │    = Total: 9.9 kg
           │
           ▼
┌─────────────────────────┐
│ RawMaterialSupply       │
│ Created                 │
│                         │
│ - material: Raw Chicken │
│ - base: 9 kg            │
│ - buffer: 0.9 kg        │
│ - total: 9.9 kg         │
│ - supplier: Random      │
└─────────────────────────┘
           │
           │ Raw Batches Created (max 5kg each)
           │ 9.9 kg → 2 batches (5kg + 4.9kg)
           │
           ▼
┌─────────────────────────┐
│ Raw Production Batches  │
│                         │
│ - Batch 1: 5.0 kg       │
│ - Batch 2: 4.9 kg       │
│ - qc_status: PENDING    │
│ - supplier: Fresh Farms │
└─────────────────────────┘
           │
           │ Orders remain at OR100
           │ (waiting for QC approval)
           │
           ▼
┌─────────────────┐
│ Orders Still    │
│ Status: OR100   │
│   (PENDING)     │
└─────────────────┘
```

### Phase 3: Raw Material Quality Control (After 7 PM)
```
┌─────────────┐
│  CK Staff   │
│  (Role 1)   │
└──────┬──────┘
       │
       │ GET /api/raw-qc/pending
       │
       ▼
┌─────────────────────────┐
│ Pending QC Batches      │
│                         │
│ - Batch 1: 5.0 kg       │
│ - Batch 2: 4.9 kg       │
│ - Supplier: Fresh Farms │
└──────────┬──────────────┘
           │
           │ Perform QC on each batch
           │ POST /api/raw-qc/perform
           │ { batch_id, qc_result: "PASS" or "FAIL" }
           │
           ├──────────────────────┬────────────────────────────────┐
           │                      │                                │
      ▼ PASS                 ▼ FAIL                                │
┌────────────────┐    ┌──────────────────────────┐                 │
│ 1. Add to CK   │    │ 1. Add to WasteLog       │                 │
│    Inventory   │    │                          │                 │
│                │    │ - material_id            │                 │
│ - material_id  │    │ - quantity: 5.0 kg       │                 │
│ - quantity: 5  │    │ - reason: QC failed      │                 │
│ - status: RAW  │    │ - logged_by              │                 │
│                │    │                          │                 │
│ 2. Update      │    │ 2. Auto-create           │                 │
│    batch QC    │    │    Replacement Batch     │                 │
│    status=PASS │    │                          │                 │
│                │    │ - Different supplier     │                 │
│ 3. Check if    │    │ - Same quantity (5.0 kg) │                 │
│    NO PENDING  │    │ - Status: PENDING        │                 │
│    batches     │    │ - Batch #: *-R (replace) │                 │
│    exist       │    │                          │                 │
│                │    │ 3. Batch QC status=FAIL  │                 │
│ 4. If NO       │    │                          │                 │
│    PENDING:    │    │ Order stays OR100        │                 │
│    Update      │    │ (waiting for all QC)     │                 │
│    Orders      │    │                          │                 │
│    OR100→OR101 │    │                          │                 │
│                │    │                          │                 │
│ If PENDING     │    │                          │                 │
│ exists:        │    │                          │                 │
│    Wait for    │    │                          │                 │
│    other       │    │                          │                 │
│    batches     │    │                          │                 │
└────────────────┘    └──────────────────────────┘                 │
        │                         │                                │
        │                         │ Replacement enters QC queue    │
        │                         ▼                                │
        │              ┌─────────────────────────┐                 │
        │              │ New Batch PENDING       │                 │
        │              │                         │                 │
        │              │ - Different supplier    │                 │
        │              │ - Awaiting QC           │                 │
        │              └─────────────────────────┘                 │
        │                                                          │
        │             Both update raw_batches                   ◄──┘
        │             qc_status: PASS or FAIL
        │             qc_by_user_id: staff_id
        │             qc_date: timestamp
        │
        ▼ (Only when NO PENDING batches exist)
┌─────────────────┐
│ Orders Updated  │
│ Status: OR101   │
│(IN_PRODUCTION)  │
└─────────────────┘
```

**Key Rule Change:** Orders transition OR100→OR101 when there are **NO PENDING** batches for today's orders, not when "all batches PASS". This handles the case where some batches might be failed/replaced and others succeed.

### Phase 4: Cooking & Cooked Batch QC (After Raw QC Approval)
```
┌─────────────┐
│  CK Staff   │
│  (Role 1)   │
└──────┬──────┘
       │
       │ Uses raw materials from CK Inventory
       │ Cooks according to recipes
       │ Creates cooked batches (max 5kg each)
       │
       │ Example: 9 kg Chicken Katsu order
       │ → Batch 1: 5 kg
       │ → Batch 2: 4 kg
       │
       ▼
┌─────────────────────────┐
│ Cooked Batches Created  │
│                         │
│ - product_id            │
│ - quantity: 5 kg        │
│ - qc_status: PENDING    │
│ - store_staff_id        │
└──────────┬──────────────┘
           │
           │ CK Supply performs QC
           │ POST /api/cooked-qc/perform
           │
           ├──────────────┬──────────────────────────┐
           │              │                          │
      ▼ PASS         ▼ FAIL                     ▼ FAIL
┌────────────┐  ┌────────────────┐      ┌──────────────────┐
│ Add to     │  │ Add to Risk    │      │ Add to Waste Log │
│ Store      │  │ Pool           │      │                  │
│ Inventory  │  │                │      │ Manual decision  │
│            │  │ Available for  │      │ by CK Supply     │
│ - product  │  │ manual search  │      │                  │
│ - quantity │  │ and transfer   │      │ product_id       │
│ - store_id │  │                │      │ quantity         │
│            │  │ Other stores   │      │ reason           │
│ Order item │  │ can search     │      │                  │
│ fulfilled  │  │ risk pool:     │      │ Cannot be        │
│            │  │                │      │ recovered        │
│            │  │ POST /api/     │      │                  │
│            │  │ cooked-qc/     │      │                  │
│            │  │ risk-pool/     │      │                  │
│            │  │ search         │      │                  │
│            │  │                │      │                  │
│            │  │ Transfer if    │      │                  │
│            │  │ needed:        │      │                  │
│            │  │                │      │                  │
│            │  │ POST /api/     │      │                  │
│            │  │ cooked-qc/     │      │                  │
│            │  │ risk-pool/     │      │                  │
│            │  │ transfer       │      │                  │
│            │  │                │      │                  │
│            │  │ → Deduct from  │      │                  │
│            │  │   risk pool    │      │                  │
│            │  │ → Add to your  │      │                  │
│            │  │   inventory    │      │                  │
│            │  │ → Issue 1:1    │      │                  │
│            │  │   credits to   │      │                  │
│            │  │   from_store   │      │                  │
└────────────┘  └────────────────┘      └──────────────────┘
       │                  │                        │
       │                  │                        │
       └──────────────────┴────────────────────────┘
                          │
                          │ When all items fulfilled
                          │ POST /api/order/update-status
                          │ { order_id, order_status_id: "OR102" }
                          │
                          ▼
                 ┌─────────────────┐
                 │ Orders Updated  │
                 │ Status: OR102   │
                 │    (STAGED)     │
                 └─────────────────┘
```

**Risk Pool System:**
- Failed batches (FAIL decision by CK Supply) go to risk pool
- Any store can search risk pool: `POST /api/cooked-qc/risk-pool/search`
- Manual transfer required: `POST /api/cooked-qc/risk-pool/transfer`
- Transferring store gets **credits** equal to product value (1:1 ratio)
- Receiving store gets inventory deducted from risk pool

### Phase 5: Dispatch (CK Supply - Role 2)
```
┌─────────────┐
│  CK Supply  │
│  (Role 2)   │
└──────┬──────┘
       │
       │ Early morning dispatch (5 AM)
       │ OR102 → OR103 (DISPATCHED)
       │ POST /api/order/update-status
       │ { order_id, order_status_id: "OR103" }
       │
       ▼
┌─────────────────┐
│ Order Dispatched│
│ Status: OR103   │
│  (DISPATCHED)   │
└─────────────────┘
```

### Phase 6: Delivery Confirmation (Shopee-Style)
```
┌─────────────┐
│ Store Staff │
│  (Role 4)   │
└──────┬──────┘
       │
       │ Receives delivery
       │ Confirms receipt
       │ POST /api/order/update-status
       │ { order_id, order_status_id: "OR104" }
       │
       ▼
┌──────────────────────────────┐
│ Delivery Confirmed (OR104)   │
│                              │
│ 1. Order status → DELIVERED  │
│                              │
│ 2. Items AUTO-ADDED to       │
│    Store Inventory:          │
│                              │
│    For each order item:      │
│    - product_id              │
│    - quantity                │
│    - expiration_date         │
│      (delivery + shelf_life) │
│                              │
│ 3. Store can now use/sell    │
│    products                  │
└──────────────────────────────┘
       │
       │ Store staff has 1 HOUR
       │ to file disputes
       │
       ▼
┌─────────────────┐
│ Final Status    │
│ Status: OR104   │
│   (DELIVERED)   │
└─────────────────┘
```

**Key Feature:** Items are automatically added to store inventory upon delivery confirmation. No separate inventory receipt required.

### Phase 7: Post-Delivery Dispute System (Within 1 Hour)
```
┌─────────────┐
│ Store Staff │
│  (Role 4)   │
└──────┬──────┘
       │
       │ Discovers issue with delivered items
       │ (missing, spoiled, damaged, wrong, qty mismatch)
       │
       │ Within 1 HOUR of delivery confirmation
       │ POST /api/dispute
       │
       ▼
┌──────────────────────────────┐
│ Dispute Filed                │
│                              │
│ - order_id                   │
│ - items: [                   │
│     {                        │
│       product_id,            │
│       disputed_quantity,     │
│       issue_type:            │
│         • MISSING (DISP100)  │
│         • SPOILED (DISP101)  │
│         • DAMAGED (DISP102)  │
│         • WRONG_ITEM(DISP103)│
│         • QUANTITY_MISMATCH  │
│           (DISP104)          │
│     }                        │
│   ]                          │
│ - reason: "explanation"      │
│ - status: PENDING            │
│                              │
│ Validations:                 │
│ ✓ Order must be OR104        │
│ ✓ Within 1-hour window       │
│ ✓ Total disputed qty ≤       │
│   ordered qty (across all    │
│   disputes for same product) │
│ ✓ Valid issue_type           │
└──────────┬───────────────────┘
           │
           │ Manager reviews
           │ POST /api/dispute/resolve
           │
           ├─────────────────┬─────────────────┐
           │                 │                 │
      ▼ APPROVED        ▼ REJECTED       ▼ Can file
┌─────────────────┐  ┌──────────────┐   multiple
│ 1. Deduct from  │  │ No action    │   disputes
│    Store        │  │              │   for same
│    Inventory    │  │ Inventory    │   order
│                 │  │ unchanged    │   (within
│ - product_id    │  │              │   time limit)
│ - quantity      │  │ No credits   │
│   disputed      │  │              │
│                 │  │ Dispute      │
│ 2. Issue        │  │ status:      │
│    Credits      │  │ REJECTED     │
│                 │  └──────────────┘
│ - 1:1 ratio     │
│   (price-based) │
│                 │
│ - Added to      │
│   store_credits │
│                 │
│ 3. Dispute      │
│    status:      │
│    APPROVED     │
└─────────────────┘
```

**Multiple Dispute Handling:**
- Store can file multiple disputes for same order
- System tracks **cumulative disputed quantity** per product
- Example:
  * Order: 10kg Chicken Katsu
  * Dispute 1: 3kg MISSING → Approved
  * Dispute 2: 5kg SPOILED → Allowed (3+5=8 ≤ 10)
  * Dispute 3: 3kg DAMAGED → **REJECTED** (3+5+3=11 > 10)

**Time Window Enforcement:**
- Uses `order_history.created_at` for OR104 transition
- Calculates hours since delivery
- Error if > 1 hour: "Dispute filing window expired"

### Phase 8: Order Cancellation (Optional - Any Time Before OR104)
```
┌──────────────────┐
│ Store Staff (4)  │
│ or Manager (3)   │
│ or Admin (0)     │
└────────┬─────────┘
         │
         │ POST /api/order/update-status
         │ { order_id, order_status_id: "OR105" }
         │
         │ Can cancel at any status before OR104
         │
         ▼
┌─────────────────┐
│ Order Cancelled │
│ Status: OR105   │
│  (CANCELLED)    │
│    - FINAL -    │
└─────────────────┘
```

## Complete Timeline Summary

| Time | Phase | Activity | Status |
|------|-------|----------|--------|
| **6:00 PM** | Order Collection | Cut-off for order submissions | OR100 |
| **7:00 PM** | Material Calc | Raw materials calculated, batches created | OR100 |
| **7:00 PM - Midnight** | Raw QC | CK Staff performs raw material QC | OR100 → OR101 |
| **After OR101** | Cooking | CK Staff cooks products | OR101 |
| **After Cooking** | Cooked QC | CK Supply performs cooked batch QC | OR101 |
| **After QC** | Staging | All items ready, order staged | OR102 |
| **5:00 AM** | Dispatch | CK Supply dispatches to stores | OR103 |
| **Upon Receipt** | Delivery | Store staff confirms, items added to inventory | OR104 |
| **Within 1 Hour** | Disputes | Store can file disputes for issues | OR104 |
| **Optional** | Cancellation | Can cancel before delivery | OR105 |

## Role Responsibilities

| Role | ID | Responsibilities |
|------|----|--------------------|
| **Admin** | 0 | Full system access, resolve disputes, cancel orders |
| **CK Staff** | 1 | Raw material QC, cooking, production management |
| **CK Supply** | 2 | Cooked batch QC, risk pool management, dispatch, delivery updates |
| **Manager** | 3 | Create products/recipes, resolve disputes, view all disputes |
| **Store Staff** | 4 | Create orders, confirm delivery, file disputes, view own disputes |

## Key Business Rules

1. **Raw Material QC:** Orders move OR100→OR101 when **NO PENDING** raw batches exist (not "all PASS")
2. **Cooked Batch QC:** Failed batches can go to Risk Pool or Waste (CK Supply decides)
3. **Delivery Confirmation:** Items automatically added to store inventory with expiration dates
4. **Dispute Window:** Strictly 1 hour from delivery confirmation timestamp
5. **Multiple Disputes:** Allowed but cumulative quantity tracked per product
6. **Credit Ratio:** Always 1:1 based on product unit price
7. **Batch Size:** Max 5kg for both raw and cooked batches
8. **Risk Pool:** Manual search and transfer, credits issued to source store
9. **Order Cancellation:** Allowed at any status before OR104
10. **Inventory Deduction:** Happens on dispute approval, not filing
