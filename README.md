# Matka SK Admin & Backend System

A comprehensive role-based authentication system with hierarchical data access control for Matka SK platform.

## Features

- **Role-Based Authentication**: Four-tier hierarchy (superadmin, admin, distributor, player)
- **Cookie-Based Security**: HTTP-only cookies for secure authentication
- **Hierarchical Data Access**: Users can only access data under their role level
- **Modern UI**: Next.js admin panel with Tailwind CSS and shadcn/ui
- **RESTful API**: Node.js/Express backend with MongoDB
- **Type Safety**: Full TypeScript support

## Role Hierarchy

```
Superadmin
├── Admin
│   ├── Distributor
│   │   └── Player
│   └── Player
└── Distributor
    └── Player
```

### Data Access by Role

- **Superadmin**: Access to all users and data
- **Admin**: Access to distributors and players under them
- **Distributor**: Access to players under them
- **Player**: Access only to their own data

## Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/matka-sk
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=http://localhost:3000
   COOKIE_DOMAIN=localhost
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to admin directory**:
   ```bash
   cd admin
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Demo Users

The system includes pre-configured demo users for testing:

| Username | Password | Role |
|----------|----------|------|
| superadmin | superadmin123 | Superadmin |
| admin | admin123 | Admin |
| distributor1 | dist123 | Distributor |
| player1 | player123 | Player |

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### User Management
- `GET /api/auth/users` - Get accessible users
- `GET /api/auth/users/:userId` - Get specific user
- `PUT /api/auth/users/:userId` - Update user

### Health Check
- `GET /health` - Server health status

## Security Features

- **HTTP-Only Cookies**: Prevents XSS attacks
- **CORS Configuration**: Secure cross-origin requests
- **Role-Based Middleware**: Automatic access control
- **JWT Tokens**: Secure session management
- **Password Hashing**: bcrypt encryption

## Frontend Features

- **Responsive Design**: Works on all devices
- **Dark/Light Mode**: Theme switching support
- **Real-time Updates**: Live data synchronization
- **Error Handling**: User-friendly error messages
- **Loading States**: Smooth user experience

## Development

### Backend Structure
```
backend/
├── src/
│   ├── controllers/    # Route handlers
│   ├── middlewares/    # Authentication & validation
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── utils/          # Utilities (JWT, etc.)
│   └── config/         # Configuration files
├── scripts/            # Database scripts
└── docs/              # Documentation
```

### Frontend Structure
```
admin/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # Reusable components
│   ├── lib/           # Utilities & API client
│   └── styles/        # Global styles
└── public/            # Static assets
```

## Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure production MongoDB
3. Set secure JWT secret
4. Configure CORS for production domain
5. Set appropriate cookie domain

### Frontend Deployment
1. Set `NEXT_PUBLIC_API_URL` to production backend URL
2. Build the application: `npm run build`
3. Deploy to Vercel, Netlify, or your preferred platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 