# Matka SK - Complete System Documentation

A comprehensive role-based authentication and management system with hierarchical data access control, market management, and transfer functionality for the Matka SK platform.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Module Documentation](#module-documentation)
- [API Reference](#api-reference)
- [Development Guide](#development-guide)
- [Deployment Guide](#deployment-guide)
- [Integration Guide](#integration-guide)
- [Security](#security)
- [Support](#support)

## 🏗️ System Overview

Matka SK is a comprehensive platform consisting of three main modules:

1. **Backend API** - Core business logic and data management
2. **Admin Panel** - Administrative interface for system management
3. **Web Application** - End-user interface (coming soon)

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web App       │    │   Admin Panel   │    │   Backend API   │
│   (Frontend)    │◄──►│   (Frontend)    │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Authentication│    │   MongoDB       │
                       │   & Security    │    │   Database      │
                       └─────────────────┘    └─────────────────┘
```

## 🎯 Features

### Core Features
- **Multi-Role Authentication System**
  - 5-tier hierarchy: Superadmin → Admin → Distributor → Agent → Player
  - JWT-based authentication with refresh tokens
  - HTTP-only cookies for enhanced security
  - Token blacklisting and rotation

- **Hierarchical User Management**
  - Role-based access control (RBAC)
  - Hierarchy-based data access control (HBAC)
  - Cascade operations (delete, update)
  - Real-time downline statistics

- **Market Management**
  - Create and manage markets
  - Set open and close times
  - Market assignment to users
  - Market status management

- **Transfer System**
  - Balance transfers between users
  - Transfer approval workflow
  - Transfer history tracking
  - Transfer validation and limits

### User Management Features
- **User Operations**: Create, update, delete users
- **Status Management**: Activate/deactivate users
- **Password Management**: Secure password updates
- **Cascade Delete**: Delete user and all downline
- **Balance Management**: User balance tracking and updates

### Security Features
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based and hierarchy-based access control
- **Data Protection**: HTTP-only cookies, CORS, Helmet
- **Input Validation**: Comprehensive server-side validation
- **Rate Limiting**: Protection against brute force attacks

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js 4.x
- **Language**: TypeScript
- **Database**: MongoDB 6.0+ with Mongoose ODM
- **Authentication**: JWT, bcrypt
- **Process Manager**: PM2
- **Package Manager**: npm

### Admin Panel
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks
- **HTTP Client**: Axios with interceptors

### Web Application (Coming Soon)
- **Framework**: Next.js 14 or React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS or styled-components
- **State Management**: Redux Toolkit or Zustand
- **Real-time**: WebSocket integration

### Infrastructure
- **Web Server**: Nginx
- **SSL**: Let's Encrypt
- **Monitoring**: PM2, Winston logging
- **Deployment**: Docker (optional), PM2 ecosystem

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ LTS
- MongoDB 6.0+
- npm or yarn
- Git

### 1. Clone Repository
```bash
git clone <your-repository-url> matka-sk
cd matka-sk
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Set up environment
cp env.example .env

# Configure environment variables
nano .env
```

**Environment Configuration:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/matka-sk

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-change-this-in-production
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Cookie Configuration
COOKIE_DOMAIN=localhost
```

```bash
# Seed database
npm run seed

# Start development server
npm run dev
```

### 3. Admin Panel Setup
```bash
# Navigate to admin panel
cd admin

# Install dependencies
npm install

# Set up environment
cp env.example .env.local

# Configure environment
nano .env.local
```

**Admin Environment:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Matka SK Admin
```

```bash
# Start development server
npm run dev
```

### 4. Access the System

- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:3000
- **API Documentation**: http://localhost:5000/api/docs (if available)

### 5. Default Users

| Username | Password | Role | Access |
|----------|----------|------|---------|
| smasher | 123456 | Superadmin | Full system access |
| admin | admin123 | Admin | Regional management |
| distributor1 | dist123 | Distributor | Area management |
| agent1 | agent123 | Agent | Local management |
| player1 | player123 | Player | Self access only |

## 📚 Module Documentation

### Backend Module
The backend provides the core API and business logic for the entire system.

**Key Components:**
- Authentication & Authorization
- User Management
- Market Management
- Transfer System
- Database Models
- API Endpoints

**Documentation:** [Backend Documentation](./backend/README.md)

### Admin Panel Module
The admin panel provides a comprehensive interface for system administrators.

**Key Features:**
- User Management Interface
- Market Management
- Transfer Management
- Analytics Dashboard
- Role-based Navigation
- Real-time Updates

**Documentation:** [Admin Panel Documentation](./admin/README.md)

### Web Application Module (Coming Soon)
The web application will provide the end-user interface for players and agents.

**Planned Features:**
- User Dashboard
- Market Participation
- Transfer Requests
- Game Interface
- Mobile Responsive Design

## 🔌 API Reference

### Base URLs
```
Development: http://localhost:5000/api
Production: https://api.your-domain.com/api
```

### Authentication
All protected endpoints require JWT authentication:
```
Authorization: Bearer <jwt-token>
```

### Core Endpoints

#### Authentication
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

#### User Management
- `GET /auth/users` - Get accessible users
- `GET /auth/users/:userId` - Get specific user
- `PUT /auth/users/:userId` - Update user
- `DELETE /auth/users/:userId` - Cascade delete user
- `PUT /auth/users/:userId/active` - Toggle user status
- `PUT /auth/users/:userId/password` - Update password

#### Market Management
- `GET /markets` - Get markets
- `POST /markets` - Create market
- `PUT /markets/:marketId` - Update market
- `DELETE /markets/:marketId` - Delete market
- `PUT /markets/:marketId/active` - Toggle market status
- `POST /markets/assign` - Assign market to user

#### Transfer Management
- `GET /transfers` - Get transfers
- `POST /transfers` - Create transfer
- `PUT /transfers/:transferId/approve` - Approve transfer
- `PUT /transfers/:transferId/reject` - Reject transfer

**Complete API Documentation:** [API Documentation](./docs/API_DOCUMENTATION.md)

## 👨‍💻 Development Guide

### Project Structure
```
matka-sk/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Database models
│   │   ├── middlewares/     # Auth & validation
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── config/          # Configuration
│   ├── scripts/             # Database scripts
│   └── docs/                # Documentation
├── admin/                   # Admin Panel
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # UI components
│   │   ├── lib/             # Utilities & API
│   │   └── styles/          # Styling
│   └── public/              # Static assets
├── webapp/                  # Web Application (Coming Soon)
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API services
│   │   └── utils/           # Utilities
│   └── public/              # Static assets
└── docs/                    # System documentation
    ├── DEPLOYMENT_GUIDE.md  # Deployment instructions
    └── API_DOCUMENTATION.md # Complete API reference
```

### Development Workflow

#### Backend Development
```bash
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Run tests (if available)
npm test
```

#### Admin Panel Development
```bash
cd admin

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

#### Database Management
```bash
cd backend

# Seed database
npm run seed

# Create admin user
npm run create-admin

# Fix database issues
npm run fix-db
```

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting
- **Husky**: Git hooks for code quality
- **Conventional Commits**: Standardized commit messages

## 🚀 Deployment Guide

### Production Deployment
For detailed deployment instructions, see: [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)

### Quick Deployment Steps

#### Backend Deployment
1. Set environment variables for production
2. Build the application
3. Configure PM2 ecosystem
4. Set up Nginx reverse proxy
5. Configure SSL certificates

#### Admin Panel Deployment
1. Set production environment variables
2. Build the application
3. Deploy to Vercel, Netlify, or your server
4. Configure domain and SSL

#### Database Setup
1. Set up MongoDB production instance
2. Configure authentication and security
3. Set up automated backups
4. Configure monitoring and alerts

## 🔗 Integration Guide

### Web Application Integration (Coming Soon)

When integrating the web application module, follow these guidelines:

#### 1. API Integration
- Use the same backend API endpoints
- Implement role-based access control
- Handle authentication tokens properly
- Implement error handling and retry logic

#### 2. Authentication Flow
```javascript
// Example authentication flow
const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  const { token, user } = response.data;
  
  // Store token securely
  localStorage.setItem('authToken', token);
  
  // Set user context
  setUser(user);
  
  return response;
};
```

#### 3. Real-time Features
- Implement WebSocket connections for live updates
- Handle market status changes
- Real-time transfer notifications
- Live balance updates

#### 4. Mobile Responsiveness
- Ensure responsive design for all screen sizes
- Implement touch-friendly interfaces
- Optimize for mobile performance
- Consider PWA capabilities

#### 5. Security Considerations
- Implement proper token management
- Add request/response encryption
- Implement rate limiting on client side
- Add input validation and sanitization

### Third-Party Integrations

#### Payment Gateways
- Integrate payment processing APIs
- Implement secure payment flows
- Handle payment callbacks and webhooks
- Maintain transaction records

#### SMS/Email Services
- Integrate notification services
- Implement OTP verification
- Send transaction notifications
- Handle delivery status

#### Analytics Integration
- Google Analytics integration
- Custom event tracking
- User behavior analytics
- Performance monitoring

## 🔒 Security

### Security Features
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control
- **Data Protection**: HTTP-only cookies, CORS
- **Input Validation**: Server-side validation
- **Rate Limiting**: Protection against attacks
- **HTTPS**: SSL/TLS encryption
- **Password Security**: bcrypt hashing

### Security Best Practices
- Regular security updates
- Environment variable protection
- Database access control
- API rate limiting
- Input sanitization
- Error handling without information leakage

### Compliance
- Data protection regulations
- User privacy requirements
- Audit trail maintenance
- Secure data transmission
- Regular security audits

## 📞 Support

### Documentation
- **System Documentation**: This README
- **API Documentation**: [API Reference](./docs/API_DOCUMENTATION.md)
- **Deployment Guide**: [Deployment Instructions](./docs/DEPLOYMENT_GUIDE.md)
- **Backend Docs**: [Backend Documentation](./backend/README.md)
- **Admin Docs**: [Admin Panel Documentation](./admin/README.md)

### Getting Help
1. **Check Documentation**: Review relevant documentation first
2. **Search Issues**: Look for similar issues in the repository
3. **Create Issue**: Open a new issue with detailed information
4. **Contact Support**: Reach out to the development team

### Issue Reporting
When reporting issues, please include:
- **Environment**: OS, Node.js version, MongoDB version
- **Steps**: Detailed steps to reproduce the issue
- **Expected vs Actual**: What you expected vs what happened
- **Logs**: Relevant error logs and stack traces
- **Screenshots**: Visual evidence if applicable

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code of Conduct
Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

---

**Last Updated**: January 2024  
**Version**: 2.0.0  
**Compatibility**: Node.js 18+, MongoDB 6.0+, Next.js 14

For the latest updates and announcements, follow our [Release Notes](CHANGELOG.md). 