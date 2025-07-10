# Matka SK - Complete Deployment & System Guide

Comprehensive guide for deploying and managing the Matka SK admin panel and backend system with advanced authentication, authorization, and hierarchical user management.

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Architecture & Features](#architecture--features)
- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Authentication & Authorization](#authentication--authorization)
- [User Hierarchy System](#user-hierarchy-system)
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
│   │   ├── models/          # MongoDB models
│   │   ├── middlewares/     # Auth & validation
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utilities
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

5. **Security Features**
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
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://your-domain.com

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
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '2G',
    restart_delay: 4000,
    max_restarts: 10,
    watch: false,
    ignore_watch: ['node_modules', 'logs']
  }]
};
```

#### Start Application
```bash
# Create logs directory
mkdir logs

# Start with PM2
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
        proxy_pass http://localhost:3001;
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
        proxy_pass http://localhost:3001/health;
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

#### Navigate to Frontend Directory
```bash
cd /var/www/matka-sk/admin
```

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
```bash
# Create production environment file
nano .env.production
```

**Production Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_APP_NAME=Matka SK Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

#### Build Application
```bash
npm run build
```

### 2. Nginx Configuration for Frontend

#### Create Frontend Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/matka-sk-frontend
```

**Frontend Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /var/www/matka-sk/admin/.next;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Cache static assets
    location /_next/static/ {
        alias /var/www/matka-sk/admin/.next/static/;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location /api/ {
        proxy_pass https://api.your-domain.com;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Main application
    location / {
        try_files $uri $uri/ /_next/static/$uri /_next/static/$uri/ /index.html;
    }
}
```

#### Enable Frontend Site
```bash
sudo ln -s /etc/nginx/sites-available/matka-sk-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🗄️ Database Setup

### 1. MongoDB Security

#### Create Database User
```bash
# Connect to MongoDB
mongosh

# Create admin user
use admin
db.createUser({
  user: "admin",
  pwd: "secure-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
})

# Create application user
use matka-sk-prod
db.createUser({
  user: "matka-app",
  pwd: "app-secure-password",
  roles: ["readWrite"]
})
```

#### Configure MongoDB Authentication
```bash
sudo nano /etc/mongod.conf
```

**Add to mongod.conf:**
```yaml
security:
  authorization: enabled

# Performance optimization
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2
    collectionConfig:
      blockCompressor: snappy

# Logging
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
  logRotate: reopen
```

#### Restart MongoDB
```bash
sudo systemctl restart mongod
```

### 2. Update Application Connection String
```env
MONGODB_URI=mongodb://matka-app:app-secure-password@localhost:27017/matka-sk-prod
```

### 3. Database Indexes
The application automatically creates the following indexes:

**Users Collection:**
- `username` (unique)
- `role`
- `parentId`
- `isActive`

**UserHierarchy Collection:**
- `userId` (unique)
- `path` (for downline queries)
- `parentId`
- `role`
- `level`
- `isActive`

## 🔐 Authentication & Authorization

### Authentication Flow

#### 1. Login Process
```javascript
// 1. User submits credentials
POST /api/auth/login
{
  "username": "admin1",
  "password": "admin123"
}

// 2. Server validates credentials
// 3. Server generates JWT tokens
// 4. Server sets HTTP-only cookies
// 5. Server returns user data
{
  "success": true,
  "data": {
    "user": { /* user object */ },
    "tokenExpires": "2025-07-10T12:00:00.000Z"
  }
}
```

#### 2. Token Refresh
```javascript
// Automatic token refresh using refresh token
POST /api/auth/refresh
// Returns new access token
```

#### 3. Logout
```javascript
// Blacklists both tokens and clears cookies
POST /api/auth/logout
```

### Authorization System

#### Role Hierarchy
```javascript
const roleHierarchy = {
  superadmin: ['admin', 'distributor', 'agent', 'player'],
  admin: ['distributor', 'agent', 'player'],
  distributor: ['agent', 'player'],
  agent: ['player'],
  player: []
};
```

#### Access Control Middleware
```javascript
// Role-based access control
requireRole(['admin', 'superadmin'])

