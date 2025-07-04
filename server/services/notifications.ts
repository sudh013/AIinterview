import { WebClient } from '@slack/web-api';

interface NotificationOptions {
  type: 'interview_completed' | 'interview_invited' | 'score_available' | 'candidate_applied';
  data: {
    candidateName: string;
    jobTitle: string;
    company?: string;
    score?: number;
    interviewId?: number;
    link?: string;
  };
  channels?: {
    slack?: string;
    teams?: string;
    email?: string[];
  };
}

interface SlackMessage {
  channel: string;
  blocks: any[];
}

interface TeamsMessage {
  type: string;
  attachments: any[];
}

class NotificationService {
  private slackClient?: WebClient;
  private teamsWebhookUrl?: string;

  constructor() {
    // Initialize Slack client if token is available
    if (process.env.SLACK_BOT_TOKEN) {
      this.slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);
    }
    
    this.teamsWebhookUrl = process.env.TEAMS_WEBHOOK_URL;
  }

  async sendNotification(options: NotificationOptions): Promise<boolean> {
    const { type, data, channels } = options;
    let success = false;

    try {
      // Send Slack notification
      if (channels?.slack && this.slackClient) {
        await this.sendSlackNotification(type, data, channels.slack);
        success = true;
      }

      // Send Teams notification
      if (channels?.teams && this.teamsWebhookUrl) {
        await this.sendTeamsNotification(type, data);
        success = true;
      }

      // Send email notifications
      if (channels?.email && channels.email.length > 0) {
        // Email notifications would be handled by the existing email service
        success = true;
      }

      return success;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  private async sendSlackNotification(
    type: NotificationOptions['type'],
    data: NotificationOptions['data'],
    channel: string
  ): Promise<void> {
    if (!this.slackClient) {
      throw new Error('Slack client not initialized');
    }

    const message = this.createSlackMessage(type, data, channel);
    await this.slackClient.chat.postMessage(message);
  }

  private async sendTeamsNotification(
    type: NotificationOptions['type'],
    data: NotificationOptions['data']
  ): Promise<void> {
    if (!this.teamsWebhookUrl) {
      throw new Error('Teams webhook URL not configured');
    }

    const message = this.createTeamsMessage(type, data);
    
    const response = await fetch(this.teamsWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Teams notification failed: ${response.statusText}`);
    }
  }

  private createSlackMessage(
    type: NotificationOptions['type'],
    data: NotificationOptions['data'],
    channel: string
  ): SlackMessage {
    const baseBlocks = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: this.getNotificationTitle(type),
        },
      },
    ];

    switch (type) {
      case 'interview_completed':
        return {
          channel,
          blocks: [
            ...baseBlocks,
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${data.candidateName}* has completed their interview for *${data.jobTitle}*`,
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Score:* ${data.score ? data.score.toFixed(1) : 'Processing...'}/10`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Position:* ${data.jobTitle}`,
                },
              ],
            },
            ...(data.link ? [{
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: 'View Interview',
                  },
                  url: data.link,
                  style: 'primary',
                },
              ],
            }] : []),
          ],
        };

      case 'interview_invited':
        return {
          channel,
          blocks: [
            ...baseBlocks,
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${data.candidateName}* has been invited for an interview for *${data.jobTitle}*`,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Company: ${data.company || 'Not specified'}`,
                },
              ],
            },
          ],
        };

      case 'candidate_applied':
        return {
          channel,
          blocks: [
            ...baseBlocks,
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${data.candidateName}* has applied for *${data.jobTitle}*`,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Application received via job platform integration`,
                },
              ],
            },
          ],
        };

      default:
        return {
          channel,
          blocks: baseBlocks,
        };
    }
  }

  private createTeamsMessage(
    type: NotificationOptions['type'],
    data: NotificationOptions['data']
  ): TeamsMessage {
    const color = this.getNotificationColor(type);
    
    const baseCard = {
      "@type": "MessageCard",
      "@context": "https://schema.org/extensions",
      summary: this.getNotificationTitle(type),
      themeColor: color,
      sections: [
        {
          activityTitle: this.getNotificationTitle(type),
          activitySubtitle: `Interview Platform Notification`,
        },
      ],
    };

    switch (type) {
      case 'interview_completed':
        return {
          ...baseCard,
          sections: [
            ...baseCard.sections,
            {
              facts: [
                {
                  name: "Candidate",
                  value: data.candidateName,
                },
                {
                  name: "Position",
                  value: data.jobTitle,
                },
                {
                  name: "Score",
                  value: data.score ? `${data.score.toFixed(1)}/10` : 'Processing...',
                },
              ],
            },
          ],
          potentialAction: data.link ? [
            {
              "@type": "OpenUri",
              name: "View Interview",
              targets: [
                {
                  os: "default",
                  uri: data.link,
                },
              ],
            },
          ] : [],
        };

      case 'interview_invited':
        return {
          ...baseCard,
          sections: [
            ...baseCard.sections,
            {
              facts: [
                {
                  name: "Candidate",
                  value: data.candidateName,
                },
                {
                  name: "Position",
                  value: data.jobTitle,
                },
                {
                  name: "Company",
                  value: data.company || 'Not specified',
                },
              ],
            },
          ],
        };

      case 'candidate_applied':
        return {
          ...baseCard,
          sections: [
            ...baseCard.sections,
            {
              facts: [
                {
                  name: "Candidate",
                  value: data.candidateName,
                },
                {
                  name: "Position",
                  value: data.jobTitle,
                },
                {
                  name: "Source",
                  value: "Job Platform Integration",
                },
              ],
            },
          ],
        };

      default:
        return baseCard;
    }
  }

  private getNotificationTitle(type: NotificationOptions['type']): string {
    switch (type) {
      case 'interview_completed':
        return '🎬 Interview Completed';
      case 'interview_invited':
        return '📧 Interview Invitation Sent';
      case 'score_available':
        return '📊 Interview Score Available';
      case 'candidate_applied':
        return '👤 New Candidate Application';
      default:
        return '🔔 Interview Platform Notification';
    }
  }

  private getNotificationColor(type: NotificationOptions['type']): string {
    switch (type) {
      case 'interview_completed':
        return '28a745'; // Green
      case 'interview_invited':
        return '007bff'; // Blue
      case 'score_available':
        return 'ffc107'; // Yellow
      case 'candidate_applied':
        return '6f42c1'; // Purple
      default:
        return '6c757d'; // Gray
    }
  }

  // Utility method to send quick notifications
  async notifyInterviewCompleted(
    candidateName: string,
    jobTitle: string,
    score: number,
    interviewId: number,
    channels: NotificationOptions['channels']
  ): Promise<boolean> {
    return this.sendNotification({
      type: 'interview_completed',
      data: {
        candidateName,
        jobTitle,
        score,
        interviewId,
        link: `${process.env.BASE_URL || 'http://localhost:5000'}/interviews?id=${interviewId}`,
      },
      channels,
    });
  }

  async notifyInterviewInvited(
    candidateName: string,
    jobTitle: string,
    company: string,
    channels: NotificationOptions['channels']
  ): Promise<boolean> {
    return this.sendNotification({
      type: 'interview_invited',
      data: {
        candidateName,
        jobTitle,
        company,
      },
      channels,
    });
  }

  async notifyCandidateApplied(
    candidateName: string,
    jobTitle: string,
    channels: NotificationOptions['channels']
  ): Promise<boolean> {
    return this.sendNotification({
      type: 'candidate_applied',
      data: {
        candidateName,
        jobTitle,
      },
      channels,
    });
  }
}

export const notificationService = new NotificationService();
export type { NotificationOptions };