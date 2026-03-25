# CKS Database Schema - Complete Relationship Documentation

This document provides accurate documentation for **ALL 23 FIRESTORE COLLECTIONS** and their relationships in the CKS (Central Kitchen System).

## Files
- **`LD_SWD.drawio`** - Current logical data model (NoSQL with optional SQL-strict constraints notes)
- **`SD_SWD.drawio`** - Current sequence diagram
- **`CD_SWD.drawio`** - Class diagram for full product and recipe route flow (route -> controller -> service -> repository -> entity)

## Class Diagram (CD_SWD)

`CD_SWD.drawio` documents the application-layer class structure in a UML style.

### Scope
- Primary focus: full product and recipe module flow, from routes to entities.
- Layered flow represented: **Route -> Controller -> Service -> Repository -> Entity**.
- Middleware is intentionally omitted from this class view.

### What It Shows
- Concrete classes for product/recipe routes, controllers, services, and repositories.
- Domain entities and their multiplicities (`Product` to `Recipe`, `Recipe` to `RecipeIngredient`).
- Repository-to-entity persistence links.

### Conventions
- Controller names map to service names where possible (for example: `rawBatchController` -> `rawBatchService`).
- Multiplicity labels follow UML cardinality notation (see table below).
- The diagram is architecture-oriented; endpoint-level validation details remain in code.

#### UML Cardinality Notation

| Notation | Meaning | Description |
| --- | --- | --- |
| `1` | Exactly one | A single, required reference. |
| `0..1` | Zero or one | An optional single-valued reference. |
| `*` or `0..*` | Zero or many | An optional many-valued (unlimited) reference. |
| `1..*` | One or many | A required many-valued reference; at least one instance. |
| `n` | Exactly n | A specific number n (where n > 1). |
| `0..n` | Zero to n | A range from zero up to and including n instances. |
| `1..n` | One to n | A range from one up to and including n instances. |
| `X..Y` | Range from X to Y | A specific range of instances. |

### Maintenance Notes
- When introducing a new controller, add a matching service class in code and reflect it in `CD_SWD.drawio`.
- Keep diagram names aligned with real filenames in `functions/controllers/` and `functions/services/`.
- Update this section when the class diagram scope expands beyond product/recipe.

### CD Relationship Notes (Why + Implementation)

The entries below document each relationship shown in `CD_SWD.drawio`, why it exists, and where it is implemented in code.

#### CD-R1: `ProductRoutes` → `ProductController` (Association)
```javascript
// routes/productRoutes.js
router.post('/create', authMiddleware, roleMiddleware([3]), strictLimiter, productController.createProduct);
router.put('/one', authMiddleware, roleMiddleware([3]), strictLimiter, productController.updateProduct);
```
**Why**: The route layer maps HTTP endpoints to product controller handlers.
**Cardinality**: `1..1 -> 1..1`.
**Implemented in**: `functions/routes/productRoutes.js`.

#### CD-R2: `RecipeRoutes` → `RecipeController` (Association)
```javascript
// routes/recipeRoutes.js
router.post('/create', authMiddleware, roleMiddleware([3]), strictLimiter, recipeController.createRecipe);
router.put('/one', authMiddleware, roleMiddleware([3]), strictLimiter, recipeController.updateRecipe);
```
**Why**: The route layer maps HTTP endpoints to recipe controller handlers.
**Cardinality**: `1..1 -> 1..1`.
**Implemented in**: `functions/routes/recipeRoutes.js`.

#### CD-R3: `ProductController` → `ProductService` (Dependency)
```javascript
// controllers/productController.js
const product = await productService.createProduct(payload, req.user.uid);
const updated = await productService.updateProduct(productId, req.body);
```
**Why**: Controller handles request/response and delegates business/data orchestration to service.
**Cardinality**: `1..1 -> 1..1`.
**Implemented in**: `functions/controllers/productController.js` calling `functions/services/productService.js`.

#### CD-R4: `RecipeController` → `RecipeService` (Dependency)
```javascript
// controllers/recipeController.js
const result = await recipeService.createRecipe({ product_id, recipe_name, instructions, ingredients }, req.user.uid);
const result = await recipeService.updateRecipe({ recipe_id, recipe_name, instructions, ingredients });
```
**Why**: Controller remains thin and delegates recipe domain logic to service.
**Cardinality**: `1..1 -> 1..1`.
**Implemented in**: `functions/controllers/recipeController.js` calling `functions/services/recipeService.js`.

#### CD-R5: `ProductService` → `ProductRepository` (Association, 1..1)
```javascript
// services/productService.js
const product = await productRepository.create({...});
return productRepository.update(productId, updateData);
```
**Why**: Product service persists and reads product documents through repository abstraction.
**Cardinality**: `1..1 -> 1..1`.
**Implemented in**: `functions/services/productService.js` and `functions/repositories/productRepository.js`.

#### CD-R6: `ProductService` → `RecipeRepository` (Association, 0..1)
```javascript
// services/productService.js
if (recipe) {
    const recipeDoc = await recipeRepository.create({...});
}
const recipe = await recipeRepository.findByProductId(productId);
```
**Why**: Product creation/retrieval optionally includes recipe linkage.
**Cardinality**: `1..1 -> 0..1`.
**Implemented in**: `functions/services/productService.js` and `functions/repositories/recipeRepository.js`.

