# V. Implementation

## V.1 Map Architecture to the Structure of the Project

### 1. Overview of the Chosen Architecture

**Architectural Style: 3-Layer (Layered) Architecture**

This project implements a 3-Layer Architecture pattern, which is a traditional software architecture that separates concerns into distinct horizontal layers. Each layer has specific responsibilities and communicates only with adjacent layers.

**Why This Architecture Was Selected:**

**Maintainability:** Clear separation of concerns makes the codebase easier to understand, modify, and debug. Changes in one layer have minimal impact on others. For example, switching from Firebase Firestore to another database only requires modifications in the Repository layer.

**Scalability:** Each layer can be optimized independently. Business logic can be scaled separately from data access, and presentation logic can be adjusted without affecting underlying services. The stateless nature of controllers and services makes horizontal scaling straightforward.

**Reusability:** Business logic encapsulated in the Service layer can be reused across multiple controllers or even different applications. For instance, the `orderService.createOrder()` method can be called from HTTP endpoints, scheduled functions, or background jobs.

**Testability:** Each layer can be tested in isolation using mocks or stubs for dependencies. Unit tests for services don't require actual database connections, and controller tests don't need real business logic implementations.

**Team Collaboration:** Different team members can work on different layers simultaneously without conflicts. Frontend developers work with Controllers/Routes, backend developers focus on Services, and database specialists optimize Repositories.

### 2. Mapping to Project Structure

**Actual Project Folder Structure:**

```
functions/
├── config/                 # Firebase and system configuration
│   ├── firebase.js         # Firebase Admin SDK initialization
│   └── firebaseConfig.json # Firebase web config (encrypted)
├── constants/              # System-wide constants
│   └── statuses.js         # Order, auth, and authorization status definitions
├── controllers/            # Presentation Layer - HTTP request handlers
│   ├── authController.js
│   ├── orderController.js
│   ├── productController.js
│   ├── rawQCController.js
│   ├── cookedQCController.js
│   ├── rawBatchController.js
│   ├── cookedBatchController.js
│   ├── disputeController.js
│   ├── inventoryController.js
│   └── userController.js
├── services/               # Business Logic Layer - Domain logic
│   ├── authService.js
│   ├── orderService.js
│   ├── materialService.js
│   ├── rawQCService.js
│   ├── cookedQCService.js
│   ├── disputeService.js
│   └── userService.js
├── repositories/           # Data Access Layer - Database operations
│   ├── userRepository.js
│   ├── orderRepository.js
│   ├── orderHistoryRepository.js
│   ├── productRepository.js
│   ├── recipeRepository.js
│   ├── recipeIngredientRepository.js
│   ├── rawMaterialRepository.js
│   ├── rawMaterialSupplyRepository.js
│   ├── supplierRepository.js
│   ├── rawBatchRepository.js
│   ├── cookedBatchRepository.js
│   ├── batchConsumptionRepository.js
│   ├── ckInventoryRepository.js
│   ├── storeInventoryRepository.js
│   ├── storeStaffRepository.js
│   ├── disputeRepository.js
│   ├── storeCreditRepository.js
│   ├── creditUsageRepository.js
│   ├── wasteLogRepository.js
│   ├── riskPoolTransferRepository.js
│   ├── roleRepository.js
│   ├── statusRepository.js
│   ├── rawQCRepository.js
│   └── cookedQCRepository.js
├── routes/                 # Presentation Layer - Route definitions
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   ├── rawQCRoutes.js
│   ├── cookedQCRoutes.js
│   ├── rawBatchRoutes.js
│   ├── cookedBatchRoutes.js
│   ├── disputeRoutes.js
│   ├── inventoryRoutes.js
│   └── userRoutes.js
├── middleware/             # Cross-cutting Concerns
│   ├── authMiddleware.js   # JWT token verification
│   ├── roleMiddleware.js   # Role-based access control
│   └── securityMiddleware.js # Rate limiting
├── validators/             # Input Validation
│   ├── authValidator.js
│   ├── orderValidator.js
│   └── userValidator.js
├── utils/                  # Helper Functions
│   ├── responseHelper.js   # Standardized response formatting
│   └── initialization.js   # Database seeding
├── documentation/          # API Documentation
│   ├── API.md
│   ├── SYSTEM_FLOW.md
│   ├── STATUS_CODES.md
│   └── DISPUTE.md
└── index.js                # Application entry point
```

