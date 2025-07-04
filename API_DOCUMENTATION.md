# AI Interview Platform API Documentation

## Overview

The AI Interview Platform provides a comprehensive REST API for external job application systems to integrate automated video interviews into their hiring workflow.

## Base URL
```
https://your-domain.com/api
```

## Authentication

All API requests require an API key in the header:
```
X-API-Key: your-api-key-here
```

## Core Endpoints

### 1. Submit Job Application

**Endpoint:** `POST /external/job-application`

**Description:** Creates a new job application and automatically generates an AI-powered video interview invitation.

**Request Body:**
```json
{
  "jobId": 1,
  "applicantData": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123",
    "resume": "https://example.com/resume.pdf"
  },
  "autoSendInvite": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "applicationId": 123,
    "interviewId": 456,
    "interviewToken": "unique-token-here",
    "interviewLink": "https://your-domain.com/interview/unique-token-here"
  },
  "message": "Job application processed successfully"
}
```

### 2. Create Job

**Endpoint:** `POST /jobs`

**Description:** Creates a new job posting in the system.

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "company": "TechCorp Inc.",
  "description": "Job description here...",
  "requirements": "5+ years experience...",
  "expertiseLevel": "senior"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Senior Software Engineer",
  "company": "TechCorp Inc.",
  "description": "Job description here...",
  "requirements": "5+ years experience...",
  "expertiseLevel": "senior",
  "status": "active",
  "createdAt": "2025-06-30T09:28:10.491Z",
  "updatedAt": "2025-06-30T09:28:10.491Z"
}
```

### 3. Get Interview Details

**Endpoint:** `GET /interviews/{interviewId}`

**Description:** Retrieves complete interview details including AI analysis scores.

**Response:**
```json
{
  "interview": {
    "id": 1,
    "status": "completed",
    "questions": [...],
    "videoPath": "/path/to/video"
  },
  "score": {
    "technicalScore": 8.2,
    "communicationScore": 7.8,
    "confidenceScore": 7.5,
    "overallScore": 7.8,
    "feedback": "Strong technical knowledge...",
    "analysisDetails": {...}
  },
  "job": {
    "title": "Senior Software Engineer",
    "company": "TechCorp Inc."
  },
  "applicant": {
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "videoUrl": "/api/videos/filename.webm"
}
```

### 4. Send Manual Interview Invitation

**Endpoint:** `POST /interviews/invite`

**Description:** Manually send an interview invitation to an existing applicant.

**Request Body:**
```json
{
  "applicantEmail": "john.doe@example.com",
  "jobId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview invitation sent successfully",
  "interviewId": 456
}
```

## Interview Workflow

1. **Application Submission:** External system submits candidate data via `/external/job-application`
2. **Question Generation:** AI generates tailored interview questions based on job requirements
3. **Email Invitation:** Automated email sent to candidate with interview link
4. **Video Interview:** Candidate completes video interview through web interface
5. **AI Analysis:** Video is analyzed for technical skills, communication, and confidence
6. **Results Available:** Complete analysis and scores available via API

## Interview Status Values

- `pending`: Interview invitation sent, waiting for candidate
- `in_progress`: Candidate has started the interview
- `completed`: Interview finished, AI analysis complete
- `expired`: Interview link expired

## Error Responses

All API endpoints return standard HTTP status codes with detailed error messages:

```json
{
  "error": "Error type",
  "message": "Detailed error description"
}
```

Common status codes:
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Invalid or missing API key
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server-side error

## Rate Limits

- API requests: 1000 per hour per API key
- Video uploads: 100 per hour per API key

## Webhooks (Optional)

Configure webhook URLs to receive real-time notifications:

**Endpoint:** `POST /webhook/job-application`

**Payload:**
```json
{
  "event": "interview_completed",
  "interviewId": 456,
  "applicantEmail": "john.doe@example.com",
  "overallScore": 7.8,
  "timestamp": "2025-06-30T10:30:00Z"
}
```

## SDKs and Examples

### cURL Example
```bash
curl -X POST https://your-domain.com/api/external/job-application \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "jobId": 1,
    "applicantData": {
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  }'
```

### JavaScript Example
```javascript
const response = await fetch('/api/external/job-application', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key'
  },
  body: JSON.stringify({
    jobId: 1,
    applicantData: {
      name: 'Jane Smith',
      email: 'jane@example.com'
    }
  })
});

const result = await response.json();
```

## Support

For API support and questions:
- Email: api-support@aiinterview.com
- Documentation: https://docs.aiinterview.com
- Status Page: https://status.aiinterview.com