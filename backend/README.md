# Matka SK Backend API Documentation

A production-level Node.js/Express backend with role-based authentication, hierarchical data access control, and comprehensive API versioning.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Configuration](#environment-configuration)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Security Features](#security-features)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture Overview

### System Design
The backend implements a production-level hierarchical role-based access control (RBAC) system with API versioning:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   MongoDB       │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   API v1        │
                       │   Controllers   │
                       │   Middleware    │
                       │   Validators    │
                       └─────────────────┘
```

### Role Hierarchy
```
Superadmin (Level 0)
├── Admin (Level 1)
│   ├── Distributor (Level 2)
│   │   └── Agent (Level 3)
│   │       └── Player (Level 4)
│   └── Distributor (Level 2)
│       └── Agent (Level 3)
│           └── Player (Level 4)
└── Admin (Level 1)
    └── Distributor (Level 2)
        └── Agent (Level 3)
            └── Player (Level 4)
```

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Logging**: Winston
- **CORS**: Express CORS middleware
- **Rate Limiting**: express-rate-limit
- **Language**: TypeScript
- **Package Manager**: npm

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── config/
│   │   ├── index.ts           # Main configuration
│   │   ├── database.ts        # Database connection
│   │   └── logger.ts          # Winston logger setup
│   ├── api/
│   │   └── v1/
│   │       ├── routes/        # API route definitions
│   │       │   ├── index.ts   # Main router
│   │       │   ├── auth.routes.ts
│   │       │   ├── users.routes.ts
│   │       │   ├── markets.routes.ts
│   │       │   ├── transfers.routes.ts
│   │       │   ├── activities.routes.ts
│   │       │   └── player.routes.ts
│   │       ├── controllers/   # Business logic handlers
│   │       │   ├── auth.controller.ts
│   │       │   ├── users.controller.ts
│   │       │   ├── markets.controller.ts
│   │       │   ├── transfers.controller.ts
│   │       │   ├── activities.controller.ts
│   │       │   └── player.controller.ts
│   │       ├── middlewares/   # Custom middleware
│   │       │   ├── auth.middleware.ts
│   │       │   ├── rateLimiter.middleware.ts
│   │       │   ├── validation.middleware.ts
│   │       │   ├── errorHandler.middleware.ts
│   │       │   └── playerAuth.middleware.ts
│   │       ├── validators/    # Request validation
│   │       │   ├── auth.validator.ts
│   │       │   ├── users.validator.ts
│   │       │   ├── markets.validator.ts
│   │       │   ├── transfers.validator.ts
│   │       │   └── player.validator.ts
│   │       └── types/         # TypeScript definitions
│   │           └── common.types.ts
│   ├── models/                # Database models
│   │   ├── User.ts
│   │   ├── Market.ts
│   │   ├── Transfer.ts
│   │   ├── Activity.ts
│   │   ├── UserMarketAssignment.ts
│   │   ├── UserHierarchy.ts
│   │   └── TokenBlacklist.ts
│   ├── utils/
│   │   ├── jwt.ts             # JWT utilities
│   │   └── utils.ts           # General utilities
│   └── services/              # Business logic services
├── scripts/
│   ├── createAdmin.ts         # Admin user creation script
│   ├── seedData.ts            # Database seeding script
│   └── fixDatabase.ts         # Database repair script
├── docs/                      # Additional documentation
├── package.json
├── tsconfig.json
├── eslint.config.mjs
└── .env.example
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher)
- npm or yarn

### Installation Steps

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables** (see Environment Configuration section)

5. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

6. **Seed the database**
   ```bash
   npm run seed
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

### Available Scripts

```json
{
  "dev": "nodemon --legacy-watch src/server.ts",
  "create-admin": "ts-node scripts/createAdmin.ts",
  "seed": "ts-node scripts/seedData.ts",
  "fix-db": "ts-node scripts/fixDatabase.ts",
  "lint": "eslint .",
  "lint:fix": "eslint --fix ."
}
```

## ⚙️ Environment Configuration

Create a `.env` file in the backend root directory:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/matka-sk

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
ACCESS_TOKEN_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Cookie Configuration
COOKIE_DOMAIN=localhost

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX_REQUESTS=5

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/matka-sk` | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | - | Yes |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token expiration | `1h` | No |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration | `7d` | No |
| `PORT` | Server port | `5000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | No |
| `LOG_LEVEL` | Winston log level | `info` | No |

## 🗄️ Database Schema

### User Model

```typescript
interface IUser {
  username: string;           // Unique username
  email?: string;            // Optional email
  password: string;           // Hashed password
  balance: number;            // User balance
  role: 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player';
  parentId?: ObjectId;        // Reference to parent user
  isActive: boolean;          // Account status
  loginSource: string;        // Login source tracking
  lastLogin: Date;            // Last login timestamp
  createdAt: Date;            // Account creation date
  updatedAt: Date;            // Last update date
}
```

### Market Model

```typescript
interface IMarket {
  name: string;               // Market name
  status: 'open' | 'closed' | 'suspended';
  isActive: boolean;          // Market status
  createdAt: Date;            // Creation date
  updatedAt: Date;            // Last update date
}
```

### UserMarketAssignment Model

```typescript
interface IUserMarketAssignment {
  assignedBy: ObjectId;       // Who assigned
  assignedTo: ObjectId;       // Who received
  marketId: ObjectId;         // Which market
  assignedAt: Date;           // Assignment date
  isActive: boolean;          // Assignment status
  hierarchyLevel: 'admin' | 'distributor' | 'agent' | 'player';
  parentAssignment?: ObjectId; // Reference to parent assignment
}
```

### Database Indexes

```typescript
// User indexes
userSchema.index({ parentId: 1, role: 1 });
userSchema.index({ role: 1 });
userSchema.index({ email: 1 });

// Market indexes
marketSchema.index({ name: 1 }); // Unique
marketSchema.index({ status: 1 });

// Assignment indexes
assignmentSchema.index({ assignedTo: 1, isActive: 1 });
assignmentSchema.index({ marketId: 1, isActive: 1 });
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### API Versioning
All endpoints are versioned with `/api/v1/` prefix for future compatibility.

### Authentication Endpoints

#### POST /auth/login
Authenticate user and return JWT tokens.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "string",
      "username": "string",
      "email": "string",
      "balance": 1000,
      "role": "admin",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-access-token"
  }
}
```

#### POST /auth/logout
Logout user and blacklist token.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "player"
}
```

#### GET /auth/profile
Get current user's profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

#### PUT /auth/profile
Update current user's profile.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "email": "string",
  "currentPassword": "string",
  "newPassword": "string"
}
```

