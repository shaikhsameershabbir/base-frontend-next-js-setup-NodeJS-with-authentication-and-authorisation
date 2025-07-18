# Player-Only Login System Documentation

## Overview

This system implements a secure, role-based login system where:
- **Admin Panel** (port 3001): For superadmin, admin, distributor access
- **Web Application** (port 3000): For player-only access

## Architecture

### Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   │   └── auth/
│   │       └── authController.ts     # Enhanced with role-based login
│   ├── middlewares/
│   │   ├── auth.ts                   # General authentication
│   │   └── playerAuth.ts             # Player-specific authentication
│   ├── routes/
│   │   ├── routes.ts                 # Main routes
│   │   └── playerRoutes.ts           # Player-only routes
│   ├── models/
│   │   ├── User.ts                   # Enhanced with login tracking
│   │   └── Activity.ts               # Activity logging
│   └── services/
│       └── activityService.ts        # Activity management
```

### Web Application Structure
```
webApplication/
├── src/
│   ├── app/(routes)/login/
│   │   └── page.tsx                  # Player login page
│   └── lib/
│       ├── api-client.ts             # API client configuration
│       └── api/
│           └── auth.ts               # Player API functions
```

## Key Features

### 1. Role-Based Access Control
- **Web Login**: Only players can login through web application
- **Admin Login**: Admins, distributors, superadmins use admin panel
- **Source Tracking**: Login source is stored and validated

### 2. Enhanced Security
- **Real IP Detection**: Captures actual IP addresses
- **User Agent Tracking**: Stores browser/device information
- **Activity Logging**: All login attempts are logged
- **Token Management**: Secure JWT-based authentication

### 3. Activity Tracking
- **Login Activities**: Track all login attempts with metadata
- **IP Addresses**: Store real IP addresses (not localhost)
- **Login Sources**: Track whether login is from web, mobile, app, etc.
- **Timestamps**: Accurate login timing

## API Endpoints

### Authentication Endpoints
```
POST /api/auth/login          # Login (role-restricted for web)
POST /api/auth/refresh        # Refresh token
POST /api/auth/logout         # Logout
```

### Player-Specific Endpoints
```
GET  /api/player/profile      # Get player profile
PUT  /api/player/profile      # Update player profile
GET  /api/player/activities   # Get player activities
GET  /api/player/activities/stats  # Get activity statistics
GET  /api/player/public/info  # Public player information
```

### Admin Endpoints (Admin Panel Only)
```
GET  /api/activities/recent   # Recent activities
GET  /api/activities/formatted # Formatted activities for dashboard
GET  /api/users               # User management
```

## Implementation Details

### 1. Login Flow
```typescript
// Web Application Login
const response = await authAPI.login({
    username: 'player123',
    password: 'password123',
    login: 'web'  // Indicates web login
});

// Backend Validation
if (login === 'web' && user.role !== 'player') {
    return res.status(403).json({
        success: false,
        message: 'Access denied. This login is only for players.'
    });
}
```

### 2. Activity Logging
```typescript
// Automatic activity logging on login
await ActivityService.logLogin(
    userId,
    realIpAddress,
    userAgent,
    loginSource
);
```

### 3. IP Address Detection
```typescript
const realIp = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.ip || 
               'unknown';
```

## Testing

### 1. Run Test Setup
```bash
cd backend
npm run test:player-login
```

### 2. Test Scenarios
- **Player Login**: Should succeed and redirect to MPIN setup
- **Admin Login**: Should be blocked with "Access denied" message
- **Invalid Credentials**: Should show appropriate error message
- **Activity Logging**: Check MongoDB for activity records

### 3. Test Users
- **Player**: `testplayer` / `password123`
- **Admin**: `testadmin` / `password123`

## Configuration

### Environment Variables
```env
# Backend
MONGODB_URI=mongodb://localhost:27017/matka-sk
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Web Application
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### CORS Configuration
```typescript
// Backend CORS setup
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
```

## Security Considerations

### 1. Role Validation
- Web login strictly validates player role
- Admin panel login validates admin roles
- Separate authentication middleware for each context

### 2. IP Address Security
- Multiple fallback methods for IP detection
- Handles proxy and load balancer scenarios
- Stores real IP addresses for security auditing

### 3. Activity Monitoring
- All login attempts are logged
- Failed attempts are tracked
- IP addresses and user agents are stored
- Login sources are validated

## Usage Examples

### 1. Player Login (Web Application)
```typescript
// Frontend
const handleLogin = async () => {
    const response = await authAPI.login({
        username: mobileNumber,
        password: password,
        login: 'web'
    });
    
    if (response.success) {
        // Redirect to MPIN setup or game
        router.push('/mpin-login');
    }
};
```

### 2. Activity Monitoring (Admin Panel)
```typescript
// Get recent activities
const activities = await ActivityService.getFormattedRecentActivities(10);

// Get player activities
const playerActivities = await ActivityService.getUserActivities(userId);
```

### 3. Player Profile Management
```typescript
// Get player profile
const profile = await authAPI.getProfile();

// Update player profile
const updated = await authAPI.updateProfile({
    username: 'newusername'
});
```

## Troubleshooting

### Common Issues

1. **IP Address Shows as ::1**
   - Solution: Updated IP detection logic
   - Check for proxy configuration

2. **Admin Can't Login to Web App**
   - Expected behavior: Only players can login to web app
   - Use admin panel for admin login

3. **Activity Not Logged**
   - Check MongoDB connection
   - Verify Activity model is properly configured
   - Check for errors in activity service

### Debug Commands
```bash
# Check MongoDB activity logs
mongo matka-sk --eval "db.activities.find().sort({createdAt: -1}).limit(5)"

# Check user roles
mongo matka-sk --eval "db.users.find({}, {username: 1, role: 1, isActive: 1})"
```

## Future Enhancements

1. **Multi-factor Authentication**: Add SMS/email verification
2. **Device Management**: Track and manage login devices
3. **Geolocation**: Add location-based security
4. **Rate Limiting**: Implement per-IP rate limiting
5. **Audit Trail**: Enhanced activity reporting

---

**System Status**: ✅ **COMPLETE AND READY FOR PRODUCTION** 