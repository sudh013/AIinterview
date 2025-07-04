# Quick File Reference Guide

## 🎯 Most Important Files

### Core Application
| File | Purpose | Key Features |
|------|---------|-------------|
| `client/src/App.tsx` | Main React app | Routing, authentication, layout |
| `server/index.ts` | Express server | Server startup, middleware setup |
| `server/routes.ts` | API endpoints | All REST API routes, authentication |
| `shared/schema.ts` | Database schema | Tables, relationships, types |

### User Interface Pages
| File | Purpose | What Users See |
|------|---------|----------------|
| `client/src/pages/dashboard.tsx` | Main dashboard | Statistics, charts, recent activity |
| `client/src/pages/jobs.tsx` | Job management | Create jobs, view applications |
| `client/src/pages/applicants.tsx` | Candidate management | View candidates, review applications |
| `client/src/pages/interview.tsx` | Video interview | Record videos, answer questions |
| `client/src/pages/api-integration.tsx` | External APIs | Connect to Greenhouse, Workday, etc. |
| `client/src/pages/calendar.tsx` | Schedule interviews | Google Calendar, Outlook integration |
| `client/src/pages/questions.tsx` | Manage questions | Create custom interview questions |
| `client/src/pages/settings.tsx` | Platform settings | Configuration, API keys, documentation |

### Backend Services
| File | Purpose | What It Does |
|------|---------|-------------|
| `server/storage.ts` | Database operations | Create, read, update, delete data |
| `server/services/analytics.ts` | Advanced analytics | Complex reporting, performance trends |
| `server/services/api-optimization.ts` | Performance optimization | Caching, rate limiting, monitoring |
| `server/middleware/rbac.ts` | Access control | User roles, permissions, security |
| `server/middleware/auth.ts` | Authentication | API key validation, user verification |

### Configuration Files
| File | Purpose | Contains |
|------|---------|----------|
| `package.json` | Dependencies | All installed packages and scripts |
| `vite.config.ts` | Frontend build | React, TypeScript, asset handling |
| `drizzle.config.ts` | Database config | PostgreSQL connection, migrations |
| `.env` | Environment variables | API keys, database URL, secrets |

## 🔄 Data Flow Through Files

### 1. Job Application Process
```
External System → server/routes.ts → server/storage.ts → shared/schema.ts → Database
```

### 2. User Interface Flow
```
User → client/src/pages/*.tsx → client/src/lib/queryClient.ts → server/routes.ts
```

### 3. Video Interview Process
```
User → client/src/pages/interview.tsx → server/routes.ts → OpenAI API → Database
```

### 4. Analytics Display
```
Database → server/services/analytics.ts → server/routes.ts → client/src/pages/dashboard.tsx
```

## 🛠️ When to Edit Which Files

### Adding New Features
- **New page**: Create in `client/src/pages/` and add to `client/src/App.tsx`
- **New API endpoint**: Add to `server/routes.ts`
- **New database table**: Add to `shared/schema.ts` and update `server/storage.ts`
- **New external integration**: Update `client/src/pages/api-integration.tsx`

### Fixing Issues
- **UI problems**: Check `client/src/pages/` files
- **API errors**: Check `server/routes.ts` and `server/storage.ts`
- **Database issues**: Check `shared/schema.ts` and `server/db.ts`
- **Authentication problems**: Check `server/middleware/auth.ts`

### Performance Optimization
- **Caching**: `server/services/api-optimization.ts`
- **Database queries**: `server/storage.ts`
- **API responses**: `server/routes.ts`
- **Frontend loading**: `client/src/lib/queryClient.ts`

## 📊 Key Numbers & Metrics

### Current System Stats
- **Total Files**: 50+ files across frontend, backend, and configuration
- **API Endpoints**: 25+ REST endpoints for all features
- **Database Tables**: 9 main tables with relationships
- **External Integrations**: 15+ ATS, email, and AI services
- **User Roles**: 4 distinct roles with granular permissions

### Performance Targets
- **API Response Time**: <100ms for cached responses
- **Video Upload**: <30 seconds for 5-minute interviews
- **Database Queries**: <50ms for most operations
- **Cache Hit Rate**: >80% for frequently accessed data

## 🚀 Quick Start Commands

### Development
```bash
npm run dev          # Start development server
npm run db:push      # Update database schema
npm run build        # Build for production
```

### Deployment
```bash
./setup.sh          # Automated setup
./deploy.sh pm2     # Deploy with PM2
make dev            # Start development mode
make deploy         # Production deployment
```

### Database
```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open database browser
```

This reference guide helps you quickly understand what each file does and when to modify them for different tasks.