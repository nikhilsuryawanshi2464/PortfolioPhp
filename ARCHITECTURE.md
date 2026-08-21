# System Architecture

## Overview

This MERN portfolio system is built with a microservices-inspired architecture, featuring clear separation of concerns, scalable components, and production-ready patterns.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  Web Browser   │  │ Mobile App   │  │ Admin Dashboard │ │
│  └────────┬───────┘  └──────┬───────┘  └────────┬────────┘ │
└───────────┼──────────────────┼───────────────────┼──────────┘
            │                  │                   │
            └──────────────────┼───────────────────┘
                              │
            ┌─────────────────┴────────────────┐
            │         Load Balancer /          │
            │         Reverse Proxy            │
            │            (Nginx)               │
            └─────────────────┬────────────────┘
                              │
        ┌─────────────────────┴────────────────────┐
        │                                          │
    ┌───▼────────────────┐              ┌─────────▼──────────┐
    │   Frontend Layer   │              │   Backend Layer    │
    │   (React + Vite)   │              │ (Express.js + WS)  │
    │                    │              │                    │
    │ - React Components │              │ - REST API         │
    │ - State Management │◄────────────►│ - WebSocket        │
    │ - Routing          │   HTTP/WSS   │ - Authentication   │
    │ - UI/UX            │              │ - Business Logic   │
    └────────────────────┘              └──────────┬─────────┘
                                                   │
                    ┌──────────────────────────────┼─────────────────────────┐
                    │                              │                         │
            ┌───────▼──────────┐        ┌─────────▼────────┐    ┌──────────▼─────────┐
            │  Data Layer      │        │  Cache Layer     │    │  Message Queue     │
            │   (MongoDB)      │        │    (Redis)       │    │      (Bull)        │
            │                  │        │                  │    │                    │
            │ - User Data      │        │ - Session Cache  │    │ - Email Jobs       │
            │ - Projects       │        │ - API Response   │    │ - Analytics Jobs   │
            │ - Analytics      │        │ - Rate Limiting  │    │ - Async Tasks      │
            │ - Contacts       │        │                  │    │                    │
            └──────────────────┘        └──────────────────┘    └────────────────────┘
                    │
            ┌───────▼──────────┐
            │  File Storage    │
            │  (Cloudinary)    │
            │                  │
            │ - Images         │
            │ - Thumbnails     │
            │ - Optimization   │
            └──────────────────┘
```

## Backend Architecture

### Layered Architecture Pattern

```
┌──────────────────────────────────────────┐
│           Routes Layer                   │
│  (API Endpoints & Routing Logic)         │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│         Middleware Layer                 │
│  - Authentication (JWT)                  │
│  - Authorization (RBAC)                  │
│  - Rate Limiting                         │
│  - Validation                            │
│  - Error Handling                        │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│        Controllers Layer                 │
│  (Request/Response Handling)             │
│  - Parse requests                        │
│  - Call services                         │
│  - Format responses                      │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│         Services Layer                   │
│  (Business Logic)                        │
│  - Data validation                       │
│  - Business rules                        │
│  - External integrations                 │
└────────────────┬─────────────────────────┘
                 │
┌────────────────▼─────────────────────────┐
│          Models Layer                    │
│  (Data Access & Schema)                  │
│  - Mongoose models                       │
│  - Database queries                      │
│  - Data transformation                   │
└──────────────────────────────────────────┘
```

## Data Flow

### 1. Public User Flow (Read Operations)

```
User → Frontend → API → [Cache Check] → 
  ├─ Cache Hit → Return cached data
  └─ Cache Miss → Database → Cache → Response

Example: Viewing a project
1. User clicks project
2. Frontend sends GET /api/v1/projects/:slug
3. Backend checks Redis cache
4. If cached: return immediately
5. If not: Query MongoDB, cache result, return
6. Track page view asynchronously
```

### 2. Admin User Flow (Write Operations)

```
Admin → Login → JWT Token → Protected Route →
  Middleware (Auth + RBAC) → Controller → 
  Service (Validation) → Database → 
  Cache Invalidation → Socket Notification → Response

Example: Creating a project
1. Admin logs in, receives JWT
2. Creates project via admin panel
3. Request hits /api/v1/projects (POST)
4. Auth middleware validates token
5. Authorization checks role (admin/editor)
6. Controller validates input
7. Service creates project in DB
8. Related cache entries cleared
9. Socket.io notifies other admins
10. Response sent to client
```

### 3. Contact Form Flow

```
User → Contact Form → Rate Limiter → Validation →
  Save to DB → [Background Jobs] →
    ├─ Send email to admin
    ├─ Send auto-reply to user
    └─ Socket notification to online admins

Timeline:
- 0ms: Form submitted
- 10ms: Rate limit check
- 20ms: Input validation
- 50ms: Saved to database
- 100ms: Background jobs queued
- 100ms: Response to user
- 500ms: Emails sent (async)
- 1000ms: Socket notification sent
```

### 4. Analytics Tracking Flow

```
Page Load → Track Event → Async POST →
  Background Processing → Aggregation →
  Dashboard Update

Data Pipeline:
1. Frontend tracks page view
2. Sends to /api/v1/analytics/pageview
3. Metadata extracted (IP, UA, Geo)
4. Saved to time-series collection
5. Real-time stats updated
6. Aggregation jobs run nightly
7. Dashboard queries aggregated data
```

## Component Interactions

### Authentication Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │   Redis  │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                     │
     │  Login (email/pwd) │                     │
     ├────────────────────►                     │
     │                    │                     │
     │                    │  Validate           │
     │                    │  credentials        │
     │                    │                     │
     │  ◄──────────────────                     │
     │  JWT + Refresh Token                     │
     │                    │                     │
     │                    │  Store refresh      │
     │                    ├────────────────────►│
     │                    │                     │
     │  API Request       │                     │
     │  + JWT Token       │                     │
     ├────────────────────►                     │
     │                    │                     │
     │                    │  Verify JWT         │
     │                    │                     │
     │  ◄──────────────────                     │
     │  Protected Data    │                     │
     │                    │                     │
```

