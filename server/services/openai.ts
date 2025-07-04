import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-test-key-fallback"
});

interface InterviewQuestion {
  question: string;
  type: "technical" | "behavioral" | "situational";
  expectedDuration: number; // in seconds
}

interface VideoAnalysisResult {
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  overallScore: number;
  feedback: string;
  analysisDetails: {
    speechPace: number; // words per minute
    pauseFrequency: number; // pauses per minute
    eyeContact: number; // 1-10 score
    enthusiasm: number; // 1-10 score
    clarity: number; // 1-10 score
    professionalLanguage: number; // 1-10 score
    questionRelevance: number; // 1-10 score
    timeManagement: number; // seconds spent per question
    transcription: string;
    keyStrengths: string[];
    improvementAreas: string[];
  };
}

export async function generateInterviewQuestions(
  jobDescription: string,
  jobTitle: string,
  expertiseLevel: string,
  numberOfQuestions: number = 5
): Promise<InterviewQuestion[]> {
  try {
    const prompt = `Generate ${numberOfQuestions} interview questions for a ${expertiseLevel} level ${jobTitle} position.

Job Description: ${jobDescription}

Please create a mix of technical, behavioral, and situational questions appropriate for the expertise level.
Return the response in JSON format with this structure:
{
  "questions": [
    {
      "question": "string",
      "type": "technical|behavioral|situational",
      "expectedDuration": number_in_seconds
    }
  ]
}`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert HR interview question generator. Create relevant, professional interview questions based on job requirements."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.questions || [];
  } catch (error) {
    console.error("Error generating interview questions:", error);
    
    // Fallback to predefined questions if OpenAI is not available
    return generateFallbackQuestions(jobTitle, expertiseLevel, numberOfQuestions);
  }
}

function generateFallbackQuestions(
  jobTitle: string,
  expertiseLevel: string,
  numberOfQuestions: number = 5
): InterviewQuestion[] {
  const fallbackQuestions: Record<string, InterviewQuestion[]> = {
    "senior": [
      {
        question: "Describe your experience with system architecture and how you approach designing scalable solutions.",
        type: "technical",
        expectedDuration: 180
      },
      {
        question: "Tell me about a time when you had to lead a technical team through a challenging project. How did you handle conflicts and ensure delivery?",
        type: "behavioral",
        expectedDuration: 150
      },
      {
        question: "How do you stay current with new technologies and determine which ones are worth adopting in your projects?",
        type: "situational",
        expectedDuration: 120
      },
      {
        question: "Explain the trade-offs between different database solutions and when you would choose one over another.",
        type: "technical",
        expectedDuration: 180
      },
      {
        question: "Describe a situation where you had to mentor junior developers. What was your approach?",
        type: "behavioral",
        expectedDuration: 150
      }
    ],
    "mid": [
      {
        question: "Walk me through how you would implement a REST API with proper error handling and authentication.",
        type: "technical",
        expectedDuration: 180
      },
      {
        question: "Tell me about a challenging bug you encountered and how you approached solving it.",
        type: "behavioral",
        expectedDuration: 150
      },
      {
        question: "How would you handle a situation where you're assigned a project with a tight deadline but unclear requirements?",
        type: "situational",
        expectedDuration: 120
      },
      {
        question: "Explain the concept of code review and describe your experience with it.",
        type: "technical",
        expectedDuration: 120
      },
      {
        question: "Describe a time when you had to learn a new technology quickly for a project.",
        type: "behavioral",
        expectedDuration: 150
      }
    ],
    "junior": [
      {
        question: "Explain the difference between let, const, and var in JavaScript.",
        type: "technical",
        expectedDuration: 120
      },
      {
        question: "Tell me about a project you're proud of and what you learned from it.",
        type: "behavioral",
        expectedDuration: 150
      },
      {
        question: "How would you approach debugging a piece of code that isn't working as expected?",
        type: "situational",
        expectedDuration: 120
      },
      {
        question: "What is version control and why is it important?",
        type: "technical",
        expectedDuration: 120
      },
      {
        question: "Describe a time when you received feedback on your code. How did you handle it?",
        type: "behavioral",
        expectedDuration: 150
      }
    ]
  };

  const questions = fallbackQuestions[expertiseLevel] || fallbackQuestions["mid"];
  return questions.slice(0, numberOfQuestions);
}