### User Management Endpoints

#### GET /users
Get all accessible users based on role hierarchy.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by username or email
- `role` (string): Filter by role

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "_id": "string",
      "username": "string",
      "email": "string",
      "balance": 1000,
      "role": "player",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### GET /users/:userId
Get specific user by ID (with access control).

#### PUT /users/:userId
Update specific user (with access control).

#### DELETE /users/:userId
Delete user and downline (with access control).

#### PUT /users/:userId/active
Toggle user active status.

#### PUT /users/:userId/password
Update user password.

### User Creation Endpoints

#### POST /users/create
Create new user (generic).

#### POST /users/create/admin
Create admin user (Superadmin only).

#### POST /users/create/distributor
Create distributor user (Admin only).

#### POST /users/create/agent
Create agent user (Distributor only).

#### POST /users/create/player
Create player user (Agent only).

### Market Assignment Endpoints

#### GET /users/:userId/available-markets
Get available markets for assignment.

#### POST /users/:userId/assign-markets
Assign markets to user.

**Request Body:**
```json
{
  "marketIds": ["marketId1", "marketId2"]
}
```

#### GET /users/:userId/assigned-markets
Get user's assigned markets.

#### POST /users/:userId/remove-markets
Remove market assignments.

### Market Management Endpoints

#### GET /markets
Get all markets.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

#### GET /markets/:id
Get market by ID.

#### POST /markets
Create new market (Admin/Superadmin only).

**Request Body:**
```json
{
  "name": "string",
  "status": "open"
}
```

#### PUT /markets/:id
Update market (Admin/Superadmin only).

#### DELETE /markets/:id
Delete market (Admin/Superadmin only).

#### PUT /markets/:id/status
Update market status.

### Transfer Endpoints

#### GET /transfers/children
Get child users for transfers.

#### POST /transfers/process
Process balance transfer.

**Request Body:**
```json
{
  "toUserId": "string",
  "amount": 100,
  "description": "string"
}
```

#### GET /transfers/history
Get transfer history.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `type` (string): 'sent', 'received', or 'all'

#### GET /transfers/stats
Get transfer statistics.

### Activity Endpoints

#### GET /activities
Get all activities.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `user` (string): Filter by user ID
- `action` (string): Filter by action

#### GET /activities/:id
Get activity by ID.

#### GET /activities/user/:userId
Get user activities.

### Player Endpoints

#### GET /player/profile
Get player profile (Player authentication required).

#### PUT /player/profile
Update player profile.

#### GET /player/assigned-markets
Get player's assigned markets.

#### POST /player/confirm-bid
Confirm bid placement.

