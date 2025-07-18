# Matka SK - Complete Deployment & System Guide

Comprehensive guide for deploying and managing the Matka SK admin panel and backend system with advanced authentication, authorization, hierarchical user management, market management, and transfer functionality.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architecture & Features](#architecture--features)
- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Authentication & Authorization](#authentication--authorization)
- [User Hierarchy System](#user-hierarchy-system)
- [Market Management](#market-management)
- [Transfer System](#transfer-system)
- [Environment Configuration](#environment-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Backup Strategy](#backup-strategy)
- [Security Checklist](#security-checklist)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## 🏗️ System Overview

### Project Structure
```
matka-sk/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   │   ├── auth/        # Authentication controllers
│   │   │   ├── users/       # User management controllers
│   │   │   ├── markets/     # Market management controllers
│   │   │   └── transfers/   # Transfer controllers
│   │   ├── models/          # MongoDB models
│   │   ├── middlewares/     # Auth & validation
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Utilities
│   │   └── config/          # Configuration
│   ├── scripts/             # Database scripts
│   └── docs/                # Documentation
└── admin/                   # Next.js Admin Panel
    ├── src/
    │   ├── app/             # Pages & routing
    │   ├── components/      # UI components
    │   ├── lib/             # Utilities & API
    │   └── styles/          # Styling
    └── public/              # Static assets
```

### Technology Stack
- **Backend**: Node.js, Express, TypeScript, MongoDB
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Process Manager**: PM2
- **Web Server**: Nginx
- **SSL**: Let's Encrypt

## 🚀 Architecture & Features

### Core Features
1. **Multi-Role Authentication System**
   - Superadmin, Admin, Distributor, Agent, Player roles
   - JWT-based authentication with refresh tokens
   - Token blacklisting for security
   - Rate limiting and brute force protection

2. **Hierarchical User Management**
   - 5-level hierarchy: Superadmin → Admin → Distributor → Agent → Player
   - Efficient downline queries using path-based indexing
   - Real-time downline statistics and counts
   - Access control based on hierarchy position

3. **Advanced Authorization**
   - Role-based access control (RBAC)
   - Hierarchy-based access control (HBAC)
   - Dynamic sidebar navigation based on user role
   - API endpoint protection with middleware

4. **User Management**
   - Create, update, and manage users
   - Role-specific user creation
   - Balance management
   - User status management (active/inactive)
   - Cascade delete functionality
   - Password update capabilities

5. **Market Management**
   - Create and manage markets
   - Set open and close times
   - Market status management (active/inactive)
   - Market assignment to users
   - Market-based access control

6. **Transfer System**
   - Balance transfers between users
   - Transfer history tracking
   - Transfer approval workflow
   - Transfer limits and validation

7. **Security Features**
   - Password hashing with bcrypt
   - JWT token rotation
   - CORS configuration
   - Helmet security headers
   - Input validation and sanitization

### User Hierarchy Structure
```
Superadmin (Level 0)
├── Admin (Level 1) - Can manage distributors, agents, players
    ├── Distributor (Level 2) - Can manage agents, players
        ├── Agent (Level 3) - Can manage players
            └── Player (Level 4) - End user
```

## 🔧 Prerequisites

### System Requirements
- **Server**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 4GB (8GB recommended for production)
- **Storage**: 50GB+ available space
- **Node.js**: v18+ LTS
- **MongoDB**: v6.0+
- **Nginx**: Latest stable version
- **PM2**: For process management

### Domain & DNS
- Registered domain name
- DNS records configured for API and admin panel
- SSL certificate (Let's Encrypt recommended)

## 🚀 Backend Deployment

### 1. Server Setup

#### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Install Node.js
```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Install MongoDB
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Install PM2
```bash
sudo npm install -g pm2
```

### 2. Application Deployment

#### Clone Repository
```bash
cd /var/www
sudo git clone <your-repository-url> matka-sk
sudo chown -R $USER:$USER matka-sk
cd matka-sk/backend
```

#### Install Dependencies
```bash
npm install --production
```

#### Build Application
```bash
npm run build
```

#### Environment Configuration
```bash
# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

**Production Environment Variables:**
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/matka-sk-prod

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here-minimum-32-characters
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://your-domain.com

# Cookie Configuration
COOKIE_DOMAIN=your-domain.com

# Logging Configuration
LOG_LEVEL=info
SERVICE_NAME=matka-sk-backend

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_WINDOW_MS=900000
LOGIN_RATE_LIMIT_MAX_REQUESTS=5
```

#### Seed Database
```bash
# Create initial users and hierarchy
npm run seed
```

**Default Superadmin Credentials:**
- Username: `smasher`
- Password: `123456`

### 3. PM2 Configuration

#### Create PM2 Ecosystem File
```bash
# Create ecosystem.config.js
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'matka-sk-backend',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '2G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

#### Start Application
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### 4. Nginx Configuration

#### Install Nginx
```bash
sudo apt install nginx -y
```

#### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/matka-sk-backend
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:5000/health;
        access_log off;
    }
}
```

#### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/matka-sk-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🎨 Frontend Deployment

### 1. Build Application
```bash
cd /var/www/matka-sk/admin

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
nano .env.local
```

**Production Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com
NEXT_PUBLIC_APP_NAME=Matka SK Admin
```

### 2. Build and Deploy
```bash
# Build the application
npm run build

# Start the application
npm start
```

### 3. PM2 Configuration for Frontend
```bash
# Create ecosystem file for frontend
nano ecosystem-frontend.config.js
```

**ecosystem-frontend.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'matka-sk-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/matka-sk/admin',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/frontend-err.log',
    out_file: './logs/frontend-out.log',
    log_file: './logs/frontend-combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
};
```

### 4. Nginx Configuration for Frontend
```bash
sudo nano /etc/nginx/sites-available/matka-sk-frontend
```

**Frontend Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static assets caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🗄️ Database Setup

### MongoDB Configuration
```bash
# Create database user
mongo
use matka-sk-prod
db.createUser({
  user: "matka_user",
  pwd: "secure_password_here",
  roles: ["readWrite"]
})
exit
```

### Database Indexes
```javascript
// User collection indexes
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "parentId": 1, "role": 1 })
db.users.createIndex({ "role": 1 })

// Market collection indexes
db.markets.createIndex({ "marketName": 1 }, { unique: true })
db.markets.createIndex({ "isActive": 1 })

// Transfer collection indexes
db.transfers.createIndex({ "fromUserId": 1 })
db.transfers.createIndex({ "toUserId": 1 })
db.transfers.createIndex({ "status": 1 })
db.transfers.createIndex({ "createdAt": -1 })

// UserMarketAssignment indexes
db.usermarketassignments.createIndex({ "userId": 1 })
db.usermarketassignments.createIndex({ "marketId": 1 })
db.usermarketassignments.createIndex({ "userId": 1, "marketId": 1 }, { unique: true })
```

## 🔐 Authentication & Authorization

### JWT Configuration
- **Access Token**: 15 minutes expiration
- **Refresh Token**: 7 days expiration
- **Token Rotation**: Automatic refresh
- **Blacklisting**: Revoked tokens tracked

### Role Permissions Matrix

| Role | Users | Markets | Transfers | System |
|------|-------|---------|-----------|---------|
| Superadmin | All | All | All | All |
| Admin | Downline | All | Downline | Limited |
| Distributor | Downline | Assigned | Downline | None |
| Agent | Downline | Assigned | Downline | None |
| Player | Self | Assigned | Self | None |

## 👥 User Hierarchy System

### Hierarchy Levels
1. **Superadmin (Level 0)**: System administrator
2. **Admin (Level 1)**: Regional administrator
3. **Distributor (Level 2)**: Area distributor
4. **Agent (Level 3)**: Local agent
5. **Player (Level 4)**: End user

### Data Access Rules
- Users can only access data from their downline
- Hierarchical queries use efficient path-based indexing
- Real-time downline statistics available
- Cascade operations respect hierarchy

## 🏪 Market Management

### Market Features
- **Market Creation**: Admin/Superadmin can create markets
- **Time Management**: Set open and close times
- **Status Control**: Activate/deactivate markets
- **User Assignment**: Assign markets to specific users
- **Access Control**: Users can only access assigned markets

### Market Operations
```bash
# Create market
POST /api/markets
{
  "marketName": "Morning Market",
  "openTime": "2024-01-01T09:00:00.000Z",
  "closeTime": "2024-01-01T12:00:00.000Z"
}

# Assign market to user
POST /api/markets/assign
{
  "userId": "user_id",
  "marketId": "market_id"
}
```

## 💰 Transfer System

### Transfer Features
- **Balance Transfers**: Transfer balance between users
- **Transfer History**: Complete audit trail
- **Status Tracking**: Pending, approved, rejected states
- **Validation**: Transfer limits and user validation
- **Notifications**: Real-time transfer notifications

### Transfer Operations
```bash
# Create transfer
POST /api/transfers
{
  "toUserId": "recipient_id",
  "amount": 1000,
  "description": "Payment for services"
}

# Approve transfer
PUT /api/transfers/:transferId/approve

# Reject transfer
PUT /api/transfers/:transferId/reject
```

## ⚙️ Environment Configuration

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/matka-sk` | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_REFRESH_SECRET` | JWT refresh secret | - | Yes |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token expiration | `15m` | No |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token expiration | `7d` | No |
| `PORT` | Server port | `5000` | No |
| `NODE_ENV` | Environment mode | `development` | No |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` | No |
| `COOKIE_DOMAIN` | Cookie domain | `localhost` | No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5000` | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Matka SK Admin` | No |

## 🔒 SSL/HTTPS Setup

### Let's Encrypt Installation
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d api.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### SSL Configuration
```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com api.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
}
```

## 📊 Monitoring & Logging

### PM2 Monitoring
```bash
# Monitor applications
pm2 monit

# View logs
pm2 logs

# Status check
pm2 status
```

### Winston Logging
```javascript
// Log levels: error, warn, info, debug
// Log files: logs/error.log, logs/combined.log
```

### Health Checks
```bash
# Backend health
curl https://api.your-domain.com/health

# Frontend health
curl https://your-domain.com
```

## 💾 Backup Strategy

### Database Backup
```bash
# Create backup script
nano /opt/backup-mongodb.sh
```

**Backup Script:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
DB_NAME="matka-sk-prod"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --db $DB_NAME --out $BACKUP_DIR/backup_$DATE

# Compress backup
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz -C $BACKUP_DIR backup_$DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/backup_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.tar.gz"
```

### Automated Backups
```bash
# Make script executable
chmod +x /opt/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/backup-mongodb.sh
```

## 🛡️ Security Checklist

### Server Security
- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication
- [ ] Regular security updates
- [ ] Fail2ban installed
- [ ] SSL certificates installed
- [ ] Security headers configured

### Application Security
- [ ] Environment variables secured
- [ ] JWT secrets rotated
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] CORS properly configured
- [ ] Helmet security headers

### Database Security
- [ ] MongoDB authentication enabled
- [ ] Database user with minimal privileges
- [ ] Regular backups configured
- [ ] Network access restricted
- [ ] SSL/TLS enabled for MongoDB

### Monitoring
- [ ] Application monitoring (PM2)
- [ ] Log monitoring
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Security alerts

## 📚 API Documentation

### Base URLs
```
Development: http://localhost:5000/api
Production: https://api.your-domain.com/api
```

### Authentication Endpoints
- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### User Management Endpoints
- `GET /auth/users` - Get accessible users
- `GET /auth/users/:userId` - Get specific user
- `PUT /auth/users/:userId` - Update user
- `DELETE /auth/users/:userId` - Delete user (cascade)
- `PUT /auth/users/:userId/active` - Toggle user status
- `PUT /auth/users/:userId/password` - Update password

### Market Management Endpoints
- `GET /markets` - Get markets
- `POST /markets` - Create market
- `PUT /markets/:marketId` - Update market
- `DELETE /markets/:marketId` - Delete market
- `PUT /markets/:marketId/active` - Toggle market status
- `POST /markets/assign` - Assign market to user

### Transfer Endpoints
- `GET /transfers` - Get transfers
- `POST /transfers` - Create transfer
- `PUT /transfers/:transferId/approve` - Approve transfer
- `PUT /transfers/:transferId/reject` - Reject transfer

### Health Check
- `GET /health` - Server health status

## 🔧 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check PM2 logs
pm2 logs matka-sk-backend

# Check Node.js version
node --version

# Check MongoDB connection
mongo --eval "db.runCommand('ping')"
```

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Test connection
mongo mongodb://localhost:27017/matka-sk-prod
```

#### Nginx Issues
```bash
# Check Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --dry-run

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/your-domain.com/cert.pem -text -noout
```

### Performance Optimization

#### Database Optimization
```javascript
// Add compound indexes for common queries
db.users.createIndex({ "parentId": 1, "role": 1, "isActive": 1 })
db.transfers.createIndex({ "fromUserId": 1, "status": 1, "createdAt": -1 })
```

#### Application Optimization
```javascript
// Enable compression
app.use(compression());

// Cache static assets
app.use(express.static('public', { maxAge: '1y' }));
```

#### Nginx Optimization
```nginx
# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Cache static files
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Emergency Procedures

#### Database Recovery
```bash
# Restore from backup
mongorestore --db matka-sk-prod /opt/backups/backup_20240101_120000/matka-sk-prod/
```

#### Application Rollback
```bash
# Rollback to previous version
pm2 stop matka-sk-backend
git checkout HEAD~1
npm install
pm2 start matka-sk-backend
```

#### Emergency Maintenance Mode
```bash
# Enable maintenance mode
echo "Maintenance Mode" > /var/www/matka-sk/admin/public/maintenance.html

# Update Nginx to serve maintenance page
# Add to Nginx config:
# location / {
#     return 503;
# }
# error_page 503 /maintenance.html;
```

## 📞 Support

### Contact Information
- **Technical Support**: [Your Email]
- **Documentation**: [Your Documentation URL]
- **Issue Tracker**: [Your Issue Tracker URL]

### Useful Commands
```bash
# Check system status
pm2 status
sudo systemctl status nginx mongod

# View logs
pm2 logs
sudo tail -f /var/log/nginx/access.log

# Monitor resources
htop
df -h
free -h
```

### Maintenance Schedule
- **Daily**: Log rotation, health checks
- **Weekly**: Security updates, backup verification
- **Monthly**: Performance review, SSL certificate renewal
- **Quarterly**: Security audit, dependency updates

---

**Last Updated**: January 2024
**Version**: 2.0.0
**Compatibility**: Node.js 18+, MongoDB 6.0+, Next.js 14 