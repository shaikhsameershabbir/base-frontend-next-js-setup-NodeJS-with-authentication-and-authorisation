# System Architecture

## 🏗️ Overview

The MK Matka Booking system follows a **microservices-inspired architecture** with three main components communicating through RESTful APIs. The system is designed for scalability, maintainability, and real-time performance.

## 📊 System Architecture Diagram

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

## 👥 User Hierarchy

```
Superadmin
    └── Admin
        └── Distributor
            └── Agent
                └── Player
```

## 🎮 Game System Architecture

### Core Components
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

### Win Calculation System
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Admin Panel   │    │   Win Calculation│    │   Game Types    │
│   LoadV2 Page   │◄──►│   Logic         │◄──►│   (Panna/Single)│
│   (React)       │    │   (TypeScript)  │    │   (Constants)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Full Sangam   │
                       │   Calculation   │
                       └─────────────────┘
```

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
│   │   │   ├── transfers.controller.ts # Transfer operations
│   │   │   └── result.controller.ts   # Result declaration logic
│   │   ├── middlewares/     # Custom middleware
│   │   │   ├── auth.middleware.ts     # Authentication middleware
│   │   │   └── playerAuth.middleware.ts # Player authentication
│   │   ├── routes/          # API route definitions
│   │   │   ├── bet.routes.ts          # Bet placement routes
│   │   │   ├── player.routes.ts       # Player routes
│   │   │   ├── auth.routes.ts         # Auth routes
│   │   │   ├── result.routes.ts       # Result declaration routes
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
│   │   ├── Transfer.ts      # Transfer schema
│   │   └── Result.ts        # Weekly result schema
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
│   │   ├── profile/         # Profile management
│   │   └── loadv2/          # Bet data management with result declaration
│   ├── components/          # Reusable components
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── layout/          # Layout components
│   │   ├── modals/          # Modal components
│   │   ├── theme/           # Theme components
│   │   ├── transfer/        # Transfer components
│   │   ├── loadv2/          # Bet data components
│   │   │   ├── FiltersSection.tsx    # Filter controls and result declaration
│   │   │   ├── TodayResults.tsx      # Today's declared results
│   │   │   ├── BetTotals.tsx         # Bet totals summary
│   │   │   ├── DetailedBetData.tsx   # Detailed bet data display
│   │   │   ├── BetDetailsModal.tsx   # Detailed winning calculation modal
│   │   │   └── index.ts              # Component exports
│   │   ├── winner/          # Winning calculation components
│   │   │   └── constants.ts # Winning rates and game constants
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
│       ├── api-service.ts   # Service API with result interfaces
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
│   │   │   │           │   ├── HalfSangamA.tsx
│   │   │   │           │   ├── HalfSangamB.tsx
│   │   │   │           │   ├── SpMotor.tsx
│   │   │   │           │   ├── DpMoter.tsx
│   │   │   │           │   └── SangamGame.tsx
│   │   │   │           └── page.tsx
│   │   │   ├── home/        # Home page with smart winning numbers
│   │   │   ├── myBids/      # Bet history
│   │   │   └── passbook/    # Transaction history
│   │   ├── components/      # Shared components
│   │   │   ├── AuthGuard.tsx # Route protection
│   │   │   ├── BidsCard.tsx # Bet display
│   │   │   ├── BottomNav.tsx # Mobile navigation
│   │   │   ├── Header.tsx   # Page header
│   │   │   ├── MarketCard.tsx # Market display with winning numbers
│   │   │   ├── WinningNumbers.tsx # Smart winning number display
│   │   │   ├── Message.tsx  # Message component
│   │   │   ├── Sidebar.tsx  # Sidebar navigation
│   │   │   ├── SplashScreen.tsx # Loading screen
│   │   │   └── ui/          # UI components
│   │   ├── constant/        # Constants
│   │   │   ├── constant.ts  # Game constants
│   │   │   └── pagination.tsx # Pagination component
│   │   ├── contexts/        # React contexts
│   │   │   ├── AuthContext.tsx # Authentication context
│   │   │   ├── NotificationContext.tsx # Notification context
│   │   │   └── MarketDataContext.tsx # Centralized market data management
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # API clients
│   │       ├── api/         # API modules
│   │       │   ├── auth.ts  # Authentication API
│   │       │   └── bet.ts   # Betting API with market results
│   │       ├── api-client.ts # Base API client
│   │       └── utils.ts     # Utility functions
├── public/                  # Static assets
│   └── Game/               # Game images
```

## 🔄 Data Flow Architecture