**Layer-to-Module Mapping:**

**Presentation Layer:**
- **Routes** (`routes/`) - Define API endpoints and HTTP methods
  - `authRoutes.js` → `/api/auth/*`
  - `orderRoutes.js` → `/api/order/*`
  - `productRoutes.js` → `/api/product/*`
  
- **Controllers** (`controllers/`) - Handle HTTP requests/responses
  - `orderController.js` - Processes order-related HTTP requests
    - `createOrder()` - POST /api/order/create
    - `updateOrderStatus()` - POST /api/order/update-status
    - `getOrder()` - POST /api/order/one
    - `getMyOrders()` - POST /api/order/my-orders
    - `getAllOrders()` - POST /api/order/all

- **Validators** (`validators/`) - Validate request data
  - `orderValidator.js` - Joi schemas for order validation
  - `authValidator.js` - Joi schemas for authentication

**Business Logic Layer:**
- **Services** (`services/`) - Implement business rules and domain logic
  - `orderService.js` - Order processing business logic
    - `createOrder()` - Validates cutoff time, applies credits, creates order
    - `updateOrderStatus()` - Enforces status transitions, triggers production
    - `processOrdersForProduction()` - Automated material calculation at 7 PM
    - `calculateMaterialRequirements()` - Aggregates recipes with 10% buffer
  
  - `materialService.js` - Material management
    - `deductMaterialsForProduction()` - Deducts from CK inventory
    - `createRawBatches()` - Creates 5kg batches for QC
  
  - `rawQCService.js` - Raw material quality control
    - `performRawMaterialQC()` - Pass → Inventory, Fail → Waste + Auto-replacement
  
  - `cookedQCService.js` - Cooked product quality control
    - `performProductQC()` - Pass → Store inventory, Fail → Risk pool or waste

**Data Access Layer:**
- **Repositories** (`repositories/`) - Database CRUD operations
  - `orderRepository.js` - Order collection operations
    - `create()` - Insert new order document
    - `findById()` - Retrieve order by ID
    - `findByStoreStaff()` - Query orders by store staff
    - `findByStatus()` - Query orders by status
    - `update()` - Update order fields
  
  - `productRepository.js` - Product collection operations
  - `ckInventoryRepository.js` - Central kitchen inventory operations
  - `storeInventoryRepository.js` - Store inventory operations

**Cross-Cutting Concerns:**
- **Middleware** (`middleware/`)
  - `authMiddleware.js` - Verifies Firebase ID tokens, attaches user to request
  - `roleMiddleware.js` - Validates user roles (0: Admin, 1: CK Staff, 2: CK Supply, 3: Manager, 4: Store Staff)
  - `securityMiddleware.js` - Rate limiting (general, strict, login)

- **Configuration** (`config/`)
  - `firebase.js` - Initializes Firebase Admin SDK, exports db and auth instances

- **Utilities** (`utils/`)
  - `responseHelper.js` - Standardized JSON responses
  - `initialization.js` - Seeds database with roles, statuses, test users

## V.2 Map Class Diagram and Interaction Diagram to Code

### Implementation of Design Patterns

**1. Repository Pattern**

The entire Data Access Layer implements the Repository Pattern, which abstracts database operations behind a consistent interface.

**Pattern Structure:**
```
┌─────────────────┐
│   Service       │
└────────┬────────┘
         │ uses
         ↓
┌─────────────────┐
│  Repository     │  ← Interface-like abstraction
│  (Pattern)      │
└────────┬────────┘
         │ implements
         ↓
┌─────────────────┐
│  Firebase       │
│  Firestore      │
└─────────────────┘
```

**Implementation Example:**