// Hierarchy-based access control
setAccessibleUsers() // Sets accessibleUserIds based on hierarchy
```

### Security Features

#### 1. Password Security
- Bcrypt hashing with salt rounds: 10
- Minimum password length: 6 characters
- Password validation on registration

#### 2. JWT Security
- Access token expiration: 15 minutes
- Refresh token expiration: 7 days
- Token blacklisting on logout
- Secure HTTP-only cookies

#### 3. Rate Limiting
- Global rate limit: 100 requests per 15 minutes
- Login rate limit: 5 attempts per 15 minutes
- IP-based rate limiting

#### 4. Input Validation
- Request body validation
- SQL injection prevention
- XSS protection
- Input sanitization

## 👥 User Hierarchy System

### Hierarchy Structure
```
Superadmin (Level 0)
├── Admin (Level 1) - 5 admins under superadmin
    ├── Distributor (Level 2) - 3 distributors per admin
        ├── Agent (Level 3) - 3 agents per distributor
            └── Player (Level 4) - 3 players per agent
```

### Database Schema

#### UserHierarchy Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to users._id
  username: String,
  role: String,
  parentId: ObjectId,
  parentUsername: String,
  parentRole: String,
  path: [ObjectId], // Full ancestor path for efficient queries
  level: Number, // Hierarchy level (0-4)
  downlineCount: {
    admin: Number,
    distributor: Number,
    agent: Number,
    player: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Hierarchy Queries

#### 1. Get Complete Downline
```javascript
// Get all users under admin's hierarchy
const downline = await HierarchyService.getDownline(adminId, 'player');
```

#### 2. Get Direct Downline
```javascript
// Get immediate children only
const directDownline = await HierarchyService.getDirectDownline(adminId, 'distributor');
```

#### 3. Get Downline Statistics
```javascript
// Get counts and balances by role
const stats = await HierarchyService.getDownlineStats(adminId);
```

#### 4. Access Control
```javascript
// Check if user can access target user
const canAccess = await HierarchyService.canAccessUser(adminId, targetUserId);
```

### API Endpoints

#### User Management
```javascript
// Get all users accessible to current user
GET /api/users

// Get users by role under current user
GET /api/users/player/all

// Get users by role under specific user
GET /api/users/agent/distributor123

// Get specific user details
GET /api/users/userId

// Update user
PUT /api/users/userId
```

#### Hierarchy Management
```javascript
// Get user's complete downline
GET /api/hierarchy/downline?role=player&page=1&limit=20

// Get user's direct downline
GET /api/hierarchy/direct-downline?role=distributor

// Get downline statistics
GET /api/hierarchy/stats

// Get user's upline
GET /api/hierarchy/upline

// Get specific user details (if in downline)
GET /api/hierarchy/user/userId
```

## 🔐 SSL/HTTPS Setup

### 1. Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtain SSL Certificates
```bash
# For backend API
sudo certbot --nginx -d api.your-domain.com

# For frontend
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Auto-renewal Setup
```bash
# Test auto-renewal
sudo certbot renew --dry-run

# Add to crontab
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring & Logging

### 1. PM2 Monitoring
```bash
# Monitor applications
pm2 monit

# View logs
pm2 logs

# View specific app logs
pm2 logs matka-sk-backend

# Monitor memory and CPU usage
pm2 show matka-sk-backend
```

### 2. Application Logging
```javascript
// Structured logging with Winston
logger.info('User logged in', {
  userId: user._id,
  role: user.role,
  ip: req.ip,
  userAgent: req.get('User-Agent')
});
```

### 3. Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 4. MongoDB Monitoring
```bash
# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Database statistics
mongosh --eval "db.stats()"
```

## 💾 Backup Strategy

### 1. Database Backup
```bash
# Create backup script
nano /var/www/matka-sk/backup.sh
```

**backup.sh:**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/matka-sk"
mkdir -p $BACKUP_DIR

# MongoDB backup
mongodump --db matka-sk-prod --out $BACKUP_DIR/mongodb_$DATE

# Compress backup
tar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz $BACKUP_DIR/mongodb_$DATE
rm -rf $BACKUP_DIR/mongodb_$DATE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "mongodb_*.tar.gz" -mtime +7 -delete

echo "Backup completed: mongodb_$DATE.tar.gz"
```