#### CD-R7: `ProductService` → `RecipeIngredientRepository` (Association, 0..*)
```javascript
// services/productService.js
if (ingredients && ingredients.length > 0) {
    await recipeIngredientRepository.create({...});
}
```
**Why**: A product-created recipe can include zero or many ingredients.
**Cardinality**: `1..1 -> 0..*`.
**Implemented in**: `functions/services/productService.js` and `functions/repositories/recipeIngredientRepository.js`.

#### CD-R8: `RecipeService` → `ProductRepository` (Association, 1..1)
```javascript
// services/recipeService.js
const product = await productRepository.findById(product_id);
```
**Why**: Recipe creation validates that target product exists.
**Cardinality**: `1..1 -> 1..1`.
**Implemented in**: `functions/services/recipeService.js` and `functions/repositories/productRepository.js`.

#### CD-R9: `RecipeService` → `RecipeRepository` (Association, 1..1)
```javascript
// services/recipeService.js
const recipe = await recipeRepository.create({...});
await recipeRepository.update(recipe_id, updateData);
await recipeRepository.deleteRecipe(recipeId);
```
**Why**: Recipe service manages recipe lifecycle through repository.
**Cardinality**: `1..1 -> 1..1`.
**Implemented in**: `functions/services/recipeService.js` and `functions/repositories/recipeRepository.js`.

#### CD-R10: `RecipeService` → `RecipeIngredientRepository` (Association, 0..*)
```javascript
// services/recipeService.js
const existingIngredients = await recipeIngredientRepository.findByRecipeId(recipe_id);
await recipeIngredientRepository.deleteIngredient(existing.ingredient_id);
await recipeIngredientRepository.create({...});
```
**Why**: Recipe ingredients are managed as a child set of recipe records.
**Cardinality**: `1..1 -> 0..*`.
**Implemented in**: `functions/services/recipeService.js` and `functions/repositories/recipeIngredientRepository.js`.

#### CD-R11: `ProductRepository` → `Product` Entity (Persistence Link)
```javascript
// repositories/productRepository.js
await db.collection('products').add({...});
await db.collection('products').doc(productId).update({...});
```
**Why**: Repository encapsulates CRUD on `products` collection.
**Cardinality**: `1..1 -> 0..*` (one repository manages many entity records).
**Implemented in**: `functions/repositories/productRepository.js`.

#### CD-R12: `RecipeRepository` → `Recipe` Entity (Persistence Link)
```javascript
// repositories/recipeRepository.js
await db.collection('recipes').add({...});
await db.collection('recipes').doc(recipeId).update({...});
```
**Why**: Repository encapsulates CRUD on `recipes` collection.
**Cardinality**: `1..1 -> 0..*` (one repository manages many entity records).
**Implemented in**: `functions/repositories/recipeRepository.js`.

#### CD-R13: `RecipeIngredientRepository` → `RecipeIngredient` Entity (Persistence Link)
```javascript
// repositories/recipeIngredientRepository.js
await db.collection('recipe_ingredients').add({...});
await db.collection('recipe_ingredients').doc(ingredientId).delete();
```
**Why**: Repository encapsulates CRUD on `recipe_ingredients` collection.
**Cardinality**: `1..1 -> 0..*` (one repository manages many entity records).
**Implemented in**: `functions/repositories/recipeIngredientRepository.js`.

#### CD-R14: `Product` ◼→ `Recipe` (Composition, `1` to `0..1`)
```javascript
// services/recipeService.js
const existingRecipe = await recipeRepository.findByProductId(product_id);
if (existingRecipe) return { error: 'Recipe already exists for this product', ... };
```
**Why**: A product may have no recipe or exactly one recipe in this design.
**Cardinality**: `1..1 -> 0..1`.
**Implemented in**: `functions/services/recipeService.js` (enforced at service layer), with lookup in `functions/repositories/recipeRepository.js`.

#### CD-R15: `Recipe` ◼→ `RecipeIngredient` (Composition, `1` to `1..*`)
```javascript
// services/recipeService.js
const existingIngredients = await recipeIngredientRepository.findByRecipeId(recipe_id);
for (const existing of existingIngredients) {
    await recipeIngredientRepository.deleteIngredient(existing.ingredient_id);
}
for (const ingredient of ingredients) {
    await recipeIngredientRepository.create({...});
}
```
**Why**: Ingredients are owned by recipe context and updated as a set.
**Cardinality**: `1..1 -> 1..*`.
**Implemented in**: `functions/services/recipeService.js` and `functions/repositories/recipeIngredientRepository.js`.

### Context Flow: Product -> Recipe -> RecipeIngredient

Use this flow to understand how the three entities connect during normal operations.

1. Product is created first.
`ProductService` writes one `Product` record through `ProductRepository`.

2. Recipe is attached to a product (optional).
`RecipeService` checks product existence (`ProductRepository.findById`) and creates one `Recipe` tied by `product_id`.

3. Recipe ingredients are attached to a recipe.
`RecipeService` writes one or more `RecipeIngredient` records tied by `recipe_id`.

4. Read flow follows parent -> child.
Typical retrieval path is `Product` -> `Recipe` (`findByProductId`) -> `RecipeIngredient[]` (`findByRecipeId`).