`orderRepository.js` (Data Access Layer):
```javascript
const { db } = require('../config/firebase');
const COLLECTION = 'orders';

const create = async (orderData) => {
    const docRef = await db.collection(COLLECTION).add(orderData);
    const doc = await docRef.get();
    return { order_id: doc.id, ...doc.data() };
};

const findById = async (orderId) => {
    const doc = await db.collection(COLLECTION).doc(orderId).get();
    if (!doc.exists) return null;
    return { order_id: doc.id, ...doc.data() };
};

const findByStatus = async (orderStatusId) => {
    const snapshot = await db.collection(COLLECTION)
        .where('order_status_id', '==', orderStatusId)
        .orderBy('created_at', 'desc')
        .get();
    return snapshot.docs.map(doc => ({ order_id: doc.id, ...doc.data() }));
};

module.exports = { create, findById, findByStatus, update };
```

**Usage in Service Layer:**

`orderService.js` uses the repository without knowing database implementation details:
```javascript
const orderRepository = require('../repositories/orderRepository');

const createOrder = async (orderData, userId) => {
    const beforeCutoff = checkCutoffTime();
    if (!beforeCutoff) {
        throw new Error('Order submission past cut-off time');
    }
    
    const order = await orderRepository.create({
        store_staff_id: storeStaff.store_staff_id,
        order_status_id: 'OR100',
        delivery_date,
        subtotal,
        created_at: new Date()
    });
    
    return order;
};
```

**Benefits Demonstrated:**
- Service layer doesn't know about Firestore-specific operations
- Easy to switch databases by changing repository implementation
- Repository methods can be mocked for unit testing

**2. Middleware Chain Pattern**

The middleware layer implements a Chain of Responsibility pattern where requests pass through multiple handlers sequentially.

**Pattern Structure:**
```
Request → generalLimiter → authMiddleware → roleMiddleware → Controller
```

**Implementation Example:**

`authRoutes.js`:
```javascript
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { loginLimiter } = require('../middleware/securityMiddleware');

router.post('/login', loginLimiter, authController.login);

router.post('/register', authMiddleware, roleMiddleware([0]), authController.register);
```

`authMiddleware.js`:
```javascript
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const userData = await userRepository.findById(decodedToken.uid);
        
        req.user = {
            user_id: userData.user_id,
            email: userData.email,
            role_id: userData.role_id
        };
        
        next(); 
    } catch (error) {
        return errorResponse(res, 401, "Invalid token", 'AUTH107');
    }
};
```

`roleMiddleware.js`:
```javascript
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role_id)) {
            return errorResponse(res, 403, "Access denied", 'AUTHZ101');
        }
        next();
    };
};
```

**Benefits Demonstrated:**
- Each middleware has single responsibility
- Easy to add/remove/reorder middleware
- Middleware can short-circuit the chain by not calling `next()`

**3. Strategy Pattern (Status Transitions)**

The order status management implements Strategy Pattern where transition logic varies based on current status.

**Pattern Structure:**
```javascript
const ORDER_STATUSES = {
    OR100: {
        status_id: 'OR100',
        status_name: 'PENDING',
        next_statuses: ['OR101', 'OR105'] 
    },
    OR101: {
        status_id: 'OR101',
        status_name: 'IN_PRODUCTION',
        next_statuses: ['OR102']
    }
};

const isValidTransition = (currentStatus, newStatus) => {
    const status = ORDER_STATUSES[currentStatus];
    return status && status.next_statuses.includes(newStatus);
};
```

**Implementation in Service:**

`orderService.js`:
```javascript
const { isValidTransition, isTerminalStatus } = require('../constants/statuses');

const updateOrderStatus = async (orderId, newStatusId, roleId, userId) => {
    const order = await orderRepository.findById(orderId);

    if (!isValidTransition(order.order_status_id, newStatusId)) {
        throw new Error(`Invalid status transition from ${order.order_status_id} to ${newStatusId}`);
    }
    
    if (isTerminalStatus(order.order_status_id)) {
        throw new Error('Cannot modify completed or cancelled orders');
    }
    
    if (newStatusId === 'OR101') {
        await materialService.deductMaterialsForProduction(orderId);
    } else if (newStatusId === 'OR104') {
        await transferToStoreInventory(orderId);
    }
    
    await orderRepository.update(orderId, { order_status_id: newStatusId });
};
```

