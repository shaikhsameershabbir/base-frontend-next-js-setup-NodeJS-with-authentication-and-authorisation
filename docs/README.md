# MK Matka Booking - Developer Documentation

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
- **Result Declaration System** with weekly storage and panna number validation
- **Smart Winning Number Display** with market status awareness
- **Centralized Market Data Management** with optimized API calls
- **Detailed Win Amount Breakdown** with Full Sangam calculations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Quick Setup
```bash
# Backend
cd backend
npm install
cp env.example .env
npm run dev

# Admin Panel
cd admin
npm install
cp env.example .env
npm run dev

# Website
cd webSite
npm install
cp env.example .env
npm run dev
```

## 📚 Documentation Structure

- **[SETUP.md](SETUP.md)** - Installation & environment configuration
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture & design patterns
- **[API.md](API.md)** - Complete API documentation
- **[GAMES.md](GAMES.md)** - Game system & betting logic
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues & debugging

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Time Management**: moment-timezone (Asia/Kolkata)

### Admin Panel
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui

### Website
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Geist UI

## 📞 Support

For technical support or questions:
- **Backend Issues**: Check logs and API documentation
- **Frontend Issues**: Browser console and React DevTools
- **Database Issues**: MongoDB Compass and query optimization
- **Deployment Issues**: Environment configuration and Docker logs
- **Game Logic Issues**: Check validation rules and time constraints
- **Time Issues**: Verify IST timezone configuration

---

*Last Updated: August 2024*
*Version: 2.0.0*
