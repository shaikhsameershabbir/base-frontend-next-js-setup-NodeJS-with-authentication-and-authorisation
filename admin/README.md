# Matka SK Admin Frontend Documentation

A modern Next.js admin panel with role-based authentication and dynamic user interface.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Configuration](#environment-configuration)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Routing & Navigation](#routing--navigation)
- [Styling & Theming](#styling--theming)
- [Role-Based Features](#role-based-features)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Build & Deployment](#build--deployment)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

The Matka SK Admin Frontend is a modern, responsive web application built with Next.js 14 and TypeScript. It provides a comprehensive interface for managing users with different roles and permissions in a hierarchical system.

### Key Features
- 🔐 Role-based authentication
- 👥 Hierarchical user management
- 🎨 Modern, responsive UI
- 🌙 Dark/Light theme support
- 📱 Mobile-friendly design
- ⚡ Real-time data updates
- 🔒 Secure API communication

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Authentication**: JWT tokens
- **Package Manager**: npm

## 📁 Project Structure

```
admin/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (routes)/           # Route groups
│   │   ├── analytics/          # Analytics page
│   │   ├── dashboard/          # Dashboard page
│   │   ├── login/              # Login page
│   │   ├── markets/            # Markets pages
│   │   ├── points/             # Points management
│   │   ├── profile/            # User profile page
│   │   ├── settings/           # Settings page
│   │   ├── users/              # User management page
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # Reusable components
│   │   ├── auth/               # Authentication components
│   │   │   └── login-form.tsx  # Login form
│   │   ├── dashboard/          # Dashboard components
│   │   ├── layout/             # Layout components
│   │   │   ├── admin-layout.tsx
│   │   │   ├── navbar.tsx
│   │   │   └── sidebar.tsx
│   │   ├── theme/              # Theme components
│   │   │   ├── theme-provider.tsx
│   │   │   └── theme-switcher.tsx
│   │   └── ui/                 # Base UI components
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── ...
│   └── lib/                    # Utilities and services
│       ├── api.ts              # API service
│       └── utils.ts            # Utility functions
├── public/                     # Static assets
├── components.json             # shadcn/ui configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── next.config.mjs             # Next.js configuration
└── package.json
```

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend server running (see backend documentation)

### Installation Steps

1. **Navigate to admin directory**
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

6. **Open browser**
   ```
   http://localhost:3000
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
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Authentication
NEXT_PUBLIC_APP_NAME=Matka SK Admin

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

### Environment Variables Explained

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3001/api` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Matka SK Admin` | No |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | - | No |

## 🧩 Component Architecture

### Component Hierarchy

```
App Layout
├── Theme Provider
├── Navigation
│   ├── Navbar
│   └── Sidebar
└── Page Content
    ├── Authentication Pages
    ├── Dashboard
    ├── User Management
    └── Profile Management
```

### Core Components

#### Authentication Components
- **LoginForm**: Handles user authentication
- **AuthGuard**: Protects routes from unauthorized access

#### Layout Components
- **AdminLayout**: Main application layout
- **Navbar**: Top navigation bar
- **Sidebar**: Side navigation menu

#### UI Components
- **Button**: Reusable button component
- **Card**: Content container component
- **Input**: Form input component
- **Badge**: Status indicator component

### Component Usage Examples

#### Login Form
```tsx
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  const handleLogin = async (username: string, password: string) => {
    // Handle login logic
  }

  return <LoginForm onLogin={handleLogin} isLoading={false} />
}
```

#### User Card
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function UserCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.username}</CardTitle>
        <Badge>{user.role}</Badge>
      </CardHeader>
      <CardContent>
        <p>Balance: ₹{user.balance}</p>
      </CardContent>
    </Card>
  )
}
```

## 🔄 State Management

### Local State
- **React Hooks**: useState, useEffect, useContext
- **Form State**: Controlled components with useState
- **Loading States**: Boolean flags for async operations

### Global State
- **Authentication**: localStorage + React Context
- **Theme**: Context API for dark/light mode
- **User Data**: API service with caching

### State Management Patterns

#### Authentication State
```tsx
// Store user data in localStorage
localStorage.setItem("user", JSON.stringify(userData))
localStorage.setItem("authToken", token)

// Retrieve on app load
const user = JSON.parse(localStorage.getItem("user") || "null")
```

#### API State Management
```tsx
const [users, setUsers] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  loadUsers()
}, [])

const loadUsers = async () => {
  try {
    setLoading(true)
    const response = await apiService.getUsers()
    setUsers(response.data.users)
  } catch (error) {
    console.error('Error loading users:', error)
  } finally {
    setLoading(false)
  }
}
```

## 🔌 API Integration

### API Service Structure

The application uses a centralized API service (`src/lib/api.ts`) that provides:

- **Type-safe interfaces** for all API responses
- **Automatic token management**
- **Error handling and retry logic**
- **Request/response interceptors**

### API Service Usage

```tsx
import { apiService } from "@/lib/api"

// Login
const response = await apiService.login(username, password)

// Get users
const usersResponse = await apiService.getUsers()

// Update profile
const profileResponse = await apiService.updateProfile(data)
```

### Error Handling

```tsx
try {
  const response = await apiService.getUsers()
  setUsers(response.data.users)
} catch (error) {
  if (error instanceof Error) {
    alert(error.message)
  } else {
    alert('An unexpected error occurred')
  }
}
```

### Authentication Flow

1. **Login**: User submits credentials
2. **Token Storage**: JWT token stored in localStorage
3. **API Calls**: Token automatically included in headers
4. **Token Refresh**: Not implemented (stateless design)
5. **Logout**: Token removed from localStorage

## 🧭 Routing & Navigation

### App Router Structure

```
/                    # Home/Redirect page
/login               # Authentication page
/dashboard           # Main dashboard
/users               # User management
/profile             # User profile
/settings            # Application settings
/analytics           # Analytics dashboard
/markets/*           # Market management
/points/*            # Points management
```

### Route Protection

```tsx
// Check authentication on route change
useEffect(() => {
  const token = localStorage.getItem("authToken")
  if (!token) {
    router.push("/login")
  }
}, [router])
```

### Dynamic Navigation

Navigation items are filtered based on user role:

```tsx
const navigationItems = [
  { href: "/dashboard", label: "Dashboard", roles: ["superadmin", "admin", "distributor"] },
  { href: "/users", label: "Users", roles: ["superadmin", "admin", "distributor"] },
  { href: "/profile", label: "Profile", roles: ["superadmin", "admin", "distributor", "player"] },
]
```

## 🎨 Styling & Theming

### Design System

The application uses a comprehensive design system built with:

- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality component library
- **Custom CSS Variables**: For consistent theming
- **Responsive Design**: Mobile-first approach

### Color Scheme

```css
:root {
  --primary: 222.2 84% 4.9%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}
```

### Theme Support

The application supports both light and dark themes:

```tsx
import { ThemeProvider } from "@/components/theme/theme-provider"

export default function RootLayout({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

### Responsive Design

```tsx
// Mobile-first responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## 👥 Role-Based Features

### Role Hierarchy

```
Superadmin → Admin → Distributor → Player
```

### Feature Access by Role

#### Superadmin
- ✅ View all users
- ✅ Create admin accounts
- ✅ Access all system data
- ✅ Full system administration

#### Admin
- ✅ View distributors and players under them
- ✅ Create distributor accounts
- ✅ Manage player accounts
- ✅ View hierarchy reports

#### Distributor
- ✅ View players under them
- ✅ Create player accounts
- ✅ Manage player balances
- ✅ View player activities

#### Player
- ✅ View own profile
- ✅ Update personal information
- ✅ View own balance
- ✅ Access player features

### Dynamic UI Components

```tsx
// Show/hide components based on role
{user.role === 'superadmin' && (
  <Button onClick={createAdmin}>Create Admin</Button>
)}

{user.role === 'admin' && (
  <Button onClick={createDistributor}>Create Distributor</Button>
)}
```

### Route Protection

```tsx
// Protect routes based on role
const allowedRoles = ['superadmin', 'admin']
if (!allowedRoles.includes(user.role)) {
  router.push('/profile')
}
```

## 🔄 Development Workflow

### Code Style Guidelines

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js rules
- **Prettier**: Code formatting (recommended)
- **Component Structure**: Functional components with hooks

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

- **Components**: PascalCase (e.g., `UserCard.tsx`)
- **Pages**: kebab-case (e.g., `user-management.tsx`)
- **Utilities**: camelCase (e.g., `apiService.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)

### Component Development

```tsx
// Component template
interface ComponentProps {
  // Define props
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
  )
}
```

## 🧪 Testing

### Manual Testing

#### Test Scenarios
1. **Authentication Flow**
   - Login with valid credentials
   - Login with invalid credentials
   - Logout functionality

2. **Role-Based Access**
   - Test each role's permissions
   - Verify data access restrictions
   - Check UI element visibility

3. **User Management**
   - View users (role-dependent)
   - Update user information
   - Create new users (role-dependent)

4. **Responsive Design**
   - Test on different screen sizes
   - Verify mobile navigation
   - Check touch interactions

### Testing Tools

- **Browser DevTools**: For debugging
- **React Developer Tools**: For component inspection
- **Network Tab**: For API request monitoring
- **Console**: For error logging

### Automated Testing
*Not implemented - consider adding Jest/React Testing Library*

## 🚀 Build & Deployment

### Production Build

```bash
# Install dependencies
npm install

# Build application
npm run build

# Start production server
npm start
```

### Environment Configuration

```env
# Production environment
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_APP_NAME=Matka SK Admin
```

### Deployment Options

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify
```bash
# Build command
npm run build

# Publish directory
out/
```

#### Docker
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

### Performance Optimization

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: `@next/bundle-analyzer`
- **Caching**: Static generation where possible

## 🔧 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install
```

#### API Connection Issues
- Verify backend server is running
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure CORS is properly configured on backend

#### Authentication Issues
- Clear localStorage: `localStorage.clear()`
- Check JWT token expiration
- Verify token format in browser devtools

#### Styling Issues
- Check Tailwind CSS configuration
- Verify CSS imports in `globals.css`
- Ensure theme provider is properly configured

### Debug Mode

```bash
# Enable Next.js debug mode
DEBUG=* npm run dev

# Enable React strict mode
# Add to next.config.mjs
```

### Performance Issues

- **Bundle Size**: Use bundle analyzer
- **API Calls**: Implement caching
- **Images**: Use Next.js Image optimization
- **Fonts**: Use `next/font` for optimization

## 📱 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🔒 Security Considerations

- **HTTPS**: Required in production
- **CSP**: Content Security Policy headers
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Token-based validation
- **Secure Headers**: Security headers configuration

## 📞 Support

For issues and questions:
1. Check this documentation
2. Review browser console for errors
3. Verify environment configuration
4. Test with provided demo credentials
5. Check backend server status

## 📄 License

This project is licensed under the ISC License.
