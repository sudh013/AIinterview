import {
  jobs,
  applicants,
  jobApplications,
  interviews,
  interviewScores,
  apiIntegrations,
  calendarProviders,
  interviewSchedules,
  availableTimeSlots,
  type Job,
  type InsertJob,
  type Applicant,
  type InsertApplicant,
  type JobApplication,
  type InsertJobApplication,
  type Interview,
  type InsertInterview,
  type InterviewScore,
  type InsertInterviewScore,
  type ApiIntegration,
  type CalendarProvider,
  type InsertCalendarProvider,
  type InterviewSchedule,
  type InsertInterviewSchedule,
  type AvailableTimeSlot,
  type InsertAvailableTimeSlot,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, avg } from "drizzle-orm";

export interface IStorage {
  // Jobs
  createJob(job: InsertJob): Promise<Job>;
  getJob(id: number): Promise<Job | undefined>;
  getJobs(): Promise<Job[]>;
  updateJobStatus(id: number, status: string): Promise<void>;

  // Applicants
  createApplicant(applicant: InsertApplicant): Promise<Applicant>;
  getApplicant(id: number): Promise<Applicant | undefined>;
  getApplicantByEmail(email: string): Promise<Applicant | undefined>;

  // Job Applications
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
  getJobApplication(id: number): Promise<JobApplication | undefined>;
  getJobApplicationsByJob(jobId: number): Promise<JobApplication[]>;
  updateApplicationStatus(id: number, status: string): Promise<void>;

  // Interviews
  createInterview(interview: InsertInterview): Promise<Interview>;
  getInterview(id: number): Promise<Interview | undefined>;
  getInterviewByToken(token: string): Promise<Interview | undefined>;
  updateInterviewStatus(id: number, status: string): Promise<void>;
  updateInterviewVideo(id: number, videoPath: string): Promise<void>;
  getRecentInterviews(limit?: number): Promise<any[]>;

  // Interview Scores
  createInterviewScore(score: InsertInterviewScore): Promise<InterviewScore>;
  getInterviewScore(interviewId: number): Promise<InterviewScore | undefined>;

  // Analytics
  getInterviewStats(): Promise<{
    totalInterviews: number;
    pendingReviews: number;
    averageScore: number;
    apiCalls: number;
  }>;

  getSkillsAnalytics(): Promise<{
    technicalAvg: number;
    communicationAvg: number;
    confidenceAvg: number;
  }>;

  // API Integrations
  getApiIntegrations(): Promise<ApiIntegration[]>;

  // Calendar Providers
  createCalendarProvider(provider: InsertCalendarProvider): Promise<CalendarProvider>;
  getCalendarProviders(userId: string): Promise<CalendarProvider[]>;
  updateCalendarProvider(id: number, updates: Partial<InsertCalendarProvider>): Promise<void>;

  // Interview Schedules
  createInterviewSchedule(schedule: InsertInterviewSchedule): Promise<InterviewSchedule>;
  getInterviewSchedule(interviewId: number): Promise<InterviewSchedule | undefined>;
  updateScheduleStatus(id: number, status: string): Promise<void>;
  getUpcomingSchedules(userId: string, limit?: number): Promise<any[]>;

  // Available Time Slots
  createTimeSlot(slot: InsertAvailableTimeSlot): Promise<AvailableTimeSlot>;
  getTimeSlots(calendarProviderId: number, jobId?: number): Promise<AvailableTimeSlot[]>;
  updateTimeSlot(id: number, updates: Partial<InsertAvailableTimeSlot>): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createJob(jobData: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(jobData).returning();
    return job;
  }

  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async updateJobStatus(id: number, status: string): Promise<void> {
    await db.update(jobs).set({ status, updatedAt: new Date() }).where(eq(jobs.id, id));
  }

  async createApplicant(applicantData: InsertApplicant): Promise<Applicant> {
    const [applicant] = await db.insert(applicants).values(applicantData).returning();
    return applicant;
  }

