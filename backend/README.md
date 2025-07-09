# Matka SK Backend API Documentation

A comprehensive Node.js/Express backend with role-based authentication and hierarchical data access control.

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
The backend implements a hierarchical role-based access control (RBAC) system with the following architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   MongoDB       │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   JWT Auth      │
                       │   Middleware    │
                       └─────────────────┘
```

### Role Hierarchy
```
Superadmin (Level 0)
├── Admin (Level 1)
│   ├── Distributor (Level 2)
│   │   └── Player (Level 3)
│   └── Distributor (Level 2)
│       └── Player (Level 3)
└── Admin (Level 1)
    └── Distributor (Level 2)
        └── Player (Level 3)
```

## 🛠️ Technology Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Built-in Express validation
- **Logging**: Winston
- **CORS**: Express CORS middleware
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
│   ├── controllers/
│   │   └── authController.ts  # Authentication & user management
│   ├── middlewares/
│   │   ├── auth.ts            # JWT authentication & role middleware
│   │   └── globalErrorHandler.ts # Global error handling
│   ├── models/
│   │   └── User.ts            # User schema & model
│   ├── routes/
│   │   └── authRoutes.ts      # API route definitions
│   ├── utils/
│   │   ├── jwt.ts             # JWT utilities
│   │   └── utils.ts           # General utilities
│   └── types/                 # TypeScript type definitions
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
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Logging Configuration
LOG_LEVEL=info
```

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/matka-sk` | Yes |
| `JWT_SECRET` | Secret key for JWT signing | - | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration time | `24h` | No |
| `PORT` | Server port | `3001` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | No |
| `LOG_LEVEL` | Winston log level | `info` | No |

## 🗄️ Database Schema

### User Model

```typescript
interface IUser {
  username: string;           // Unique username
  password: string;           // Hashed password
  balance: number;            // User balance
  role: 'superadmin' | 'admin' | 'distributor' | 'player';
  parentId?: ObjectId;        // Reference to parent user
  isActive: boolean;          // Account status
  createdAt: Date;            // Account creation date
  updatedAt: Date;            // Last update date
}
```

### Database Indexes

```typescript
// Efficient queries for role-based access
userSchema.index({ parentId: 1, role: 1 });
userSchema.index({ role: 1 });
userSchema.index({ username: 1 }); // Unique index
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### POST /auth/login
Authenticate user and return JWT token.

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
      "balance": 1000,
      "role": "admin",
      "parentId": "string",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

#### POST /auth/register
Register a new user (requires authentication and proper role permissions).

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "balance": 0,
  "role": "player",
  "parentId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token-here"
  }
}
```

#### GET /auth/profile
Get current user's profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { /* user object */ }
  }
}
```

#### PUT /auth/profile
Update current user's profile.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "username": "string",
  "balance": 1000
}
```

### User Management Endpoints

#### GET /auth/users
Get all accessible users based on role hierarchy.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "string",
        "username": "string",
        "balance": 1000,
        "role": "player",
        "parentId": {
          "_id": "string",
          "username": "string",
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

#### GET /auth/users/:userId
Get specific user by ID (with access control).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

#### PUT /auth/users/:userId
Update specific user (with access control).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "username": "string",
  "balance": 1000,
  "isActive": true
}
```

### Role-Specific Registration Endpoints

#### POST /auth/register/admin
Create admin user (Superadmin only).

#### POST /auth/register/distributor
Create distributor user (Admin only).

#### POST /auth/register/player
Create player user (Distributor only).

### Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔐 Authentication & Authorization

### JWT Token Structure

```typescript
interface JWTPayload {
  userId: string;
  username: string;
  balance: number;
  role: string;
  parentId?: string;
}
```

### Role-Based Access Control

#### Role Hierarchy Rules
1. **Superadmin**: Can access all users and create admins
2. **Admin**: Can access distributors and players under them
3. **Distributor**: Can access players under them
4. **Player**: Can only access their own data

#### Data Access Implementation
```typescript
// Middleware determines accessible user IDs
const accessibleUserIds = await getAccessibleUserIds(req.user.role, req.user.userId);
```

### Token Management

- **Expiration**: 24 hours (configurable)
- **Refresh**: Not implemented (stateless design)
- **Storage**: Client-side (localStorage)
- **Security**: HTTPS recommended in production

## 🔧 Middleware

### Authentication Middleware

#### `authenticateToken`
- Validates JWT token
- Checks user existence and active status
- Adds user data to request object

#### `requireRole`
- Validates user has required role(s)
- Used for role-specific endpoints

#### `getAccessibleUserIds`
- Determines which users current user can access
- Implements hierarchical data filtering
- Adds accessible user IDs to request object

### Global Error Handler

```typescript
// Catches all unhandled errors
app.use(errorHandler);
```

**Features:**
- Consistent error response format
- Logging of errors
- Development vs production error details

## 🛡️ Security Features

### Password Security
- **Hashing**: bcrypt with salt rounds (10)
- **Validation**: Minimum 6 characters
- **Comparison**: Secure timing attack prevention

### JWT Security
- **Secret**: Environment variable
- **Expiration**: Configurable
- **Payload**: Minimal user data

### Input Validation
- **Username**: 3-30 characters, unique
- **Password**: Minimum 6 characters
- **Balance**: Non-negative numbers
- **Role**: Enum validation

### CORS Protection
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Rate Limiting
*Not implemented - consider adding for production*

## 🔄 Development Workflow

### Code Style
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier (recommended)
- **Type Safety**: Strict TypeScript configuration

### Git Hooks
- **Pre-commit**: Lint staged files
- **Husky**: Git hooks management

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
| Player | `player1` | `player123` | Player level |

#### API Testing Tools
- **Postman**: API testing
- **Insomnia**: Alternative API client
- **curl**: Command line testing

### Automated Testing
*Not implemented - consider adding Jest/Mocha*

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the server**
   ```bash
   npm start
   ```

### Docker Deployment (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### PM2 Deployment
```bash
npm install -g pm2
pm2 start ecosystem.config.js
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

#### CORS Issues
- Verify `FRONTEND_URL` is correct
- Check browser console for CORS errors
- Ensure credentials are included in requests

#### Role Access Issues
- Verify user role in database
- Check parent-child relationships
- Validate role hierarchy

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
```

## 📞 Support

For issues and questions:
1. Check this documentation
2. Review error logs
3. Verify environment configuration
4. Test with provided demo credentials

## 📄 License

This project is licensed under the ISC License. 