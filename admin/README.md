# MR GAME Admin Panel

A modern, production-level admin panel built with Next.js 14, TypeScript, and Tailwind CSS, designed to manage the MR GAME backend system.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Configuration](#environment-configuration)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Components](#components)
- [Hooks](#hooks)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT Token Management**: Secure authentication with access and refresh tokens
- **Role-Based Access Control**: Hierarchical user roles (Superadmin → Admin → Distributor → Agent → Player)
- **Automatic Token Refresh**: Seamless token renewal without user intervention
- **Session Management**: Secure logout and session cleanup

### 👥 User Management
- **User CRUD Operations**: Create, read, update, and delete users
- **Role-Specific User Creation**: Create users with appropriate roles
- **User Status Management**: Activate/deactivate users
- **Password Management**: Update user passwords securely
- **Market Assignments**: Assign and manage markets for users

### 🏪 Market Management
- **Market CRUD Operations**: Full market lifecycle management
- **Market Status Control**: Open, close, or suspend markets
- **Market Assignment**: Assign markets to users based on hierarchy
- **Market Analytics**: View market performance and statistics

### 💰 Transfer Management
- **Balance Transfers**: Process transfers between users
- **Transfer History**: View complete transfer history
- **Transfer Statistics**: Analytics and reporting
- **Child User Management**: Manage downline users

### 📊 Activity Monitoring
- **Activity Logging**: Track all user actions
- **Activity Filtering**: Filter by user, action, and date
- **Activity Analytics**: Comprehensive activity reporting

### 🎨 Modern UI/UX
- **Responsive Design**: Works on all device sizes
- **Dark/Light Theme**: Toggle between themes
- **Modern Components**: Built with shadcn/ui components
- **Loading States**: Smooth loading indicators
- **Error Handling**: Comprehensive error management

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: React Hooks + Context
- **HTTP Client**: Axios
- **Authentication**: JWT with refresh tokens
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation

## 📁 Project Structure

```
admin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (routes)/          # Protected routes
│   │   ├── login/             # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── users/             # User management pages
│   │   ├── markets/           # Market management pages
│   │   ├── transfers/         # Transfer management pages
│   │   ├── activities/        # Activity monitoring pages
│   │   ├── profile/           # User profile pages
│   │   ├── settings/          # Settings pages
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── layout/           # Layout components
│   │   ├── auth/             # Authentication components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── modals/           # Modal components
│   │   └── theme/            # Theme components
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts        # Authentication hook
│   │   ├── useUsers.ts       # User management hook
│   │   ├── useMarkets.ts     # Market management hook
│   │   ├── useTransfers.ts   # Transfer management hook
│   │   └── useActivities.ts  # Activity monitoring hook
│   └── lib/                  # Utility libraries
│       ├── api-client.ts     # Axios client configuration
│       ├── api-service.ts    # API service functions
│       ├── api-market.ts     # Legacy market API (deprecated)
│       └── api.ts            # Legacy API (deprecated)
├── public/                   # Static assets
├── components.json           # shadcn/ui configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies and scripts
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend README)

### Installation Steps

1. **Clone and navigate to admin directory**
   ```bash
   cd admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables** (see Environment Configuration section)

5. **Start development server**
   ```bash
   npm run dev
   ```

### Available Scripts

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "lint:fix": "next lint --fix"
}
```

## ⚙️ Environment Configuration

Create a `.env.local` file in the admin root directory:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000

# Development
NODE_ENV=development
```

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000/api/v1` | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | - | Yes |
| `NEXTAUTH_URL` | Frontend URL | `http://localhost:3000` | Yes |
| `NODE_ENV` | Environment mode | `development` | No |

## 🔌 API Integration

### API Client Configuration

The admin panel uses a centralized API client (`src/lib/api-client.ts`) with:

- **Automatic Token Management**: Handles access and refresh tokens
- **Request/Response Interceptors**: Automatic error handling and token refresh
- **TypeScript Support**: Full type safety for API calls
- **Error Handling**: Consistent error handling across the app

### API Service Structure

```typescript
// Example API service usage
import { authAPI, usersAPI, marketsAPI } from '@/lib/api-service';

// Authentication
const loginResponse = await authAPI.login({ username, password });

// User management
const usersResponse = await usersAPI.getUsers(1, 10, 'search', 'admin');

// Market management
const marketsResponse = await marketsAPI.getMarkets(1, 10, 'open');
```

### API Response Format

All API responses follow a consistent format:

```typescript
interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Array<{
        field: string;
        message: string;
    }>;
}
```

## 🔐 Authentication

### Authentication Flow

1. **Login**: User provides credentials
2. **Token Storage**: Access and refresh tokens stored in localStorage
3. **Automatic Refresh**: Tokens automatically refreshed before expiration
4. **Logout**: Tokens cleared and user redirected to login

### Authentication Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
    const { user, loading, login, logout, isAuthenticated } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    if (!isAuthenticated) return <div>Please log in</div>;
    
    return <div>Welcome, {user?.username}!</div>;
}
```

### Protected Routes

Routes are automatically protected using the authentication context:

```typescript
// In layout.tsx
import { AuthProvider } from '@/hooks/useAuth';