**Request Body:**
```json
{
  "marketId": "string",
  "gameType": "single",
  "numbers": [123, 456],
  "amount": 100
}
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "username",
      "message": "Username is required"
    }
  ]
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (Duplicate Entry)
- `429` - Too Many Requests (Rate Limited)
- `500` - Internal Server Error

## 🔐 Authentication & Authorization

### JWT Token Structure

```typescript
interface JWTPayload {
  userId: string;
  role: string;
  iat: number;
  exp: number;
}
```

### Role-Based Access Control

#### Role Hierarchy Rules
1. **Superadmin**: Can access all users and create admins
2. **Admin**: Can access distributors, agents, and players under them
3. **Distributor**: Can access agents and players under them
4. **Agent**: Can access players under them
5. **Player**: Can only access their own data

#### Data Access Implementation
```typescript
// Middleware determines accessible user IDs
const accessibleUserIds = await getAccessibleUserIds(req.user.role, req.user._id);
```

### Token Management

- **Access Token Expiration**: 1 hour (configurable)
- **Refresh Token Expiration**: 7 days (configurable)
- **Token Blacklisting**: Implemented for secure logout
- **Storage**: Client-side (localStorage/sessionStorage)
- **Security**: HTTPS required in production

## 🔧 Middleware

### Authentication Middleware

#### `authenticateToken`
- Validates JWT access token
- Checks token blacklist
- Verifies user existence and active status
- Adds user data to request object

#### `requireRole`
- Validates user has required role(s)
- Used for role-specific endpoints
- Implements role hierarchy validation



### Rate Limiting Middleware

#### `loginLimiter`
- Limits login attempts to 5 per 15 minutes
- Prevents brute force attacks

#### `apiLimiter`
- Limits general API requests to 100 per 15 minutes
- Prevents API abuse

#### `transferLimiter`
- Limits transfer requests to 10 per minute
- Prevents rapid transfer abuse

### Validation Middleware

#### `validateRequest`
- Validates request data using express-validator
- Returns consistent error responses
- Logs validation errors

#### `sanitizeInput`
- Sanitizes input data
- Removes malicious content
- Trims whitespace

### Error Handling Middleware

#### `handleError`
- Catches all unhandled errors
- Returns consistent error format
- Logs errors with context
- Hides sensitive data in production

#### `handleNotFound`
- Handles 404 errors
- Returns consistent not found response

### Player Authentication Middleware

#### `authenticatePlayer`
- Validates player-specific authentication
- Ensures user has player role
- Used for player-only endpoints

## 🛡️ Security Features

### Password Security
- **Hashing**: bcrypt with salt rounds (12)
- **Validation**: Minimum 6 characters, complexity requirements
- **Comparison**: Secure timing attack prevention

### JWT Security
- **Access Token**: Short expiration (1 hour)
- **Refresh Token**: Longer expiration (7 days)
- **Blacklisting**: Secure logout implementation
- **Payload**: Minimal user data

### Input Validation
- **Username**: 3-50 characters, alphanumeric + underscore
- **Email**: Valid email format, optional
- **Password**: Minimum 6 characters, complexity requirements
- **Amount**: Positive numbers only
- **Market Names**: 2-100 characters

### CORS Protection
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

### Rate Limiting
- **Login**: 5 attempts per 15 minutes
- **API**: 100 requests per 15 minutes
- **Transfers**: 10 requests per minute
- **Custom handlers**: Detailed error messages

### Request Logging
- **IP Address**: Logged for security
- **User Agent**: Tracked for analytics
- **Timestamp**: ISO format
- **Method & Path**: Request details

## 🔄 Development Workflow

### Code Style
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier (recommended)
- **Type Safety**: Strict TypeScript configuration

### API Structure
- **Versioning**: `/api/v1/` prefix
- **Controllers**: Class-based architecture
- **Services**: Business logic separation
- **Validators**: Request validation
- **Types**: TypeScript interfaces

### Development Commands
```bash
# Start development server with hot reload
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Create admin user
npm run create-admin

# Seed database
npm run seed

# Fix database issues
npm run fix-db
```

## 🧪 Testing

### Manual Testing

#### Test Users (after seeding)
| Role | Username | Password | Permissions |
|------|----------|----------|-------------|
| Superadmin | `superadmin` | `superadmin123` | Full access |
| Admin | `admin` | `admin123` | Admin level |
| Distributor | `distributor1` | `dist123` | Distributor level |
| Agent | `agent1` | `agent123` | Agent level |
| Player | `player1` | `player123` | Player level |

#### API Testing Tools
- **Postman**: API testing
- **Insomnia**: Alternative API client
- **curl**: Command line testing

### Health Check
```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "version": "1.0.0"
}
```

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
FRONTEND_URL=https://your-frontend-domain.com
PORT=5000
```

### Deployment Steps

1. **Set production environment variables**

2. **Install dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### PM2 Deployment
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔧 Troubleshooting

### Common Issues

#### MongoDB Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

#### JWT Token Issues
- Verify `JWT_SECRET` is set
- Check token expiration
- Validate token format
- Check token blacklist

#### CORS Issues
- Verify `FRONTEND_URL` is correct
- Check browser console for CORS errors
- Ensure credentials are included in requests

#### Rate Limiting Issues
- Check rate limit headers in response
- Wait for rate limit window to reset
- Implement exponential backoff

#### TypeScript Compilation Issues
- Check for missing dependencies
- Verify TypeScript configuration
- Ensure proper type definitions

### Debug Mode
```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev
```

### Database Debugging
```bash
# Connect to MongoDB shell
mongosh matka-sk

# Check user collection
db.users.find().pretty()

# Check market assignments
db.usermarketassignments.find().pretty()
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:5000/health

# Test authentication
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 📞 Support

For issues and questions:
1. Check this documentation
2. Review error logs
3. Verify environment configuration
4. Test with provided demo credentials
5. Check API health endpoint

## 📄 License

This project is licensed under the ISC License. 