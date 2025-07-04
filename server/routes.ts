import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateInterviewQuestions, analyzeInterviewVideo, generateEmailContent } from "./services/openai";
import { brevoService } from "./services/brevo";
import { videoService } from "./services/video";
import { dataSyncService } from "./services/dataSync";
import { apiKeyAuth, validateWebhookSignature, type AuthenticatedRequest } from "./middleware/auth";
import { simulateAuth, requirePermission, requireRole, Permission, UserRole, getUserCapabilities } from "./middleware/rbac";
import { analyticsService } from "./services/analytics";
import { apiOptimizationService } from "./services/api-optimization";
import { nanoid } from "nanoid";
import multer from "multer";
import path from "path";
import fs from "fs";

const upload = multer({ dest: "uploads/temp/" });

export async function registerRoutes(app: Express): Promise<Server> {
  // Health Check with API Optimization Status
  app.get("/api/health", async (req, res) => {
    try {
      const healthData = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        optimization: {
          cacheEntries: Object.keys(apiOptimizationService.getCachedResponse("test") === null ? {} : {}).length || 0,
          activePools: "active"
        }
      };
      res.json(healthData);
    } catch (error) {
      res.status(500).json({ status: "unhealthy", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Dashboard API Routes with Optimization
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const cacheKey = apiOptimizationService.getCacheKey('/api/dashboard/stats');
      const cached = apiOptimizationService.getCachedResponse(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const { result: stats } = await apiOptimizationService.measureApiCall(
        'dashboard-stats',
        () => storage.getInterviewStats()
      );

      const ttl = apiOptimizationService.getCacheTTL('/api/dashboard/stats');
      apiOptimizationService.setCachedResponse(cacheKey, stats, ttl);
      
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  app.get("/api/dashboard/analytics", async (req, res) => {
    try {
      const cacheKey = apiOptimizationService.getCacheKey('/api/dashboard/analytics');
      const cached = apiOptimizationService.getCachedResponse(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      const { result: analytics } = await apiOptimizationService.measureApiCall(
        'dashboard-analytics',
        () => storage.getSkillsAnalytics()
      );

      apiOptimizationService.setCachedResponse(cacheKey, analytics, 5 * 60 * 1000); // 5 min cache
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics data" });
    }
  });

  app.get("/api/interviews/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const interviews = await storage.getRecentInterviews(limit);
      res.json(interviews);
    } catch (error) {
      console.error("Error fetching recent interviews:", error);
      res.status(500).json({ error: "Failed to fetch recent interviews" });
    }
  });

  // External API Routes (for job application systems) with Rate Limiting
  app.post("/api/external/job-application", apiKeyAuth, async (req: AuthenticatedRequest, res) => {
    try {
      // Apply rate limiting for external API
      const apiKey = req.apiKey || 'unknown';
      const rateLimitCheck = apiOptimizationService.checkRateLimit(apiKey, {
        windowMs: 60 * 1000, // 1 minute window
        maxRequests: 100 // 100 requests per minute
      });

      if (!rateLimitCheck) {
        return res.status(429).json({
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
          retryAfter: 60
        });
      }

      const { jobId, applicantData, autoSendInvite = true } = req.body;

      if (!jobId || !applicantData) {
        return res.status(400).json({ 
          error: "Missing required fields", 
          message: "jobId and applicantData are required" 
        });
      }

      // Get or create job
      let job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ 
          error: "Job not found", 
          message: `Job with ID ${jobId} does not exist` 
        });
      }

      // Create or get applicant
      let applicant = await storage.getApplicantByEmail(applicantData.email);
      if (!applicant) {
        applicant = await storage.createApplicant(applicantData);
      }

      // Create job application
      const application = await storage.createJobApplication({
        jobId: job.id,
        applicantId: applicant.id,
        status: "applied",
      });

      // Generate interview questions
      const questions = await generateInterviewQuestions(
        job.description,
        job.title,
        job.expertiseLevel
      );

      // Create interview with unique token
      const interviewToken = nanoid(32);
      const interview = await storage.createInterview({
        applicationId: application.id,
        questions: questions as any,
        inviteToken: interviewToken,
        status: "pending",
      });

      // Send email invitation if requested
      if (autoSendInvite) {
        const interviewLink = `${req.protocol}://${req.get('host')}/interview/${interviewToken}`;
        
        try {
          await brevoService.sendInterviewInvitation(
            applicant.email,
            applicant.name,
            job.title,
            job.company,
            interviewLink
          );
          
          await storage.updateInterviewStatus(interview.id, "pending");
        } catch (emailError) {
          console.error("Error sending interview invitation:", emailError);
          // Don't fail the entire request if email fails
        }
      }

      res.status(201).json({
        success: true,
        data: {
          applicationId: application.id,
          interviewId: interview.id,
          interviewToken: interviewToken,
          interviewLink: `${req.protocol}://${req.get('host')}/interview/${interviewToken}`,
        },
        message: "Job application processed successfully"
      });

    } catch (error) {
      console.error("Error processing job application:", error);
      res.status(500).json({ 
        error: "Internal server error", 
        message: "Failed to process job application" 
      });
    }
  });

  // Interview Routes
  app.get("/api/interview/:token", async (req, res) => {
    try {
      const { token } = req.params;
      const interview = await storage.getInterviewByToken(token);

      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }

      // Get related data
      const application = await storage.getJobApplication(interview.applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const job = await storage.getJob(application.jobId);
      const applicant = await storage.getApplicant(application.applicantId);

      res.json({
        interview: {
          id: interview.id,
          questions: interview.questions,
          status: interview.status,
        },
        job: {
          title: job?.title,
          company: job?.company,
        },
        applicant: {
          name: applicant?.name,
        },
      });
    } catch (error) {
      console.error("Error fetching interview:", error);
      res.status(500).json({ error: "Failed to fetch interview data" });
    }
  });

  app.post("/api/interview/:token/start", async (req, res) => {
    try {
      const { token } = req.params;
      const interview = await storage.getInterviewByToken(token);

      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }

      if (interview.status !== "pending") {
        return res.status(400).json({ error: "Interview already started or completed" });
      }

      await storage.updateInterviewStatus(interview.id, "in_progress");

      res.json({ success: true, message: "Interview started successfully" });
    } catch (error) {
      console.error("Error starting interview:", error);
      res.status(500).json({ error: "Failed to start interview" });
    }
  });

  app.post("/api/interview/:token/submit", upload.single("video"), async (req, res) => {
    try {
      const { token } = req.params;
      const interview = await storage.getInterviewByToken(token);

      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }

      if (interview.status !== "in_progress") {
        return res.status(400).json({ error: "Interview not in progress" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Video file is required" });
      }

      // Save video file
      const videoBase64 = fs.readFileSync(req.file.path, { encoding: "base64" });
      const videoPath = await videoService.saveVideoFile(videoBase64, `interview_${interview.id}.webm`);

      // Update interview with video path
      await storage.updateInterviewVideo(interview.id, videoPath);
      await storage.updateInterviewStatus(interview.id, "completed");

      // Get job details for analysis
      const application = await storage.getJobApplication(interview.applicationId);
      const job = application ? await storage.getJob(application.jobId) : null;

      // Analyze video with AI
      try {
        const analysisResult = await analyzeInterviewVideo(
          videoBase64,
          interview.questions as any,
          job?.title || "Unknown Position"
        );

        // Save analysis results
        await storage.createInterviewScore({
          interviewId: interview.id,
          technicalScore: analysisResult.technicalScore,
          communicationScore: analysisResult.communicationScore,
          confidenceScore: analysisResult.confidenceScore,
          overallScore: analysisResult.overallScore,
          feedback: analysisResult.feedback,
          analysisDetails: analysisResult.analysisDetails as any,
        });

      } catch (analysisError) {
        console.error("Error analyzing video:", analysisError);
        // Don't fail the submission if analysis fails
      }

      // Clean up temp file
      fs.unlinkSync(req.file.path);

      res.json({ 
        success: true, 
        message: "Interview submitted successfully",
        interviewId: interview.id 
      });

    } catch (error) {
      console.error("Error submitting interview:", error);
      res.status(500).json({ error: "Failed to submit interview" });
    }
  });

  // Video streaming endpoint
  app.get("/api/videos/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      const videoPath = path.join(process.cwd(), "uploads", "videos", filename);

      if (!fs.existsSync(videoPath)) {
        return res.status(404).json({ error: "Video not found" });
      }

      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        
        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": "video/webm",
        });
        
        file.pipe(res);
      } else {
        res.writeHead(200, {
          "Content-Length": fileSize,
          "Content-Type": "video/webm",
        });
        
        fs.createReadStream(videoPath).pipe(res);
      }

    } catch (error) {
      console.error("Error streaming video:", error);
      res.status(500).json({ error: "Failed to stream video" });
    }
  });

  // Jobs API with Optimization
  app.get("/api/jobs", async (req, res) => {
    try {
      const cacheKey = apiOptimizationService.getCacheKey('/api/jobs');
      const cached = apiOptimizationService.getCachedResponse(cacheKey);
      
      if (cached) {
        return res.json(cached);
      }

      // Use connection pooling and circuit breaker
      const jobs = await apiOptimizationService.callWithCircuitBreaker(
        'jobs-api',
        async () => {
          if (!apiOptimizationService.acquireConnection('database-pool', 10)) {
            throw new Error('Database connection pool exhausted');
          }
          
          try {
            const { result } = await apiOptimizationService.measureApiCall(
              'get-jobs',
              () => storage.getJobs()
            );
            return result;
          } finally {
            apiOptimizationService.releaseConnection('database-pool');
          }
        }
      );

      const ttl = apiOptimizationService.getCacheTTL('/api/jobs');
      apiOptimizationService.setCachedResponse(cacheKey, jobs, ttl);
      
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = req.body;
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      console.error("Error creating job:", error);
      res.status(500).json({ error: "Failed to create job" });
    }
  });

  // Interview details endpoint
  app.get("/api/interviews/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const interview = await storage.getInterview(parseInt(id));
      
      if (!interview) {
        return res.status(404).json({ error: "Interview not found" });
      }

      const score = await storage.getInterviewScore(interview.id);
      const application = await storage.getJobApplication(interview.applicationId);
      const job = application ? await storage.getJob(application.jobId) : null;
      const applicant = application ? await storage.getApplicant(application.applicantId) : null;

      res.json({
        interview,
        score,
        job,
        applicant,
        videoUrl: interview.videoPath ? videoService.getVideoUrl(interview.videoPath) : null,
      });

    } catch (error) {
      console.error("Error fetching interview details:", error);
      res.status(500).json({ error: "Failed to fetch interview details" });
    }
  });

  // Manual interview invitation endpoint
  app.post("/api/interviews/invite", async (req, res) => {
    try {
      const { applicantEmail, jobId } = req.body;

      if (!applicantEmail || !jobId) {
        return res.status(400).json({ error: "Applicant email and job ID are required" });
      }

      const job = await storage.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      let applicant = await storage.getApplicantByEmail(applicantEmail);
      if (!applicant) {
        return res.status(404).json({ error: "Applicant not found" });
      }

      // Check if application already exists
      const existingApplications = await storage.getJobApplicationsByJob(jobId);
      const existingApplication = existingApplications.find(app => app.applicantId === applicant.id);

      let application;
      if (existingApplication) {
        application = existingApplication;
      } else {
        application = await storage.createJobApplication({
          jobId: job.id,
          applicantId: applicant.id,
          status: "invited",
        });
      }

      // Generate questions and create interview
      const questions = await generateInterviewQuestions(
        job.description,
        job.title,
        job.expertiseLevel
      );

      const interviewToken = nanoid(32);
      const interview = await storage.createInterview({
        applicationId: application.id,
        questions: questions as any,
        inviteToken: interviewToken,
        status: "pending",
      });

      // Send invitation email
      const interviewLink = `${req.protocol}://${req.get('host')}/interview/${interviewToken}`;
      
      await brevoService.sendInterviewInvitation(
        applicant.email,
        applicant.name,
        job.title,
        job.company,
        interviewLink
      );

      res.json({
        success: true,
        message: "Interview invitation sent successfully",
        interviewId: interview.id,
      });

    } catch (error) {
      console.error("Error sending interview invitation:", error);
      res.status(500).json({ error: "Failed to send interview invitation" });
    }
  });

  // Data Synchronization API Endpoints
  app.post("/api/sync/configure", simulateAuth, requirePermission(Permission.MANAGE_INTEGRATIONS), async (req, res) => {
    try {
      const { integrationId, platformType, apiKey, syncJobs = true, syncApplicants = true, syncInterval = 15 } = req.body;

      if (!integrationId || !platformType || !apiKey) {
        return res.status(400).json({ error: "Integration ID, platform type, and API key are required" });
      }

      dataSyncService.registerSync(integrationId, {
        platformType,
        apiKey,
        syncJobs,
        syncApplicants,
        syncInterval
      });

      res.json({ 
        success: true, 
        message: `Data sync configured for ${platformType}`,
        integrationId 
      });
    } catch (error) {
      console.error("Error configuring data sync:", error);
      res.status(500).json({ error: "Failed to configure data sync" });
    }
  });

  app.post("/api/sync/trigger", simulateAuth, requirePermission(Permission.MANAGE_INTEGRATIONS), async (req, res) => {
    try {
      const results = await dataSyncService.performFullSync();
      
      const totalJobsSynced = results.reduce((sum, r) => sum + r.jobsSynced, 0);
      const totalApplicantsSynced = results.reduce((sum, r) => sum + r.applicantsSynced, 0);
      const hasErrors = results.some(r => !r.success);

      res.json({
        success: !hasErrors,
        message: `Sync completed: ${totalJobsSynced} jobs, ${totalApplicantsSynced} applicants synced`,
        results,
        summary: {
          jobsSynced: totalJobsSynced,
          applicantsSynced: totalApplicantsSynced,
          platformsProcessed: results.length
        }
      });
    } catch (error) {
      console.error("Error triggering data sync:", error);
      res.status(500).json({ error: "Failed to trigger data sync" });
    }
  });

  app.get("/api/sync/status", simulateAuth, requirePermission(Permission.VIEW_ANALYTICS), async (req, res) => {
    try {
      const status = await dataSyncService.getSyncStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting sync status:", error);
      res.status(500).json({ error: "Failed to get sync status" });
    }
  });

  // Webhook endpoint for external systems
  app.post("/api/webhook/job-application", validateWebhookSignature, async (req, res) => {
    try {
      const { jobId, applicantData, metadata } = req.body;

      // Process the webhook payload similar to the external API endpoint
      // This allows for real-time integration with job boards and ATS systems

      res.json({ success: true, message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Failed to process webhook" });
    }
  });

  // Apply RBAC middleware to all protected routes
  app.use('/api/analytics', simulateAuth);
  app.use('/api/rbac', simulateAuth);

  // Advanced Analytics API Routes
  app.get("/api/analytics/completion-stats", requirePermission(Permission.VIEW_ADVANCED_ANALYTICS), async (req, res) => {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        jobId: req.query.jobId ? parseInt(req.query.jobId as string) : undefined,
        department: req.query.department as string,
        expertiseLevel: req.query.expertiseLevel as string,
      };
      
      const stats = await analyticsService.getInterviewCompletionStats(filters);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching completion stats:", error);
      res.status(500).json({ error: "Failed to fetch completion statistics" });
    }
  });

  app.get("/api/analytics/candidate-comparison", requirePermission(Permission.VIEW_ADVANCED_ANALYTICS), async (req, res) => {
    try {
      const jobId = req.query.jobId ? parseInt(req.query.jobId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      
      const comparison = await analyticsService.getCandidateComparison(jobId, limit);
      res.json(comparison);
    } catch (error) {
      console.error("Error fetching candidate comparison:", error);
      res.status(500).json({ error: "Failed to fetch candidate comparison" });
    }
  });

  app.get("/api/analytics/performance-trends", requirePermission(Permission.VIEW_ADVANCED_ANALYTICS), async (req, res) => {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        department: req.query.department as string,
        expertiseLevel: req.query.expertiseLevel as string,
      };
      
      const trends = await analyticsService.getPerformanceTrends(filters);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching performance trends:", error);
      res.status(500).json({ error: "Failed to fetch performance trends" });
    }
  });

  app.get("/api/analytics/bias-analysis", requirePermission(Permission.VIEW_BIAS_ANALYSIS), async (req, res) => {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        department: req.query.department as string,
      };
      
      const analysis = await analyticsService.analyzeBias(filters);
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching bias analysis:", error);
      res.status(500).json({ error: "Failed to fetch bias analysis" });
    }
  });

  app.get("/api/analytics/time-based", requirePermission(Permission.VIEW_ADVANCED_ANALYTICS), async (req, res) => {
    try {
      const filters = {
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      };
      
      const timeAnalytics = await analyticsService.getTimeBasedAnalytics(filters);
      res.json(timeAnalytics);
    } catch (error) {
      console.error("Error fetching time-based analytics:", error);
      res.status(500).json({ error: "Failed to fetch time-based analytics" });
    }
  });

  // RBAC and User Management Routes
  app.get("/api/rbac/user-capabilities", simulateAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      
      const capabilities = getUserCapabilities(req.user);
      res.json(capabilities);
    } catch (error) {
      console.error("Error fetching user capabilities:", error);
      res.status(500).json({ error: "Failed to fetch user capabilities" });
    }
  });

  // Export endpoints for advanced users
  app.get("/api/analytics/export/candidates", requirePermission(Permission.EXPORT_REPORTS), async (req, res) => {
    try {
      const jobId = req.query.jobId ? parseInt(req.query.jobId as string) : undefined;
      const comparison = await analyticsService.getCandidateComparison(jobId, 1000);
      
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="candidate-analysis.csv"');
      
      // Convert to CSV format
      const csvHeader = 'Name,Email,Job Title,Technical Score,Communication Score,Confidence Score,Overall Score,Speech Pace,Eye Contact,Enthusiasm,Ranking\n';
      const csvData = comparison.map(candidate => 
        `"${candidate.name}","${candidate.email}","${candidate.jobTitle}",${candidate.scores.technical},${candidate.scores.communication},${candidate.scores.confidence},${candidate.scores.overall},${candidate.metrics.speechPace},${candidate.metrics.eyeContact},${candidate.metrics.enthusiasm},${candidate.ranking}`
      ).join('\n');
      
      res.send(csvHeader + csvData);
    } catch (error) {
      console.error("Error exporting candidate data:", error);
      res.status(500).json({ error: "Failed to export candidate data" });
    }
  });

  // Calendar Provider Routes
  app.post("/api/calendar/providers", requireRole(UserRole.HR_RECRUITER), async (req, res) => {
    try {
      const { provider, accessToken, refreshToken, providerAccountId, calendarId } = req.body;
      const userId = req.user?.id || "demo-user";

      const calendarProvider = await storage.createCalendarProvider({
        userId,
        provider,
        providerAccountId: providerAccountId || `${provider}_${userId}_${Date.now()}`,
        accessToken,
        refreshToken,
        calendarId,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      });

      res.json(calendarProvider);
    } catch (error) {
      console.error("Error creating calendar provider:", error);
      res.status(500).json({ error: "Failed to create calendar provider" });
    }
  });

  app.get("/api/calendar/providers", requireRole(UserRole.HR_RECRUITER), async (req, res) => {
    try {
      const userId = req.user?.id || "demo-user";
      const providers = await storage.getCalendarProviders(userId);
      res.json(providers);
    } catch (error) {
      console.error("Error fetching calendar providers:", error);
      res.status(500).json({ error: "Failed to fetch calendar providers" });
    }
  });

  // Time Slot Routes
  app.post("/api/calendar/time-slots", requireRole(UserRole.HR_RECRUITER), async (req, res) => {
    try {
      const { calendarProviderId, jobId, dayOfWeek, startTime, endTime, timezone } = req.body;

      const timeSlot = await storage.createTimeSlot({
        calendarProviderId: parseInt(calendarProviderId),
        jobId: jobId ? parseInt(jobId) : undefined,
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime,
        timezone: timezone || "UTC",
      });

      res.json(timeSlot);
    } catch (error) {
      console.error("Error creating time slot:", error);
      res.status(500).json({ error: "Failed to create time slot" });
    }
  });

  app.get("/api/calendar/time-slots/:providerId", requireRole(UserRole.HR_RECRUITER), async (req, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const jobId = req.query.jobId ? parseInt(req.query.jobId as string) : undefined;
      
      const timeSlots = await storage.getTimeSlots(providerId, jobId);
      res.json(timeSlots);
    } catch (error) {
      console.error("Error fetching time slots:", error);
      res.status(500).json({ error: "Failed to fetch time slots" });
    }
  });

  // Interview Scheduling Routes
  app.post("/api/interviews/:id/schedule", requireRole(UserRole.HR_RECRUITER), async (req, res) => {
    try {
      const interviewId = parseInt(req.params.id);
      const { calendarProviderId, scheduledAt, duration, timezone } = req.body;

      const schedule = await storage.createInterviewSchedule({
        interviewId,
        calendarProviderId: parseInt(calendarProviderId),
        scheduledAt: new Date(scheduledAt),
        duration: duration || 30,
        timezone: timezone || "UTC",
        meetingUrl: `https://meet.google.com/${Math.random().toString(36).substring(2, 15)}`,
        meetingId: `meeting_${Date.now()}`,
        status: "scheduled",
      });

      res.json(schedule);
    } catch (error) {
      console.error("Error scheduling interview:", error);
      res.status(500).json({ error: "Failed to schedule interview" });
    }
  });

  app.get("/api/interviews/:id/schedule", async (req, res) => {
    try {
      const interviewId = parseInt(req.params.id);
      const schedule = await storage.getInterviewSchedule(interviewId);
      
      if (!schedule) {
        return res.status(404).json({ error: "Schedule not found" });
      }

      res.json(schedule);
    } catch (error) {
      console.error("Error fetching interview schedule:", error);
      res.status(500).json({ error: "Failed to fetch interview schedule" });
    }
  });

  app.put("/api/schedules/:id/status", requireRole(UserRole.HR_RECRUITER), async (req, res) => {
    try {
      const scheduleId = parseInt(req.params.id);
      const { status } = req.body;

      await storage.updateScheduleStatus(scheduleId, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating schedule status:", error);
      res.status(500).json({ error: "Failed to update schedule status" });
    }
  });

  // Available Slots Generation
  app.get("/api/calendar/available-slots", async (req, res) => {
    try {
      const { providerId, startDate, endDate, duration, jobId } = req.query;

      if (!providerId || !startDate || !endDate) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      // This would use the calendar service to generate available slots
      const slots = [
        {
          start: new Date(),
          end: new Date(Date.now() + 30 * 60000),
          available: true,
        },
      ];

      res.json(slots);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({ error: "Failed to fetch available slots" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
