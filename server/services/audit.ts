import { db } from "../db";
import { sql } from "drizzle-orm";

export enum AuditAction {
  // User Management
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  ROLE_CHANGED = 'role_changed',
  
  // Job Management
  JOB_CREATED = 'job_created',
  JOB_UPDATED = 'job_updated',
  JOB_DELETED = 'job_deleted',
  JOB_STATUS_CHANGED = 'job_status_changed',
  
  // Interview Management
  INTERVIEW_CREATED = 'interview_created',
  INTERVIEW_STARTED = 'interview_started',
  INTERVIEW_COMPLETED = 'interview_completed',
  INTERVIEW_SCORED = 'interview_scored',
  SCORE_OVERRIDDEN = 'score_overridden',
  VIDEO_UPLOADED = 'video_uploaded',
  VIDEO_DELETED = 'video_deleted',
  
  // API and Integration
  API_KEY_CREATED = 'api_key_created',
  API_KEY_REVOKED = 'api_key_revoked',
  INTEGRATION_ADDED = 'integration_added',
  INTEGRATION_REMOVED = 'integration_removed',
  WEBHOOK_RECEIVED = 'webhook_received',
  
  // Data Access
  CANDIDATE_DATA_ACCESSED = 'candidate_data_accessed',
  REPORT_EXPORTED = 'report_exported',
  ANALYTICS_ACCESSED = 'analytics_accessed',
  BIAS_ANALYSIS_VIEWED = 'bias_analysis_viewed',
  
  // Security Events
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  PERMISSION_DENIED = 'permission_denied',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PASSWORD_CHANGED = 'password_changed',
  
  // System Events
  SYSTEM_BACKUP = 'system_backup',
  DATA_MIGRATION = 'data_migration',
  CONFIGURATION_CHANGED = 'configuration_changed'
}

export interface AuditLogEntry {
  id?: number;
  userId: string;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class AuditLogger {
  
  async log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      // In a production system, this would insert into an audit_logs table
      // For now, we'll log to console and store in memory for demonstration
      
      const fullEntry: AuditLogEntry = {
        ...entry,
        timestamp: new Date()
      };
      
      // Log to console for development
      console.log(`[AUDIT] ${fullEntry.action}: ${fullEntry.userEmail} (${fullEntry.userRole}) - ${fullEntry.resourceType}${fullEntry.resourceId ? ` (${fullEntry.resourceId})` : ''}`);
      
      // In production, this would be:
      // await db.insert(auditLogs).values(fullEntry);
      
      // Store in memory for demonstration (in production use persistent storage)
      this.storeAuditEntry(fullEntry);
      
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Audit logging should never fail the main operation
    }
  }

  private auditStorage: AuditLogEntry[] = [];
  
  private storeAuditEntry(entry: AuditLogEntry): void {
    // Assign a mock ID
    entry.id = this.auditStorage.length + 1;
    
    // Store in memory (limit to last 1000 entries for demo)
    this.auditStorage.push(entry);
    if (this.auditStorage.length > 1000) {
      this.auditStorage.shift();
    }
  }

  async getAuditLogs(filters: {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
    severity?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ logs: AuditLogEntry[], total: number }> {
    try {
      let filteredLogs = [...this.auditStorage];
      
      // Apply filters
      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
      }
      
      if (filters.action) {
        filteredLogs = filteredLogs.filter(log => log.action === filters.action);
      }
      
      if (filters.resourceType) {
        filteredLogs = filteredLogs.filter(log => log.resourceType === filters.resourceType);
      }
      
      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
      }
      
      if (filters.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
      }
      
      if (filters.severity) {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
      }
      
      // Sort by timestamp (newest first)
      filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      const total = filteredLogs.length;
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      
      const paginatedLogs = filteredLogs.slice(offset, offset + limit);
      
      return { logs: paginatedLogs, total };
      
    } catch (error) {
      console.error('Failed to retrieve audit logs:', error);
      return { logs: [], total: 0 };
    }
  }

  async getAuditSummary(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<{
    totalEvents: number;
    criticalEvents: number;
    topActions: { action: string; count: number }[];
    topUsers: { userEmail: string; count: number }[];
    securityEvents: number;
  }> {
    try {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      const relevantLogs = this.auditStorage.filter(log => log.timestamp >= startDate);
      
      // Calculate summary statistics
      const totalEvents = relevantLogs.length;
      const criticalEvents = relevantLogs.filter(log => log.severity === 'critical').length;
      
      // Top actions
      const actionCounts: Record<string, number> = {};
      relevantLogs.forEach(log => {
        actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      });
      
      const topActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Top users
      const userCounts: Record<string, number> = {};
      relevantLogs.forEach(log => {
        userCounts[log.userEmail] = (userCounts[log.userEmail] || 0) + 1;
      });
      
      const topUsers = Object.entries(userCounts)
        .map(([userEmail, count]) => ({ userEmail, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Security events
      const securityActions = [
        AuditAction.UNAUTHORIZED_ACCESS,
        AuditAction.PERMISSION_DENIED,
        AuditAction.SUSPICIOUS_ACTIVITY,
        AuditAction.PASSWORD_CHANGED
      ];
      
      const securityEvents = relevantLogs.filter(log => 
        securityActions.includes(log.action)
      ).length;
      
      return {
        totalEvents,
        criticalEvents,
        topActions,
        topUsers,
        securityEvents
      };
      
    } catch (error) {
      console.error('Failed to generate audit summary:', error);
      return {
        totalEvents: 0,
        criticalEvents: 0,
        topActions: [],
        topUsers: [],
        securityEvents: 0
      };
    }
  }

  // Convenience methods for common audit scenarios
  async logUserAction(
    userId: string,
    userEmail: string,
    userRole: string,
    action: AuditAction,
    details: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.log({
      userId,
      userEmail,
      userRole,
      action,
      resourceType: 'user',
      details,
      ipAddress,
      userAgent,
      severity: 'low'
    });
  }

  async logInterviewAction(
    userId: string,
    userEmail: string,
    userRole: string,
    action: AuditAction,
    interviewId: string,
    details: Record<string, any>
  ): Promise<void> {
    const severity = action === AuditAction.SCORE_OVERRIDDEN ? 'medium' : 'low';
    
    await this.log({
      userId,
      userEmail,
      userRole,
      action,
      resourceType: 'interview',
      resourceId: interviewId,
      details,
      severity
    });
  }

  async logSecurityEvent(
    userId: string,
    userEmail: string,
    userRole: string,
    action: AuditAction,
    details: Record<string, any>,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      userId,
      userEmail,
      userRole,
      action,
      resourceType: 'security',
      details,
      ipAddress,
      severity: 'high'
    });
  }

  async logDataAccess(
    userId: string,
    userEmail: string,
    userRole: string,
    resourceType: string,
    resourceId: string,
    accessType: 'view' | 'export' | 'modify',
    details: Record<string, any>
  ): Promise<void> {
    const actionMap = {
      'view': AuditAction.CANDIDATE_DATA_ACCESSED,
      'export': AuditAction.REPORT_EXPORTED,
      'modify': AuditAction.JOB_UPDATED
    };

    await this.log({
      userId,
      userEmail,
      userRole,
      action: actionMap[accessType] || AuditAction.CANDIDATE_DATA_ACCESSED,
      resourceType,
      resourceId,
      details,
      severity: accessType === 'export' ? 'medium' : 'low'
    });
  }
}

export const auditLogger = new AuditLogger();
export type { AuditLogEntry };