# Setup & Installation Guide

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18 or higher
- **MongoDB**: Version 6 or higher
- **npm** or **yarn**: Package manager
- **Git**: Version control system

### Operating System Support
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Ubuntu 18.04+
- ✅ CentOS 7+

## 🚀 Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd matka-booking-system
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Configure environment variables
# Edit .env file with your settings
```

### 3. Admin Panel Setup
```bash
cd admin

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Configure environment variables
# Edit .env file with your settings
```

### 4. Website Setup
```bash
cd webSite

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Configure environment variables
# Edit .env file with your settings
```

## ⚙️ Environment Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/matka_booking
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Admin Panel (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Website (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## 🗄️ Database Setup

### MongoDB Installation

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Start MongoDB service

#### macOS
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Ubuntu/Debian
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Database Initialization
```bash
# Connect to MongoDB
mongosh

# Create database
use matka_booking

# Create initial collections (optional - will be created automatically)
db.createCollection('users')
db.createCollection('markets')
db.createCollection('bets')
db.createCollection('results')
db.createCollection('transfers')
```

## 🏃‍♂️ Running the Application

### Development Mode

#### 1. Start Backend
```bash
cd backend
npm run dev
# Server will start on http://localhost:5000
```

#### 2. Start Admin Panel
```bash
cd admin
npm run dev
# Admin panel will start on http://localhost:3001
```

#### 3. Start Website
```bash
cd webSite
npm run dev
# Website will start on http://localhost:3000
```

### Production Mode
```bash
# Backend
cd backend
npm run build
npm start

# Admin Panel
cd admin
npm run build
npm start

# Website
cd webSite
npm run build
npm start
```

## 🔧 Configuration Options

### Backend Configuration

#### Database Connection
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/matka_booking

# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/matka_booking

# MongoDB with Authentication
MONGODB_URI=mongodb://username:password@localhost:27017/matka_booking
```

#### JWT Configuration
```env
# JWT Secrets (use strong, unique secrets)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here

# Token Expiration
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### Server Configuration
```env
# Port Configuration
PORT=5000

# Environment
NODE_ENV=development

# CORS Origins (for production)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Frontend Configuration

#### API URLs
```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Production
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
```

## 🧪 Testing the Setup

### 1. Backend Health Check
```bash
curl http://localhost:5000/api/v1/health
# Should return: {"status": "ok", "message": "Server is running"}
```

### 2. Database Connection
```bash
# Check MongoDB connection
mongosh --eval "db.runCommand({ping: 1})"
# Should return: {"ok": 1}
```

### 3. Frontend Access
- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3001

## 🐛 Common Setup Issues

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB if not running
sudo systemctl start mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

### Port Already in Use
```bash
# Check what's using the port
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Update Node.js if needed
# Using nvm (recommended)
nvm install 18
nvm use 18
```

### Permission Issues
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```

## 📦 Package Scripts

### Backend Scripts
```bash
npm run dev          # Development mode with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run test         # Run tests
```

### Frontend Scripts
```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🔐 Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use strong, unique secrets for JWT keys
- Rotate secrets regularly in production

### Database Security
- Use strong passwords for MongoDB
- Enable authentication in production
- Use SSL/TLS for database connections

### API Security
- Implement rate limiting
- Use HTTPS in production
- Validate all input data
- Implement proper CORS policies

## 📚 Next Steps

After successful setup:
1. **Create Initial Users**: Set up admin accounts
2. **Configure Markets**: Add market data and schedules
3. **Test Game Logic**: Verify betting and result systems
4. **Deploy to Production**: Follow deployment guide
5. **Monitor Performance**: Set up logging and monitoring

---

*For detailed architecture information, see [ARCHITECTURE.md](ARCHITECTURE.md)*
*For API documentation, see [API.md](API.md)*
*For deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md)*