5. Update flow keeps composition integrity.
When recipe composition changes, service logic replaces ingredient rows as a set for that recipe.

#### Relationship View (Quick)
- `Product` -> `Recipe`: `1..1 -> 0..1` (a product may have no recipe, or exactly one).
- `Recipe` -> `RecipeIngredient`: `1..1 -> 1..*` (a recipe owns one or more ingredients in this design).
- `Product` -> `RecipeIngredient`: indirect via `Recipe` (no direct FK in the model).

#### Minimal Example (Conceptual)
```text
Product: P100 ("Chicken Soup")
    -> Recipe: R200 (product_id = P100)
             -> RecipeIngredient: RI301 (recipe_id = R200, material_id = M10)
             -> RecipeIngredient: RI302 (recipe_id = R200, material_id = M11)
```

### Route Context Flow: Product and Recipe Modules

This view explains the request path for the two route modules represented in `CD_SWD.drawio`.

#### A) Product Create/Update Route Flow

```text
POST /products/create or PUT /products/one
    -> ProductRoutes
    -> ProductController
    -> ProductService
    -> ProductRepository (always)
    -> RecipeRepository (optional, when recipe payload exists)
    -> RecipeIngredientRepository (optional, when ingredients exist)
    -> Entity writes: Product (+ optional Recipe + optional RecipeIngredient[])
```

Relationship mapping in CD:
- `ProductRoutes -> ProductController` (CD-R1)
- `ProductController -> ProductService` (CD-R3)
- `ProductService -> ProductRepository` (CD-R5)
- `ProductService -> RecipeRepository` (CD-R6)
- `ProductService -> RecipeIngredientRepository` (CD-R7)

#### B) Recipe Create/Update Route Flow

```text
POST /recipes/create or PUT /recipes/one
    -> RecipeRoutes
    -> RecipeController
    -> RecipeService
    -> ProductRepository (validate target product)
    -> RecipeRepository (create/update recipe)
    -> RecipeIngredientRepository (create/replace recipe ingredients)
    -> Entity writes: Recipe + RecipeIngredient[]
```

Relationship mapping in CD:
- `RecipeRoutes -> RecipeController` (CD-R2)
- `RecipeController -> RecipeService` (CD-R4)
- `RecipeService -> ProductRepository` (CD-R8)
- `RecipeService -> RecipeRepository` (CD-R9)
- `RecipeService -> RecipeIngredientRepository` (CD-R10)

#### Why this matters
- It shows that route/controller classes orchestrate direction, while entity ownership remains `Product -> Recipe -> RecipeIngredient`.
- It explains why both product and recipe modules can touch recipe ingredient persistence, but with different business intent.

## How to Open
- VS Code: `code --install-extension hediet.vscode-drawio`
- Online: https://app.diagrams.net/
- Desktop: `sudo pacman -S drawio-desktop`

## Database Overview

**Total Collections: 23**

**Key Characteristics:**
- NoSQL embedded arrays: `items[]`, `failed_items[]`, `next_statuses[]`
- Simplified credit system: No status field, uses `amount - used_amount = remaining_amount`
- Batch traceability: `replaced` (boolean) + `source` (transfer_id or empty string)
- Single product per batch: Cooked batches contain only one product type (max 5kg)

## Complete Relationship Catalog

### 1. USER MANAGEMENT (5 relationships)

#### R1: `users` → `roles` (Many-to-One)
```javascript
// userRepository.js
const create = async (userData) => {
    await db.collection('users').add({
        role_id: userData.role_id  // FK to roles
    });
};
```
**Why**: Multiple users share same role, each user has exactly one role.

#### R2: `users` → `store_staff` (One-to-Zero-or-One)
```javascript
// storeStaffRepository.js
const findByUserId = async (userId) => {
    const snapshot = await db.collection('store_staff')
        .where('user_id', '==', userId).get();  // FK to users
    return snapshot.empty ? null : snapshot.docs[0];
};
```
**Why**: Only role_id=4 (store_staff) users have store_staff records.

#### R3: `users` → `products` (One-to-Many) via `created_by`
```javascript
// productRepository.js
const create = async (productData) => {
    await db.collection('products').add({
        created_by: productData.created_by  // FK to users
    });
};
```
**Why**: Track who created each product for audit.

#### R4: `users` → `recipes` (One-to-Many) via `created_by`
```javascript
// recipeRepository.js
const create = async (recipeData) => {
    await db.collection('recipes').add({
        created_by: recipeData.created_by  // FK to users
    });
};
```
**Why**: Track who created each recipe for audit.

#### R5: `users` → `production_batches` (One-to-Many) via `qc_by`
```javascript
// services/rawQCService.js
const performRawQC = async (batchId, qcResult, qcByUserId) => {
    await productionBatchRepository.update(batchId, {
        qc_by: qcByUserId,  // FK to users
        qc_status: qcResult,
        qc_date: admin.firestore.FieldValue.serverTimestamp()
    });
};
```
**Why**: QC accountability - track who performed raw material QC.

### 2. ORDER MANAGEMENT (7 relationships)

#### R6: `store_staff` → `orders` (One-to-Many)
```javascript
// orderRepository.js
const create = async (orderData) => {
    await db.collection('orders').add({
        store_staff_id: orderData.store_staff_id  // FK to store_staff
    });
};
```
**Why**: Each store staff can create multiple orders.

