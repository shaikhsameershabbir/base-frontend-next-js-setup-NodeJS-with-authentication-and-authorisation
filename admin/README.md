# Modern Admin Panel

A beautiful, responsive admin panel built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **Modern UI/UX**: Clean, professional design with dark/light mode support
- **Responsive Design**: Fully responsive across all devices
- **Component-Based**: Modular architecture with reusable components
- **Authentication**: Login system with demo credentials
- **Dashboard**: Comprehensive analytics and metrics
- **User Management**: Complete user CRUD operations
- **Settings**: Configurable application settings
- **Navigation**: Collapsible sidebar with nested menu items
- **Search**: Global search functionality
- **Notifications**: Real-time notification system

## 🎨 Design System

### Color Scheme
- **Primary**: Blue (#3B82F6) - Main brand color
- **Secondary**: Light gray (#F1F5F9) - Supporting elements
- **Tertiary**: Purple (#8B5CF6) - Accent color
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)

### Typography
- **Font**: Inter (system font stack)
- **Headings**: Bold weights with proper hierarchy
- **Body**: Regular weight for readability

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React hooks
- **Authentication**: Local storage (demo)

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── (routes)/          # Route groups
│   ├── dashboard/         # Dashboard page
│   ├── users/            # Users management
│   ├── analytics/        # Analytics page
│   ├── settings/         # Settings page
│   └── login/            # Login page
├── components/           # Reusable components
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── auth/            # Authentication components
│   └── dashboard/       # Dashboard-specific components
└── lib/                 # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials
- **Email**: admin@example.com
- **Password**: admin123

## 📱 Pages & Features

### Login Page (`/login`)
- Modern login form with validation
- Password visibility toggle
- Remember me functionality
- Demo credentials display

### Dashboard (`/dashboard`)
- Key metrics cards with trends
- Recent activity feed
- Quick action cards
- Analytics overview placeholder

### Users (`/users`)
- User list with search functionality
- User status management
- Role-based badges
- Action buttons (edit, delete)

### Analytics (`/analytics`)
- Traffic overview
- User demographics
- Device analytics
- Top pages performance
- Real-time statistics

### Settings (`/settings`)
- General application settings
- Appearance customization
- Notification preferences
- Security settings
- Database status

## 🎯 Key Components

### Layout Components
- **AdminLayout**: Main layout wrapper
- **Navbar**: Top navigation with search and user menu
- **Sidebar**: Collapsible navigation menu

### UI Components
- **StatsCard**: Reusable metric cards
- **RecentActivity**: Activity feed component
- **LoginForm**: Authentication form

### Features
- **Responsive Design**: Mobile-first approach
- **Search**: Global search with real-time filtering
- **Notifications**: Badge indicators and dropdown
- **Theme Support**: CSS variables for easy customization

## 🎨 Customization

### Colors
Update the color scheme in `src/app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  --tertiary: 262.1 83.3% 57.8%;
  /* ... other colors */
}
```

### Components
All components are built with shadcn/ui and can be customized by modifying the component files in `src/components/ui/`.

### Layout
Modify the sidebar navigation in `src/components/layout/sidebar.tsx` to add/remove menu items.

## 🔧 Development

### Adding New Pages
1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Import and use the `AdminLayout` component
4. Add navigation item to the sidebar

### Adding New Components
1. Create component in appropriate directory under `src/components/`
2. Export the component
3. Import and use in your pages

### Styling
- Use Tailwind CSS classes for styling
- Follow the design system color palette
- Ensure responsive design with mobile-first approach

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables
Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_APP_NAME=Admin Panel
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Lucide](https://lucide.dev/) for the icons
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Next.js](https://nextjs.org/) for the React framework

---

Built with ❤️ using modern web technologies
