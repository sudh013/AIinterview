import { storage } from "../storage";
import { auditLogger, AuditAction } from "./audit";

// Job data structure from external platforms
interface ExternalJob {
  externalId: string;
  title: string;
  description: string;
  requirements: string;
  department: string;
  location: string;
  salaryRange?: string;
  expertiseLevel: 'entry' | 'mid' | 'senior';
  status: 'open' | 'closed' | 'draft';
  postedDate: Date;
  closingDate?: Date;
  source: 'greenhouse' | 'workday' | 'lever' | 'bamboohr';
}

// Applicant data structure from external platforms
interface ExternalApplicant {
  externalId: string;
  externalJobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  applicationDate: Date;
  status: 'new' | 'reviewed' | 'interview_scheduled' | 'rejected' | 'hired';
  source: 'greenhouse' | 'workday' | 'lever' | 'bamboohr';
}

interface SyncResult {
  success: boolean;
  jobsSynced: number;
  applicantsSynced: number;
  errors: string[];
}

interface SyncConfig {
  platformType: 'greenhouse' | 'workday' | 'lever' | 'bamboohr';
  apiKey: string;
  baseUrl?: string;
  syncJobs: boolean;
  syncApplicants: boolean;
  syncInterval: number; // in minutes
  lastSync?: Date;
}

class DataSyncService {
  private syncConfigurations: Map<string, SyncConfig> = new Map();

  // Register a sync configuration for a platform
  registerSync(integrationId: string, config: SyncConfig): void {
    this.syncConfigurations.set(integrationId, config);
    console.log(`[DataSync] Registered sync for ${config.platformType} with ID ${integrationId}`);
  }

  // Perform full sync for all configured integrations
  async performFullSync(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const [integrationId, config] of Array.from(this.syncConfigurations.entries())) {
      try {
        const result = await this.syncPlatform(integrationId, config);
        results.push(result);

        // Update last sync time
        config.lastSync = new Date();

        // Log sync completion
        console.log(`[DataSync] Completed sync for ${config.platformType}: ${result.jobsSynced} jobs, ${result.applicantsSynced} applicants`);
      } catch (error) {
        console.error(`[DataSync] Error syncing ${config.platformType}:`, error);
        results.push({
          success: false,
          jobsSynced: 0,
          applicantsSynced: 0,
          errors: [(error as Error).message]
        });
      }
    }