#### R7: `orders` → `statuses` (Many-to-One) via `order_status_id`
```javascript
// orderService.js
const updateOrderStatus = async (orderId, newStatusId) => {
    await orderRepository.update(orderId, {
        order_status_id: newStatusId  // FK to statuses
    });
};
```
**Why**: Multiple orders can have same status.

#### R8: `orders` → `items[]` (Embedded Array - NoSQL)
```javascript
// services/orderService.js
const createOrder = async (orderData) => {
    const order = {
        store_staff_id: orderData.store_staff_id,
        items: orderData.items.map(item => ({
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: item.quantity,
            weight_per_unit: item.weight_per_unit,
            total_weight: item.total_weight
        })),
        subtotal: orderData.subtotal
    };
    await orderRepository.create(order);
};
```
**Why**: NoSQL optimization - order items embedded directly, no separate `order_items` table.

#### R9: `orders` → `order_history` (One-to-Many)

```javascript
// orderHistoryRepository.js
const create = async (historyData) => {
    await db.collection('order_history').add({
        order_id: historyData.order_id
    });
};
```
**Why**: Each order has multiple status change records.

#### R10: `order_history` → `users` (Many-to-One) via `changed_by_user_id`
```javascript
// orderService.js
await orderHistoryRepository.create({
    changed_by_user_id: userId
});
```
**Why**: Track who made each status change.

#### R11: `order_history` → `roles` (Many-to-One) via `changed_by_role_id`
```javascript
// orderService.js
await orderHistoryRepository.create({
    changed_by_role_id: user.role_id
});
```
**Why**: Track role-based permissions for status changes.

#### R12: `order_history` → `statuses` (Many-to-Two) via `from_status_id` and `to_status_id`
```javascript
// orderHistoryRepository.js
const create = async (historyData) => {
    await db.collection('order_history').add({
        from_status_id: historyData.from_status_id,
        to_status_id: historyData.to_status_id
    });
};
```
**Why**: Track status transitions for audit trail (from and to statuses).

### 3. PRODUCT & RECIPE MANAGEMENT (5 relationships)

#### R13: `users` → `recipes` via `created_by` (already documented as R4 - duplicate removed)

#### R14: `products` → `recipes` (One-to-Zero-or-One)
```javascript
// recipeRepository.js
const findByProductId = async (productId) => {
    const snapshot = await db.collection('recipes')
        .where('product_id', '==', productId).get();
    return snapshot.empty ? null : snapshot.docs[0];
};
```
**Why**: Each product can have one recipe, not all products need recipes.

#### R15: `recipes` → `recipe_ingredients` (One-to-Many)
```javascript
// services/recipeService.js
const createRecipe = async (recipeData) => {
    // Create recipe first
    const recipe = await recipeRepository.create({
        product_id: recipeData.product_id,
        recipe_name: recipeData.recipe_name,
        instructions: recipeData.instructions,
        created_by: recipeData.created_by
    });
    
    // Create ingredients linking to this recipe
    for (const ingredient of recipeData.ingredients) {
        await recipeIngredientRepository.create({
            recipe_id: recipe.id,  // FK to recipes
            material_id: ingredient.material_id,
            material_name: ingredient.material_name,
            quantity_per_unit: ingredient.quantity_per_unit,
            unit: ingredient.unit
        });
    }
};
```
**Why**: Each recipe contains multiple ingredients (bill of materials).
**Implemented in**: `functions/services/recipeService.js` (controller delegates).

#### R16: `recipe_ingredients` → `raw_materials` (Many-to-One)
```javascript
// recipeIngredientRepository.js
const create = async (ingredientData) => {
    await db.collection('recipe_ingredients').add({
        material_id: ingredientData.material_id  // FK to raw_materials
    });
};
```
**Why**: Multiple recipes can use same raw material.

#### R17: `raw_materials` → `ck_inventory` (One-to-Many)
```javascript
// ckInventoryRepository.js
const findByMaterialId = async (materialId) => {
    const snapshot = await db.collection('ck_inventory')
        .where('material_id', '==', materialId).get();  // FK to raw_materials
};
```
**Why**: CK inventory tracks quantities of raw materials.

### 4. SUPPLY CHAIN MANAGEMENT (5 relationships)

#### R18: `suppliers` → `raw_material_supplies` (One-to-Many)
```javascript
// rawMaterialSupplyRepository.js
const create = async (supplyData) => {
    await db.collection('raw_material_supplies').add({
        supplier_id: supplyData.supplier_id  // FK to suppliers
    });
};
```
**Why**: Each supplier can provide multiple material supplies.

#### R19: `raw_materials` → `raw_material_supplies` (One-to-Many)
```javascript
// rawMaterialSupplyRepository.js
const create = async (supplyData) => {
    await db.collection('raw_material_supplies').add({
        material_id: supplyData.material_id
    });
};
```
**Why**: Same material can be supplied by different suppliers.

