# API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Register User
**POST** `/auth/register`

**Access:** Admin only

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "editor"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "editor",
    "isActive": true,
    "createdAt": "2024-03-23T10:00:00.000Z"
  }
}
```

### Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Current User
**GET** `/auth/me`

**Access:** Protected

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "avatar": "https://via.placeholder.com/150"
  }
}
```

## Projects

### Get All Projects
**GET** `/projects`

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Text search
- `category` (string): Filter by category
- `tags` (string): Comma-separated tags
- `featured` (boolean): Filter featured projects
- `published` (boolean): Filter by publish status
- `sort` (string): Sort field (default: -createdAt)

**Example:** `/projects?page=1&limit=5&category=web&featured=true`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "E-commerce Platform",
      "slug": "e-commerce-platform",
      "description": "Full-stack e-commerce solution",
      "thumbnail": {
        "url": "https://res.cloudinary.com/.../image.jpg",
        "alt": "Project thumbnail"
      },
      "technologies": ["React", "Node.js", "MongoDB"],
      "tags": ["web", "fullstack", "ecommerce"],
      "category": "web",
      "featured": true,
      "published": true,
      "metrics": {
        "views": 1250,
        "likes": 45
      },
      "author": {
        "_id": "...",
        "name": "Admin User",
        "avatar": "..."
      },
      "createdAt": "2024-03-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 24,
    "pages": 5
  }
}
```

### Get Project by Slug
**GET** `/projects/:slug`

**Example:** `/projects/e-commerce-platform`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "E-commerce Platform",
    "slug": "e-commerce-platform",
    "description": "Full-stack e-commerce solution with advanced features",
    "content": "# Project Overview\n\nThis project implements...",
    "contentType": "markdown",
    "thumbnail": {
      "url": "https://res.cloudinary.com/.../image.jpg",
      "publicId": "portfolio/project-123",
      "alt": "Project screenshot"
    },
    "images": [
      {
        "url": "https://res.cloudinary.com/.../detail-1.jpg",
        "caption": "Dashboard view"
      }
    ],
    "technologies": ["React", "Node.js", "MongoDB", "Redis"],
    "tags": ["web", "fullstack", "ecommerce"],
    "category": "web",
    "status": "completed",
    "featured": true,
    "priority": 10,
    "links": {
      "live": "https://example.com",
      "github": "https://github.com/user/repo",
      "demo": "https://demo.example.com"
    },
    "metrics": {
      "views": 1250,
      "likes": 45,
      "shares": 12
    },
    "relatedProjects": [
      {
        "_id": "...",
        "title": "Another Project",
        "slug": "another-project",
        "thumbnail": {...}
      }
    ],
    "client": {
      "name": "Acme Corp",
      "testimonial": "Excellent work!"
    },
    "duration": {
      "start": "2024-01-01T00:00:00.000Z",
      "end": "2024-03-01T00:00:00.000Z"
    },
    "author": {
      "_id": "...",
      "name": "Admin User",
      "email": "admin@example.com",
      "bio": "Full-stack developer"
    },
    "published": true,
    "publishedAt": "2024-03-01T00:00:00.000Z",
    "readingTime": 5,
    "createdAt": "2024-03-20T10:00:00.000Z",
    "updatedAt": "2024-03-23T10:00:00.000Z"
  }
}
```

### Create Project
**POST** `/projects`

**Access:** Admin/Editor

**Request:**
```json
{
  "title": "New Project",
  "description": "Project description",
  "content": "# Full content in markdown",
  "contentType": "markdown",
  "technologies": ["React", "Node.js"],
  "tags": ["web", "fullstack"],
  "category": "web",
  "featured": false,
  "priority": 5,
  "links": {
    "github": "https://github.com/user/repo"
  },
  "published": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "New Project",
    "slug": "new-project",
    ...
  }
}
```

### Update Project
**PUT** `/projects/:id`

**Access:** Admin/Editor (own projects)

**Request:**
```json
{
  "title": "Updated Title",
  "published": true
}
```

### Delete Project
**DELETE** `/projects/:id`

**Access:** Admin only

**Response:**
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Search Projects
**GET** `/projects/search`

**Query Parameters:**
- `q` (string): Search query
- `tags` (string): Comma-separated tags
- `technologies` (string): Comma-separated technologies
- `category` (string): Category filter
- `limit` (number): Max results (default: 10)

**Example:** `/projects/search?q=react&tags=web,fullstack&limit=5`

## Contact

### Submit Contact Form
**POST** `/contact`

**Rate Limit:** 3 requests per hour per IP

**Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "subject": "Project Inquiry",
  "message": "I'm interested in working with you on...",
  "category": "project-inquiry"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for your message. I will get back to you soon!",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "createdAt": "2024-03-23T10:00:00.000Z"
  }
}
```

### Get All Contacts
**GET** `/contact`

**Access:** Admin/Editor

**Query Parameters:**
- `page`, `limit`
- `status` (new|read|replied|archived|spam)
- `category` (general|project-inquiry|job-opportunity|collaboration|other)
- `priority` (low|medium|high)
- `search` (string)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "subject": "Project Inquiry",
      "message": "...",
      "category": "project-inquiry",
      "status": "new",
      "priority": "medium",
      "metadata": {
        "browser": "Chrome",
        "os": "Windows",
        "country": "US",
        "city": "New York"
      },
      "createdAt": "2024-03-23T10:00:00.000Z"
    }
  ],
  "pagination": {...}
}
```

### Update Contact Status
**PUT** `/contact/:id/status`

**Access:** Admin/Editor

**Request:**
```json
{
  "status": "replied",
  "priority": "high"
}
```

## Analytics

### Track Page View
**POST** `/analytics/pageview`

**Request:**
```json
{
  "path": "/projects/e-commerce-platform",
  "referrer": "https://google.com",
  "duration": 45
}
```

**Response:**
```json
{
  "success": true
}
```

### Get Dashboard Analytics
**GET** `/analytics/dashboard`

**Access:** Admin/Editor

**Query Parameters:**
- `period` (24h|7d|30d|90d): Time period (default: 7d)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "pageViews": 12450,
      "uniqueVisitors": 3421,
      "projectViews": 5678,
      "resumeDownloads": 234
    },
    "topPages": [
      { "_id": "/", "count": 3450 },
      { "_id": "/projects", "count": 2341 }
    ],
    "topProjects": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "E-commerce Platform",
        "views": 1250,
        "uniqueVisitors": 842
      }
    ],
    "dailyViews": [
      {
        "_id": "2024-03-23",
        "pageViews": 432,
        "uniqueVisitors": 234
      }
    ],
    "deviceBreakdown": [
      { "_id": "Desktop", "count": 6543 },
      { "_id": "Mobile", "count": 4231 }
    ],
    "geographicalDistribution": [
      { "_id": "US", "count": 5432 },
      { "_id": "UK", "count": 2134 }
    ]
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common status codes:
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limits

- **General API:** 100 requests per 15 minutes
- **Authentication:** 5 attempts per 15 minutes
- **Contact Form:** 3 submissions per hour
- **File Uploads:** 20 uploads per hour
- **Analytics:** 100 requests per minute