export default function RootLayout({ children }) {
  return (
        <html>
            <body>
                <AuthProvider>
      {children}
                </AuthProvider>
            </body>
        </html>
    );
}
```

## 🧩 Components

### UI Components

Built with shadcn/ui for consistency and accessibility:

- **Button**: Various button styles and states
- **Input**: Form inputs with validation
- **Card**: Content containers
- **Dialog**: Modal dialogs
- **Table**: Data tables with sorting and pagination
- **Badge**: Status indicators
- **Avatar**: User avatars
- **Dropdown**: Dropdown menus

### Layout Components

- **AdminLayout**: Main layout with sidebar and header
- **Sidebar**: Navigation sidebar
- **Navbar**: Top navigation bar
- **ThemeProvider**: Theme management

### Custom Components

- **AddUserModal**: User creation modal
- **EditUserModal**: User editing modal
- **MarketModal**: Market management modal
- **TransferModal**: Transfer processing modal

## 🎣 Hooks

### Custom Hooks

The admin panel includes several custom hooks for state management:

#### useAuth
```typescript
const { user, loading, login, logout, isAuthenticated } = useAuth();
```

#### useUsers
```typescript
const { 
    users, 
    loading, 
    error, 
    getUsers, 
    createUser, 
    updateUser, 
    deleteUser 
} = useUsers();
```

#### useMarkets
```typescript
const { 
    markets, 
    loading, 
    error, 
    getMarkets, 
    createMarket, 
    updateMarket 
} = useMarkets();
```

#### useTransfers
```typescript
const { 
    transfers, 
    loading, 
    error, 
    processTransfer, 
    getHistory 
} = useTransfers();
```

#### useActivities
```typescript
const { 
    activities, 
    loading, 
    error, 
    getActivities 
} = useActivities();
```

## 🔄 Development Workflow

### Code Style
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit linting

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserTable.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Pages**: kebab-case (e.g., `user-management.tsx`)
- **API Services**: camelCase (e.g., `api-service.ts`)

### Component Structure
```typescript
// Component template
interface ComponentProps {
    // Props interface
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
    );
}
```

## 🚀 Deployment

### Production Build

1. **Build the application**
```bash
npm run build
   ```

2. **Set production environment variables**
   ```env
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
   NEXTAUTH_SECRET=your-production-secret
   NEXTAUTH_URL=https://your-admin-domain.com
   NODE_ENV=production
   ```

3. **Start the server**
   ```bash
npm start
```

### Vercel Deployment

1. **Connect to Vercel**
```bash
   npx vercel
   ```

2. **Set environment variables in Vercel dashboard**

3. **Deploy**
```bash
   npx vercel --prod
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Troubleshooting

### Common Issues

#### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check if backend server is running
- Ensure CORS is properly configured

#### Authentication Issues
- Clear localStorage and try logging in again
- Check if JWT tokens are valid
- Verify backend authentication endpoints

#### Build Issues
- Clear `.next` folder and rebuild
- Check for TypeScript errors
- Verify all dependencies are installed

#### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check if shadcn/ui components are installed
- Verify CSS imports in layout files

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development DEBUG=* npm run dev
```

## 📞 Support

For issues and questions:
1. Check this documentation
2. Review the backend API documentation
3. Check browser console for errors
4. Verify environment configuration
5. Test API endpoints directly

## 📄 License

This project is licensed under the ISC License.