#### R20: `raw_material_supplies` → `production_batches` (One-to-Many)
```javascript
// services/materialService.js
const createMaterialSupplyOrders = async (materialsNeeded, supplyDate) => {
    for (const materialId in materialsNeeded) {
        const material = materialsNeeded[materialId];
        
        // Create supply order
        const supplyId = await rawMaterialSupplyRepository.create({
            material_id: materialId,
            supplier_id: material.supplier_id,
            base_quantity: material.quantity,
            buffer_quantity: material.buffer,
            total_quantity: material.total
        });
        
        // Split into 5kg batches for QC
        const batchCount = Math.ceil(material.total / 5);
        for (let i = 0; i < batchCount; i++) {
            await productionBatchRepository.create({
                supply_id: supplyId,
                material_id: materialId,
                supplier_id: material.supplier_id,
                batch_number: `${supplyDate}-${materialId}-${i + 1}`,
                quantity: Math.min(5, material.total - (i * 5)),
                batch_date: supplyDate,
                qc_status: 'PENDING'
            });
        }
    }
};
```
**Why**: Each supply order divided into 5kg max batches for quality control.

#### R21: `production_batches` → `raw_materials` (Many-to-One)
```javascript
// repositories/productionBatchRepository.js
const create = async (batchData) => {
    const batchRef = await db.collection('production_batches').add({
        supply_id: batchData.supply_id,
        material_id: batchData.material_id,
        material_name: batchData.material_name,
        batch_number: batchData.batch_number,
        quantity: batchData.quantity,
        unit: batchData.unit,
        batch_date: batchData.batch_date,
        qc_status: batchData.qc_status || 'PENDING'
    });
    return batchRef.id;
};
```
**Why**: Multiple batches can contain same material (e.g., 10 batches of chicken from one supply order).

#### R22: `production_batches` → `suppliers` (Many-to-One)
```javascript
// repositories/productionBatchRepository.js
const create = async (batchData) => {
    await db.collection('production_batches').add({
        supply_id: batchData.supply_id,
        material_id: batchData.material_id,
        supplier_id: batchData.supplier_id,
        supplier_name: batchData.supplier_name
    });
};
```
**Why**: Multiple batches can come from same supplier (traceability for quality issues).

### 5. PRODUCTION & QC SYSTEM (4 relationships)

#### R23: `orders` → `cooked_batches` (One-to-Many)
```javascript
// services/orderService.js - createCookedBatches
const createCookedBatches = async (order) => {
    // Group items by product_id
    const itemsByProduct = {};
    order.items.forEach(item => {
        if (!itemsByProduct[item.product_id]) {
            itemsByProduct[item.product_id] = [];
        }
        itemsByProduct[item.product_id].push(item);
    });
    
    // Create separate batches per product (max 5kg each)
    for (const productId in itemsByProduct) {
        const productItems = itemsByProduct[productId];
        const totalWeight = productItems.reduce((sum, item) => sum + item.total_weight, 0);
        const batchCount = Math.ceil(totalWeight / 5);
        
        for (let i = 0; i < batchCount; i++) {
            await cookedBatchRepository.create({
                order_id: order.order_id,
                store_id: order.store_staff_id,
                batch_number: i + 1,
                total_batches: batchCount,
                items: productItems,
                qc_status: 'PENDING',
                replaced: false,
                source: ''
            });
        }
    }
};
```
**Why**: Each order split into multiple batches (max 5kg, one product per batch) for QC.

#### R24: `cooked_batches` → `items[]` (Embedded Array - NoSQL)
```javascript
// services/orderService.js
const createCookedBatches = async (order) => {
    // Each batch contains items[] array with single product
    await cookedBatchRepository.create({
        order_id: order.order_id,
        items: productItems,  // [{product_id, product_name, quantity, weight_per_unit, total_weight}]
        qc_status: 'PENDING'
    });
};
```
**Why**: NoSQL optimization - batch items embedded directly, `items[0].product_id` used for risk pool searches.
**Constraint**: All items in a batch must be same product_id (enforced by batch creation logic).

#### R25: `cooked_batches` → `store_staff` (Many-to-One) via `store_id`
```javascript
// repositories/cookedBatchRepository.js
const create = async (batchData) => {
    await db.collection('cooked_batches').add({
        order_id: batchData.order_id,
        store_id: batchData.store_id,  // FK to store_staff (destination)
        items: batchData.items,
        qc_status: 'PENDING'
    });
};
```
**Why**: Multiple batches destined for same store (batch reassignment for fulfillment).

#### R26: `cooked_batches` → `product_qc` (One-to-Zero-or-One)
```javascript
// repositories/cookedQCRepository.js
const findByBatchId = async (batchId) => {
    const snapshot = await db.collection('product_qc')
        .where('batch_id', '==', batchId).get();  // FK to cooked_batches
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

// services/cookedQCService.js
const performProductQC = async (batchId, qcResult, qcBy) => {
    // Create QC record
    await cookedQCRepository.create({
        batch_id: batchId,  // FK to cooked_batches
        order_id: batch.order_id,
        qc_status: qcResult,
        qc_by: qcBy,
        qc_date: admin.firestore.FieldValue.serverTimestamp(),
        notes: qcResult === 'FAIL' ? 'Failed QC inspection' : 'Passed QC inspection',
        failed_items: qcResult === 'FAIL' ? batch.items : []
    });
    
    // Update batch status
    await cookedBatchRepository.update(batchId, { qc_status: qcResult });
};
```
**Why**: QC performed on cooked batches creates separate QC record (zero-or-one because QC is optional/pending).

