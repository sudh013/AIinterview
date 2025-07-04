import { 
  calendarProviders, 
  interviewSchedules, 
  availableTimeSlots,
  type CalendarProvider,
  type InsertCalendarProvider,
  type InterviewSchedule,
  type InsertInterviewSchedule,
  type AvailableTimeSlot,
  type InsertAvailableTimeSlot
} from "@shared/schema";
import { db } from "../db";
import { eq, and, gte, lte } from "drizzle-orm";

// Calendar provider types
export type CalendarProviderType = "google" | "outlook" | "calendly";

// Time slot interface
interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

// Meeting details interface
interface MeetingDetails {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  meetingUrl?: string;
}

// Calendar integration service
export class CalendarService {
  
  // Connect a calendar provider for a user
  async connectCalendarProvider(
    userId: string,
    provider: CalendarProviderType,
    accessToken: string,
    refreshToken?: string,
    providerAccountId?: string,
    calendarId?: string
  ): Promise<CalendarProvider> {
    const [calendarProvider] = await db
      .insert(calendarProviders)
      .values({
        userId,
        provider,
        providerAccountId: providerAccountId || `${provider}_${userId}_${Date.now()}`,
        accessToken,
        refreshToken,
        calendarId,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour default
      })
      .returning();

    return calendarProvider;
  }

  // Get calendar providers for a user
  async getCalendarProviders(userId: string): Promise<CalendarProvider[]> {
    return await db
      .select()
      .from(calendarProviders)
      .where(and(
        eq(calendarProviders.userId, userId),
        eq(calendarProviders.isActive, true)
      ));
  }

  // Create an available time slot
  async createAvailableTimeSlot(
    calendarProviderId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    timezone: string = "UTC",
    jobId?: number
  ): Promise<AvailableTimeSlot> {
    const [timeSlot] = await db
      .insert(availableTimeSlots)
      .values({
        calendarProviderId,
        jobId,
        dayOfWeek,
        startTime,
        endTime,
        timezone,
      })
      .returning();

    return timeSlot;
  }

  // Get available time slots for a calendar provider
  async getAvailableTimeSlots(
    calendarProviderId: number,
    jobId?: number
  ): Promise<AvailableTimeSlot[]> {
    const conditions = [eq(availableTimeSlots.calendarProviderId, calendarProviderId)];
    
    if (jobId) {
      conditions.push(eq(availableTimeSlots.jobId, jobId));
    }

    return await db
      .select()
      .from(availableTimeSlots)
      .where(and(...conditions));
  }

  // Schedule an interview
  async scheduleInterview(
    interviewId: number,
    calendarProviderId: number,
    scheduledAt: Date,
    duration: number = 30,
    timezone: string = "UTC"
  ): Promise<InterviewSchedule> {
    // Create meeting URL (mock implementation - would integrate with actual calendar APIs)
    const meetingUrl = this.generateMockMeetingUrl();
    const meetingId = `meeting_${Date.now()}`;

    const [schedule] = await db
      .insert(interviewSchedules)
      .values({
        interviewId,
        calendarProviderId,
        scheduledAt,
        duration,
        timezone,
        meetingUrl,
        meetingId,
        status: "scheduled",
      })
      .returning();

    return schedule;
  }

  // Get interview schedule
  async getInterviewSchedule(interviewId: number): Promise<InterviewSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(interviewSchedules)
      .where(eq(interviewSchedules.interviewId, interviewId));

