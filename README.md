# 🚀 Production-Ready MERN Portfolio System

A feature-rich, SaaS-like portfolio platform built with the MERN stack, designed to showcase projects with enterprise-grade capabilities including role-based admin panel, real-time analytics, automated workflows, and scalable architecture.

## ✨ Key Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with access and refresh tokens
- **Role-based access control** (Admin, Editor, Viewer)
- **Secure password hashing** with bcrypt
- **Token refresh** mechanism for seamless UX
- **Session management** with cookie support

### 👥 Admin Panel
- **Multi-role system** with granular permissions
- **Rich text editor** for project content (Markdown/HTML)
- **Image upload** and optimization via Cloudinary
- **Project management** with CRUD operations
- **Contact form** management with status tracking
- **User management** for team collaboration

### 📊 Advanced Analytics
- **Visitor tracking** with geolocation and device detection
- **Page view analytics** with session tracking
- **Project view metrics** and engagement tracking
- **Resume download** tracking
- **Real-time dashboard** with live visitor count
- **Custom event tracking** for user interactions
- **Traffic source analysis** and referrer tracking
- **Device and browser** breakdown
- **Geographic distribution** visualization

### 🎨 Content Management
- **Dynamic project portfolio** with tags and categories
- **Advanced search** with text indexing and filters
- **Related project recommendations** algorithm
- **Rich content editor** with image embedding
- **SEO optimization** with meta tags
- **Featured projects** and priority sorting
- **Draft/Published** workflow

### 📧 Communication System
- **Contact form** with spam protection
- **Email automation** via Nodemailer
- **Auto-reply** system for inquiries
- **Admin notifications** for new submissions
- **Rate limiting** (3 submissions/hour)
- **IP and metadata** tracking
- **Priority and category** classification

### ⚡ Performance & Scalability
- **Redis caching** for frequently accessed data
- **Background job** processing with Bull
- **Image optimization** via Cloudinary
- **Database indexing** for fast queries
- **Pagination** on all list endpoints
- **Query optimization** with projection
- **Response compression**

### 🔔 Real-Time Features
- **Socket.io integration** for live updates
- **Real-time admin notifications** for:
  - New contact submissions
  - Project creations
  - User actions
- **Active visitor tracking**
- **Live dashboard** updates

### 🌍 Global Ready
- **i18n support** for multiple languages
- **Timezone handling** for analytics
- **Geolocation tracking**
- **Multi-currency ready** (extensible)

### 🛡️ Security
- **Helmet.js** for HTTP header security
- **CORS** configuration
- **Rate limiting** on all endpoints
- **Input validation** with express-validator
- **MongoDB sanitization** against injection
- **File upload** restrictions
- **XSS protection**

### 📈 DevOps & Monitoring
- **Winston logging** with log rotation
- **Error tracking** and logging
- **Health check** endpoint
- **Environment-based** configuration
- **Graceful shutdown** handling
- **Process monitoring** ready

### 🧪 Testing Ready
- **Jest** configured for unit tests
- **Supertest** for API testing
- **Test database** setup
- **Coverage reporting**

### 🎯 Feature Flags
- Toggle features via environment variables:
  - Analytics tracking
  - GitHub integration
  - i18n support
  - Real-time notifications
  - Email notifications
  - Advanced search
  - Recommendations engine

## 🏗️ Architecture

```
mern-portfolio-saas/
├── backend/                    # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   ├── services/           # Business logic layer
│   │   ├── routes/             # API routes
│   │   ├── middleware/         # Custom middleware
│   │   ├── models/             # Mongoose schemas
│   │   ├── utils/              # Helper functions
│   │   ├── config/             # Configuration files
│   │   ├── jobs/               # Background jobs (Bull)
│   │   ├── validators/         # Input validation
│   │   └── tests/              # Test files
│   ├── logs/                   # Application logs
│   ├── .env.example            # Environment template
│   └── server.js               # Entry point
│
├── frontend/                   # React + Vite frontend
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── admin/          # Admin panel components
│   │   │   ├── common/         # Shared components
│   │   │   └── portfolio/      # Public portfolio components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API service layer
│   │   ├── contexts/           # React contexts
│   │   ├── utils/              # Helper functions
│   │   └── styles/             # Global styles
│   ├── vite.config.js          # Vite configuration
│   └── tailwind.config.js      # Tailwind CSS config
│
├── shared/                     # Shared code (types, constants)
└── deployment/                 # Deployment configs
    ├── docker/                 # Docker configurations
    ├── nginx/                  # Nginx configs
    └── ci-cd/                  # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (v6+)
- Redis (optional, for caching)
- Cloudinary account (for images)

### Backend Setup

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Required environment variables:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/portfolio

# JWT Secrets
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for contact form)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

4. **Start development server:**
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Configure environment:**
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
echo "VITE_SOCKET_URL=http://localhost:5000" >> .env
```

3. **Start development server:**
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`

### Create Admin User

Use MongoDB shell or Compass to create the first admin:

```javascript
// Connect to your database
use portfolio