### Authentication Flow
```
1. User Login Request
   ↓
2. Backend Validation
   ↓
3. JWT Token Generation
   ↓
4. Token Storage (Cookies)
   ↓
5. Protected Route Access
```

### Betting Flow
```
1. User Selects Game Type
   ↓
2. Frontend Validation
   ↓
3. API Request to Backend
   ↓
4. Backend Validation & Processing
   ↓
5. Database Update
   ↓
6. Balance Update
   ↓
7. Response to Frontend
```

### Result Declaration Flow
```
1. Admin Declares Result
   ↓
2. Panna Number Validation
   ↓
3. Win Calculation
   ↓
4. Database Storage
   ↓
5. Real-time Updates
   ↓
6. Frontend Display
```

## 🗄️ Database Architecture

### Schema Relationships
```
User (1) ──── (N) Bet
User (1) ──── (N) Transfer
Market (1) ──── (N) Bet
Market (1) ──── (1) Result
User (1) ──── (N) MarketAssignment
```

### Data Models

#### User Model
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

#### Market Model
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

#### Bet Model
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

#### Result Model
```typescript
interface IResult {
    marketId: ObjectId;         // Market reference
    declaredBy: ObjectId;       // User who declared the result
    weekStartDate: Date;        // Week start date
    weekEndDate: Date;          // Week end date
    weekDays: number;           // Number of days in week
    results: {
        [dayName: string]: DayResult;
    };
    createdAt: Date;
    updatedAt: Date;
}

interface DayResult {
    open?: number;              // 3-digit panna number
    main?: number;              // Calculated main value
    close?: number;             // 3-digit panna number
    openDeclationTime?: Date;
    closeDeclationTime?: Date;
}
```

## 🔐 Security Architecture

### Authentication & Authorization
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   JWT Token     │    │   Backend       │
│   (React)       │◄──►│   Validation    │◄──►│   (Express)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Role-Based    │
                       │   Access Control│
                       └─────────────────┘
```

### Security Layers
1. **Rate Limiting**: Prevent API abuse
2. **Input Validation**: Sanitize all inputs
3. **JWT Authentication**: Secure token-based auth
4. **Role-Based Authorization**: Control access by user role
5. **CORS Protection**: Control cross-origin requests
6. **HTTPS Enforcement**: Secure data transmission

## ⚡ Performance Architecture

### Caching Strategy
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   MarketData    │    │   Backend       │
│   Cache         │◄──►│   Context       │◄──►│   Cache         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Optimization Techniques
1. **Batch API Calls**: Reduce network requests
2. **Debounced Requests**: Prevent duplicate calls
3. **Context Caching**: Store frequently accessed data
4. **Lazy Loading**: Load components on demand
5. **Code Splitting**: Reduce bundle size

## 🔄 State Management Architecture

### Frontend State Management
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AuthContext   │    │   MarketData    │    │   Notification  │
│   (User State)  │    │   Context       │    │   Context       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Local State   │
                       │   (Components)  │
                       └─────────────────┘
```

### State Flow
1. **Global State**: User authentication, market data
2. **Local State**: Component-specific data
3. **Server State**: API responses and caching
4. **Form State**: User input and validation

## 🌐 API Architecture

### RESTful API Design
```
Base URL: /api/v1

Authentication:
├── POST /auth/login
├── POST /auth/logout
└── GET /auth/profile

Betting:
├── POST /bets/place-bet
├── GET /player/bet-history
└── PUT /player/bet/:id/cancel

Results:
├── POST /result/declare
├── GET /result/market/:marketId
└── GET /result/player/markets

Users:
├── GET /users
├── POST /users
└── PUT /users/:id

Markets:
├── GET /markets
├── POST /markets
└── PUT /markets/:id
```

### API Response Format
```typescript
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
```

## 🎯 Scalability Considerations

### Horizontal Scaling
- **Load Balancing**: Multiple backend instances
- **Database Sharding**: Distribute data across servers
- **CDN**: Static asset delivery
- **Microservices**: Split into smaller services

### Vertical Scaling
- **Database Optimization**: Indexing and query optimization
- **Caching**: Redis for session and data caching
- **Connection Pooling**: Efficient database connections
- **Memory Management**: Optimize memory usage

## 🔧 Development Architecture

### Development Workflow
```
1. Feature Branch Creation
   ↓
2. Development & Testing
   ↓
3. Code Review
   ↓
4. Merge to Main
   ↓
5. Deployment
```

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full user flow testing
- **Performance Tests**: Load and stress testing

---

*For detailed API documentation, see [API.md](API.md)*
*For game system details, see [GAMES.md](GAMES.md)*
*For deployment information, see [DEPLOYMENT.md](DEPLOYMENT.md)*
