# Matka SK Deployment Guide

Complete guide for deploying the Matka SK backend and frontend to production environments.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Backup Strategy](#backup-strategy)
- [Security Checklist](#security-checklist)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Server**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 20GB+ available space
- **Node.js**: v18+ LTS
- **MongoDB**: v5.0+
- **Nginx**: Latest stable version
- **PM2**: For process management

### Domain & DNS
- Registered domain name
- DNS records configured
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
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3001
NODE_ENV=production

# CORS Configuration
FRONTEND_URL=https://your-domain.com

# Logging Configuration
LOG_LEVEL=info
```

#### Seed Database
```bash
npm run seed
```

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
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10
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
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
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
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    location / {
        try_files $uri $uri/ /_next/static/$uri /_next/static/$uri/ /index.html;
    }

    location /_next/static/ {
        alias /var/www/matka-sk/admin/.next/static/;
        expires 365d;
        access_log off;
    }

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
}
```

#### Enable Frontend Site
```bash
sudo ln -s /etc/nginx/sites-available/matka-sk-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 3. PM2 for Frontend (Optional)

If you want to run the frontend with PM2 instead of static files:

#### PM2 Configuration for Frontend
```javascript
// Add to ecosystem.config.js
{
  name: 'matka-sk-frontend',
  script: 'npm',
  args: 'start',
  cwd: '/var/www/matka-sk/admin',
  env: {
    NODE_ENV: 'production',
    PORT: 3000
  }
}
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
```

#### Restart MongoDB
```bash
sudo systemctl restart mongod
```

### 2. Update Application Connection String
```env
MONGODB_URI=mongodb://matka-app:app-secure-password@localhost:27017/matka-sk-prod
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
```

### 2. Nginx Logs
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 3. MongoDB Logs
```bash
# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### 4. Application Logs
```bash
# PM2 logs
pm2 logs

# Direct log files
tail -f /var/www/matka-sk/backend/logs/combined.log
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
- [ ] Strong JWT secret configured
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Rate limiting considered

### ✅ Database Security
- [ ] MongoDB authentication enabled
- [ ] Strong passwords used
- [ ] Network access restricted
- [ ] Regular backups configured
- [ ] Database logs monitored

### ✅ SSL/HTTPS
- [ ] SSL certificates installed
- [ ] Auto-renewal configured
- [ ] HTTP to HTTPS redirect
- [ ] Security headers configured
- [ ] HSTS enabled

### ✅ Monitoring
- [ ] Application logs monitored
- [ ] Error tracking implemented
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Alert system configured

## 🔧 Troubleshooting

### Common Issues

#### PM2 Issues
```bash
# Check PM2 status
pm2 status

# Restart application
pm2 restart matka-sk-backend

# View detailed logs
pm2 logs matka-sk-backend --lines 100
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
```

#### Application Issues
```bash
# Check application logs
pm2 logs matka-sk-backend

# Check environment variables
pm2 env matka-sk-backend

# Restart with fresh environment
pm2 restart matka-sk-backend --update-env
```

### Performance Optimization

#### Nginx Optimization
```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
client_max_body_size 10M;
```

#### MongoDB Optimization
```yaml
# Add to mongod.conf
storage:
  wiredTiger:
    engineConfig:
      cacheSizeGB: 1
```

#### Node.js Optimization
```javascript
// PM2 ecosystem optimization
{
  instances: 'max',
  exec_mode: 'cluster',
  max_memory_restart: '1G'
}
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
- [ ] Weekly: Check logs for errors
- [ ] Monthly: Update system packages
- [ ] Monthly: Review security logs
- [ ] Quarterly: Test backup restoration
- [ ] Quarterly: Review performance metrics

### Monitoring Tools
- **PM2**: Application monitoring
- **Nginx**: Web server monitoring
- **MongoDB**: Database monitoring
- **Uptime Robot**: External monitoring
- **Logwatch**: Log analysis

### Emergency Procedures
1. **Application Down**: Check PM2 status and restart
2. **Database Issues**: Check MongoDB logs and connectivity
3. **SSL Issues**: Renew certificates manually
4. **Security Breach**: Review logs and update credentials

## 📄 License

This deployment guide is part of the Matka SK project and is licensed under the ISC License. 