// Create admin user (password will be hashed on first login)
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$password-hash-here",  // Use bcrypt to hash
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the API after starting the server (requires existing admin):
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin-token>" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@example.com",
    "password": "secure-password",
    "role": "admin"
  }'
```

## 📡 API Endpoints

### Authentication
```
POST   /api/v1/auth/register       # Register user (admin only)
POST   /api/v1/auth/login          # Login
POST   /api/v1/auth/logout         # Logout
POST   /api/v1/auth/refresh        # Refresh token
GET    /api/v1/auth/me             # Get current user
PUT    /api/v1/auth/password       # Update password
```

### Projects
```
GET    /api/v1/projects            # Get all projects (paginated)
GET    /api/v1/projects/search     # Advanced search
GET    /api/v1/projects/:slug      # Get project by slug
GET    /api/v1/projects/:id/related # Get related projects
POST   /api/v1/projects            # Create project (admin/editor)
PUT    /api/v1/projects/:id        # Update project (admin/editor)
DELETE /api/v1/projects/:id        # Delete project (admin)
```

### Contact
```
POST   /api/v1/contact             # Submit contact form (rate limited)
GET    /api/v1/contact             # Get all contacts (admin)
GET    /api/v1/contact/stats       # Get contact statistics
GET    /api/v1/contact/:id         # Get single contact
PUT    /api/v1/contact/:id/status  # Update status
POST   /api/v1/contact/:id/notes   # Add note
DELETE /api/v1/contact/:id         # Delete contact (admin)
```

### Analytics
```
POST   /api/v1/analytics/pageview     # Track page view
POST   /api/v1/analytics/project/:id  # Track project view
POST   /api/v1/analytics/resume       # Track resume download
POST   /api/v1/analytics/event        # Track custom event
GET    /api/v1/analytics/dashboard    # Get dashboard data (admin)
GET    /api/v1/analytics/realtime     # Get real-time stats (admin)
```

## 🎨 Frontend Routes

### Public Routes
```
/                    # Homepage
/projects            # Projects gallery
/projects/:slug      # Project detail
/about               # About page
/contact             # Contact form
/login               # Login page
```

### Admin Routes (Protected)
```
/admin                      # Dashboard overview
/admin/projects             # Project management
/admin/projects/new         # Create project
/admin/projects/:id/edit    # Edit project
/admin/contacts             # Contact submissions
/admin/analytics            # Analytics dashboard
/admin/settings             # Settings
```

## 🔧 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Redis** - Caching layer
- **Bull** - Background jobs
- **Nodemailer** - Email service
- **Cloudinary** - Image storage
- **Winston** - Logging
- **Jest** - Testing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Socket.io Client** - Real-time

## 🔒 Security Best Practices

1. **Never commit `.env` files**
2. **Use strong JWT secrets** (minimum 32 characters)
3. **Enable HTTPS** in production
4. **Configure CORS** properly
5. **Use rate limiting** on all public endpoints
6. **Validate and sanitize** all inputs
7. **Implement CSP** headers
8. **Keep dependencies** updated
9. **Use environment variables** for secrets
10. **Enable MongoDB** authentication

## 🚀 Deployment

### Docker Deployment
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

### Manual Deployment

1. **Backend:**
```bash
cd backend
npm install --production
npm start
```

2. **Frontend:**
```bash
cd frontend
npm install
npm run build
# Serve dist/ folder with Nginx or similar
```

### Environment Variables (Production)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/portfolio
JWT_SECRET=very-long-random-secret-key
REDIS_HOST=redis-host
CLOUDINARY_CLOUD_NAME=production-cloud
FRONTEND_URL=https://yourportfolio.com
CORS_ORIGIN=https://yourportfolio.com
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-03-23T10:00:00.000Z",
  "uptime": 12345,
  "environment": "production"
}
```

### Logs
Logs are stored in `backend/logs/`:
- `combined.log` - All logs
- `error.log` - Error logs only
- `exceptions.log` - Uncaught exceptions
- `rejections.log` - Unhandled rejections

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:watch
npm run test:coverage

# Frontend tests
cd frontend
npm test
```

## 🎯 Performance Optimization

1. **Caching Strategy:**
   - Redis cache for API responses (5-10 min TTL)
   - Browser caching for static assets
   - CDN for images (Cloudinary)

2. **Database Optimization:**
   - Indexes on frequently queried fields
   - Pagination on all list endpoints
   - Projection to limit returned fields

3. **Frontend Optimization:**
   - Code splitting by route
   - Lazy loading components
   - Image lazy loading
   - Debounced search inputs

## 📝 Feature Flags

Toggle features via `.env`:
```env
FEATURE_ANALYTICS=true
FEATURE_GITHUB_INTEGRATION=true
FEATURE_I18N=true
FEATURE_REAL_TIME_NOTIFICATIONS=true
FEATURE_EMAIL_NOTIFICATIONS=true
FEATURE_ADVANCED_SEARCH=true
FEATURE_RECOMMENDATIONS=true
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with modern MERN stack best practices
- Inspired by SaaS application architectures
- Designed for real-world production use

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact: admin@example.com

---

**Built with ❤️ for developers who want production-ready portfolios**