### Real-Time Notification Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Admin 1 │         │  Server  │         │  Admin 2 │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                     │
     │  Create Project    │                     │
     ├────────────────────►                     │
     │                    │                     │
     │                    │  Save to DB         │
     │                    │                     │
     │                    │  Emit Socket Event  │
     │                    ├────────────────────►│
     │                    │                     │
     │  ◄──────────────────                     │
     │  Success Response  │                     │
     │                    │                     │
     │                    │                     ▼
     │                    │              Toast Notification
     │                    │              "New project created"
```

## Database Schema Design

### Collections Overview

```
Users
├─ Authentication data
├─ Role information
└─ Profile details

Projects
├─ Content (rich text)
├─ Media (Cloudinary URLs)
├─ Metadata (tags, category)
├─ Metrics (views, likes)
└─ Relations (author, related)

Skills
├─ Proficiency data
├─ Categories
└─ Project associations

Experience
├─ Work history
├─ Technologies used
└─ Project references

Contacts
├─ Form submissions
├─ Status tracking
├─ Notes and replies
└─ Metadata (IP, UA, Geo)

Analytics (Time-Series)
├─ PageViews
├─ ProjectViews
├─ ResumeDownloads
├─ Events
└─ Sessions
```

### Indexing Strategy

```
Projects:
- Text index: (title, description, content, tags)
- Compound: (published, priority, createdAt)
- Single: (slug, featured, category)

PageViews:
- Compound: (path, timestamp)
- Single: (sessionId, timestamp)

Contacts:
- Compound: (status, createdAt)
- Text: (name, email, subject, message)
```

## Caching Strategy

### Redis Cache Layers

```
L1: Route-Level Cache (5 min TTL)
└─ GET /api/v1/projects → All projects list

L2: Resource-Level Cache (10 min TTL)
└─ GET /api/v1/projects/:slug → Single project

L3: Fragment Cache (1 hour TTL)
└─ Skills list, Experience list

L4: Session Cache (30 min TTL)
└─ Active sessions, rate limit counters
```

### Cache Invalidation

```
Write Operation → Cache Keys to Invalidate

Create Project:
  - projects:*
  - project:{slug}

Update Project:
  - projects:*
  - project:{slug}

Delete Project:
  - projects:*
  - project:{slug}
  - related-projects:{id}
```

## Security Architecture

### Defense in Depth

```
Layer 1: Network
├─ HTTPS/TLS
├─ Firewall rules
└─ DDoS protection

Layer 2: Application
├─ Helmet.js headers
├─ CORS configuration
├─ Rate limiting
└─ Input sanitization

Layer 3: Authentication
├─ JWT with short expiry
├─ Refresh tokens
├─ Secure password hashing
└─ Session management

Layer 4: Authorization
├─ Role-based access (RBAC)
├─ Resource ownership checks
└─ Permission validation

Layer 5: Data
├─ MongoDB sanitization
├─ Encrypted connections
└─ Backup encryption
```

## Scalability Considerations

### Horizontal Scaling

```
Load Balancer
    │
    ├── App Server 1 ───┐
    ├── App Server 2 ───┼── MongoDB (Replica Set)
    └── App Server 3 ───┘
         │
         └── Redis (Cluster/Sentinel)
```

### Performance Optimization

1. **Database**
   - Indexes on frequent queries
   - Pagination for large datasets
   - Projection to limit data transfer
   - Connection pooling

2. **Caching**
   - Redis for hot data
   - Browser caching for static assets
   - CDN for images (Cloudinary)

3. **Background Processing**
   - Async email sending
   - Deferred analytics aggregation
   - Scheduled cleanup jobs

4. **Frontend**
   - Code splitting by route
   - Lazy loading components
   - Image lazy loading
   - Debounced search inputs

## Monitoring & Observability

```
Application Logs (Winston)
    ├─ Error logs → Alert on critical errors
    ├─ Access logs → Traffic analysis
    └─ Debug logs → Development troubleshooting

Health Checks
    ├─ /health endpoint
    ├─ Database connectivity
    └─ Redis connectivity

Metrics
    ├─ Response times
    ├─ Error rates
    ├─ Cache hit rates
    └─ Queue lengths
```

## Deployment Architecture

### Production Environment

```
                  ┌─────────────────┐
                  │   Load Balancer │
                  │    (AWS ELB)    │
                  └────────┬────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         ┌────▼────┐  ┌───▼─────┐  ┌──▼──────┐
         │ App 1   │  │ App 2   │  │ App 3   │
         │ (Docker)│  │ (Docker)│  │ (Docker)│
         └─────────┘  └─────────┘  └─────────┘
              │            │            │
              └────────────┼────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
         ┌────▼────────┐      ┌────────▼─────┐
         │  MongoDB    │      │    Redis     │
         │ (Replica)   │      │  (Sentinel)  │
         └─────────────┘      └──────────────┘
```

## Future Enhancements

1. **Microservices Migration**
   - Separate analytics service
   - Dedicated email service
   - Independent scaling

2. **Advanced Features**
   - GraphQL API
   - Server-side rendering (Next.js)
   - Progressive Web App
   - Offline support

3. **AI/ML Integration**
   - Content recommendations
   - Spam detection
   - Sentiment analysis

4. **Observability**
   - Distributed tracing (Jaeger)
   - Metrics dashboards (Grafana)
   - Log aggregation (ELK stack)