**Benefits Demonstrated:**
- Status transition rules centralized in constants
- Easy to add new statuses and transitions
- Prevents invalid state changes

**4. Factory Pattern (Response Helpers)**

The response helper implements Factory Pattern to create standardized response objects.

**Implementation:**

`utils/responseHelper.js`:
```javascript
const successResponse = (res, statusCode, message, data = null, statusId = null) => {
    const response = {
        statusCode,
        status: statusId || "SUCCESS",
        message
    };
    if (data !== null) response.data = data;
    return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode, message, statusId = null) => {
    const response = {
        statusCode,
        status: statusId || "ERROR",
        message
    };
    return res.status(statusCode).json(response);
};
```

**Usage in Controllers:**
```javascript
const createOrder = async (req, res) => {
    try {
        const result = await orderService.createOrder(value, req.user.user_id);
        return successResponse(res, 201, "Order created successfully", result, 'OR100');
    } catch (error) {
        return errorResponse(res, 500, error.message, 'SYS100');
    }
};
```

**Benefits Demonstrated:**
- Consistent response format across all endpoints
- Easy to modify response structure in one place
- Reduces code duplication

**5. Dependency Injection Pattern**

Services inject repositories as dependencies, enabling loose coupling and testability.

**Implementation:**

`orderService.js`:
```javascript
const orderRepository = require('../repositories/orderRepository');
const productRepository = require('../repositories/productRepository');
const storeInventoryRepository = require('../repositories/storeInventoryRepository');

const createOrder = async (orderData, userId) => {
    const product = await productRepository.findById(item.product_id);
    const order = await orderRepository.create(orderData);
    await storeInventoryRepository.update(inventory_id, newQuantity);
};
```

**Benefits Demonstrated:**
- Services can be tested by mocking repositories
- Easy to swap implementations (e.g., different database)
- Clear dependency hierarchy

# VI. Applying Alternative Architecture Patterns

## VI.1 Applying Service-Oriented Architecture (SOA)

### 1. Problem Identification

**Non-Functional Requirement Not Fully Supported:** NF-05: Reusability

**Current Architecture Limitations:**

The monolithic 3-Layer Architecture tightly couples all domain logic within a single codebase. While separation of concerns exists within layers, the entire system must be deployed as one unit. This creates several reusability issues:

**Deployment Coupling:** All modules (orders, products, QC, inventory, disputes) are deployed together. A bug fix in the dispute module requires redeploying the entire application, affecting all other modules.

**Technology Lock-in:** All services must use the same technology stack (Node.js, Express, Firebase). Cannot adopt different technologies optimized for specific tasks (e.g., Python for data analytics, Go for high-performance inventory tracking).

**Independent Scaling Limitations:** Cannot scale individual components based on load. Order creation might need 10x capacity during peak hours (5-6 PM), while QC operations run at steady rate, but both scale together.

**Team Boundaries:** Multiple teams working on different modules (ordering team, QC team, inventory team) must coordinate deployments and share the same codebase, increasing merge conflicts and testing complexity.

**Feature Reuse Across Systems:** Business logic cannot be easily reused by other systems. For example, a mobile app or admin dashboard would need to duplicate order validation logic or make HTTP calls through the same monolithic API.

### 2. SOA-Based Solution

**Reorganize System Components into Independent Services:**

**Microservices Architecture:**