  async getApplicant(id: number): Promise<Applicant | undefined> {
    const [applicant] = await db.select().from(applicants).where(eq(applicants.id, id));
    return applicant;
  }

  async getApplicantByEmail(email: string): Promise<Applicant | undefined> {
    const [applicant] = await db.select().from(applicants).where(eq(applicants.email, email));
    return applicant;
  }

  async createJobApplication(applicationData: InsertJobApplication): Promise<JobApplication> {
    const [application] = await db.insert(jobApplications).values(applicationData).returning();
    return application;
  }

  async getJobApplication(id: number): Promise<JobApplication | undefined> {
    const [application] = await db.select().from(jobApplications).where(eq(jobApplications.id, id));
    return application;
  }

  async getJobApplicationsByJob(jobId: number): Promise<JobApplication[]> {
    return await db.select().from(jobApplications).where(eq(jobApplications.jobId, jobId));
  }

  async updateApplicationStatus(id: number, status: string): Promise<void> {
    await db.update(jobApplications).set({ status }).where(eq(jobApplications.id, id));
  }

  async createInterview(interviewData: InsertInterview): Promise<Interview> {
    const [interview] = await db.insert(interviews).values(interviewData).returning();
    return interview;
  }

  async getInterview(id: number): Promise<Interview | undefined> {
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
    return interview;
  }

  async getInterviewByToken(token: string): Promise<Interview | undefined> {
    const [interview] = await db.select().from(interviews).where(eq(interviews.inviteToken, token));
    return interview;
  }

  async updateInterviewStatus(id: number, status: string): Promise<void> {
    const updatedFields: any = { status };
    
    if (status === "in_progress") {
      updatedFields.startedAt = new Date();
    } else if (status === "completed") {
      updatedFields.completedAt = new Date();
    }

    await db.update(interviews).set(updatedFields).where(eq(interviews.id, id));
  }

  async updateInterviewVideo(id: number, videoPath: string): Promise<void> {
    await db.update(interviews).set({ videoPath }).where(eq(interviews.id, id));
  }

  async getRecentInterviews(limit: number = 10): Promise<any[]> {
    const result = await db
      .select({
        id: interviews.id,
        status: interviews.status,
        startedAt: interviews.startedAt,
        completedAt: interviews.completedAt,
        applicantName: applicants.name,
        applicantEmail: applicants.email,
        applicantImage: applicants.profileImage,
        jobTitle: jobs.title,
        overallScore: interviewScores.overallScore,
      })
      .from(interviews)
      .leftJoin(jobApplications, eq(interviews.applicationId, jobApplications.id))
      .leftJoin(applicants, eq(jobApplications.applicantId, applicants.id))
      .leftJoin(jobs, eq(jobApplications.jobId, jobs.id))
      .leftJoin(interviewScores, eq(interviews.id, interviewScores.interviewId))
      .orderBy(desc(interviews.createdAt))
      .limit(limit);

    return result;
  }

  async createInterviewScore(scoreData: InsertInterviewScore): Promise<InterviewScore> {
    const [score] = await db.insert(interviewScores).values(scoreData).returning();
    return score;
  }

  async getInterviewScore(interviewId: number): Promise<InterviewScore | undefined> {
    const [score] = await db.select().from(interviewScores).where(eq(interviewScores.interviewId, interviewId));
    return score;
  }

  async getInterviewStats(): Promise<{
    totalInterviews: number;
    pendingReviews: number;
    averageScore: number;
    apiCalls: number;
  }> {
    const [totalInterviewsResult] = await db
      .select({ count: count() })
      .from(interviews);

    const [pendingReviewsResult] = await db
      .select({ count: count() })
      .from(interviews)
      .where(eq(interviews.status, "completed"));

    const [averageScoreResult] = await db
      .select({ avg: avg(interviewScores.overallScore) })
      .from(interviewScores);

    return {
      totalInterviews: totalInterviewsResult.count,
      pendingReviews: pendingReviewsResult.count,
      averageScore: Number(averageScoreResult.avg) || 0,
      apiCalls: 12400, // This would be tracked separately in a real implementation
    };
  }