**Note**: `failed_items` stored in product_qc only, not duplicated in cooked_batches.

### 6. INVENTORY MANAGEMENT (4 relationships)

#### R27: `store_staff` → `store_inventory` (One-to-Many)
```javascript
// storeInventoryRepository.js
const findByStoreStaff = async (storeStaffId) => {
    const snapshot = await db.collection('store_inventory')
        .where('store_staff_id', '==', storeStaffId).get();
};
```
**Why**: Each store has its own inventory.

#### R28: `products` → `store_inventory` (One-to-Many)
```javascript
// storeInventoryRepository.js
const create = async (inventoryData) => {
    await db.collection('store_inventory').add({
        product_id: inventoryData.product_id
    });
};
```
**Why**: A store can hold many different products, and the same product can appear in inventories of many stores.

**SQL strict note**: With `UNIQUE(store_staff_id, product_id)`, each store has at most one inventory row per product while still holding many products.

#### R29: `orders` → `batch_consumption` (One-to-Many)
```javascript
// repositories/batchConsumptionRepository.js
const create = async (consumptionData) => {
    await db.collection('batch_consumption').add({
        order_id: consumptionData.order_id,  // FK to orders
        material_id: consumptionData.material_id,
        material_name: consumptionData.material_name,
        quantity: consumptionData.quantity,
        unit: consumptionData.unit,
        batch_id: consumptionData.batch_id,
        consumed_at: admin.firestore.FieldValue.serverTimestamp()
    });
};
```
**Why**: Track which raw materials consumed for each order production (audit trail).

#### R30: `raw_materials` → `batch_consumption` (Many-to-One)
```javascript
// repositories/batchConsumptionRepository.js
const create = async (consumptionData) => {
    await db.collection('batch_consumption').add({
        material_id: consumptionData.material_id,
        quantity: consumptionData.quantity
    });
};
```
**Why**: Track consumption of specific materials.

### 7. RISK POOL SYSTEM (5 relationships)

#### R31: `cooked_batches` → `risk_pool_transfers` (One-to-Many)
```javascript
// services/cookedQCService.js - transferFromRiskPool
const transferFromRiskPool = async (batchId, fromStoreStaffId, transferredBy) => {
    const failedBatch = await cookedBatchRepository.findById(batchId);
    const product = failedBatch.items[0];  // Single product per batch
    
    // Create transfer record
    const transferId = await riskPoolTransferRepository.create({
        batch_id: batchId,  // FK to failed cooked_batches
        order_id: failedBatch.order_id,
        product_id: product.product_id,
        quantity: product.quantity,
        from_store_staff_id: fromStoreStaffId,
        credit_awarded: product.quantity * productPrice,
        transferred_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Mark original batch as REPLACED
    await cookedBatchRepository.update(batchId, { qc_status: 'REPLACED' });
    
    // Create new replacement batch with traceability
    await cookedBatchRepository.create({
        order_id: failedBatch.order_id,
        store_id: failedBatch.store_id,
        items: failedBatch.items,
        qc_status: 'PENDING',
        replaced: true,  // Traceability flag
        source: transferId  // Link to transfer record
    });
};
```
**Why**: Failed batches generate transfer records, one transfer per failed batch.

#### R32: `store_staff` → `risk_pool_transfers` (One-to-Many) via `from_store_staff_id`
```javascript
// repositories/riskPoolTransferRepository.js
const create = async (transferData) => {
    await db.collection('risk_pool_transfers').add({
        from_store_staff_id: transferData.from_store_staff_id  // FK to store_staff
    });
};
```
**Why**: Track which store donated inventory to risk pool (for credit calculation).

#### R33: `risk_pool_transfers` → `orders` (Many-to-One) via `order_id`
```javascript
// services/cookedQCService.js
const transferFromRiskPool = async (batchId, fromStoreStaffId) => {
    const failedBatch = await cookedBatchRepository.findById(batchId);
    await riskPoolTransferRepository.create({
        batch_id: batchId,
        order_id: failedBatch.order_id
    });
};
```
**Why**: Track which order receives transferred inventory (multiple transfers can go to same order).

#### R34: `risk_pool_transfers` → `products` (Many-to-One) via `product_id`
```javascript
// services/cookedQCService.js
const transferFromRiskPool = async (batchId, fromStoreStaffId) => {
    const failedBatch = await cookedBatchRepository.findById(batchId);
    const product = failedBatch.items[0];
    
    await riskPoolTransferRepository.create({
        product_id: product.product_id,
        quantity: product.quantity
    });
};
```
**Why**: Track which product was transferred (for inventory and credit calculations).

#### R35: `risk_pool_transfers` → `store_credits` (One-to-One) via `source`
```javascript
// services/cookedQCService.js
const transferFromRiskPool = async (batchId, fromStoreStaffId) => {
    const transferId = await riskPoolTransferRepository.create({ /* ... */ });
    
    await storeCreditRepository.create({
        store_staff_id: fromStoreStaffId,
        amount: creditAmount,
        used_amount: 0,
        remaining_amount: creditAmount,
        source: 'RISK_POOL',
        batch_id: batchId,
        product_id: product.product_id
    });
};
```
**Why**: Each transfer generates exactly one credit for the donor store.

