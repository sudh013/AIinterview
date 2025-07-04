import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Jobs table
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  company: text("company").notNull(),
  requirements: text("requirements").notNull(),
  expertiseLevel: text("expertise_level").notNull(), // "junior", "mid", "senior"
  status: text("status").default("active"), // "active", "paused", "closed"
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Applicants table
export const applicants = pgTable("applicants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  resume: text("resume"), // file path or URL
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Job applications table (many-to-many between jobs and applicants)
export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  applicantId: integer("applicant_id").references(() => applicants.id).notNull(),
  status: text("status").default("applied"), // "applied", "invited", "interviewed", "scored", "rejected", "hired"
  appliedAt: timestamp("applied_at").defaultNow(),
});

// Interviews table
export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => jobApplications.id).notNull(),
  questions: jsonb("questions").notNull(), // Array of generated questions
  inviteToken: text("invite_token").notNull().unique(),
  inviteSentAt: timestamp("invite_sent_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  videoPath: text("video_path"), // Local file path to recorded video
  status: text("status").default("pending"), // "pending", "in_progress", "completed", "expired"
  createdAt: timestamp("created_at").defaultNow(),
});

// Interview scores table
export const interviewScores = pgTable("interview_scores", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").references(() => interviews.id).notNull(),
  technicalScore: real("technical_score").notNull(),
  communicationScore: real("communication_score").notNull(),
  confidenceScore: real("confidence_score").notNull(),
  overallScore: real("overall_score").notNull(),
  feedback: text("feedback"), // AI-generated feedback
  analysisDetails: jsonb("analysis_details"), // Detailed AI analysis
  createdAt: timestamp("created_at").defaultNow(),
});

// API integrations table for external systems
export const apiIntegrations = pgTable("api_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull(),
  webhookUrl: text("webhook_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calendar Providers table for calendar integrations
export const calendarProviders = pgTable("calendar_providers", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // HR user who connected the calendar
  provider: text("provider").notNull(), // "google", "outlook", "calendly"
  providerAccountId: text("provider_account_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  calendarId: text("calendar_id"), // Default calendar to use
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Interview Schedules table for calendar integration
export const interviewSchedules = pgTable("interview_schedules", {
  id: serial("id").primaryKey(),
  interviewId: integer("interview_id").references(() => interviews.id).notNull(),
  calendarProviderId: integer("calendar_provider_id").references(() => calendarProviders.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull().default(30), // in minutes
  timezone: text("timezone").notNull().default("UTC"),
  meetingUrl: text("meeting_url"), // Google Meet, Teams, Zoom link
  meetingId: text("meeting_id"), // External calendar event ID
  status: text("status").default("scheduled"), // "scheduled", "confirmed", "cancelled", "completed"
  confirmedAt: timestamp("confirmed_at"),
  cancelledAt: timestamp("cancelled_at"),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Available Time Slots table for scheduling
export const availableTimeSlots = pgTable("available_time_slots", {
  id: serial("id").primaryKey(),
  calendarProviderId: integer("calendar_provider_id").references(() => calendarProviders.id).notNull(),
  jobId: integer("job_id").references(() => jobs.id), // Optional: job-specific availability
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(), // "09:00"
  endTime: text("end_time").notNull(), // "17:00"
  timezone: text("timezone").notNull().default("UTC"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const jobsRelations = relations(jobs, ({ many }) => ({
  applications: many(jobApplications),
}));

export const applicantsRelations = relations(applicants, ({ many }) => ({
  applications: many(jobApplications),
}));

export const jobApplicationsRelations = relations(jobApplications, ({ one, many }) => ({
  job: one(jobs, {
    fields: [jobApplications.jobId],
    references: [jobs.id],
  }),
  applicant: one(applicants, {
    fields: [jobApplications.applicantId],
    references: [applicants.id],
  }),
  interviews: many(interviews),
}));

export const interviewsRelations = relations(interviews, ({ one, many }) => ({
  application: one(jobApplications, {
    fields: [interviews.applicationId],
    references: [jobApplications.id],
  }),
  scores: many(interviewScores),
  schedule: one(interviewSchedules, {
    fields: [interviews.id],
    references: [interviewSchedules.interviewId],
  }),
}));

export const interviewScoresRelations = relations(interviewScores, ({ one }) => ({
  interview: one(interviews, {
    fields: [interviewScores.interviewId],
    references: [interviews.id],
  }),
}));

export const calendarProvidersRelations = relations(calendarProviders, ({ many }) => ({
  schedules: many(interviewSchedules),
  timeSlots: many(availableTimeSlots),
}));

export const interviewSchedulesRelations = relations(interviewSchedules, ({ one }) => ({
  interview: one(interviews, {
    fields: [interviewSchedules.interviewId],
    references: [interviews.id],
  }),
  calendarProvider: one(calendarProviders, {
    fields: [interviewSchedules.calendarProviderId],
    references: [calendarProviders.id],
  }),
}));

export const availableTimeSlotsRelations = relations(availableTimeSlots, ({ one }) => ({
  calendarProvider: one(calendarProviders, {
    fields: [availableTimeSlots.calendarProviderId],
    references: [calendarProviders.id],
  }),
  job: one(jobs, {
    fields: [availableTimeSlots.jobId],
    references: [jobs.id],
  }),
}));

// Insert schemas
export const insertJobSchema = createInsertSchema(jobs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertApplicantSchema = createInsertSchema(applicants).omit({ id: true, createdAt: true });
export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({ id: true, appliedAt: true });
export const insertInterviewSchema = createInsertSchema(interviews).omit({ id: true, createdAt: true });
export const insertInterviewScoreSchema = createInsertSchema(interviewScores).omit({ id: true, createdAt: true });
export const insertCalendarProviderSchema = createInsertSchema(calendarProviders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertInterviewScheduleSchema = createInsertSchema(interviewSchedules).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAvailableTimeSlotSchema = createInsertSchema(availableTimeSlots).omit({ id: true, createdAt: true });

// Types
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Applicant = typeof applicants.$inferSelect;
export type InsertApplicant = z.infer<typeof insertApplicantSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = z.infer<typeof insertInterviewSchema>;
export type InterviewScore = typeof interviewScores.$inferSelect;
export type InsertInterviewScore = z.infer<typeof insertInterviewScoreSchema>;
export type ApiIntegration = typeof apiIntegrations.$inferSelect;
export type CalendarProvider = typeof calendarProviders.$inferSelect;
export type InsertCalendarProvider = z.infer<typeof insertCalendarProviderSchema>;
export type InterviewSchedule = typeof interviewSchedules.$inferSelect;
export type InsertInterviewSchedule = z.infer<typeof insertInterviewScheduleSchema>;
export type AvailableTimeSlot = typeof availableTimeSlots.$inferSelect;
export type InsertAvailableTimeSlot = z.infer<typeof insertAvailableTimeSlotSchema>;
