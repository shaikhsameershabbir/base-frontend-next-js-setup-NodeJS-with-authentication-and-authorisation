# MK Matka Booking - Developer Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Authentication & Authorization](#authentication--authorization)
9. [Development Workflow](#development-workflow)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**MK Matka Booking** is a comprehensive matka (gambling) management system with three main components:

- **Admin Panel** - Management interface for administrators
- **Backend API** - RESTful API server with authentication and business logic
- **Website** - Player-facing application for betting and game management

### Key Features
- Multi-level user hierarchy (Superadmin → Admin → Distributor → Agent → Player)
- Market management with time-based operations
- Real-time balance transfers and transactions
- Comprehensive analytics and reporting
- Secure authentication with JWT tokens
- Responsive design for mobile and desktop

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │  Backend API    │    │    Website      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (Next.js)     │
│   Port: 3001    │    │   Port: 5000    │    │   Port: 3000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   Database      │
                       └─────────────────┘
```

### User Hierarchy
```
Superadmin
    └── Admin
        └── Distributor
            └── Agent
                └── Player
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs, helmet, cors
- **Validation**: express-validator
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit

### Admin Panel
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Context API

### Website
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Geist UI
- **Icons**: Lucide React, React Icons
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Animations**: Framer Motion

---

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── api/v1/
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Custom middleware
│   │   ├── routes/          # API route definitions
│   │   ├── types/           # TypeScript interfaces
│   │   └── validators/      # Request validation
│   ├── config/              # Configuration files
│   ├── controllers/         # Business logic controllers
│   ├── middlewares/         # Global middleware
│   ├── models/              # MongoDB schemas
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── scripts/                 # Database scripts
├── logs/                    # Application logs
└── docker/                  # Docker configuration
```

### Admin Panel Structure
```
admin/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (routes)/        # Route groups
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── users/           # User management
│   │   ├── markets/         # Market management
│   │   ├── analytics/       # Analytics pages
│   │   ├── settings/        # Settings pages
│   │   └── login/           # Authentication
│   ├── components/          # Reusable components
│   ├── hooks/               # Custom React hooks
│   └── lib/                 # Utility libraries
```

### Website Structure
```
webSite/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (routes)/        # Protected routes
│   │   ├── login/           # Public login page
│   │   ├── home/            # Home page
│   │   ├── games/           # Game pages
│   │   ├── charts/          # Chart pages
│   │   └── components/      # Shared components
│   ├── contexts/            # React contexts
│   ├── hooks/               # Custom hooks
│   └── lib/                 # API clients
├── public/                  # Static assets
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Configure .env with your MongoDB URI and JWT secret
npm run dev
```

### Admin Panel Setup
```bash
cd admin
npm install
cp env.example .env
# Configure .env with backend API URL
npm run dev
```

### Website Setup
```bash
cd webSite
npm install
cp env.example .env
# Configure .env with backend API URL
npm run dev
```

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/matka_booking
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### Admin Panel (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

#### Website (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 🗄️ Database Schema

### User Model
```typescript
interface IUser {
    username: string;           // Unique username
    password: string;           // Hashed password
    balance: number;            // Current balance
    role: 'superadmin' | 'admin' | 'distributor' | 'agent' | 'player';
    parentId?: ObjectId;        // Reference to parent user
    isActive: boolean;          // Account status
    loginSource: string;        // Login platform
    lastLogin: Date;            // Last login timestamp
    createdAt: Date;
    updatedAt: Date;
}
```

### Market Model
```typescript
interface IMarket {
    marketName: string;         // Market name
    openTime: string;           // Opening time
    closeTime: string;          // Closing time
    isActive: boolean;          // Market status
    createdAt: Date;
    updatedAt: Date;
}
```

### Transfer Model
```typescript
interface ITransfer {
    fromUser: ObjectId;         // Sender user
    toUser: ObjectId;           // Receiver user
    amount: number;             // Transfer amount
    type: 'credit' | 'debit';   // Transfer type
    status: 'pending' | 'completed' | 'failed';
    reason: string;             // Transfer reason
    adminNote?: string;         // Admin notes
    processedBy: ObjectId;      // Admin who processed
    fromUserBalanceBefore: number;
    fromUserBalanceAfter: number;
    toUserBalanceBefore: number;
    toUserBalanceAfter: number;
    createdAt: Date;
    updatedAt: Date;
}
```

### Market Assignment Model
```typescript
interface IMarketAssignment {
    assignedBy: ObjectId;       // Who assigned
    assignedTo: ObjectId;       // Assigned to user
    marketId: ObjectId;         // Market reference
    hierarchyLevel: string;     // Hierarchy level
    parentAssignment?: ObjectId; // Parent assignment
    isActive: boolean;          // Assignment status
    createdAt: Date;
    updatedAt: Date;
}
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### POST /api/v1/auth/login
Login user with username and password
```json
{
    "username": "user123",
    "password": "password123",
    "loginSource": "web"
}
```

#### POST /api/v1/auth/logout
Logout user and invalidate tokens

#### GET /api/v1/auth/profile
Get current user profile

#### PUT /api/v1/auth/profile
Update user profile

### User Management Endpoints

#### GET /api/v1/users
Get all users (admin only)

#### POST /api/v1/users
Create new user

#### GET /api/v1/users/:id
Get user by ID

#### PUT /api/v1/users/:id
Update user

#### DELETE /api/v1/users/:id
Delete user

### Market Management Endpoints

#### GET /api/v1/markets
Get all markets

#### POST /api/v1/markets
Create new market

#### GET /api/v1/markets/:id
Get market by ID

#### PUT /api/v1/markets/:id
Update market

#### DELETE /api/v1/markets/:id
Delete market

### Transfer Endpoints

#### GET /api/v1/transfers
Get all transfers

#### POST /api/v1/transfers
Create new transfer

#### PUT /api/v1/transfers/:id/approve
Approve transfer

#### PUT /api/v1/transfers/:id/reject
Reject transfer

### Player Endpoints

#### GET /api/v1/player/profile
Get player profile

#### PUT /api/v1/player/profile
Update player profile

#### GET /api/v1/player/assigned-markets
Get player's assigned markets

#### POST /api/v1/player/confirm-bid
Confirm player bid

---

## 🔐 Authentication & Authorization

### JWT Token System
- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Token Blacklisting**: Invalidated tokens stored in database

### Role-Based Access Control
```typescript
enum UserRole {
    SUPERADMIN = 'superadmin',
    ADMIN = 'admin',
    DISTRIBUTOR = 'distributor',
    AGENT = 'agent',
    PLAYER = 'player'
}
```

### Permission Hierarchy
- **Superadmin**: Full system access
- **Admin**: User management, market management
- **Distributor**: Agent management, balance transfers
- **Agent**: Player management, basic operations
- **Player**: Game access, personal data

### Middleware Chain
1. **Rate Limiting**: Prevent abuse
2. **Authentication**: Verify JWT tokens
3. **Authorization**: Check user permissions
4. **Validation**: Validate request data
5. **Business Logic**: Process request

---

## 🔄 Development Workflow

### Code Organization

#### Backend
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic implementation
- **Models**: Database schema definitions
- **Middlewares**: Request processing pipeline
- **Validators**: Input validation rules

#### Frontend (Admin & Website)
- **Components**: Reusable UI components
- **Contexts**: Global state management
- **Hooks**: Custom React hooks
- **Pages**: Route-specific components
- **Utils**: Helper functions

### State Management

#### Admin Panel
- **AuthContext**: User authentication state
- **MarketsContext**: Market data management
- **UsersContext**: User management state

#### Website
- **AuthContext**: Player authentication
- **MarketsContext**: Market assignments
- **GameContext**: Game state management

### API Integration
```typescript
// Example API client usage
const { login, state } = useAuthContext();
const success = await login(username, password);
```

### Error Handling
- **Backend**: Centralized error middleware
- **Frontend**: Context-based error states
- **Validation**: Client and server-side validation

---

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://production-db:27017/matka_booking
JWT_SECRET=production_jwt_secret
JWT_REFRESH_SECRET=production_refresh_secret
```

### Docker Deployment
```bash
# Build images
docker build -t matka-backend ./backend
docker build -t matka-admin ./admin
docker build -t matka-website ./webSite

# Run containers
docker run -p 5000:5000 matka-backend
docker run -p 3001:3000 matka-admin
docker run -p 3000:3000 matka-website
```

### Environment Setup
1. **Database**: MongoDB cluster setup
2. **Backend**: Node.js server deployment
3. **Frontend**: Next.js static export or SSR
4. **Reverse Proxy**: Nginx for load balancing
5. **SSL**: HTTPS certificate configuration

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
1. **MongoDB Connection**: Check connection string and network
2. **JWT Errors**: Verify secret keys and token expiration
3. **CORS Errors**: Check allowed origins configuration
4. **Rate Limiting**: Monitor request frequency

#### Frontend Issues
1. **API Connection**: Verify API URL configuration
2. **Authentication**: Check token storage and refresh
3. **State Management**: Verify context providers
4. **Build Errors**: Check TypeScript and dependency issues

### Debug Commands
```bash
# Backend debugging
npm run dev          # Development mode with hot reload
npm run lint         # Code linting
npm run test:player-login  # Test player authentication

# Frontend debugging
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
```

### Logs
- **Backend**: Check `logs/` directory
- **Frontend**: Browser developer tools
- **Database**: MongoDB logs

### Performance Monitoring
- **API Response Times**: Monitor endpoint performance
- **Database Queries**: Optimize slow queries
- **Frontend Loading**: Bundle size optimization
- **Memory Usage**: Monitor application memory

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Development Tools
- **VS Code Extensions**: TypeScript, ESLint, Prettier
- **API Testing**: Postman, Insomnia
- **Database GUI**: MongoDB Compass
- **Version Control**: Git with conventional commits

### Best Practices
- **Code Style**: ESLint + Prettier configuration
- **Git Workflow**: Feature branches with PR reviews
- **Testing**: Unit tests for critical functions
- **Security**: Regular dependency updates
- **Performance**: Code splitting and optimization

---

## 📞 Support

For technical support or questions:
- **Backend Issues**: Check logs and API documentation
- **Frontend Issues**: Browser console and React DevTools
- **Database Issues**: MongoDB Compass and query optimization
- **Deployment Issues**: Environment configuration and Docker logs

---

*Last Updated: July 2024*
*Version: 1.0.0* 