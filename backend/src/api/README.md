# API Documentation

## Overview

This API follows a production-level structure with proper separation of concerns, validation, error handling, and security measures.

## API Structure

```
src/api/v1/
├── routes/           # Route definitions
├── controllers/      # Business logic handlers
├── services/         # Data access and business logic
├── middlewares/      # Custom middleware
├── validators/       # Request validation
├── types/           # TypeScript type definitions
└── index.ts         # Main API router
```

## API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout
- `POST /register` - User registration
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /logout-all` - Logout from all devices

### Users (`/api/v1/users`)
- `GET /` - Get all accessible users
- `GET /:userId` - Get user by ID
- `PUT /:userId` - Update user
- `DELETE /:userId` - Delete user and downline
- `PUT /:userId/active` - Toggle user active status
- `PUT /:userId/password` - Update user password
- `POST /create` - Create new user
- `POST /create/:role` - Create user with specific role
- `GET /:userId/available-markets` - Get available markets for assignment
- `POST /:userId/assign-markets` - Assign markets to user
- `GET /:userId/assigned-markets` - Get user's assigned markets
- `POST /:userId/remove-markets` - Remove market assignments

### Markets (`/api/v1/markets`)
- `GET /` - Get all markets
- `GET /:id` - Get market by ID
- `POST /` - Create new market
- `PUT /:id` - Update market
- `DELETE /:id` - Delete market
- `PUT /:id/status` - Update market status

### Transfers (`/api/v1/transfers`)
- `GET /children` - Get child users
- `POST /process` - Process balance transfer
- `GET /history` - Get transfer history
- `GET /stats` - Get transfer statistics

### Activities (`/api/v1/activities`)
- `GET /` - Get all activities
- `GET /:id` - Get activity by ID
- `GET /user/:userId` - Get user activities

### Player (`/api/v1/player`)
- `GET /profile` - Get player profile
- `PUT /profile` - Update player profile
- `GET /assigned-markets` - Get player's assigned markets
- `POST /confirm-bid` - Confirm bid placement

## Middleware

### Authentication Middleware
- `authenticateToken` - Verify JWT token
- `requireRole` - Check user role permissions
- `setAccessibleUsers` - Set accessible users based on hierarchy

### Rate Limiting
- `loginLimiter` - Limit login attempts
- `apiLimiter` - General API rate limiting
- `transferLimiter` - Transfer-specific rate limiting

### Validation
- `validateRequest` - Validate request data
- `sanitizeInput` - Sanitize input data

### Error Handling
- `handleError` - Global error handler
- `handleNotFound` - 404 handler

## Security Features

1. **JWT Authentication** - Secure token-based authentication
2. **Role-based Access Control** - Hierarchical permission system
3. **Rate Limiting** - Protection against abuse
4. **Input Validation** - Request data validation
5. **Input Sanitization** - XSS protection
6. **CORS Configuration** - Cross-origin resource sharing
7. **Helmet Security** - Security headers
8. **Token Blacklisting** - Secure logout

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Response Format

Successful responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {} // Response data
}
```

## Pagination

Paginated responses include pagination metadata:

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Development Guidelines

1. **Controllers** - Handle HTTP requests and responses
2. **Services** - Contain business logic and data access
3. **Validators** - Validate request data using express-validator
4. **Types** - Define TypeScript interfaces
5. **Middleware** - Reusable request processing functions

## Environment Variables

Required environment variables:
- `JWT_SECRET` - JWT signing secret
- `MONGODB_URI` - MongoDB connection string
- `NODE_ENV` - Environment (development/production)

## Testing

Run tests with:
```bash
npm test
```

## Deployment

1. Set environment variables
2. Build the application
3. Start the server with PM2 or similar process manager
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure monitoring and logging 