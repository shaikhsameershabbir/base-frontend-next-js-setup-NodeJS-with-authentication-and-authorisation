# Production Deployment Guide

This guide explains how to deploy your Next.js application to a production server with a specific port.

## Prerequisites

- Node.js 18+ installed on your server
- npm or yarn package manager
- PM2 (optional, for process management): `npm install -g pm2`

## Environment Setup

1. **Create environment files:**
   ```bash
   # Copy the example file
   cp .env.example .env.local     # For development
   cp .env.example .env.production # For production
   ```

2. **Configure environment variables:**
   Edit `.env.production` with your production settings:
   ```env
   NODE_ENV=production
   PORT=3001
   NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXTAUTH_URL=https://your-domain.com
   NEXTAUTH_SECRET=your-production-secret-key
   ```

## Deployment Options

### Option 1: Quick Deployment (Recommended)

```bash
# Make scripts executable
chmod +x deploy.sh build-production.sh start-production.sh

# Deploy with one command
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# 1. Install dependencies
npm ci

# 2. Build for production
npm run build:prod

# 3. Start the application
npm run start:prod
```

### Option 3: PM2 Process Management

```bash
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run dev:port` - Start development server with custom port
- `npm run build:prod` - Build for production
- `npm run start:prod` - Start production server
- `npm run serve` - Build and start production server

## Port Configuration

The application uses these ports by default:
- **Development**: 3000
- **Production**: 3001

To use a custom port:
```bash
PORT=8080 npm run start:prod
```

Or set it in your environment file:
```env
PORT=8080
```

## PM2 Commands

```bash
# Check application status
pm2 status

# View logs
pm2 logs website-frontend

# Restart application
pm2 restart website-frontend

# Stop application
pm2 stop website-frontend

# Monitor resource usage
pm2 monit
```

## Security Considerations

- Always use HTTPS in production
- Set strong secrets in environment variables
- Configure firewall to only allow necessary ports
- Keep dependencies updated
- Use a reverse proxy (nginx/apache) for additional security

## Troubleshooting

### Application won't start
1. Check if port is already in use: `netstat -tlnp | grep :3001`
2. Verify environment variables are set correctly
3. Check logs: `pm2 logs website-frontend` or check console output

### Build fails
1. Clear Next.js cache: `rm -rf .next`
2. Delete node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npm run lint`

### Performance Issues
1. Check memory usage: `pm2 monit`
2. Enable compression in reverse proxy
3. Consider using CDN for static assets

## Health Check

The application will be available at:
- Local: `http://localhost:3001`
- Production: `https://your-domain.com`

## Logs Location

When using PM2, logs are stored in:
- Combined logs: `./logs/app.log`
- Output logs: `./logs/out.log`
- Error logs: `./logs/error.log`
