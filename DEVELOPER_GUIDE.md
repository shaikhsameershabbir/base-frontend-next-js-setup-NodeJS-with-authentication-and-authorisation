# MK Matka Booking - Developer Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Setup & Installation](#setup--installation)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Game System](#game-system)
9. [Authentication & Authorization](#authentication--authorization)
10. [Development Workflow](#development-workflow)
11. [Deployment](#deployment)
12. [Troubleshooting](#troubleshooting)

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
- **Advanced Betting System** with multiple game types
- **Time-based Betting Restrictions** with IST timezone support
- **Real-time Balance Management** with instant updates
- **Comprehensive Game Validation** (frontend & backend)

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

### Game System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Game UI       │    │   Bet API       │    │   Time Utils    │
│   Components    │◄──►│   Controllers   │◄──►│   (IST Logic)   │
│   (React)       │    │   (Express)     │    │   (Moment.js)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Bet Model     │
                       │   (MongoDB)     │
                       └─────────────────┘
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
- **Time Management**: moment-timezone (Asia/Kolkata)
- **Real-time Updates**: WebSocket support (planned)

### Admin Panel
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Theme**: Dark/Light mode support

### Website
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Geist UI
- **Icons**: Lucide React, React Icons
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Animations**: Framer Motion
- **Notifications**: React Toastify
- **Time Management**: moment-timezone

---

## 📁 Project Structure

### Backend Structure
```
backend/
├── src/
│   ├── api/v1/
│   │   ├── controllers/     # Request handlers
│   │   │   ├── bet.controller.ts      # Bet placement logic
│   │   │   ├── player.controller.ts   # Player operations
│   │   │   ├── auth.controller.ts     # Authentication
│   │   │   ├── markets.controller.ts  # Market management
│   │   │   ├── users.controller.ts    # User management
│   │   │   └── transfers.controller.ts # Transfer operations
│   │   ├── middlewares/     # Custom middleware
│   │   ├── routes/          # API route definitions
│   │   │   ├── bet.routes.ts          # Bet placement routes
│   │   │   ├── player.routes.ts       # Player routes
│   │   │   ├── auth.routes.ts         # Auth routes
│   │   │   └── index.ts               # Route aggregation
│   │   ├── types/           # TypeScript interfaces
│   │   └── validators/      # Request validation
│   │       └── player.validator.ts    # Bet validation rules
│   ├── config/              # Configuration files
│   ├── controllers/         # Business logic controllers
│   ├── middlewares/         # Global middleware
│   ├── models/              # MongoDB schemas
│   │   ├── Bet.ts           # Bet schema with betType & selectedNumbers
│   │   ├── User.ts          # User schema
│   │   ├── Market.ts        # Market schema
│   │   └── Transfer.ts      # Transfer schema
│   ├── services/            # Business logic services
│   ├── utils/               # Utility functions
│   │   └── timeUtils.ts     # IST timezone utilities
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
│   │   ├── (login)/         # Login route group
│   │   ├── dashboard/       # Dashboard pages
│   │   ├── users/           # User management
│   │   │   └── [role]/      # Role-based user views
│   │   │       └── [userid]/ # Individual user management
│   │   ├── markets/         # Market management
│   │   │   └── rank/        # Market ranking
│   │   ├── analytics/       # Analytics pages
│   │   ├── points/          # Points management
│   │   │   └── transfer/    # Transfer operations
│   │   ├── settings/        # Settings pages
│   │   └── profile/         # Profile management
│   ├── components/          # Reusable components
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── layout/          # Layout components
│   │   ├── modals/          # Modal components
│   │   ├── theme/           # Theme components
│   │   ├── transfer/        # Transfer components
│   │   └── ui/              # UI components (shadcn/ui)
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   ├── useDebounce.ts   # Debounce utility
│   │   ├── useMarkets.ts    # Market data hook
│   │   └── useUsers.ts      # User management hook
│   └── lib/                 # Utility libraries
│       ├── api/             # API clients
│       │   └── transfer.ts  # Transfer API
│       ├── api-client.ts    # Base API client
│       ├── api-market.ts    # Market API
│       ├── api-service.ts   # Service API
│       └── utils.ts         # Utility functions
```

### Website Structure
```
webSite/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── (login)/         # Public login page
│   │   ├── (routes)/        # Protected routes
│   │   │   ├── charts/      # Chart pages
│   │   │   │   ├── Jodi/    # Jodi charts
│   │   │   │   └── Panel/   # Panel charts
│   │   │   ├── funds/       # Funds management
│   │   │   ├── gameRate/    # Game rates
│   │   │   ├── games/       # Game pages
│   │   │   │   └── [id]/    # Market-specific games
│   │   │   │       └── [type]/ # Game type components
│   │   │   │           ├── components/ # Game components
│   │   │   │           │   ├── SingleGame.tsx
│   │   │   │           │   ├── JodiGame.tsx
│   │   │   │           │   ├── SinglePanna.tsx
│   │   │   │           │   ├── DoublePanna.tsx
│   │   │   │           │   ├── TriplePanna.tsx
│   │   │   │           │   ├── BaseMotorGame.tsx
│   │   │   │           │   ├── CommonSpDp.tsx
│   │   │   │           │   ├── RedBracket.tsx
│   │   │   │           │   ├── FamilyPanel.tsx
│   │   │   │           │   ├── CyclePanna.tsx
│   │   │   │           │   └── SangamGame.tsx
│   │   │   │           └── page.tsx
│   │   │   ├── home/        # Home page
│   │   │   ├── myBids/      # Bet history
│   │   │   └── passbook/    # Transaction history
│   │   ├── components/      # Shared components
│   │   │   ├── AuthGuard.tsx # Route protection
│   │   │   ├── BidsCard.tsx # Bet display
│   │   │   ├── BottomNav.tsx # Mobile navigation
│   │   │   ├── Header.tsx   # Page header
│   │   │   ├── MarketCard.tsx # Market display
│   │   │   ├── Message.tsx  # Message component
│   │   │   ├── Sidebar.tsx  # Sidebar navigation
│   │   │   ├── SplashScreen.tsx # Loading screen
│   │   │   └── ui/          # UI components
│   │   ├── constant/        # Constants
│   │   │   ├── constant.ts  # Game constants
│   │   │   └── pagination.tsx # Pagination component
│   │   ├── contexts/        # React contexts
│   │   │   ├── AuthContext.tsx # Authentication context
│   │   │   └── MarketsContext.tsx # Market context
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # API clients
│   │       ├── api/         # API modules
│   │       │   ├── auth.ts  # Authentication API
│   │       │   └── bet.ts   # Betting API
│   │       ├── api-client.ts # Base API client
│   │       └── utils.ts     # Utility functions
├── public/                  # Static assets
│   └── Game/               # Game images
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
    openTime: string;           // Opening time (HH:mm format)
    closeTime: string;          // Closing time (HH:mm format)
    isActive: boolean;          // Market status
    createdAt: Date;
    updatedAt: Date;
}
```

### Bet Model (NEW)
```typescript
interface IBet {
    userId: ObjectId;           // User who placed the bet
    marketId: ObjectId;         // Market reference
    gameType: string;           // Game type (single, jodi, panna, etc.)
    betType: 'open' | 'close';  // Bet type (open/close)
    numbers: { [key: string]: number }; // Numbers and amounts
    selectedNumbers: any;       // Specific numbers bet on
    totalAmount: number;        // Total bet amount
    status: 'pending' | 'won' | 'lost' | 'cancelled';
    result?: string;            // Game result
    payout?: number;            // Payout amount
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

### Betting Endpoints (NEW)

#### POST /api/v1/bets/place-bet
Place a new bet
```json
{
    "marketId": "market_id_here",
    "gameType": "single",
    "betType": "open",
    "numbers": {
        "123": 100,
        "456": 200
    },
    "selectedNumbers": ["123", "456"]
}
```

#### GET /api/v1/player/bet-history
Get user's bet history
```json
{
    "bets": [
        {
            "id": "bet_id",
            "marketName": "Market Name",
            "gameType": "single",
            "betType": "open",
            "totalAmount": 300,
            "status": "pending",
            "selectedNumbers": ["123", "456"],
            "createdAt": "2024-01-01T00:00:00Z"
        }
    ]
}
```

#### GET /api/v1/player/bet/:id
Get specific bet details

#### PUT /api/v1/player/bet/:id/cancel
Cancel a bet

#### GET /api/v1/player/bet-stats
Get betting statistics

#### GET /api/v1/player/current-time
Get current IST time

#### GET /api/v1/player/market/:marketId/status
Get market betting status

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

## 🎮 Game System

### Game Types

#### 1. Single Game
- **Description**: Bet on single digits (0-9)
- **API Type**: `single`
- **UI Component**: `SingleGame.tsx`
- **Features**: Amount selection, balance validation, time restrictions

#### 2. Jodi Game
- **Description**: Bet on number pairs (00-99)
- **API Type**: `jodi`
- **UI Component**: `JodiGame.tsx`
- **Features**: Range selection, modern UI, real-time validation

#### 3. Panna Games
- **Single Panna**: 3-digit combinations (000-999)
- **Double Panna**: 2-digit combinations (00-99)
- **Triple Panna**: 1-digit combinations (0-9)
- **API Types**: `single_panna`, `double_panna`, `triple_panna`
- **UI Components**: `SinglePanna.tsx`, `DoublePanna.tsx`, `TriplePanna.tsx`

#### 4. Motor Games
- **SP Motor**: Generate single pannas from input digits
- **DP Motor**: Generate double pannas from input digits
- **API Types**: `motor_sp`, `motor_dp`
- **UI Component**: `BaseMotorGame.tsx`
- **Features**: Auto-placement, minimum 4 digits required

#### 5. Common Games
- **Common SP**: Filter single pannas by input digits
- **Common DP**: Filter double pannas by input digits
- **Common SP-DP**: Filter both types
- **API Types**: `common_sp`, `common_dp`, `common_sp_dp`
- **UI Component**: `CommonSpDp.tsx`
- **Features**: Any-digit matching, auto-placement

#### 6. Bracket Games
- **Half Bracket**: Numbers with sum ≤ 9
- **Full Bracket**: Numbers with sum ≤ 9
- **API Types**: `half_bracket`, `full_bracket`
- **UI Component**: `RedBracket.tsx`
- **Features**: Dynamic number generation, auto-placement

#### 7. Family Panel
- **Description**: Bet on family numbers
- **API Type**: `family_panel`
- **UI Component**: `FamilyPanel.tsx`
- **Features**: Family identification, auto-placement

#### 8. Cycle Panna
- **Description**: Bet on cycle panna numbers
- **API Type**: `cycle_panna`
- **UI Component**: `CyclePanna.tsx`
- **Features**: Cycle identification, input validation

#### 9. Sangam Games
- **Half Sangam Open**: Panna X Digit (e.g., 123X6)
- **Half Sangam Close**: Digit X Panna (e.g., 4X123)
- **Full Sangam**: Panna-SumLastDigits-Panna (e.g., 123-64-112)
- **API Type**: `sangam`
- **UI Component**: `SangamGame.tsx`
- **Features**: Complex calculations, real-time filtering

### Time-Based Betting System

#### Betting Windows
```typescript
// Open Betting: 12:00 AM - 12:15 PM
// Buffer Period: 12:15 PM - 12:30 PM (No betting)
// Close Betting: 12:30 PM - 3:45 PM
// Game Closed: 3:45 PM - 4:00 PM
```

#### Time Validation Logic
```typescript
function isBettingAllowed(betType: 'open' | 'close', currentTime: moment.Moment): boolean {
    const hour = currentTime.hour();
    const minute = currentTime.minute();
    const timeInMinutes = hour * 60 + minute;
    
    if (betType === 'open') {
        // Open betting: 00:00 - 12:15 (0 - 735 minutes)
        return timeInMinutes >= 0 && timeInMinutes <= 735;
    } else {
        // Close betting: 12:30 - 15:45 (750 - 945 minutes)
        return timeInMinutes >= 750 && timeInMinutes <= 945;
    }
}
```

#### Market Status
```typescript
function getMarketStatus(currentTime: moment.Moment): string {
    const hour = currentTime.hour();
    const minute = currentTime.minute();
    const timeInMinutes = hour * 60 + minute;
    
    if (timeInMinutes >= 0 && timeInMinutes <= 735) {
        return 'open_betting';
    } else if (timeInMinutes >= 750 && timeInMinutes <= 945) {
        return 'close_betting';
    } else {
        return 'closed';
    }
}
```

### UI Components Architecture

#### Common Features Across All Games
- **Modern UI**: Curved corners, shadows, gradients
- **Responsive Design**: Mobile-first approach
- **Balance Validation**: Real-time balance checking
- **Time Validation**: IST timezone support
- **Toast Notifications**: User feedback
- **Loading States**: API call indicators
- **Form Reset**: After successful submission

#### Component Structure
```typescript
interface GameComponentProps {
    marketId: string;
    marketName: string;
}

interface GameState {
    amounts: { [key: string]: number };
    selectedAmount: number | null;
    selectedBetType: 'open' | 'close';
    loading: boolean;
    currentTime: string;
    marketStatus: string;
}
```

#### State Management
```typescript
// AuthContext for user balance
const { user, updateBalance } = useAuthContext();

// Real-time balance update
const handleSubmit = async () => {
    if (user.balance < total) {
        toast.error('Insufficient balance');
        return;
    }
    
    const response = await betAPI.placeBet(betData);
    if (response.success) {
        updateBalance(user.balance - total);
        toast.success('Bet placed successfully!');
        resetForm();
    }
};
```

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
- **Player**: Game access, personal data, betting

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
- **Utils**: Time utilities and helper functions

#### Frontend (Admin & Website)
- **Components**: Reusable UI components
- **Contexts**: Global state management
- **Hooks**: Custom React hooks
- **Pages**: Route-specific components
- **Utils**: Helper functions
- **API Clients**: HTTP request handlers

### State Management

#### Admin Panel
- **AuthContext**: User authentication state
- **MarketsContext**: Market data management
- **UsersContext**: User management state

#### Website
- **AuthContext**: Player authentication and balance
- **MarketsContext**: Market assignments and data

### API Integration
```typescript
// Example API client usage
const { login, user, updateBalance } = useAuthContext();
const success = await login(username, password);

// Bet placement
const response = await betAPI.placeBet({
    marketId,
    gameType,
    betType,
    numbers,
    selectedNumbers
});
```

### Error Handling
- **Backend**: Centralized error middleware
- **Frontend**: Context-based error states
- **Validation**: Client and server-side validation
- **Toast Notifications**: User-friendly error messages

### Time Management
```typescript
// Frontend time synchronization
useEffect(() => {
    const fetchTime = async () => {
        const response = await betAPI.getCurrentTime();
        setCurrentTime(response.currentTime);
        setMarketStatus(response.marketStatus);
    };
    
    fetchTime();
    const interval = setInterval(fetchTime, 1000);
    return () => clearInterval(interval);
}, []);
```

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
5. **Time Validation**: Verify IST timezone configuration
6. **Bet Validation**: Check game type and bet type validation

#### Frontend Issues
1. **API Connection**: Verify API URL configuration
2. **Authentication**: Check token storage and refresh
3. **State Management**: Verify context providers
4. **Build Errors**: Check TypeScript and dependency issues
5. **Time Synchronization**: Verify IST time display
6. **Balance Updates**: Check real-time balance updates

#### Game-Specific Issues
1. **Motor Games**: Verify minimum 4 digits requirement
2. **Common Games**: Check digit filtering logic
3. **Bracket Games**: Verify sum calculation (≤ 9)
4. **Sangam Games**: Check complex calculation logic
5. **Input Validation**: Verify real-time and on-blur validation

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
- **Time Validation**: Check IST timezone logs

### Performance Monitoring
- **API Response Times**: Monitor endpoint performance
- **Database Queries**: Optimize slow queries
- **Frontend Loading**: Bundle size optimization
- **Memory Usage**: Monitor application memory
- **Real-time Updates**: Monitor WebSocket performance

---

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Moment.js Timezone Documentation](https://momentjs.com/timezone/)

### Development Tools
- **VS Code Extensions**: TypeScript, ESLint, Prettier
- **API Testing**: Postman, Insomnia
- **Database GUI**: MongoDB Compass
- **Version Control**: Git with conventional commits
- **Time Testing**: IST timezone testing tools

### Best Practices
- **Code Style**: ESLint + Prettier configuration
- **Git Workflow**: Feature branches with PR reviews
- **Testing**: Unit tests for critical functions
- **Security**: Regular dependency updates
- **Performance**: Code splitting and optimization
- **Time Management**: Consistent IST timezone usage
- **Validation**: Dual frontend and backend validation

---

## 📞 Support

For technical support or questions:
- **Backend Issues**: Check logs and API documentation
- **Frontend Issues**: Browser console and React DevTools
- **Database Issues**: MongoDB Compass and query optimization
- **Deployment Issues**: Environment configuration and Docker logs
- **Game Logic Issues**: Check validation rules and time constraints
- **Time Issues**: Verify IST timezone configuration

---

*Last Updated: July 2024*
*Version: 2.0.0* 