#### Setup Automated Backups
```bash
# Make script executable
chmod +x /var/www/matka-sk/backup.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add this line:
0 2 * * * /var/www/matka-sk/backup.sh
```

### 2. Application Backup
```bash
# Backup application files
tar -czf /var/backups/matka-sk/app_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/matka-sk
```

## 🛡️ Security Checklist

### ✅ Server Security
- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication only
- [ ] Fail2ban installed and configured
- [ ] Regular system updates enabled
- [ ] Unnecessary services disabled

### ✅ Application Security
- [ ] Strong JWT secrets configured (32+ characters)
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Rate limiting configured
- [ ] Helmet security headers enabled
- [ ] Password hashing with bcrypt

### ✅ Database Security
- [ ] MongoDB authentication enabled
- [ ] Strong passwords used
- [ ] Network access restricted
- [ ] Regular backups configured
- [ ] Database logs monitored
- [ ] Proper indexes created

### ✅ SSL/HTTPS
- [ ] SSL certificates installed
- [ ] Auto-renewal configured
- [ ] HTTP to HTTPS redirect
- [ ] Security headers configured
- [ ] HSTS enabled

### ✅ Authentication & Authorization
- [ ] JWT token rotation implemented
- [ ] Refresh token system working
- [ ] Token blacklisting enabled
- [ ] Role-based access control tested
- [ ] Hierarchy-based access control tested
- [ ] Password policies enforced

### ✅ Monitoring
- [ ] Application logs monitored
- [ ] Error tracking implemented
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Alert system configured

## 📚 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin1",
  "password": "admin123"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
```

#### Logout
```http
POST /api/auth/logout
```

#### Logout All Sessions
```http
POST /api/auth/logout-all
```

### User Management Endpoints

#### Get All Users
```http
GET /api/users
Authorization: Bearer <access_token>
```

#### Get Users by Role
```http
GET /api/users/{role}/{userId}
Authorization: Bearer <access_token>

# Examples:
GET /api/users/player/all          # All players under current user
GET /api/users/agent/distributor123 # All agents under distributor123
```

#### Get User by ID
```http
GET /api/users/{userId}
Authorization: Bearer <access_token>
```

#### Update User
```http
PUT /api/users/{userId}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "balance": 50000,
  "isActive": true
}
```

### Hierarchy Endpoints

#### Get Downline
```http
GET /api/hierarchy/downline?role=player&page=1&limit=20
Authorization: Bearer <access_token>
```

#### Get Direct Downline
```http
GET /api/hierarchy/direct-downline?role=distributor
Authorization: Bearer <access_token>
```

#### Get Downline Statistics
```http
GET /api/hierarchy/stats
Authorization: Bearer <access_token>
```

#### Get Upline
```http
GET /api/hierarchy/upline
Authorization: Bearer <access_token>
```

### User Registration Endpoints

#### Register Admin (Superadmin only)
```http
POST /api/register/admin
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "newadmin",
  "password": "admin123",
  "balance": 100000
}
```

#### Register Distributor (Admin only)
```http
POST /api/register/distributor
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "newdistributor",
  "password": "dist123",
  "balance": 50000
}
```

#### Register Player (Distributor only)
```http
POST /api/register/player
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "username": "newplayer",
  "password": "player123",
  "balance": 1000
}
```

## 🔧 Troubleshooting

### Common Issues

#### Authentication Issues
```bash
# Check JWT configuration
pm2 env matka-sk-backend | grep JWT

# Check token blacklist
mongosh --eval "use matka-sk-prod; db.tokenblacklists.find()"

