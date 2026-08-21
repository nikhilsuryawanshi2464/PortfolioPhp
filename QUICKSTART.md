# 🚀 Quick Start Guide

Get your production-ready MERN portfolio running in under 10 minutes!

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] MongoDB installed and running
- [ ] (Optional) Redis installed for caching
- [ ] (Optional) Cloudinary account for images

## 5-Minute Setup

### Step 1: Clone and Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd mern-portfolio-saas

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Configure Environment (1 minute)

```bash
# Backend configuration
cd backend
cp .env.example .env

# Edit .env with your preferred text editor
# Minimum required configuration:
nano .env
```

**Minimum .env Configuration:**
```env
MONGODB_URI=mongodb://localhost:27017/portfolio
JWT_SECRET=your-very-long-secret-key-at-least-32-characters
JWT_REFRESH_SECRET=another-long-secret-for-refresh-tokens
FRONTEND_URL=http://localhost:3000
ADMIN_EMAIL=your-email@example.com
```

**Optional but Recommended:**
```env
# For image uploads
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# For contact form emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# For caching (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Step 3: Start Development Servers (30 seconds)

Open **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 4: Create Admin User (1 minute)

Option A - Using MongoDB Shell:
```bash
mongosh

use portfolio

db.users.insertOne({
  name: "Admin",
  email: "admin@example.com",
  password: "$2a$10$rQk5VqhBxBGkQBiDLRvuweK1sFh0E9k0mCTzY8qT0pO0mGxJ0G0bW",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```
*Default password: `password123` - Change immediately after first login!*

Option B - Using API (after creating first admin manually):
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-admin-token>" \
  -d '{
    "name": "New Admin",
    "email": "admin@example.com",
    "password": "securepassword123",
    "role": "admin"
  }'
```

### Step 5: Access Your Portfolio

- **Frontend:** http://localhost:3000
- **Admin Login:** http://localhost:3000/login
- **API:** http://localhost:5000/api/v1
- **Health Check:** http://localhost:5000/health

## Common Issues & Solutions

### MongoDB Connection Error

**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solution:**
```bash
# Start MongoDB
sudo systemctl start mongod
# Or on Mac
brew services start mongodb-community
```

### Port Already in Use

**Error:** `Port 5000 already in use`

**Solution:**
```bash
# Find process using port
lsof -i :5000
# Kill process
kill -9 <PID>
# Or change port in .env
PORT=5001
```

### Redis Connection Error

**Error:** `Redis connection failed`

**Solution:**
Redis is optional. Either:
```bash
# Install and start Redis
brew install redis
brew services start redis
```
Or disable Redis by commenting out in `.env`:
```env
# REDIS_HOST=localhost
```

## Feature Configuration

### Enable/Disable Features

Edit `.env` to toggle features:

```env
# Analytics Dashboard
FEATURE_ANALYTICS=true

# Real-time Notifications
FEATURE_REAL_TIME_NOTIFICATIONS=true

# Email Notifications (requires SMTP config)
FEATURE_EMAIL_NOTIFICATIONS=true

# GitHub Integration (requires GITHUB_TOKEN)
FEATURE_GITHUB_INTEGRATION=false

# Multi-language Support
FEATURE_I18N=false
```

### Image Upload Setup (Cloudinary)

1. Create free account at https://cloudinary.com
2. Get your credentials from Dashboard
3. Add to `.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Email Setup (Gmail)

1. Enable 2FA on your Gmail account
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
ADMIN_EMAIL=your-email@gmail.com
```

## Production Deployment

### Docker Deployment (Easiest)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Deployment

1. **Build Frontend:**
```bash
cd frontend
npm run build
# Serve dist/ folder with Nginx
```

2. **Start Backend:**
```bash
cd backend
NODE_ENV=production npm start
```

3. **Configure Environment:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/portfolio
FRONTEND_URL=https://yourportfolio.com
CORS_ORIGIN=https://yourportfolio.com
```

## Next Steps

### 1. Customize Your Portfolio

- [ ] Update personal information
- [ ] Add your projects
- [ ] Upload skills and experience
- [ ] Configure contact form

### 2. Security Hardening

- [ ] Change default admin password
- [ ] Generate strong JWT secrets (32+ chars)
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS in production
- [ ] Review rate limiting settings

### 3. Optional Enhancements

- [ ] Set up custom domain
- [ ] Configure SSL certificate
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

## Useful Commands

```bash
# Backend
npm run dev          # Development with auto-reload
npm start            # Production mode
npm test             # Run tests
npm run lint         # Check code quality

# Frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build

# Docker
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # View backend logs
docker-compose restart backend    # Restart backend
```

## Testing Your Setup

### Health Check
```bash
curl http://localhost:5000/health
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Check Frontend
Visit http://localhost:3000 - you should see your portfolio homepage

## Getting Help

- 📖 **Full Documentation:** See [README.md](README.md)
- 🏗️ **Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md)
- 📡 **API Reference:** See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- 🐛 **Issues:** Open an issue on GitHub
- 💬 **Discussions:** Join our community discussions

## What's Next?

Once your portfolio is running:

1. **Explore the Admin Panel** at http://localhost:3000/admin
2. **Create Your First Project** via the admin dashboard
3. **Customize the Design** in `frontend/src/styles`
4. **Add Your Content** through the CMS
5. **Monitor Analytics** to track visitors

---

**You're all set!** 🎉 Your production-ready portfolio is now running.

For detailed configuration and advanced features, see the full [README.md](README.md).