```
┌────────────────────────────────────────────────────────┐
│                    API Gateway                         │
│              (Request Routing & Auth)                  │
└───────────┬─────────────┬─────────────┬────────────────┘
            │             │             │
┌───────────▼──────┐ ┌───▼────────┐ ┌─▼──────────────┐
│  Order Service   │ │ QC Service │ │ Product Service│
│  - Create order  │ │ - Raw QC   │ │ - Manage items │
│  - Update status │ │ - Cooked QC│ │ - Recipes      │
│  - Query orders  │ │ - QC logs  │ │ - Pricing      │
│  Port: 5001      │ │ Port: 5002 │ │ Port: 5003     │
└──────────┬───────┘ └─────┬──────┘ └────────┬───────┘
           │               │                  │
┌──────────▼───────────────▼──────────────────▼─────────-┐
│           Shared Database (Firestore)                  │
│  or Service-Specific Databases (Database-per-Service)  │
└────────────────────────────────────────────────────────┘
```

**Service Decomposition:**

**1. Authentication Service**
- Responsibilities: User registration, login, token generation/verification
- Endpoints: `/auth/register`, `/auth/login`, `/auth/verify`
- Technology: Node.js + Firebase Auth
- Independent scaling: Moderate load

**2. Order Service**
- Responsibilities: Order creation, status updates, order history
- Endpoints: `/order/create`, `/order/update-status`, `/order/one`, `/order/all`
- Technology: Node.js + Express
- Independent scaling: High load during 5-6 PM cutoff

**3. Product Service**
- Responsibilities: Product catalog, recipes, ingredient management
- Endpoints: `/product/create`, `/product/all`, `/product/one`
- Technology: Node.js + Express
- Independent scaling: Low load (admin operations)

**4. QC Service**
- Responsibilities: Raw material QC, cooked product QC, waste tracking
- Endpoints: `/qc/raw/perform`, `/qc/cooked/perform`, `/qc/pending`
- Technology: Node.js + Express
- Independent scaling: Steady load throughout production hours

**5. Inventory Service**
- Responsibilities: CK inventory, store inventory, risk pool management
- Endpoints: `/inventory/ck`, `/inventory/store`, `/inventory/risk-pool`
- Technology: Go (for high-performance concurrent inventory updates)
- Independent scaling: High load during order dispatch and delivery

**6. Dispute Service**
- Responsibilities: Dispute filing, resolution, credit management
- Endpoints: `/dispute/file`, `/dispute/resolve`, `/dispute/all`
- Technology: Node.js + Express
- Independent scaling: Low to moderate load

**Service Communication:**

**Synchronous (HTTP/REST):** Order Service → Product Service (validate product availability)
**Asynchronous (Events/Pub-Sub):** Order status update → Trigger material deduction in Inventory Service
**Shared Database:** Services read from shared Firestore collections
**Service-Specific Databases:** Each service owns its data (e.g., Order Service owns `orders` collection)

**Refactored Code Example:**

**Order Service (Standalone Microservice):**

```
order-service/
├── controllers/
│   └── orderController.js
├── services/
│   └── orderService.js
├── repositories/
│   └── orderRepository.js
├── routes/
│   └── orderRoutes.js
├── utils/
│   └── httpClient.js  # For calling other services
├── config/
│   └── firebase.js
└── index.js
```

`orderService.js` (Service-to-Service Communication):
```javascript
const httpClient = require('../utils/httpClient');
const orderRepository = require('../repositories/orderRepository');

const createOrder = async (orderData, userId) => {
    const productResponse = await httpClient.post(
        'http://product-service:5003/api/product/validate',
        { product_ids: orderData.items.map(i => i.product_id) }
    );
    
    if (!productResponse.data.valid) {
        throw new Error('Invalid products in order');
    }
    
    const order = await orderRepository.create({
        ...orderData,
        order_status_id: 'OR100',
        created_at: new Date()
    });
    
    await eventBus.publish('order.created', {
        order_id: order.order_id,
        items: orderData.items
    });
    
    return order;
};
```

### 3. Supporting Diagrams