# Check user authentication
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"smasher","password":"123456"}'
```

#### Hierarchy Issues
```bash
# Check hierarchy data
mongosh --eval "use matka-sk-prod; db.userhierarchies.find().limit(5)"

# Check user relationships
mongosh --eval "use matka-sk-prod; db.users.find({role:'admin'}).limit(3)"
```

#### PM2 Issues
```bash
# Check PM2 status
pm2 status

# Restart application
pm2 restart matka-sk-backend

# View detailed logs
pm2 logs matka-sk-backend --lines 100

# Check memory usage
pm2 show matka-sk-backend
```

#### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log
```

#### MongoDB Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Connect to MongoDB
mongosh

# Check database
show dbs
use matka-sk-prod
show collections

# Check indexes
db.users.getIndexes()
db.userhierarchies.getIndexes()
```

#### Application Issues
```bash
# Check application logs
pm2 logs matka-sk-backend

# Check environment variables
pm2 env matka-sk-backend

# Restart with fresh environment
pm2 restart matka-sk-backend --update-env

# Check health endpoint
curl http://localhost:3001/health
```

### Performance Optimization

#### Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
client_max_body_size 10M;

# Gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

#### MongoDB Optimization
```yaml
# Add to mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2
    collectionConfig:
      blockCompressor: snappy

# Index optimization
operationProfiling:
  mode: slowOp
  slowOpThresholdMs: 100
```

#### Node.js Optimization
```javascript
// PM2 ecosystem optimization
{
  instances: 'max',
  exec_mode: 'cluster',
  max_memory_restart: '2G',
  node_args: '--max-old-space-size=2048'
}
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] **Daily**: Check application logs for errors
- [ ] **Weekly**: Monitor database performance
- [ ] **Weekly**: Check backup status
- [ ] **Monthly**: Update system packages
- [ ] **Monthly**: Review security logs
- [ ] **Monthly**: Test authentication system
- [ ] **Quarterly**: Test backup restoration
- [ ] **Quarterly**: Review performance metrics
- [ ] **Quarterly**: Update SSL certificates

### Monitoring Tools
- **PM2**: Application monitoring and process management
- **Nginx**: Web server monitoring and access logs
- **MongoDB**: Database monitoring and performance
- **Uptime Robot**: External monitoring and alerts
- **Logwatch**: Automated log analysis
- **Prometheus + Grafana**: Advanced monitoring (optional)

### Emergency Procedures
1. **Application Down**: 
   - Check PM2 status: `pm2 status`
   - Restart application: `pm2 restart matka-sk-backend`
   - Check logs: `pm2 logs matka-sk-backend`

2. **Database Issues**: 
   - Check MongoDB status: `sudo systemctl status mongod`
   - Check connectivity: `mongosh --eval "db.adminCommand('ping')"`
   - Review logs: `sudo tail -f /var/log/mongodb/mongod.log`

3. **Authentication Issues**:
   - Check JWT configuration
   - Verify token blacklist
   - Test login endpoint

4. **SSL Issues**: 
   - Renew certificates: `sudo certbot renew`
   - Check certificate validity: `sudo certbot certificates`

5. **Security Breach**: 
   - Review access logs
   - Update all passwords
   - Check for unauthorized access
   - Review user hierarchy

### Performance Monitoring
```bash
# Monitor system resources
htop

# Monitor MongoDB performance
mongosh --eval "db.currentOp()"

# Monitor application performance
pm2 monit

# Check disk usage
df -h

# Check memory usage
free -h
```

## 📄 License

This deployment guide is part of the Matka SK project and is licensed under the ISC License.

## 🤝 Support

For technical support and questions:
- **Documentation**: Check this guide and project README
- **Issues**: Create GitHub issues for bugs
- **Security**: Report security issues privately
- **Updates**: Follow the project for updates and new features

---

**Last Updated**: July 2025
**Version**: 1.0.0
**Compatibility**: Node.js 18+, MongoDB 6.0+, Next.js 14 