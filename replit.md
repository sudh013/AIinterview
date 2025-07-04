# AI Interview Platform

## Overview

This is a comprehensive AI-powered Video Interview SaaS that integrates with major job platforms and automates personalized assessments based on job descriptions. The platform features real-time candidate tracking, HR dashboard, and seamless integration with ATS systems like Greenhouse, Workday, Lever, and BambooHR. The system automatically generates tailored interview questions, conducts video interviews, and provides AI-powered scoring with human override capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Handling**: Multer for video upload processing
- **Authentication**: API key-based authentication for external integrations

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with schema-first approach
- **File Storage**: Local file system for video recordings
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Database Schema
The application uses a relational database structure with the following core entities:
- **Jobs**: Job postings with requirements and expertise levels
- **Applicants**: Candidate information and profiles
- **Job Applications**: Many-to-many relationship between jobs and applicants
- **Interviews**: Video interview sessions with generated questions
- **Interview Scores**: AI-generated assessment results
- **API Integrations**: External system integration management

### AI Integration
- **OpenAI API**: Powers question generation and video analysis
- **Question Generation**: Creates tailored interview questions based on job requirements
- **Video Analysis**: Processes recorded interviews for technical, communication, and confidence scoring
- **Email Content**: Generates personalized communication content

### Video Processing
- **Recording**: Browser-based video recording using MediaRecorder API
- **Storage**: Server-side video file management
- **Processing**: Base64 encoding for video transmission

### External Integrations
- **Email Service**: Brevo (formerly Sendinblue) for transactional emails
- **API Gateway**: RESTful API for external job application systems
- **Webhook Support**: Signature validation for secure integrations

## Data Flow

1. **Job Creation**: HR teams create job postings with requirements
2. **Application Submission**: External systems submit candidate applications via API
3. **Interview Invitation**: System generates questions and sends email invitations
4. **Video Interview**: Candidates record responses through web interface
5. **AI Analysis**: OpenAI processes videos and generates scores
6. **Results Dashboard**: HR teams review candidates through admin interface

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **openai**: OpenAI API integration
- **nodemailer**: Email sending functionality
- **multer**: File upload handling

### Development Tools
- **TypeScript**: Type safety across the stack
- **Vite**: Frontend build tooling
- **ESBuild**: Backend bundling for production
- **Tailwind CSS**: Utility-first CSS framework

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite dev server with HMR
- **Database**: Neon Database with connection pooling
- **File Serving**: Express static middleware

### Production Build
- **Frontend**: Vite build with optimized assets
- **Backend**: ESBuild bundle for Node.js deployment
- **Database Migrations**: Drizzle Kit for schema management
- **Environment Variables**: Secure configuration management

### Infrastructure Requirements
- **Node.js**: Runtime environment
- **PostgreSQL**: Database (via Neon)
- **SMTP Service**: Email delivery (via Brevo)
- **OpenAI API**: AI processing capabilities
- **File Storage**: Persistent storage for video files

## Changelog

```
Changelog:
- June 30, 2025. Complete AI interview platform with full integration suite
  * Created complete database schema with PostgreSQL integration
  * Implemented OpenAI-powered question generation and video analysis with fallback mechanisms
  * Built external API endpoints for job application system integration
  * Added Brevo email service integration for automated interview invitations
  * Created comprehensive admin dashboard with real-time statistics
  * Implemented video recording and upload functionality
  * Added interview management and scoring system
  * Built responsive React frontend with video interview interface
  * Configured API key authentication for external integrations
  * Added error handling and graceful degradation for all services
  * Restored complete integration suite: Greenhouse, Workday, Lever, BambooHR, Zapier, Slack, Teams, Brevo, Mailgun, OpenAI, Google Vision, Azure Face, Hume AI, AssemblyAI, Deepgram, Custom REST APIs
  * Implemented bidirectional data synchronization with automatic job and applicant sync (15-30 minute intervals)
  * Added comprehensive API key management with edit/delete functionality for admins
  * Created Questions management page for custom interview questions alongside AI-generated content
  * Added demo interview page (/demo-interview) for testing video interview functionality
  * Implemented Zapier integration and Custom REST API/Webhook support for enterprise HR systems
  * Added role-based access control with admin full access to all API keys and integrations
  * Email service configured with fallback handling for demo purposes when credentials unavailable
  * Fixed demo interview video recording issues - removed duplicate buttons and enabled proper video playback
  * Created comprehensive PROJECT_PLAN.md documenting business model, technical architecture, development roadmap, and success metrics
  * Implemented calendar integration system with one-click interview scheduling
  * Added calendar providers support for Google Calendar, Outlook, and Calendly
  * Created time slot management for setting available interview times
  * Built interview scheduling API endpoints with meeting URL generation
  * Added Calendar page (/calendar) for managing calendar integrations and availability
  * Created comprehensive Settings & Documentation page with complete platform management guide
  * Added tabbed interface covering core features, advanced functionality, role-based access, and technical architecture
  * Documented all management locations and features with visual guides and quick-start instructions
  * Added complete Developer Documentation with API reference, code examples, and extension guidelines
  * Included detailed API documentation with authentication, webhooks, error handling, and SDK examples
  * Provided comprehensive troubleshooting guide and development best practices for code enhancement
  * Created complete installation and deployment system with automated setup scripts
  * Added setup.sh for automated installation on any system (Linux, macOS, Windows)
  * Built deploy.sh for production deployment with multiple options (PM2, Docker, Systemd)
  * Created comprehensive INSTALLATION.md guide with detailed setup instructions
  * Added .env.example template with all configuration options and documentation
  * Included README.md with quick start guide and feature overview
  * Created Makefile for easy project management and common tasks
- January 2, 2025. API optimization and comprehensive documentation
  * Enhanced API optimization with comprehensive caching, connection pooling, and circuit breaker patterns
  * Fixed API integration screen to properly handle APIs without webhook support (polling/manual sync)
  * Added performance monitoring with real-time metrics for cache hit rates and system health
  * Created complete documentation suite: COMPLETE_DOCUMENTATION.md and QUICK_FILE_REFERENCE.md
  * Optimized jobs API endpoint with intelligent caching and database connection pooling
  * Added API_OPTIMIZATION_SUMMARY.md documenting all performance improvements and backend optimizations
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```