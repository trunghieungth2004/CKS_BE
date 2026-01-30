# CKS_BE - Central Kitchen Software Backend

Firebase Cloud Functions backend built with **Layered Architecture** pattern for separation of concerns and maintainability.

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

# Start Firebase emulators
firebase emulators:start
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

For complete API documentation, visit the Swagger UI at `/api-docs` when running the server.

## Request/Response Structure

### Request Format
All requests use `POST`, `PUT`, or `DELETE` methods with data in `req.body`:

```javascript
// Headers
{
  "Authorization": "Bearer <firebase_token>",  // For protected endpoints
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
All responses follow this standardized structure:

**Success Response:**
```json
{
  "statusCode": 200,
  "status": "SUCCESS",
  "message": "Operation successful",
  "data": {
    "userId": "...",
    "email": "user@example.com"
  }
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

## Swagger API Documentation

Interactive API documentation is available at `/api-docs` when running the server. The Swagger UI provides:
- Complete endpoint specifications
- Request/response schemas
- Interactive API testing
- Authentication flows

## License

MIT