**Deployment Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│                     Load Balancer                           │
└──────────────┬──────────────┬──────────────┬───────────-────┘
               │              │              │
    ┌──────────▼──────┐ ┌────▼──────┐ ┌─────▼─────────-─┐
    │  Order Service  │ │QC Service │ │Product Service  │
    │  (3 instances)  │ │(1 instance)│ │ (1 instance)   │
    │  Node.js:5001   │ │Node.js:5002│ │ Node.js:5003   │
    └────────┬────────┘ └─────┬──────┘ └────────┬───────┘
             │                │                  │
    ┌────────▼────────────────▼──────────────────▼──-──────┐
    │              Firebase Firestore                      │
    │  Collections: orders, products, qc_logs, inventory   │
    └──────────────────────────────────────────────────────┘
```

**Updated Component Diagram:**

```
┌──────────────────────────────────────────────────────────┐
│                    Client Application                    │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│                     API Gateway                          │
│          (Authentication, Rate Limiting, Routing)        │
└───┬──────────┬──────────┬──────────┬──────────┬──────-───┘
    │          │          │          │          │
┌───▼─────┐ ┌─▼──────┐ ┌─▼──────┐ ┌─▼──────┐ ┌─▼─────────┐
│  Auth   │ │ Order  │ │Product │ │   QC   │ │ Inventory │
│ Service │ │Service │ │Service │ │Service │ │  Service  │
└────┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └─────┬─────┘
     │          │          │          │            │
     └──────────┴──────────┴──────────┴────────────┘
                         │
              ┌──────────▼──────────┐
              │  Message Queue      │
              │  (Event Bus)        │
              └─────────────────────┘
```

**Updated Class Diagram (Service Boundaries):**

```
┌─────────────────────────────────────────────┐
│         <<Service>> OrderService            │
├─────────────────────────────────────────────┤
│ - orderRepository: OrderRepository          │
│ - productServiceClient: HttpClient          │
├─────────────────────────────────────────────┤
│ + createOrder(orderData): Order             │
│ + updateOrderStatus(orderId, status): Order │
│ + getOrderById(orderId): Order              │
└─────────────────────────────────────────────┘
                     │ calls
                     ▼
┌─────────────────────────────────────────────┐
│       <<Service>> ProductService            │
├─────────────────────────────────────────────┤
│ - productRepository: ProductRepository      │
├─────────────────────────────────────────────┤
│ + validateProducts(productIds): Boolean     │
│ + getProductById(productId): Product        │
└─────────────────────────────────────────────┘
```

## VI.2 Applying Service Discovery Pattern in SOA

### 1. Problem & Requirement

**Relevant Non-Functional Requirement:** NF-06: Scalability

**Current Problem:**

In the Service-Oriented Architecture described in VI.1, services communicate using hardcoded endpoints:

```javascript
const productResponse = await httpClient.post(
    'http://product-service:5003/api/product/validate',  
    { product_ids: orderData.items.map(i => i.product_id) }
);
```

**Scalability Issues:**

**Static Configuration:** Each service must know the exact host and port of every other service. When deploying multiple instances for load balancing, code must be updated with all instance addresses.

**No Failover:** If a service instance goes down, clients cannot automatically discover healthy instances. Manual intervention required.

**Manual Load Balancing:** Cannot dynamically distribute requests across multiple instances of the same service. All requests go to one hardcoded endpoint.

**Deployment Complexity:** Adding/removing service instances requires updating configuration files and redeploying dependent services.

**Need for Service Discovery:**

As the system grows with multiple branches, stores, and increased order volume:

**Multiple Instances:** Order Service needs 10 instances during peak hours (5-6 PM), but only 2 instances at night. Service discovery enables dynamic instance registration.

**Independent Deployment:** New instances can be deployed without updating dependent services. Instances register themselves automatically.

**Health Monitoring:** Service registry tracks which instances are healthy and removes unhealthy instances from rotation.

**Dynamic Load Distribution:** Requests automatically distributed across all healthy instances.

### 2. Service Discovery-Based Solution

**Integrate Service Discovery Pattern:**

```
┌─────────────────────────────────────────────────────────┐
│                  Service Registry                       │
│              (Consul / Eureka / K8s DNS)                │
│                                                         │
│  Services:                                              │
│  - order-service: [10.0.1.5:5001, 10.0.1.6:5001, ...]   │
│  - product-service: [10.0.2.3:5003]                     │
│  - qc-service: [10.0.3.8:5002, 10.0.3.9:5002]           │
└───────────▲───────────────────────────────────▲─────────┘
            │ register/heartbeat                │ query
    ┌───────┴────────┐                  ┌───────┴────────-┐
    │  Order Service │                  │  API Gateway    │
    │  Instance 1    │                  │                 │
    │  10.0.1.5:5001 │                  │  Discovers &    │
    │                │                  │  Routes requests│
    │  Registers:    │                  └───────────────-─┘
    │  - On startup  │
    │  - Heartbeat   │
    │  - Deregister  │
    └────────────────┘
