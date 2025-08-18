# Matka Admin Panel - Deployment Guide

## Quick Start

### Method 1: Direct Node.js Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start on specific port (3001):**
   ```bash
   PORT=3001 npm start
   ```

3. **Or use the deployment script:**
   ```bash
   node deploy.js
   ```

### Method 2: Using PM2 (Recommended for Production)

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

3. **Monitor the application:**
   ```bash
   pm2 monit
   pm2 logs matka-admin
   ```

4. **Setup auto-restart on system reboot:**
   ```bash
   pm2 startup
   pm2 save
   ```

### Method 3: Using Docker

1. **Build Docker image:**
   ```bash
   docker build -t matka-admin .
   ```

2. **Run container:**
   ```bash
   docker run -d -p 3001:3001 --name matka-admin matka-admin
   ```

3. **Or use docker-compose:**
   ```bash
   docker-compose up -d
   ```

## Configuration

### Environment Variables

- `PORT`: Port number (default: 3001)
- `HOSTNAME`: Hostname to bind (default: 0.0.0.0)
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NODE_ENV`: Environment (production)

### Custom Port Configuration

You can run on any port by setting the PORT environment variable:

```bash
# Port 4000
PORT=4000 npm start

# Port 8080
PORT=8080 npm start
```

## Server Setup

### Ubuntu/Debian Server

1. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install PM2:**
   ```bash
   sudo npm install -g pm2
   ```

3. **Clone and setup your project:**
   ```bash
   git clone <your-repo>
   cd admin
   npm ci --only=production
   npm run build
   ```

4. **Start with PM2:**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 startup
   pm2 save
   ```

### Nginx Reverse Proxy (Optional)

Create `/etc/nginx/sites-available/matka-admin`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

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
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/matka-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Monitoring and Logs

### PM2 Commands
```bash
pm2 list                    # List all processes
pm2 monit                   # Monitor processes
pm2 logs matka-admin        # View logs
pm2 restart matka-admin     # Restart application
pm2 stop matka-admin        # Stop application
pm2 delete matka-admin      # Delete process
```

### Log Files
- Application logs: `./logs/`
- PM2 logs: `~/.pm2/logs/`

## Security Considerations

1. **Environment Variables**: Store sensitive data in environment variables
2. **Firewall**: Configure firewall to allow only necessary ports
3. **SSL**: Use HTTPS in production (with Nginx + Let's Encrypt)
4. **Updates**: Keep dependencies updated

## Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   lsof -i :3001
   kill -9 <PID>
   ```

2. **Permission denied:**
   ```bash
   sudo chown -R $USER:$USER /path/to/project
   ```

3. **Build errors:**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

### Health Check

The application will be available at:
- Local: `http://localhost:3001`
- Network: `http://YOUR_SERVER_IP:3001`
