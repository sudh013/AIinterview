import { db } from "../db";
import { interviews, interviewScores, jobs, applicants, jobApplications } from "@shared/schema";
import { eq, sql, desc, and, gte, lte } from "drizzle-orm";

interface AnalyticsFilters {
  startDate?: Date;
  endDate?: Date;
  jobId?: number;
  department?: string;
  expertiseLevel?: string;
}

interface InterviewCompletionStats {
  totalInvited: number;
  totalCompleted: number;
  completionRate: number;
  averageCompletionTime: number; // in minutes
  dropoffStages: {
    invited: number;
    started: number;
    completed: number;
  };
}

interface CandidateComparison {
  candidateId: number;
  name: string;
  email: string;
  jobTitle: string;
  interviewDate: Date;
  scores: {
    technical: number;
    communication: number;
    confidence: number;
    overall: number;
  };
  metrics: {
    speechPace: number;
    pauseFrequency: number;
    eyeContact: number;
    enthusiasm: number;
    timeManagement: number;
  };
  ranking: number;
}

interface PerformanceTrends {
  timeRange: string;
  averageScores: {
    technical: number;
    communication: number;
    confidence: number;
    overall: number;
  };
  interviewCount: number;
  topSkills: string[];
  improvementAreas: string[];
}

interface BiasAnalysis {
  scoringConsistency: number; // 0-1 score
  demographicDistribution: {
    genderBalance: number;
    experienceDistribution: Record<string, number>;
  };
  questionFairness: {
    questionId: string;
    question: string;
    averageScore: number;
    scoreVariation: number;
    potentialBias: boolean;
  }[];
  recommendations: string[];
}

class AnalyticsService {
  
  // Enhanced interview completion analytics
  async getInterviewCompletionStats(filters: AnalyticsFilters = {}): Promise<InterviewCompletionStats> {
    try {
      const whereConditions = this.buildWhereConditions(filters);
      
      const totalInvitedQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(interviews)
        .where(whereConditions);

      const completedQuery = db
        .select({ 
          count: sql<number>`count(*)`,
          avgTime: sql<number>`avg(extract(epoch from (completed_at - started_at))/60)`
        })
        .from(interviews)
        .where(and(whereConditions, eq(interviews.status, 'completed')));

      const startedQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(interviews)
        .where(and(whereConditions, sql`started_at IS NOT NULL`));

      const [totalInvited, completed, started] = await Promise.all([
        totalInvitedQuery,
        completedQuery,
        startedQuery
      ]);

      const totalInvitedCount = totalInvited[0]?.count || 0;
      const completedCount = completed[0]?.count || 0;
      const startedCount = started[0]?.count || 0;
      const averageTime = completed[0]?.avgTime || 0;

      return {
        totalInvited: totalInvitedCount,
        totalCompleted: completedCount,
        completionRate: totalInvitedCount > 0 ? (completedCount / totalInvitedCount) * 100 : 0,
        averageCompletionTime: averageTime,
        dropoffStages: {
          invited: totalInvitedCount,
          started: startedCount,
          completed: completedCount
        }
      };
    } catch (error) {
      console.error('Error getting interview completion stats:', error);
      throw error;
    }
  }