```

**Implementation Technologies:**

**Consul (HashiCorp):**
- Service registration via HTTP API
- DNS-based service discovery
- Health checking with TTL or HTTP endpoints
- Multi-datacenter support

**Eureka (Netflix OSS):**
- Client libraries for Node.js
- REST-based registration
- Self-preservation mode during network partitions

**Kubernetes DNS:**
- Built-in service discovery
- DNS records automatically created for services
- Load balancing via kube-proxy
- Best for cloud-native deployments

**Refactored Code with Service Discovery:**

**Service Registration (Order Service):**

```javascript
const Consul = require('consul');

const consul = new Consul({
    host: process.env.CONSUL_HOST || 'localhost',
    port: process.env.CONSUL_PORT || 8500
});

const registerService = async (serviceName, servicePort, serviceHost) => {
    const serviceId = `${serviceName}-${serviceHost}-${servicePort}`;
    
    await consul.agent.service.register({
        id: serviceId,
        name: serviceName,
        address: serviceHost,
        port: servicePort,
        check: {
            http: `http://${serviceHost}:${servicePort}/health`,
            interval: '10s',
            timeout: '5s',
            deregistertimeout: '1m'
        }
    });
    
    console.log(`Service ${serviceId} registered with Consul`);
    
    process.on('SIGINT', async () => {
        await consul.agent.service.deregister(serviceId);
        process.exit(0);
    });
};

module.exports = { registerService };
```

**Service Startup with Registration:**

```javascript
const express = require('express');
const { registerService } = require('./config/serviceDiscovery');

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '10.0.1.5';

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.listen(PORT, async () => {
    console.log(`Order Service running on ${HOST}:${PORT}`);
    await registerService('order-service', PORT, HOST);
});
```

**Service Discovery Client:**

```javascript
const Consul = require('consul');
const axios = require('axios');

const consul = new Consul({
    host: process.env.CONSUL_HOST || 'localhost',
    port: process.env.CONSUL_PORT || 8500
});

const discoverService = async (serviceName) => {
    const services = await consul.health.service({
        service: serviceName,
        passing: true  // Only healthy instances
    });
    
    if (services.length === 0) {
        throw new Error(`No healthy instances of ${serviceName} found`);
    }
    
    const instance = services[Math.floor(Math.random() * services.length)];
    const { Address, Port } = instance.Service;
    
    return `http://${Address}:${Port}`;
};

const callService = async (serviceName, endpoint, method = 'GET', data = null) => {
    const serviceUrl = await discoverService(serviceName);
    const url = `${serviceUrl}${endpoint}`;
    
    try {
        const response = await axios({ method, url, data });
        return response.data;
    } catch (error) {
        console.error(`Error calling ${serviceName}:`, error.message);
        throw error;
    }
};

module.exports = { callService };
```

**Refactored Service-to-Service Communication:**

```javascript
const { callService } = require('../utils/serviceClient');
const orderRepository = require('../repositories/orderRepository');

