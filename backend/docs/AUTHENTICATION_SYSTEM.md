# Authentication System Documentation

## Overview

This document describes the comprehensive authentication system implemented for the Matka SK Admin Panel, featuring refresh tokens, enhanced security, and role-based access control.

## Features

### 🔐 Security Features
- **Refresh Token System**: Short-lived access tokens (15min) with long-lived refresh tokens (7 days)
- **Token Blacklisting**: Automatic token revocation on logout
- **Rate Limiting**: Protection against brute force attacks
- **Input Sanitization**: XSS and injection attack prevention
- **Helmet Security**: HTTP security headers
- **CORS Protection**: Cross-origin request security
- **Password Hashing**: bcrypt with salt rounds

### 🔄 Token Management
- **Access Tokens**: 15-minute lifespan for API requests
- **Refresh Tokens**: 7-day lifespan for session renewal
- **Automatic Refresh**: Seamless token renewal in frontend
- **Token Revocation**: Immediate logout from all devices

### 👥 Role-Based Access Control
- **Superadmin**: Full system access
- **Admin**: Manage distributors and players
- **Distributor**: Manage sub-distributors and players
- **Player**: Self-management only

## Architecture

### Backend Structure
```
backend/
├── src/
│   ├── controllers/auth/
│   │   └── authController.ts      # Login, logout, refresh
│   ├── middlewares/
│   │   └── auth.ts               # Authentication & authorization
│   ├── models/
│   │   ├── User.ts               # User model
│   │   └── TokenBlacklist.ts     # Token revocation
│   ├── utils/
│   │   └── jwt.ts                # JWT utilities
│   └── routes/
│       └── routes.ts             # API endpoints
```

### Frontend Structure
```
admin/src/
├── lib/
│   ├── api-client.ts             # Axios with auto-refresh
│   └── api-service.ts            # API service layer
├── components/
│   ├── auth/
│   │   └── login-form.tsx        # Login component
│   └── layout/
│       ├── admin-layout.tsx      # Protected layout
│       └── navbar.tsx            # User menu & logout
```

## API Endpoints

### Authentication Endpoints
```
POST /api/auth/login              # User login
POST /api/auth/refresh            # Token refresh
POST /api/auth/logout             # Single device logout
POST /api/auth/logout-all         # All devices logout
GET  /api/profile                 # Get user profile
PUT  /api/profile                 # Update profile
```

### User Management Endpoints
```
GET  /api/users                   # Get accessible users
GET  /api/users/:role/:userId     # Get users by role
GET  /api/users/:userId           # Get specific user
PUT  /api/users/:userId           # Update user
```

## Security Implementation

### 1. Token System
```typescript
// Access Token (15 minutes)
{
  userId: string,
  username: string,
  role: string,
  type: 'access',
  jti: string, // Unique token ID
  exp: number
}

// Refresh Token (7 days)
{
  userId: string,
  username: string,
  role: string,
  type: 'refresh',
  jti: string, // Same ID as access token
  exp: number
}
```

### 2. Rate Limiting
- **Global**: 100 requests per 15 minutes per IP
- **Login**: 5 attempts per 15 minutes per IP
- **Automatic blocking** with user-friendly messages

### 3. Input Validation
```typescript
// Username validation
- Minimum 3 characters
- Case-insensitive matching
- Trimmed and sanitized

// Password validation
- Minimum 6 characters
- bcrypt hashing with salt
- Secure comparison
```

### 4. CORS Configuration
```typescript
{
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}
```

## Frontend Integration

### 1. Automatic Token Refresh
```typescript
// api-client.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Attempt token refresh
      const refreshResponse = await authAPI.refresh()
      if (refreshResponse.success) {
        return apiClient(originalRequest)
      }
      // Redirect to login on failure
    }
    return Promise.reject(error)
  }
)
```

### 2. Authentication State Management
```typescript
// Store in localStorage
localStorage.setItem('isAuthenticated', 'true')
localStorage.setItem('user', JSON.stringify(userData))

// Verify on app load
const response = await authAPI.getProfile()
if (response.success) {
  setUser(response.data.user)
} else {
  router.push('/login')
}
```

## User Hierarchy

```
Superadmin (smasher)
├── Admin 1 (admin1)
│   ├── Distributor 1_1 (distributor1_1)
│   │   ├── Sub-Distributor 1_1 (subdist1_1)
│   │   │   ├── Player 1 (player1)
│   │   │   ├── Player 2 (player2)
│   │   │   └── Player 3 (player3)
│   │   ├── Sub-Distributor 1_2 (subdist1_2)
│   │   └── Sub-Distributor 1_3 (subdist1_3)
│   ├── Distributor 1_2 (distributor1_2)
│   └── Distributor 1_3 (distributor1_3)
├── Admin 2 (admin2)
└── ... (continues for 5 admins)
```

## Demo Credentials

### Superadmin
- **Username**: `smasher`
- **Password**: `123456`
- **Access**: Full system control

### Admin
- **Username**: `admin1` through `admin5`
- **Password**: `admin123`
- **Access**: Manage distributors and players

### Distributor
- **Username**: `distributor1_1` through `distributor5_3`
- **Password**: `dist123`
- **Access**: Manage sub-distributors and players

### Sub-Distributor
- **Username**: `subdist1_1` through `subdist45_3`
- **Password**: `subdist123`
- **Access**: Manage players

### Player
- **Username**: `player1` through `player135`
- **Password**: `player123`
- **Access**: Self-management only

## Environment Configuration

```env
# Database
MONGODB_URI=mongodb://localhost:27017/matka-sk

# JWT Secrets (CHANGE IN PRODUCTION)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key

# Token Expiration
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Security
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Security Best Practices

### 1. Production Deployment
- Use strong, unique JWT secrets
- Enable HTTPS
- Set secure cookie options
- Use environment-specific configurations
- Implement proper logging and monitoring

### 2. Token Security
- Short-lived access tokens
- Secure cookie storage
- Automatic token refresh
- Token blacklisting on logout
- Unique token IDs for revocation

### 3. Rate Limiting
- Global rate limiting
- Login-specific rate limiting
- IP-based blocking
- User-friendly error messages

### 4. Input Validation
- Server-side validation
- Input sanitization
- SQL injection prevention
- XSS protection

## Testing the System

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd admin
npm run dev
```

### 3. Test Login Flow
1. Navigate to `http://localhost:3000/login`
2. Use demo credentials
3. Verify automatic token refresh
4. Test logout functionality

### 4. Test Security Features
1. Try invalid credentials (rate limiting)
2. Test expired token handling
3. Verify role-based access
4. Test logout from all devices

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check FRONTEND_URL configuration
2. **Token Expiration**: Verify token expiration settings
3. **Rate Limiting**: Check rate limit configuration
4. **Database Connection**: Verify MONGODB_URI

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## Future Enhancements

1. **Two-Factor Authentication (2FA)**
2. **Password Reset Functionality**
3. **Session Management Dashboard**
4. **Audit Logging**
5. **Advanced Role Permissions**
6. **API Key Management**

---

This authentication system provides a robust, secure foundation for the Matka SK Admin Panel with modern security practices and seamless user experience. 