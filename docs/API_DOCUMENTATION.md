# Matka SK API Documentation

Complete API reference for the Matka SK backend system with role-based authentication and hierarchical data access control.

## 📋 Table of Contents

- [Base URL & Authentication](#base-url--authentication)
- [Authentication Endpoints](#authentication-endpoints)
- [User Management Endpoints](#user-management-endpoints)
- [Role-Specific Endpoints](#role-specific-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Testing Examples](#testing-examples)

## 🌐 Base URL & Authentication

### Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### POST /auth/register

Register a new user (requires authentication and proper role permissions).

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "balance": 0,
  "role": "player",
  "parentId": "507f1f77bcf86cd799439011"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439013",
      "username": "newuser",
      "balance": 0,
      "role": "player",
      "parentId": "507f1f77bcf86cd799439011",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Username already exists"
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

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "username": "player1",
        "balance": 1000,
        "role": "player",
        "parentId": {
          "_id": "507f1f77bcf86cd799439011",
          "username": "distributor1",
          "role": "distributor"
        },
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/auth/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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

**Error Response (403):**
```json
{
  "success": false,
  "message": "Access denied to this user"
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3001/api/auth/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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

**cURL Example:**
```bash
curl -X PUT http://localhost:3001/api/auth/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "username": "updatedusername",
    "balance": 75000,
    "isActive": true
  }'
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

**Error Response (403):**
```json
{
  "success": false,
  "message": "Insufficient permissions"
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

### POST /auth/register/player

Create player user (Distributor only).

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
  "parentId": "507f1f77bcf86cd799439013"
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

#### Role Hierarchy Errors
```json
{
  "success": false,
  "message": "Parent ID is required for non-superadmin roles"
}
```

```json
{
  "success": false,
  "message": "Invalid parent role. admin can only be created under superadmin"
}
```

## 🚦 Rate Limiting

Currently, the API does not implement rate limiting. Consider implementing rate limiting for production use.

**Recommended Rate Limits:**
- Authentication endpoints: 5 requests per minute
- User management endpoints: 100 requests per minute
- Profile endpoints: 60 requests per minute

## 🧪 Testing Examples

### Complete Authentication Flow

#### 1. Login as Superadmin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "superadmin123"
  }'
```

#### 2. Create Admin User
```bash
# Use token from previous response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3001/api/auth/register/admin \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testadmin",
    "password": "adminpass123",
    "balance": 100000,
    "parentId": "507f1f77bcf86cd799439012"
  }'
```

#### 3. Get All Users
```bash
curl -X GET http://localhost:3001/api/auth/users \
  -H "Authorization: Bearer $TOKEN"
```

### Testing with Different Roles

#### Login as Admin
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

#### Login as Distributor
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "distributor1",
    "password": "dist123"
  }'
```

#### Login as Player
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "password": "player123"
  }'
```

### JavaScript/Node.js Examples

#### Using Fetch API
```javascript
// Login
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
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
const usersResponse = await fetch('http://localhost:3001/api/auth/users', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const usersData = await usersResponse.json();
console.log(usersData.data.users);
```

#### Using Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api'
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
    "http://localhost:3001/api/auth/login",
    headers={"Content-Type": "application/json"},
    data=json.dumps(login_data)
)

login_response = response.json()
token = login_response["data"]["token"]

# Get users
headers = {"Authorization": f"Bearer {token}"}
users_response = requests.get(
    "http://localhost:3001/api/auth/users",
    headers=headers
)

users_data = users_response.json()
print(users_data["data"]["users"])
```

## 📊 Response Data Types

### User Object
```typescript
interface User {
  _id: string;
  username: string;
  balance: number;
  role: 'superadmin' | 'admin' | 'distributor' | 'player';
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

### API Response
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
```

### Login Response
```typescript
interface LoginResponse {
  user: User;
  token: string;
}
```

## 🔒 Security Considerations

### JWT Token Security
- Tokens expire after 24 hours
- Store tokens securely (localStorage for web apps)
- Never expose tokens in URLs
- Use HTTPS in production

### Input Validation
- All inputs are validated server-side
- Username: 3-30 characters, unique
- Password: Minimum 6 characters
- Balance: Non-negative numbers

### Role-Based Access Control
- Each endpoint validates user permissions
- Data access is restricted by role hierarchy
- Parent-child relationships are enforced

## 📞 Support

For API support:
1. Check this documentation
2. Verify your request format
3. Check authentication token
4. Review error messages
5. Test with provided examples

## 📄 License

This API documentation is part of the Matka SK project and is licensed under the ISC License. 