const createOrder = async (orderData, userId) => {
    const productValidation = await callService(
        'product-service',
        '/api/product/validate',
        'POST',
        { product_ids: orderData.items.map(i => i.product_id) }
    );
    
    if (!productValidation.valid) {
        throw new Error('Invalid products in order');
    }
    
    const order = await orderRepository.create({
        ...orderData,
        order_status_id: 'OR100',
        created_at: new Date()
    });
    
    await callService(
        'inventory-service',
        '/api/inventory/reserve',
        'POST',
        { order_id: order.order_id, items: orderData.items }
    );
    
    return order;
};
```

**Kubernetes DNS Alternative:**

```javascript
const callService = async (serviceName, endpoint, method = 'GET', data = null) => {
    const serviceUrl = `http://${serviceName}.default.svc.cluster.local`;
    const url = `${serviceUrl}${endpoint}`;
    
    const response = await axios({ method, url, data });
    return response.data;
};
```

### 3. Supporting Diagrams

**Deployment Diagram with Service Discovery:**

```
┌──────────────────────────────────────────────────────────┐
│                  Service Registry (Consul)               │
│           consul.service.local:8500                      │
└────────▲─────────────────────────────────────▲───────────┘
         │ register                            │ query
         │                                     │
┌────────┴─────────┐                  ┌────────┴──────────┐
│  Order Service   │                  │   API Gateway     │
│                  │                  │                   │
│  Instance 1      │                  │ - Discovers       │
│  10.0.1.5:5001   │◄─────calls──────┤   services         │
│  Instance 2      │                  │ - Routes requests │
│  10.0.1.6:5001   │                  │ - Load balancing  │
│  Instance 3      │                  └───────────────────┘
│  10.0.1.7:5001   │
└──────┬───────────┘
       │ discovers
       ▼
┌──────────────────┐
│ Product Service  │
│ 10.0.2.3:5003    │
└──────┬───────────┘
       │
┌──────▼───────────┐
│   QC Service     │
│ Instance 1       │
│ 10.0.3.8:5002    │
│ Instance 2       │
│ 10.0.3.9:5002    │
└──────────────────┘
```

**Updated Component Diagram with Discovery Service:**

```
┌─────────────────────────────────────────────────────┐
│                  Client Application                 │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                  API Gateway                        │
│         (Routes to services via discovery)          │
└───┬──────────┬──────────┬──────────┬──────────p─────┘
    │          │          │          │
    │          ▼          ▼          ▼
    │    ┌─────────┐ ┌─────────┐ ┌─────────┐
    │    │ Order   │ │Product  │ │   QC    │
    │    │ Service │ │Service  │ │ Service │
    │    │ (x3)    │ │ (x1)    │ │ (x2)    │
    │    └────┬────┘ └────┬────┘ └────┬────┘
    │         │           │           │
    │         │  register │  register │  register
    │         ▼           ▼           ▼
    │    ┌────────────────────────────────────┐
    └───►│      Service Registry (Consul)     │
         │  - Service registration            │
         │  - Health checking                 │
         │  - Service discovery               │
         └────────────────────────────────────┘
```

**Sequence Diagram: Service Discovery Flow:**

```
Client          API Gateway      Consul       Order Service    Product Service
  │                  │              │               │                 │
  │ POST /order      │              │               │                 │
  ├─────────────────►│              │               │                 │
  │                  │ Discover     │               │                 │
  │                  │ "order-srv"  │               │                 │
  │                  ├─────────────►│               │                 │
  │                  │ [10.0.1.5]   │               │                 │
  │                  │◄─────────────┤               │                 │
  │                  │              │               │                 │
  │                  │ POST /create │               │                 │
  │                  ├──────────────┼──────────────►│                 │
  │                  │              │               │ Discover        │
  │                  │              │               │ "product-srv"   │
  │                  │              │               ├────────────────►│
  │                  │              │               │ [10.0.2.3]      │
  │                  │              │               │◄────────────────┤
  │                  │              │               │                 │
  │                  │              │               │ POST /validate  │
  │                  │              │               ├────────────────►│
  │                  │              │               │ {valid: true}   │
  │                  │              │               │◄────────────────┤
  │                  │              │               │                 │
  │                  │ {order_id}   │               │                 │
  │                  │◄─────────────┼───────────────┤                 │
  │ 201 Created      │              │               │                 │
  │◄─────────────────┤              │               │                 │
  │                  │              │               │                 │
```