  // Advanced candidate comparison with detailed metrics
  async getCandidateComparison(jobId?: number, limit: number = 20): Promise<CandidateComparison[]> {
    try {
      const query = db
        .select({
          candidateId: applicants.id,
          name: applicants.name,
          email: applicants.email,
          jobTitle: jobs.title,
          interviewDate: interviews.completedAt,
          technicalScore: interviewScores.technicalScore,
          communicationScore: interviewScores.communicationScore,
          confidenceScore: interviewScores.confidenceScore,
          overallScore: interviewScores.overallScore,
          analysisDetails: interviewScores.analysisDetails
        })
        .from(interviews)
        .innerJoin(interviewScores, eq(interviews.id, interviewScores.interviewId))
        .innerJoin(jobApplications, eq(interviews.jobApplicationId, jobApplications.id))
        .innerJoin(applicants, eq(jobApplications.applicantId, applicants.id))
        .innerJoin(jobs, eq(jobApplications.jobId, jobs.id))
        .where(jobId ? eq(jobs.id, jobId) : sql`true`)
        .orderBy(desc(interviewScores.overallScore))
        .limit(limit);

      const results = await query;

      return results.map((result, index) => {
        const details = result.analysisDetails as any || {};
        
        return {
          candidateId: result.candidateId,
          name: result.name,
          email: result.email,
          jobTitle: result.jobTitle,
          interviewDate: result.interviewDate || new Date(),
          scores: {
            technical: result.technicalScore || 0,
            communication: result.communicationScore || 0,
            confidence: result.confidenceScore || 0,
            overall: result.overallScore || 0
          },
          metrics: {
            speechPace: details.speechPace || 150,
            pauseFrequency: details.pauseFrequency || 5,
            eyeContact: details.eyeContact || 7,
            enthusiasm: details.enthusiasm || 6,
            timeManagement: details.timeManagement || 120
          },
          ranking: index + 1
        };
      });
    } catch (error) {
      console.error('Error getting candidate comparison:', error);
      throw error;
    }
  }

  // Performance trends over time
  async getPerformanceTrends(filters: AnalyticsFilters = {}): Promise<PerformanceTrends[]> {
    try {
      const whereConditions = this.buildWhereConditions(filters);
      
      // Get trends for the last 6 months, grouped by month
      const trends = await db
        .select({
          month: sql<string>`to_char(${interviews.completedAt}, 'YYYY-MM')`,
          avgTechnical: sql<number>`avg(${interviewScores.technicalScore})`,
          avgCommunication: sql<number>`avg(${interviewScores.communicationScore})`,
          avgConfidence: sql<number>`avg(${interviewScores.confidenceScore})`,
          avgOverall: sql<number>`avg(${interviewScores.overallScore})`,
          interviewCount: sql<number>`count(*)`
        })
        .from(interviews)
        .innerJoin(interviewScores, eq(interviews.id, interviewScores.interviewId))
        .where(and(
          whereConditions,
          eq(interviews.status, 'completed'),
          gte(interviews.completedAt, sql`now() - interval '6 months'`)
        ))
        .groupBy(sql`to_char(${interviews.completedAt}, 'YYYY-MM')`)
        .orderBy(sql`to_char(${interviews.completedAt}, 'YYYY-MM')`);

      return trends.map(trend => ({
        timeRange: trend.month,
        averageScores: {
          technical: Number((trend.avgTechnical || 0).toFixed(1)),
          communication: Number((trend.avgCommunication || 0).toFixed(1)),
          confidence: Number((trend.avgConfidence || 0).toFixed(1)),
          overall: Number((trend.avgOverall || 0).toFixed(1))
        },
        interviewCount: trend.interviewCount,
        topSkills: this.extractTopSkills(trend.month),
        improvementAreas: this.extractImprovementAreas(trend.month)
      }));
    } catch (error) {
      console.error('Error getting performance trends:', error);
      throw error;
    }
  }

  // AI bias detection and analysis
  async analyzeBias(filters: AnalyticsFilters = {}): Promise<BiasAnalysis> {
    try {
      const whereConditions = this.buildWhereConditions(filters);
      
      // Calculate scoring consistency (standard deviation of scores)
      const consistencyQuery = await db
        .select({
          stddevTechnical: sql<number>`stddev(${interviewScores.technicalScore})`,
          stddevCommunication: sql<number>`stddev(${interviewScores.communicationScore})`,
          stddevConfidence: sql<number>`stddev(${interviewScores.confidenceScore})`,
          avgOverall: sql<number>`avg(${interviewScores.overallScore})`
        })
        .from(interviews)
        .innerJoin(interviewScores, eq(interviews.id, interviewScores.interviewId))
        .where(whereConditions);

      const consistency = consistencyQuery[0];
      const averageStddev = (
        (consistency.stddevTechnical || 0) +
        (consistency.stddevCommunication || 0) +
        (consistency.stddevConfidence || 0)
      ) / 3;

      // Scoring consistency: lower standard deviation = higher consistency (inverted scale)
      const scoringConsistency = Math.max(0, 1 - (averageStddev / 10));

      // Mock demographic analysis (in production, this would use actual demographic data)
      const demographicDistribution = {
        genderBalance: 0.45, // 45% female, 55% male representation
        experienceDistribution: {
          'junior': 0.35,
          'mid': 0.45,
          'senior': 0.20
        }
      };

      // Question fairness analysis
      const questionFairness = this.analyzeQuestionFairness();

      const recommendations = this.generateBiasRecommendations(
        scoringConsistency,
        demographicDistribution,
        questionFairness
      );

      return {
        scoringConsistency,
        demographicDistribution,
        questionFairness,
        recommendations
      };
    } catch (error) {
      console.error('Error analyzing bias:', error);
      throw error;
    }
  }