    return schedule;
  }

  // Update interview schedule status
  async updateScheduleStatus(
    scheduleId: number,
    status: "scheduled" | "confirmed" | "cancelled" | "completed"
  ): Promise<void> {
    const updateData: any = { status };
    
    if (status === "confirmed") {
      updateData.confirmedAt = new Date();
    } else if (status === "cancelled") {
      updateData.cancelledAt = new Date();
    }

    await db
      .update(interviewSchedules)
      .set(updateData)
      .where(eq(interviewSchedules.id, scheduleId));
  }

  // Generate available time slots for a date range
  async generateAvailableSlots(
    calendarProviderId: number,
    startDate: Date,
    endDate: Date,
    duration: number = 30,
    jobId?: number
  ): Promise<TimeSlot[]> {
    const timeSlots = await this.getAvailableTimeSlots(calendarProviderId, jobId);
    const existingSchedules = await this.getExistingSchedules(calendarProviderId, startDate, endDate);
    
    const availableSlots: TimeSlot[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const daySlots = timeSlots.filter(slot => slot.dayOfWeek === dayOfWeek);

      for (const slot of daySlots) {
        const slotStart = this.combineDateAndTime(currentDate, slot.startTime);
        const slotEnd = this.combineDateAndTime(currentDate, slot.endTime);

        // Generate slots within the available time
        const currentSlot = new Date(slotStart);
        while (currentSlot < slotEnd) {
          const slotEndTime = new Date(currentSlot.getTime() + duration * 60000);
          
          if (slotEndTime <= slotEnd) {
            const isAvailable = !this.isSlotConflicting(
              currentSlot,
              slotEndTime,
              existingSchedules
            );

            availableSlots.push({
              start: new Date(currentSlot),
              end: new Date(slotEndTime),
              available: isAvailable,
            });
          }

          currentSlot.setMinutes(currentSlot.getMinutes() + duration);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableSlots.filter(slot => slot.available);
  }

  // Get existing schedules for conflict checking
  private async getExistingSchedules(
    calendarProviderId: number,
    startDate: Date,
    endDate: Date
  ): Promise<InterviewSchedule[]> {
    return await db
      .select()
      .from(interviewSchedules)
      .where(and(
        eq(interviewSchedules.calendarProviderId, calendarProviderId),
        gte(interviewSchedules.scheduledAt, startDate),
        lte(interviewSchedules.scheduledAt, endDate),
        eq(interviewSchedules.status, "scheduled")
      ));
  }

  // Check if a time slot conflicts with existing schedules
  private isSlotConflicting(
    slotStart: Date,
    slotEnd: Date,
    existingSchedules: InterviewSchedule[]
  ): boolean {
    return existingSchedules.some(schedule => {
      const scheduleStart = new Date(schedule.scheduledAt);
      const scheduleEnd = new Date(scheduleStart.getTime() + schedule.duration * 60000);

      return (
        (slotStart >= scheduleStart && slotStart < scheduleEnd) ||
        (slotEnd > scheduleStart && slotEnd <= scheduleEnd) ||
        (slotStart <= scheduleStart && slotEnd >= scheduleEnd)
      );
    });
  }

  // Combine date and time string
  private combineDateAndTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }

  // Generate mock meeting URL (would be replaced with actual calendar API integration)
  private generateMockMeetingUrl(): string {
    const meetingId = Math.random().toString(36).substring(2, 15);
    return `https://meet.google.com/${meetingId}`;
  }

  // Sync with external calendar (mock implementation)
  async syncWithExternalCalendar(calendarProviderId: number): Promise<void> {
    // This would integrate with Google Calendar, Outlook, etc.
    // For now, we'll just update the last sync time
    await db
      .update(calendarProviders)
      .set({ updatedAt: new Date() })
      .where(eq(calendarProviders.id, calendarProviderId));
  }

  // Cancel an interview schedule
  async cancelSchedule(scheduleId: number, reason?: string): Promise<void> {
    await this.updateScheduleStatus(scheduleId, "cancelled");
    
    // Here you would also:
    // 1. Send cancellation emails to participants
    // 2. Cancel the calendar event
    // 3. Log the cancellation for audit purposes
  }

  // Confirm an interview schedule
  async confirmSchedule(scheduleId: number): Promise<void> {
    await this.updateScheduleStatus(scheduleId, "confirmed");
    
    // Here you would also:
    // 1. Send confirmation emails
    // 2. Update calendar event
    // 3. Set up reminders
  }

  // Send schedule reminders (mock implementation)
  async sendScheduleReminders(): Promise<void> {
    const upcomingSchedules = await db
      .select()
      .from(interviewSchedules)
      .where(and(
        eq(interviewSchedules.status, "confirmed"),
        eq(interviewSchedules.reminderSent, false),
        gte(interviewSchedules.scheduledAt, new Date()),
        lte(interviewSchedules.scheduledAt, new Date(Date.now() + 24 * 60 * 60 * 1000)) // Next 24 hours
      ));

    for (const schedule of upcomingSchedules) {
      // Send reminder email (would integrate with email service)
      console.log(`Sending reminder for interview ${schedule.interviewId} at ${schedule.scheduledAt}`);
      
      // Mark reminder as sent
      await db
        .update(interviewSchedules)
        .set({ reminderSent: true })
        .where(eq(interviewSchedules.id, schedule.id));
    }
  }

  // Get upcoming schedules for a user
  async getUpcomingSchedules(userId: string, limit: number = 10): Promise<any[]> {
    // This would join with interviews and applications to get full details
    const userProviders = await this.getCalendarProviders(userId);
    const providerIds = userProviders.map(p => p.id);

    if (providerIds.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(interviewSchedules)
      .where(and(
        gte(interviewSchedules.scheduledAt, new Date()),
        eq(interviewSchedules.status, "confirmed")
      ))
      .limit(limit);
  }
}

export const calendarService = new CalendarService();