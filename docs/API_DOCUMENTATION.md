# Matka SK API Documentation

Complete API reference for the Matka SK backend system with role-based authentication, hierarchical data access control, market management, and transfer functionality.

## 📋 Table of Contents

- [Base URL & Authentication](#base-url--authentication)
- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Market Management Endpoints](#market-management-endpoints)
- [Transfer Management Endpoints](#transfer-management-endpoints)
- [Role-Specific Endpoints](#role-specific-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Testing Examples](#testing-examples)

## 🌐 Base URL & Authentication

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.your-domain.com/api
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Content Type
All requests should include:
```
Content-Type: application/json
```

### Cookie-Based Authentication
The system also supports HTTP-only cookies for enhanced security:
```
Cookie: authToken=<your-jwt-token>
```

## 🔐 Authentication Endpoints

### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "balance": 100000,
      "role": "admin",
      "parentId": "507f1f77bcf86cd799439012",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenExpires": 1704067200000
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### POST /auth/logout

Logout user and invalidate token.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### POST /auth/refresh

Refresh JWT token.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenExpires": 1704067200000
  }
}
```

### GET /auth/profile

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "admin",
      "balance": 100000,
      "role": "admin",
      "parentId": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "superadmin",
        "role": "superadmin"
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /auth/profile

Update current user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "username": "newusername",
  "balance": 150000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "newusername",
      "balance": 150000,
      "role": "admin",
      "parentId": "507f1f77bcf86cd799439012",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

## 👥 User Management Endpoints

### GET /auth/users

Get all accessible users based on role hierarchy.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by username
- `role` (string): Filter by role
- `status` (string): Filter by status (active/inactive)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "username": "distributor1",
        "balance": 50000,
        "role": "distributor",
        "parentId": {
          "_id": "507f1f77bcf86cd799439012",
          "username": "admin",
          "role": "admin"
        },
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### GET /auth/users/:userId

Get specific user by ID (with access control).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "distributor1",
      "balance": 50000,
      "role": "distributor",
      "parentId": {
        "_id": "507f1f77bcf86cd799439012",
        "username": "admin",
        "role": "admin"
      },
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /auth/users/:userId

Update specific user (with access control).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "username": "updatedusername",
  "balance": 75000,
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "updatedusername",
      "balance": 75000,
      "role": "distributor",
      "parentId": "507f1f77bcf86cd799439012",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### DELETE /auth/users/:userId

Delete user and all downline users (cascade delete).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User and downline deleted successfully"
}
```

### PUT /auth/users/:userId/active

Toggle user active/inactive status.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "distributor1",
      "isActive": false,
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### PUT /auth/users/:userId/password

Update user password.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## 🏪 Market Management Endpoints

### GET /markets

Get all markets with pagination and filtering.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by market name
- `status` (string): Filter by status (active/inactive)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "markets": [
      {
        "_id": "507f1f77bcf86cd799439021",
        "marketName": "Morning Market",
        "openTime": "2024-01-01T09:00:00.000Z",
        "closeTime": "2024-01-01T12:00:00.000Z",
        "createdBy": "admin",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

### POST /markets

Create a new market (Admin/Superadmin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "marketName": "Evening Market",
  "openTime": "2024-01-01T18:00:00.000Z",
  "closeTime": "2024-01-01T21:00:00.000Z"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Market created successfully",
  "data": {
    "market": {
      "_id": "507f1f77bcf86cd799439022",
      "marketName": "Evening Market",
      "openTime": "2024-01-01T18:00:00.000Z",
      "closeTime": "2024-01-01T21:00:00.000Z",
      "createdBy": "admin",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /markets/:marketId

Update market information (Admin/Superadmin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "marketName": "Updated Market Name",
  "openTime": "2024-01-01T10:00:00.000Z",
  "closeTime": "2024-01-01T13:00:00.000Z"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Market updated successfully",
  "data": {
    "market": {
      "_id": "507f1f77bcf86cd799439021",
      "marketName": "Updated Market Name",
      "openTime": "2024-01-01T10:00:00.000Z",
      "closeTime": "2024-01-01T13:00:00.000Z",
      "createdBy": "admin",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### DELETE /markets/:marketId

Delete market (Admin/Superadmin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Market deleted successfully"
}
```

### PUT /markets/:marketId/active

Toggle market active/inactive status (Admin/Superadmin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Market status updated successfully",
  "data": {
    "market": {
      "_id": "507f1f77bcf86cd799439021",
      "marketName": "Morning Market",
      "isActive": false,
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### POST /markets/assign

Assign market to user (Admin/Superadmin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "marketId": "507f1f77bcf86cd799439021"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Market assigned successfully",
  "data": {
    "assignment": {
      "_id": "507f1f77bcf86cd799439031",
      "userId": "507f1f77bcf86cd799439011",
      "marketId": "507f1f77bcf86cd799439021",
      "assignedBy": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 💰 Transfer Management Endpoints

### GET /transfers

Get all transfers with pagination and filtering.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (pending/approved/rejected)
- `type` (string): Filter by type (sent/received)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transfers": [
      {
        "_id": "507f1f77bcf86cd799439041",
        "fromUserId": "507f1f77bcf86cd799439011",
        "toUserId": "507f1f77bcf86cd799439012",
        "amount": 1000,
        "description": "Payment for services",
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

### POST /transfers

Create a new transfer.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "toUserId": "507f1f77bcf86cd799439012",
  "amount": 1000,
  "description": "Payment for services"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transfer created successfully",
  "data": {
    "transfer": {
      "_id": "507f1f77bcf86cd799439041",
      "fromUserId": "507f1f77bcf86cd799439011",
      "toUserId": "507f1f77bcf86cd799439012",
      "amount": 1000,
      "description": "Payment for services",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### PUT /transfers/:transferId/approve

Approve transfer (Admin/Superadmin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transfer approved successfully",
  "data": {
    "transfer": {
      "_id": "507f1f77bcf86cd799439041",
      "status": "approved",
      "approvedAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### PUT /transfers/:transferId/reject

Reject transfer (Admin/Superadmin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "reason": "Insufficient funds"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Transfer rejected successfully",
  "data": {
    "transfer": {
      "_id": "507f1f77bcf86cd799439041",
      "status": "rejected",
      "rejectionReason": "Insufficient funds",
      "rejectedAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

## 👑 Role-Specific Endpoints

### POST /auth/register/admin

Create admin user (Superadmin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "username": "newadmin",
  "password": "adminpass123",
  "balance": 100000,
  "parentId": "507f1f77bcf86cd799439012"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439014",
      "username": "newadmin",
      "balance": 100000,
      "role": "admin",
      "parentId": "507f1f77bcf86cd799439012",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/register/distributor

Create distributor user (Admin only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "username": "newdistributor",
  "password": "distpass123",
  "balance": 50000,
  "parentId": "507f1f77bcf86cd799439011"
}
```

### POST /auth/register/agent

Create agent user (Distributor only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "username": "newagent",
  "password": "agentpass123",
  "balance": 10000,
  "parentId": "507f1f77bcf86cd799439013"
}
```

### POST /auth/register/player

Create player user (Agent only).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "username": "newplayer",
  "password": "playerpass123",
  "balance": 1000,
  "parentId": "507f1f77bcf86cd799439014"
}
```

## ❌ Error Handling

### Standard Error Response Format

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes

| Status Code | Description | Example |
|-------------|-------------|---------|
| `200` | Success | GET /auth/profile |
| `201` | Created | POST /auth/register |
| `400` | Bad Request | Invalid input data |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | User not found |
| `500` | Internal Server Error | Server error |

### Common Error Messages

#### Authentication Errors
```json
{
  "success": false,
  "message": "Access token required"
}
```

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

```json
{
  "success": false,
  "message": "User not found or inactive"
}
```

#### Validation Errors
```json
{
  "success": false,
  "message": "Username and password are required"
}
```

```json
{
  "success": false,
  "message": "Username already exists"
}
```

```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

#### Permission Errors
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

```json
{
  "success": false,
  "message": "Access denied to this user"
}
```

#### Market Errors
```json
{
  "success": false,
  "message": "Market not found"
}
```

```json
{
  "success": false,
  "message": "Market name already exists"
}
```

#### Transfer Errors
```json
{
  "success": false,
  "message": "Insufficient balance"
}
```

```json
{
  "success": false,
  "message": "Transfer not found"
}
```

## 🚦 Rate Limiting

The API implements rate limiting for security:

**Rate Limits:**
- Authentication endpoints: 5 requests per minute
- User management endpoints: 100 requests per minute
- Market endpoints: 60 requests per minute
- Transfer endpoints: 30 requests per minute
- General endpoints: 100 requests per minute

**Rate Limit Response:**
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```

## 🧪 Testing Examples

### Complete Authentication Flow

#### 1. Login as Superadmin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "smasher",
    "password": "123456"
  }'
```

#### 2. Create Admin User
```bash
# Use token from previous response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:5000/api/auth/register/admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testadmin",
    "password": "adminpass123",
    "balance": 100000,
    "parentId": "507f1f77bcf86cd799439012"
  }'
```

#### 3. Create Market
```bash
curl -X POST http://localhost:5000/api/markets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "marketName": "Test Market",
    "openTime": "2024-01-01T09:00:00.000Z",
    "closeTime": "2024-01-01T12:00:00.000Z"
  }'
```

#### 4. Create Transfer
```bash
curl -X POST http://localhost:5000/api/transfers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toUserId": "507f1f77bcf86cd799439012",
    "amount": 1000,
    "description": "Test transfer"
  }'
```

### JavaScript/Node.js Examples

#### Using Fetch API
```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.data.token;

// Get users
const usersResponse = await fetch('http://localhost:5000/api/auth/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const usersData = await usersResponse.json();
console.log(usersData.data.users);

// Create market
const marketResponse = await fetch('http://localhost:5000/api/markets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    marketName: 'New Market',
    openTime: '2024-01-01T09:00:00.000Z',
    closeTime: '2024-01-01T12:00:00.000Z'
  })
});

const marketData = await marketResponse.json();
console.log(marketData.data.market);
```

#### Using Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Login
const loginResponse = await api.post('/auth/login', {
  username: 'admin',
  password: 'admin123'
});

const token = loginResponse.data.data.token;

// Set token for subsequent requests
api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

// Get users
const usersResponse = await api.get('/auth/users');
console.log(usersResponse.data.data.users);

// Create transfer
const transferResponse = await api.post('/transfers', {
  toUserId: '507f1f77bcf86cd799439012',
  amount: 1000,
  description: 'Payment'
});

console.log(transferResponse.data.data.transfer);
```

### Python Examples

#### Using requests
```python
import requests
import json

# Login
login_data = {
    "username": "admin",
    "password": "admin123"
}

response = requests.post(
    "http://localhost:5000/api/auth/login",
    headers={"Content-Type": "application/json"},
    data=json.dumps(login_data)
)

login_response = response.json()
token = login_response["data"]["token"]

# Get markets
headers = {"Authorization": f"Bearer {token}"}
markets_response = requests.get(
    "http://localhost:5000/api/markets",
    headers=headers
)

markets_data = markets_response.json()
print(markets_data["data"]["markets"])

# Create transfer
transfer_data = {
    "toUserId": "507f1f77bcf86cd799439012",
    "amount": 1000,
    "description": "Payment"
}

transfer_response = requests.post(
    "http://localhost:5000/api/transfers",
    headers=headers,
    data=json.dumps(transfer_data)
)

transfer_result = transfer_response.json()
print(transfer_result["data"]["transfer"])
```

## 📊 Response Data Types

### User Object
```typescript
interface User {
  _id: string;
  username: string;
  balance: number;
  role: 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player';
  parentId?: {
    _id: string;
    username: string;
    role: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Market Object
```typescript
interface Market {
  _id: string;
  marketName: string;
  openTime: string;
  closeTime: string;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Transfer Object
```typescript
interface Transfer {
  _id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

### API Response
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
```

### Pagination Info
```typescript
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

## 🔒 Security Considerations

### JWT Token Security
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Tokens are stored in HTTP-only cookies
- Token blacklisting for logout
- Never expose tokens in URLs
- Use HTTPS in production

### Input Validation
- All inputs are validated server-side
- Username: 3-30 characters, unique
- Password: Minimum 6 characters
- Balance: Non-negative numbers
- Market names: Unique, required
- Transfer amounts: Positive numbers

### Role-Based Access Control
- Each endpoint validates user permissions
- Hierarchical data access control
- Market assignment validation
- Transfer approval workflow
- Cascade delete protection

### Rate Limiting
- Prevents brute force attacks
- Protects against DDoS
- Configurable limits per endpoint
- IP-based rate limiting

## 📈 Performance Optimization

### Database Indexes
```javascript
// User indexes
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "parentId": 1, "role": 1 })
db.users.createIndex({ "role": 1, "isActive": 1 })

// Market indexes
db.markets.createIndex({ "marketName": 1 }, { unique: true })
db.markets.createIndex({ "isActive": 1 })

// Transfer indexes
db.transfers.createIndex({ "fromUserId": 1, "status": 1 })
db.transfers.createIndex({ "toUserId": 1, "status": 1 })
db.transfers.createIndex({ "createdAt": -1 })
```

### Caching Strategy
- User profile caching
- Market list caching
- Transfer history pagination
- Static asset caching

### Response Optimization
- Pagination for large datasets
- Selective field projection
- Efficient database queries
- Compressed responses

---

**Last Updated**: January 2024
**Version**: 2.0.0
**Compatibility**: Node.js 18+, MongoDB 6.0+, Express 4.x 