### 8. DISPUTE SYSTEM (3 relationships)

#### R36: `orders` → `order_disputes` (One-to-Many)
```javascript
// repositories/disputeRepository.js
const create = async (disputeData) => {
    await db.collection('order_disputes').add({
        order_id: disputeData.order_id
    });
};
```
**Why**: Orders can have multiple disputes within 1-hour window.

#### R37: `store_staff` → `order_disputes` (One-to-Many)
```javascript
// repositories/disputeRepository.js
const create = async (disputeData) => {
    await db.collection('order_disputes').add({
        order_id: disputeData.order_id,
        store_staff_id: disputeData.store_staff_id,
        items: disputeData.items,
        reason: disputeData.reason,
        status: 'PENDING',
        filed_at: admin.firestore.FieldValue.serverTimestamp()
    });
};
```
**Why**: Store staff can file multiple disputes (one per order within 1-hour window).

#### R38: `order_disputes` → `items[]` (Embedded Array - NoSQL)
```javascript
// services/disputeService.js
const fileDispute = async (orderId, items, reason, userId) => {
    const storeStaff = await storeStaffRepository.findByUserId(userId);
    return disputeRepository.create({
        order_id: orderId,
        store_staff_id: storeStaff.store_staff_id,
        items,
        reason,
        status: 'PENDING'
    });
};
```
**Why**: NoSQL optimization - disputed items embedded directly, no separate `dispute_items` table.
**Implemented in**: `functions/services/disputeService.js` (controller delegates).

### 9. CREDIT SYSTEM (4 relationships)

#### R39: `store_staff` → `store_credits` (One-to-Many)
```javascript
// services/cookedQCService.js
const transferFromRiskPool = async (batchId, fromStoreStaffId) => {
    await storeCreditRepository.create({
        store_staff_id: fromStoreStaffId,
        amount: creditAmount,
        used_amount: 0,
        remaining_amount: creditAmount,
        source: 'RISK_POOL',
        batch_id: batchId,
        product_id: product.product_id
    });
};
```
**Why**: Store staff can have multiple credits from risk pool transfers (accumulated over time).

#### R40: `cooked_batches` → `store_credits` (One-to-Many) via `batch_id`
```javascript
// repositories/storeCreditRepository.js (when source = RISK_POOL)
const create = async (creditData) => {
    await db.collection('store_credits').add({
        source: 'RISK_POOL',
        batch_id: creditData.batch_id,
        product_id: creditData.product_id,
        amount: creditData.amount
    });
};
```
**Why**: Credits from risk pool transfers link back to the failed batch (for traceability).

#### R41: `products` → `store_credits` (One-to-Many) via `product_id`
```javascript
// repositories/storeCreditRepository.js (when source = RISK_POOL)
const create = async (creditData) => {
    await db.collection('store_credits').add({
        source: 'RISK_POOL',
        batch_id: creditData.batch_id,
        product_id: creditData.product_id,
        amount: creditData.amount
    });
};
```
**Why**: Identify which product generated the credit (for product-specific cost analysis).

## Summary: 45 Total Relationships

**Collections: 23**
- **users** (1)
- **roles** (1)
- **store_staff** (1)
- **products** (1)
- **recipes** (1)
- **recipe_ingredients** (1)
- **raw_materials** (1)
- **suppliers** (1)
- **orders** (1)
- **statuses** (1)
- **order_history** (1)
- **raw_material_supplies** (1)
- **production_batches** (raw batches) (1)
- **cooked_batches** (1)
- **product_qc** (cooked QC) (1)
- **ck_inventory** (1)
- **store_inventory** (1)
- **store_credits** (1)
- **credit_usage** (1)
- **order_disputes** (1)
- **risk_pool_transfers** (1)
- **waste_logs** (1)
- **batch_consumption** (1)

**Relationships by Category:**
- **User Management**: 5 relationships (R1-R5)
- **Order Management**: 6 relationships (R6-R13, excluding R8-R9 for embedded items)
- **Product & Recipe**: 4 relationships (R14-R17)
- **Supply Chain**: 6 relationships (R18-R22, removed R23 self-reference)
- **Production & QC**: 6 relationships (R23-R26, plus embedded R24)
- **Inventory**: 4 relationships (R31-R34)
- **Risk Pool**: 5 relationships (R35-R39)
- **Dispute System**: 3 relationships (R40-R42, including embedded items)
- **Credit System**: 4 relationships (R43-R46)
- **Waste Tracking**: 3 relationships (R47-R49)

**NoSQL Embedded Arrays** (not separate tables):
- `orders.items[]` - order line items
- `cooked_batches.items[]` - batch contents (single product)
- `order_disputes.items[]` - disputed items
- `product_qc.failed_items[]` - QC failure details
- `statuses.next_statuses[]` - allowed state transitions

**Key Business Rules:**
1. Each cooked batch contains only ONE product type (enforced by batch creation logic)
2. Credits have no status field - calculated as `amount - used_amount = remaining_amount`
3. Risk pool transfers create new batches with `replaced=true, source=transfer_id`
4. Raw material batches max 5kg, cooked batches max 5kg (QC optimization)
5. Order status transitions tracked in order_history (audit trail)
6. QC failures stored in product_qc, not duplicated in cooked_batches