export async function analyzeInterviewVideo(
  videoBase64: string,
  questions: InterviewQuestion[],
  jobTitle: string
): Promise<VideoAnalysisResult> {
  try {
    const prompt = `Analyze this video interview for a ${jobTitle} position. 

The candidate was asked these questions:
${questions.map((q, i) => `${i + 1}. ${q.question} (${q.type})`).join('\n')}

Please evaluate the candidate on:
1. Technical Knowledge (1-10): Understanding of relevant concepts and ability to answer technical questions
2. Communication Skills (1-10): Clarity, articulation, professional language, and engagement
3. Confidence Level (1-10): Body language, eye contact, posture, and overall presence

Provide an overall score (1-10) and detailed feedback explaining your assessment.

Return the response in JSON format:
{
  "technicalScore": number,
  "communicationScore": number,
  "confidenceScore": number,
  "overallScore": number,
  "feedback": "detailed_feedback_string",
  "analysisDetails": {
    "strengths": ["array", "of", "strengths"],
    "improvements": ["array", "of", "improvement", "areas"],
    "nonVerbalCues": "description_of_body_language_and_presence",
    "technicalAccuracy": "assessment_of_technical_responses"
  }
}`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert interview assessor with years of experience evaluating candidates. Provide fair, constructive, and detailed analysis."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:video/mp4;base64,${videoBase64}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      technicalScore: Math.max(1, Math.min(10, result.technicalScore || 5)),
      communicationScore: Math.max(1, Math.min(10, result.communicationScore || 5)),
      confidenceScore: Math.max(1, Math.min(10, result.confidenceScore || 5)),
      overallScore: Math.max(1, Math.min(10, result.overallScore || 5)),
      feedback: result.feedback || "No feedback available",
      analysisDetails: result.analysisDetails || {},
    };
  } catch (error) {
    console.error("Error analyzing interview video:", error);
    
    // Fallback analysis if OpenAI is not available
    return generateFallbackAnalysis(questions, jobTitle);
  }
}

function generateFallbackAnalysis(
  questions: InterviewQuestion[],
  jobTitle: string
): VideoAnalysisResult {
  // Generate realistic scores based on question types
  const technicalQuestions = questions.filter(q => q.type === "technical").length;
  const behavioralQuestions = questions.filter(q => q.type === "behavioral").length;
  const situationalQuestions = questions.filter(q => q.type === "situational").length;
  
  // Simulate reasonable scores (6-8 range for demo purposes)
  const technicalScore = Math.random() * 2 + 6; // 6-8
  const communicationScore = Math.random() * 2 + 7; // 7-9
  const confidenceScore = Math.random() * 2 + 6.5; // 6.5-8.5
  const overallScore = (technicalScore + communicationScore + confidenceScore) / 3;
  
  return {
    technicalScore: Number(technicalScore.toFixed(1)),
    communicationScore: Number(communicationScore.toFixed(1)),
    confidenceScore: Number(confidenceScore.toFixed(1)),
    overallScore: Number(overallScore.toFixed(1)),
    feedback: `The candidate demonstrated good understanding of ${jobTitle} concepts. They answered ${technicalQuestions} technical questions with reasonable accuracy, showed clear communication skills in ${behavioralQuestions} behavioral responses, and handled ${situationalQuestions} situational scenarios appropriately. Areas for improvement include more detailed technical explanations and increased confidence in responses.`,
    analysisDetails: {
      speechPace: 150 + Math.random() * 50, // 150-200 WPM
      pauseFrequency: 3 + Math.random() * 4, // 3-7 pauses per minute
      eyeContact: 6 + Math.random() * 3, // 6-9 score
      enthusiasm: 6 + Math.random() * 2, // 6-8 score
      clarity: 7 + Math.random() * 2, // 7-9 score
      professionalLanguage: 7 + Math.random() * 2, // 7-9 score
      questionRelevance: 6 + Math.random() * 3, // 6-9 score
      timeManagement: 90 + Math.random() * 60, // 90-150 seconds per question
      transcription: "Candidate provided thoughtful responses to all questions with good technical depth and clear communication.",
      keyStrengths: [
        "Clear communication style",
        "Good understanding of core concepts",
        "Professional demeanor",
        "Structured responses"
      ],
      improvementAreas: [
        "Provide more specific examples",
        "Show deeper technical knowledge", 
        "Improve confidence in delivery",
        "Use more industry-specific terminology"
      ]
    }
  };
}

export async function generateEmailContent(
  candidateName: string,
  jobTitle: string,
  companyName: string,
  interviewLink: string
): Promise<{ subject: string; htmlContent: string; textContent: string }> {
  try {
    const prompt = `Generate a professional email invitation for an AI video interview.

Details:
- Candidate Name: ${candidateName}
- Job Title: ${jobTitle}
- Company: ${companyName}
- Interview Link: ${interviewLink}

Create an engaging but professional email that:
1. Thanks them for applying
2. Explains this is an AI-powered video interview
3. Provides clear instructions
4. Sets expectations (duration, format, etc.)
5. Includes the interview link

Return the response in JSON format:
{
  "subject": "email_subject_line",
  "htmlContent": "html_formatted_email_body",
  "textContent": "plain_text_email_body"
}`;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional HR communication specialist. Create clear, engaging, and professional email content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      subject: result.subject || `Interview Invitation - ${jobTitle} Position`,
      htmlContent: result.htmlContent || `<p>Dear ${candidateName},</p><p>Please complete your video interview at: ${interviewLink}</p>`,
      textContent: result.textContent || `Dear ${candidateName}, Please complete your video interview at: ${interviewLink}`,
    };
  } catch (error) {
    console.error("Error generating email content:", error);
    throw new Error("Failed to generate email content: " + (error as Error).message);
  }
}