  async getSkillsAnalytics(): Promise<{
    technicalAvg: number;
    communicationAvg: number;
    confidenceAvg: number;
  }> {
    const [result] = await db
      .select({
        technicalAvg: avg(interviewScores.technicalScore),
        communicationAvg: avg(interviewScores.communicationScore),
        confidenceAvg: avg(interviewScores.confidenceScore),
      })
      .from(interviewScores);

    return {
      technicalAvg: Number(result.technicalAvg) || 0,
      communicationAvg: Number(result.communicationAvg) || 0,
      confidenceAvg: Number(result.confidenceAvg) || 0,
    };
  }

  async getApiIntegrations(): Promise<ApiIntegration[]> {
    return await db.select().from(apiIntegrations).where(eq(apiIntegrations.isActive, true));
  }

  // Calendar Provider methods
  async createCalendarProvider(providerData: InsertCalendarProvider): Promise<CalendarProvider> {
    const [provider] = await db.insert(calendarProviders).values(providerData).returning();
    return provider;
  }

  async getCalendarProviders(userId: string): Promise<CalendarProvider[]> {
    return await db
      .select()
      .from(calendarProviders)
      .where(and(
        eq(calendarProviders.userId, userId),
        eq(calendarProviders.isActive, true)
      ));
  }

  async updateCalendarProvider(id: number, updates: Partial<InsertCalendarProvider>): Promise<void> {
    await db
      .update(calendarProviders)
      .set(updates)
      .where(eq(calendarProviders.id, id));
  }

  // Interview Schedule methods
  async createInterviewSchedule(scheduleData: InsertInterviewSchedule): Promise<InterviewSchedule> {
    const [schedule] = await db.insert(interviewSchedules).values(scheduleData).returning();
    return schedule;
  }

  async getInterviewSchedule(interviewId: number): Promise<InterviewSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(interviewSchedules)
      .where(eq(interviewSchedules.interviewId, interviewId));
    return schedule;
  }

  async updateScheduleStatus(id: number, status: string): Promise<void> {
    await db
      .update(interviewSchedules)
      .set({ status })
      .where(eq(interviewSchedules.id, id));
  }

  async getUpcomingSchedules(userId: string, limit: number = 10): Promise<any[]> {
    // Get user's calendar providers first
    const userProviders = await this.getCalendarProviders(userId);
    const providerIds = userProviders.map(p => p.id);

    if (providerIds.length === 0) {
      return [];
    }

    // Get upcoming schedules for user's calendar providers
    return await db
      .select()
      .from(interviewSchedules)
      .where(and(
        eq(interviewSchedules.status, "confirmed"),
        // Add provider filtering logic here if needed
      ))
      .limit(limit);
  }

  // Available Time Slot methods
  async createTimeSlot(slotData: InsertAvailableTimeSlot): Promise<AvailableTimeSlot> {
    const [slot] = await db.insert(availableTimeSlots).values(slotData).returning();
    return slot;
  }

  async getTimeSlots(calendarProviderId: number, jobId?: number): Promise<AvailableTimeSlot[]> {
    const conditions = [eq(availableTimeSlots.calendarProviderId, calendarProviderId)];
    
    if (jobId) {
      conditions.push(eq(availableTimeSlots.jobId, jobId));
    }

    return await db
      .select()
      .from(availableTimeSlots)
      .where(and(...conditions));
  }

  async updateTimeSlot(id: number, updates: Partial<InsertAvailableTimeSlot>): Promise<void> {
    await db
      .update(availableTimeSlots)
      .set(updates)
      .where(eq(availableTimeSlots.id, id));
  }
}

export const storage = new DatabaseStorage();
