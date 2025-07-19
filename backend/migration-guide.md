# API Migration Guide

## Overview

This guide helps you migrate from the old API structure to the new production-level structure.

## New Structure Benefits

1. **Better Organization** - Clear separation of concerns
2. **Type Safety** - Full TypeScript support with proper types
3. **Validation** - Request validation with express-validator
4. **Error Handling** - Consistent error responses
5. **Security** - Enhanced security measures
6. **Scalability** - Easy to extend and maintain
7. **Documentation** - Comprehensive API documentation

## Migration Steps

### 1. Update API Endpoints

Old endpoints:
```
/api/auth/login
/api/users
/api/markets
/api/transfers
/api/activities
/api/player
```

New endpoints:
```
/api/v1/auth/login
/api/v1/users
/api/v1/markets
/api/v1/transfers
/api/v1/activities
/api/v1/player
```

### 2. Update Frontend API Calls

Update all frontend API calls to use the new `/api/v1/` prefix.

### 3. Update Environment Variables

Ensure these environment variables are set:
```env
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_uri
NODE_ENV=development
```

### 4. Install Dependencies

```bash
npm install express-validator
```

### 5. Update Import Statements

Update all import statements in your existing code to use the new structure.

## Breaking Changes

1. **API Versioning** - All endpoints now require `/v1/` prefix
2. **Response Format** - All responses now follow consistent format
3. **Error Handling** - Error responses are now standardized
4. **Validation** - Request validation is now required for all endpoints

## Rollback Plan

If you need to rollback:

1. Keep the old `routes.ts` file as backup
2. Update `app.ts` to use the old routes temporarily
3. Gradually migrate endpoints one by one

## Testing

After migration:

1. Test all authentication endpoints
2. Test user management functionality
3. Test market operations
4. Test transfer functionality
5. Test player-specific endpoints
6. Verify error handling works correctly

## Support

If you encounter issues during migration:

1. Check the API documentation in `/src/api/README.md`
2. Review the type definitions in `/src/api/v1/types/`
3. Check the middleware implementations
4. Verify environment variables are set correctly 