    return results;
  }

  // Sync data from a specific platform
  private async syncPlatform(integrationId: string, config: SyncConfig): Promise<SyncResult> {
    console.log(`[DataSync] Starting sync for ${config.platformType}`);
    
    let jobsSynced = 0;
    let applicantsSynced = 0;
    const errors: string[] = [];

    try {
      // Sync jobs if enabled
      if (config.syncJobs) {
        const jobs = await this.fetchJobsFromPlatform(config);
        for (const externalJob of jobs) {
          try {
            await this.syncJob(externalJob);
            jobsSynced++;
          } catch (error) {
            errors.push(`Job sync error for ${externalJob.title}: ${(error as Error).message}`);
          }
        }
      }

      // Sync applicants if enabled
      if (config.syncApplicants) {
        const applicants = await this.fetchApplicantsFromPlatform(config);
        for (const externalApplicant of applicants) {
          try {
            await this.syncApplicant(externalApplicant);
            applicantsSynced++;
          } catch (error) {
            errors.push(`Applicant sync error for ${externalApplicant.email}: ${(error as Error).message}`);
          }
        }
      }

      return {
        success: errors.length === 0,
        jobsSynced,
        applicantsSynced,
        errors
      };
    } catch (error) {
      return {
        success: false,
        jobsSynced,
        applicantsSynced,
        errors: [(error as Error).message]
      };
    }
  }

  // Fetch jobs from external platform
  private async fetchJobsFromPlatform(config: SyncConfig): Promise<ExternalJob[]> {
    switch (config.platformType) {
      case 'greenhouse':
        return this.fetchGreenhouseJobs(config);
      case 'workday':
        return this.fetchWorkdayJobs(config);
      case 'lever':
        return this.fetchLeverJobs(config);
      case 'bamboohr':
        return this.fetchBambooHRJobs(config);
      default:
        throw new Error(`Unknown platform type: ${config.platformType}`);
    }
  }

  // Fetch applicants from external platform
  private async fetchApplicantsFromPlatform(config: SyncConfig): Promise<ExternalApplicant[]> {
    switch (config.platformType) {
      case 'greenhouse':
        return this.fetchGreenhouseApplicants(config);
      case 'workday':
        return this.fetchWorkdayApplicants(config);
      case 'lever':
        return this.fetchLeverApplicants(config);
      case 'bamboohr':
        return this.fetchBambooHRApplicants(config);
      default:
        throw new Error(`Unknown platform type: ${config.platformType}`);
    }
  }

  // Platform-specific job fetching methods
  private async fetchGreenhouseJobs(config: SyncConfig): Promise<ExternalJob[]> {
    // Mock implementation - replace with actual Greenhouse API calls
    console.log(`[DataSync] Fetching jobs from Greenhouse with API key: ${config.apiKey.substring(0, 8)}...`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return [
      {
        externalId: "gh_job_123",
        title: "Senior Frontend Developer",
        description: "We are looking for a senior frontend developer to join our team...",
        requirements: "5+ years React experience, TypeScript, etc.",
        department: "Engineering",
        location: "San Francisco, CA",
        salaryRange: "$120,000 - $160,000",
        expertiseLevel: "senior",
        status: "open",
        postedDate: new Date("2025-06-25"),
        source: "greenhouse"
      },
      {
        externalId: "gh_job_124",
        title: "Product Manager",
        description: "Lead product strategy and roadmap development...",
        requirements: "3+ years product management experience",
        department: "Product",
        location: "Remote",
        salaryRange: "$100,000 - $140,000",
        expertiseLevel: "mid",
        status: "open",
        postedDate: new Date("2025-06-28"),
        source: "greenhouse"
      }
    ];
  }

  private async fetchWorkdayJobs(config: SyncConfig): Promise<ExternalJob[]> {
    console.log(`[DataSync] Fetching jobs from Workday`);
    // Mock implementation - replace with actual Workday API calls
    return [];
  }

  private async fetchLeverJobs(config: SyncConfig): Promise<ExternalJob[]> {
    console.log(`[DataSync] Fetching jobs from Lever`);
    // Mock implementation - replace with actual Lever API calls
    return [];
  }

  private async fetchBambooHRJobs(config: SyncConfig): Promise<ExternalJob[]> {
    console.log(`[DataSync] Fetching jobs from BambooHR`);
    // Mock implementation - replace with actual BambooHR API calls
    return [];
  }

  // Platform-specific applicant fetching methods
  private async fetchGreenhouseApplicants(config: SyncConfig): Promise<ExternalApplicant[]> {
    console.log(`[DataSync] Fetching applicants from Greenhouse`);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return [
      {
        externalId: "gh_applicant_456",
        externalJobId: "gh_job_123",
        firstName: "Sarah",
        lastName: "Chen",
        email: "sarah.chen@email.com",
        phone: "+1-555-0123",
        applicationDate: new Date("2025-06-29"),
        status: "new",
        source: "greenhouse"
      },
      {
        externalId: "gh_applicant_457",
        externalJobId: "gh_job_124",
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike.johnson@email.com",
        applicationDate: new Date("2025-06-30"),
        status: "reviewed",
        source: "greenhouse"
      }
    ];
  }

  private async fetchWorkdayApplicants(config: SyncConfig): Promise<ExternalApplicant[]> {
    console.log(`[DataSync] Fetching applicants from Workday`);
    return [];
  }

  private async fetchLeverApplicants(config: SyncConfig): Promise<ExternalApplicant[]> {
    console.log(`[DataSync] Fetching applicants from Lever`);
    return [];
  }

  private async fetchBambooHRApplicants(config: SyncConfig): Promise<ExternalApplicant[]> {
    console.log(`[DataSync] Fetching applicants from BambooHR`);
    return [];
  }

  // Sync individual job to local database
  private async syncJob(externalJob: ExternalJob): Promise<void> {
    try {
      // Check if job already exists
      const existingJobs = await storage.getJobs();
      const existingJob = existingJobs.find(job => 
        job.title === externalJob.title
      );

      if (!existingJob) {
        // Create new job
        await storage.createJob({
          title: externalJob.title,
          description: externalJob.description,
          company: externalJob.department, // Map department to company field
          requirements: externalJob.requirements,
          expertiseLevel: externalJob.expertiseLevel,
          status: externalJob.status
        });
        
        console.log(`[DataSync] Created new job: ${externalJob.title}`);
      } else {
        // Update existing job status if needed
        if (existingJob.status !== externalJob.status) {
          await storage.updateJobStatus(existingJob.id, externalJob.status);
          console.log(`[DataSync] Updated job status: ${externalJob.title} -> ${externalJob.status}`);
        }
      }
    } catch (error) {
      console.error(`[DataSync] Error syncing job ${externalJob.title}:`, error);
      throw error;
    }
  }

  // Sync individual applicant to local database
  private async syncApplicant(externalApplicant: ExternalApplicant): Promise<void> {
    try {
      // Check if applicant already exists
      const existingApplicant = await storage.getApplicantByEmail(externalApplicant.email);

      let applicantId: number;

      if (!existingApplicant) {
        // Create new applicant
        const newApplicant = await storage.createApplicant({
          name: `${externalApplicant.firstName} ${externalApplicant.lastName}`,
          email: externalApplicant.email,
          phone: externalApplicant.phone || "",
          resume: externalApplicant.resumeUrl || ""
        });
        applicantId = newApplicant.id;
        console.log(`[DataSync] Created new applicant: ${externalApplicant.email}`);
      } else {
        applicantId = existingApplicant.id;
      }

      // Find the corresponding job
      const jobs = await storage.getJobs();
      const matchingJob = jobs.find(job => 
        job.title.includes(externalApplicant.externalJobId.replace(/^[a-z]+_job_/, '')) ||
        job.department === "Engineering" // Fallback matching logic
      );

      if (matchingJob) {
        // Create job application if it doesn't exist
        const existingApplications = await storage.getJobApplicationsByJob(matchingJob.id);
        const existingApplication = existingApplications.find(app => app.applicantId === applicantId);

        if (!existingApplication) {
          await storage.createJobApplication({
            jobId: matchingJob.id,
            applicantId: applicantId,
            status: this.mapExternalStatusToInternal(externalApplicant.status),
            coverLetter: externalApplicant.coverLetter || ""
          });
          console.log(`[DataSync] Created job application for ${externalApplicant.email} -> ${matchingJob.title}`);
        } else {
          // Update status if changed
          const internalStatus = this.mapExternalStatusToInternal(externalApplicant.status);
          if (existingApplication.status !== internalStatus) {
            await storage.updateApplicationStatus(existingApplication.id, internalStatus);
            console.log(`[DataSync] Updated application status: ${externalApplicant.email} -> ${internalStatus}`);
          }
        }
      }
    } catch (error) {
      console.error(`[DataSync] Error syncing applicant ${externalApplicant.email}:`, error);
      throw error;
    }
  }

  // Map external applicant status to internal status
  private mapExternalStatusToInternal(externalStatus: string): string {
    const statusMap: Record<string, string> = {
      'new': 'applied',
      'reviewed': 'screening',
      'interview_scheduled': 'interview',
      'rejected': 'rejected',
      'hired': 'hired'
    };
    return statusMap[externalStatus] || 'applied';
  }

  // Get sync status for dashboard
  async getSyncStatus(): Promise<{
    totalConfigurations: number;
    lastSyncTimes: Record<string, Date | null>;
    nextScheduledSync: Date | null;
  }> {
    const lastSyncTimes: Record<string, Date | null> = {};
    
    for (const [id, config] of this.syncConfigurations) {
      lastSyncTimes[config.platformType] = config.lastSync || null;
    }

    return {
      totalConfigurations: this.syncConfigurations.size,
      lastSyncTimes,
      nextScheduledSync: this.getNextScheduledSync()
    };
  }

  private getNextScheduledSync(): Date | null {
    let nextSync: Date | null = null;
    
    for (const [_, config] of this.syncConfigurations) {
      if (config.lastSync) {
        const nextSyncTime = new Date(config.lastSync.getTime() + (config.syncInterval * 60 * 1000));
        if (!nextSync || nextSyncTime < nextSync) {
          nextSync = nextSyncTime;
        }
      }
    }
    
    return nextSync;
  }
}

export const dataSyncService = new DataSyncService();

// Auto-sync job - runs periodically
setInterval(async () => {
  try {
    const results = await dataSyncService.performFullSync();
    const totalJobsSynced = results.reduce((sum, r) => sum + r.jobsSynced, 0);
    const totalApplicantsSynced = results.reduce((sum, r) => sum + r.applicantsSynced, 0);
    
    if (totalJobsSynced > 0 || totalApplicantsSynced > 0) {
      console.log(`[DataSync] Auto-sync completed: ${totalJobsSynced} jobs, ${totalApplicantsSynced} applicants`);
    }
  } catch (error) {
    console.error('[DataSync] Auto-sync error:', error);
  }
}, 15 * 60 * 1000); // Run every 15 minutes