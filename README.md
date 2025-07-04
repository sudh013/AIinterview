# AI Interview Platform

A comprehensive AI-powered video interview platform that integrates with major job platforms and automates personalized candidate assessments.

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repository-url>
cd ai-interview-platform

# Run automated setup
chmod +x setup.sh
./setup.sh

# Configure environment
cp .env.example .env
# Edit .env with your API keys and database credentials

# Start the application
npm run dev
```

Visit `http://localhost:5000` to access the platform.

## ✨ Features

### Core Functionality
- **AI-Powered Interviews**: Automated question generation using OpenAI GPT-4
- **Video Interview System**: Browser-based video recording and playback
- **Smart Candidate Scoring**: AI analysis of technical skills, communication, and confidence
- **Job Management**: Create and manage job postings with custom requirements
- **Applicant Tracking**: Complete candidate pipeline management

### Advanced Features
- **Calendar Integration**: One-click scheduling with Google Calendar, Outlook, and Calendly
- **ATS Integration**: Seamless connection with Greenhouse, Workday, Lever, and BambooHR
- **Analytics & Reporting**: Advanced candidate comparison and bias analysis
- **Role-Based Access**: Admin, HR/Recruiter, Support Reviewer, and Candidate roles
- **API & Webhooks**: Complete REST API for external integrations

### Communication & Automation
- **Email Notifications**: Automated interview invitations and status updates
- **Slack/Teams Integration**: Real-time notifications and updates
- **Zapier Workflows**: Custom automation and data synchronization
- **Custom REST APIs**: Build your own integrations and workflows

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js + Express, TypeScript, ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI GPT-4 for question generation and video analysis
- **Email**: Brevo (Sendinblue) for transactional emails
- **File Storage**: Local filesystem with optional cloud storage

### Project Structure
```
ai-interview-platform/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Route-based page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility libraries
├── server/                # Node.js backend application
│   ├── middleware/        # Express middleware
│   ├── services/         # Business logic services
│   ├── db.ts             # Database connection
│   ├── storage.ts        # Data access layer
│   └── routes.ts         # API route definitions
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema definitions
├── setup.sh             # Automated setup script
├── deploy.sh            # Production deployment script
└── INSTALLATION.md      # Detailed installation guide
```

## 🛠️ Installation Options

### Option 1: Automated Setup (Recommended)
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Installation
See [INSTALLATION.md](INSTALLATION.md) for detailed manual setup instructions.

### Option 3: Docker Deployment
```bash
# Using Docker Compose
docker-compose up -d

# Using Docker only
docker build -t ai-interview-platform .
docker run -d -p 5000:5000 --env-file .env ai-interview-platform
```

## ⚙️ Configuration

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ai_interview_db

# AI Service
OPENAI_API_KEY=sk-your-openai-api-key

# Email Service
BREVO_API_KEY=your-brevo-api-key

# Security
SESSION_SECRET=your-random-secret
```

### Optional Integrations
- **Calendar**: Google Calendar, Outlook, Calendly
- **ATS Systems**: Greenhouse, Workday, Lever, BambooHR
- **Communication**: Slack, Microsoft Teams
- **Automation**: Zapier, Custom REST APIs

See [.env.example](.env.example) for complete configuration options.

## 🚀 Deployment

### Development
```bash
npm run dev          # Start development server
npm run db:push      # Deploy database schema
npm run db:studio    # Open database GUI
```

### Production
```bash
# Option 1: PM2 Process Manager
./deploy.sh pm2

# Option 2: Docker
./deploy.sh docker

# Option 3: Docker Compose
./deploy.sh docker-compose

# Option 4: Systemd Service
./deploy.sh systemd
```

## 📱 Usage

### For Administrators
1. Configure API integrations and calendar providers
2. Set up job postings with requirements
3. Customize interview questions and scoring criteria
4. Monitor platform analytics and user activity

### For HR/Recruiters
1. Create job postings with AI-generated questions
2. Review incoming applications and candidate profiles
3. Schedule interviews using calendar integration
4. Evaluate candidates using AI scoring and analytics

### For Candidates
1. Receive interview invitation via email
2. Complete video interview at convenient time
3. Record responses to AI-generated questions
4. Receive feedback and next steps

## 🔌 API Integration

### External Job Application Submission
```bash
curl -X POST https://your-domain.com/api/external/job-application \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": 123,
    "applicant": {
      "email": "candidate@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "skills": ["JavaScript", "React"]
    }
  }'
```

### Webhook Integration
```javascript
// Receive interview completion notifications
app.post('/webhook/interview-completed', (req, res) => {
  const { interviewId, scores, status } = req.body;
  // Process interview results
});
```

See [Settings → Developer Guide](http://localhost:5000/settings) for complete API documentation.

## 📊 Features Overview

| Feature | Description | Status |
|---------|-------------|---------|
| AI Question Generation | OpenAI-powered personalized interview questions | ✅ Complete |
| Video Interview System | Browser-based recording and playback | ✅ Complete |
| Candidate Scoring | AI analysis of skills and communication | ✅ Complete |
| Calendar Integration | Google/Outlook/Calendly scheduling | ✅ Complete |
| ATS Integration | Greenhouse, Workday, Lever, BambooHR | ✅ Complete |
| Analytics Dashboard | Performance trends and bias analysis | ✅ Complete |
| Role-Based Access | Admin, HR, Support, Candidate roles | ✅ Complete |
| Email Notifications | Automated invitations and updates | ✅ Complete |
| API & Webhooks | REST API and webhook integrations | ✅ Complete |
| Slack/Teams Integration | Real-time notifications | ✅ Complete |

## 🔒 Security

- **API Key Authentication**: Secure access to external endpoints
- **Role-Based Access Control**: Granular permissions system
- **Data Encryption**: Secure storage of sensitive information
- **HTTPS Support**: SSL/TLS encryption for all communications
- **Input Validation**: Comprehensive request validation and sanitization
- **Rate Limiting**: Protection against API abuse and attacks

## 📈 Scaling

### Horizontal Scaling
- Load balancer configuration (Nginx/HAProxy)
- Multiple application instances
- Shared database and file storage
- Redis session store for multi-instance deployments

### Performance Optimization
- Database indexing and query optimization
- CDN integration for static assets
- File compression and caching
- Connection pooling and resource management

## 🤝 Support

### Documentation
- [Installation Guide](INSTALLATION.md) - Complete setup instructions
- [API Documentation](http://localhost:5000/settings) - Developer guide and API reference
- [Deployment Guide](deploy.sh) - Production deployment options

### Troubleshooting
- Check application logs for errors
- Verify environment variable configuration
- Test API endpoints and database connectivity
- Review network and firewall settings

### Getting Help
- Review documentation and troubleshooting guides
- Check GitHub issues for common problems
- Contact support team for assistance

## 📄 License

This project is proprietary software. All rights reserved.

## 🚀 Quick Links

- **Live Demo**: [Demo Interview](http://localhost:5000/demo-interview)
- **Admin Dashboard**: [Dashboard](http://localhost:5000/)
- **API Documentation**: [Settings → Developer Guide](http://localhost:5000/settings)
- **Calendar Setup**: [Calendar Integration](http://localhost:5000/calendar)
- **Job Management**: [Jobs](http://localhost:5000/jobs)

---

**Built with ❤️ by the AI Interview Platform Team**