  // Time-based analytics for interview performance
  async getTimeBasedAnalytics(filters: AnalyticsFilters = {}) {
    try {
      const whereConditions = this.buildWhereConditions(filters);
      
      // Average time spent per question type
      const timeAnalytics = await db
        .select({
          avgTimePerQuestion: sql<number>`avg(
            CASE 
              WHEN ${interviewScores.analysisDetails}->>'timeManagement' IS NOT NULL 
              THEN (${interviewScores.analysisDetails}->>'timeManagement')::numeric 
              ELSE 120 
            END
          )`,
          totalInterviews: sql<number>`count(*)`
        })
        .from(interviews)
        .innerJoin(interviewScores, eq(interviews.id, interviewScores.interviewId))
        .where(whereConditions);

      return timeAnalytics[0] || { avgTimePerQuestion: 120, totalInterviews: 0 };
    } catch (error) {
      console.error('Error getting time-based analytics:', error);
      throw error;
    }
  }

  // Helper methods
  private buildWhereConditions(filters: AnalyticsFilters) {
    const conditions = [];
    
    if (filters.startDate) {
      conditions.push(gte(interviews.createdAt, filters.startDate));
    }
    
    if (filters.endDate) {
      conditions.push(lte(interviews.createdAt, filters.endDate));
    }

    return conditions.length > 0 ? and(...conditions) : sql`true`;
  }

  private extractTopSkills(month: string): string[] {
    // In production, this would analyze the actual feedback content
    return [
      "Technical Problem Solving",
      "Clear Communication",
      "System Design Knowledge",
      "Professional Demeanor"
    ];
  }

  private extractImprovementAreas(month: string): string[] {
    // In production, this would analyze common improvement themes
    return [
      "More specific examples needed",
      "Deeper technical explanations",
      "Better time management",
      "Increased confidence"
    ];
  }

  private analyzeQuestionFairness() {
    // Mock question fairness analysis
    return [
      {
        questionId: "tech_1",
        question: "Explain your approach to system design",
        averageScore: 7.2,
        scoreVariation: 1.8,
        potentialBias: false
      },
      {
        questionId: "behav_1", 
        question: "Describe a challenging team situation",
        averageScore: 6.8,
        scoreVariation: 2.3,
        potentialBias: true
      }
    ];
  }

  private generateBiasRecommendations(
    consistency: number,
    demographics: any,
    questions: any[]
  ): string[] {
    const recommendations = [];

    if (consistency < 0.7) {
      recommendations.push("Consider standardizing scoring rubrics to improve consistency");
    }

    if (demographics.genderBalance < 0.4 || demographics.genderBalance > 0.6) {
      recommendations.push("Review recruitment channels to improve gender balance");
    }

    const biasedQuestions = questions.filter(q => q.potentialBias);
    if (biasedQuestions.length > 0) {
      recommendations.push("Review and rephrase questions with high score variation");
    }

    if (recommendations.length === 0) {
      recommendations.push("Bias analysis shows good consistency and fairness");
    }

    return recommendations;
  }
}

export const analyticsService = new AnalyticsService();
export type { 
  AnalyticsFilters, 
  InterviewCompletionStats, 
  CandidateComparison, 
  PerformanceTrends, 
  BiasAnalysis 
};