Every relationship enforces business rules, maintains data integrity, and supports the workflow from order creation to delivery and risk pool management
```javascript
// repositories/storeCreditRepository.js (when source = RISK_POOL)
const create = async (creditData) => {
    await db.collection('store_credits').add({
        source: 'RISK_POOL',
        batch_id: creditData.batch_id,  // FK to failed batch (nullable)
        product_id: creditData.product_id,
        amount: creditData.amount
    });
};
```
**Why**: Credits from risk pool transfers link back to the failed batch (for traceability).

#### R42: `store_credits` → `credit_usage` (One-to-Many)
```javascript
// services/orderService.js - applyCredits (FIFO order)
const applyCredits = async (storeStaffId, orderTotal) => {
    const credits = await storeCreditRepository.findByStoreStaffId(storeStaffId);
    let remaining = orderTotal;
    
    for (const credit of credits) {
        if (remaining <= 0) break;
        const availableCredit = (credit.remaining_amount ?? credit.amount) || 0;
        if (availableCredit <= 0) continue;
        
        const amountToUse = Math.min(remaining, availableCredit);
        
        await creditUsageRepository.create({
            credit_id: credit.credit_id,
            order_id: orderId,
            amount_used: amountToUse,
            used_by: userId,
            used_at: admin.firestore.FieldValue.serverTimestamp()
        });
        
        await storeCreditRepository.update(credit.credit_id, {
            used_amount: (credit.used_amount || 0) + amountToUse,
            remaining_amount: availableCredit - amountToUse
        });
        
        remaining -= amountToUse;
    }
};
```
**Why**: Single credit can be partially used across multiple orders (FIFO consumption).

### 10. WASTE TRACKING (3 relationships)

#### R43: `raw_materials` → `waste_logs` (One-to-Many) via `material_id`
```javascript
// repositories/wasteLogRepository.js
const create = async (wasteData) => {
    await db.collection('waste_logs').add({
        waste_date: wasteData.waste_date,
        material_id: wasteData.material_id,
        product_id: null,
        quantity: wasteData.quantity,
        unit: wasteData.unit,
        reason: wasteData.reason,
        logged_by: wasteData.logged_by
    });
};
```
**Why**: Track waste of raw materials (spoilage, contamination, etc.) for cost analysis.

#### R44: `products` → `waste_logs` (One-to-Many) via `product_id`
```javascript
// repositories/wasteLogRepository.js
const create = async (wasteData) => {
    await db.collection('waste_logs').add({
        waste_date: wasteData.waste_date,
        material_id: null,
        product_id: wasteData.product_id,
        quantity: wasteData.quantity,
        unit: wasteData.unit,
        reason: wasteData.reason,
        logged_by: wasteData.logged_by
    });
};
```
**Why**: Track waste of finished products (failed QC, expiration, damage) for cost analysis.

#### R45: `users` → `waste_logs` (One-to-Many) via `logged_by`
```javascript
// repositories/wasteLogRepository.js
const create = async (wasteData) => {
    await db.collection('waste_logs').add({
        logged_by: wasteData.logged_by,
        waste_date: wasteData.waste_date,
        material_id: wasteData.material_id || null,
        product_id: wasteData.product_id || null,
        quantity: wasteData.quantity,
        reason: wasteData.reason
    });
};
```
**Why**: Track who logged each waste entry (accountability for waste management).

## Summary: 45 Total Relationships

**Collections: 23**
- users
- roles
- store_staff
- products
- recipes
- recipe_ingredients
- raw_materials
- suppliers
- orders
- statuses
- order_history
- raw_material_supplies
- production_batches (raw batches)
- cooked_batches
- product_qc (cooked QC)
- ck_inventory
- store_inventory
- store_credits
- credit_usage
- order_disputes
- risk_pool_transfers
- waste_logs
- batch_consumption

**Relationships by Category:**
- User Management: 5 relationships (R1-R5)
- Order Management: 7 relationships (R6-R12, including embedded R8)
- Product & Recipe: 5 relationships (R13-R17, note: R13 is duplicate of R4)
- Supply Chain: 5 relationships (R18-R22)
- Production & QC: 4 relationships (R23-R26, including embedded R24)
- Inventory: 4 relationships (R27-R30)
- Risk Pool: 5 relationships (R31-R35)
- Dispute System: 3 relationships (R36-R38, including embedded items)
- Credit System: 4 relationships (R39-R42)
- Waste Tracking: 3 relationships (R43-R45)

**NoSQL Embedded Arrays** (not separate tables):
- `orders.items[]` - order line items
- `cooked_batches.items[]` - batch contents (single product)
- `order_disputes.items[]` - disputed items
- `product_qc.failed_items[]` - QC failure details
- `statuses.next_statuses[]` - allowed state transitions

**Key Business Rules:**
1. Each cooked batch contains only ONE product type (enforced by batch creation logic)
2. Credits have no status field - calculated as `amount - used_amount = remaining_amount`
3. Risk pool transfers create new batches with `replaced=true, source=transfer_id`
4. Raw material batches max 5kg, cooked batches max 5kg (QC optimization)
5. Order status transitions tracked in order_history (audit trail)
6. QC failures stored in product_qc, not duplicated in cooked_batches

Every relationship enforces business rules, maintains data integrity, and supports the workflow from order creation to delivery and risk pool management.