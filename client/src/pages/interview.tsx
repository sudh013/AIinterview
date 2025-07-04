import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { VideoRecorder } from "@/components/video-recorder";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, PlayCircle, StopCircle, Upload } from "lucide-react";

interface InterviewQuestion {
  question: string;
  type: "technical" | "behavioral" | "situational";
  expectedDuration: number;
}

interface InterviewData {
  interview: {
    id: number;
    questions: InterviewQuestion[];
    status: string;
  };
  job: {
    title: string;
    company: string;
  };
  applicant: {
    name: string;
  };
}

export default function Interview() {
  const { token } = useParams();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<"intro" | "questions" | "recording" | "completed">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);
  const videoRecorderRef = useRef<{ startRecording: () => void; stopRecording: () => void } | null>(null);

  // Check if this is demo mode (no token in URL means demo)
  const isDemoMode = !token || window.location.pathname === '/demo-interview';

  // Mock data for demo mode
  const demoInterviewData: InterviewData = {
    interview: {
      id: 999,
      questions: [
        {
          question: "Tell me about yourself and your experience with frontend development.",
          type: "behavioral",
          expectedDuration: 3
        },
        {
          question: "Explain the difference between let, const, and var in JavaScript.",
          type: "technical",
          expectedDuration: 4
        },
        {
          question: "How would you handle a situation where you disagree with your team lead's technical approach?",
          type: "situational",
          expectedDuration: 3
        }
      ],
      status: "pending"
    },
    job: {
      title: "Frontend Developer",
      company: "Demo Company"
    },
    applicant: {
      name: "Demo Candidate"
    }
  };

  const { data: interviewData, isLoading } = useQuery<InterviewData>({
    queryKey: [`/api/interview/${token}`],
    enabled: !!token && !isDemoMode,
  });

  // Use demo data if in demo mode, otherwise use API data
  const activeInterviewData = isDemoMode ? demoInterviewData : interviewData;

  const startInterviewMutation = useMutation({
    mutationFn: () => {
      if (isDemoMode) {
        return Promise.resolve({ success: true });
      }
      return apiRequest("POST", `/api/interview/${token}/start`);
    },
    onSuccess: () => {
      setCurrentStep("questions");
      toast({
        title: "Interview Started",
        description: isDemoMode ? "Demo interview started. This is for testing purposes only." : "You can now begin your video interview.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitInterviewMutation = useMutation({
    mutationFn: (videoBlob: Blob) => {
      const formData = new FormData();
      formData.append("video", videoBlob, "interview.webm");
      
      return fetch(`/api/interview/${token}/submit`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
    },
    onSuccess: () => {
      setCurrentStep("completed");
      toast({
        title: "Interview Submitted",
        description: "Thank you! Your interview has been submitted for review.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleStartInterview = () => {
    startInterviewMutation.mutate();
  };

  const handleVideoRecorded = (videoBlob: Blob) => {
    setRecordedVideo(videoBlob);
  };

  const handleSubmitInterview = () => {
    if (isDemoMode) {
      // For demo mode, just show completion
      setCurrentStep("completed");
      toast({
        title: "Demo Completed",
        description: "Demo interview completed successfully! This was just for testing.",
      });
    } else if (recordedVideo) {
      submitInterviewMutation.mutate(recordedVideo);
    }
  };

  if (isLoading && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (!activeInterviewData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-semibold mb-2">Interview Not Found</h1>
            <p className="text-gray-600">The interview link may be invalid or expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { interview, job, applicant } = activeInterviewData!;
  const questions = interview.questions || [];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <PlayCircle className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">AI Video Interview</h1>
              <p className="text-gray-600">
                {job.title} at {job.company} • {applicant.name}
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        {currentStep === "questions" || currentStep === "recording" ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        ) : null}

        {/* Content */}
        <Card>
          <CardContent className="p-8">
            {currentStep === "intro" && (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎥</div>
                <h2 className="text-2xl font-semibold text-gray-900">Welcome to Your Interview</h2>
                <div className="max-w-2xl mx-auto space-y-4 text-gray-600">
                  <p>
                    This AI-powered video interview will take approximately 15-20 minutes to complete.
                    You'll be asked {questions.length} questions covering technical skills, experience, and behavioral aspects.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">Before you start:</h3>
                    <ul className="text-sm text-blue-800 space-y-1 text-left">
                      <li>• Ensure you have a stable internet connection</li>
                      <li>• Test your camera and microphone</li>
                      <li>• Find a quiet, well-lit space</li>
                      <li>• Have any relevant documents ready</li>
                    </ul>
                  </div>
                </div>
                <Button 
                  onClick={handleStartInterview} 
                  disabled={startInterviewMutation.isPending}
                  size="lg"
                >
                  {startInterviewMutation.isPending ? "Starting..." : "Start Interview"}
                </Button>
              </div>
            )}

            {currentStep === "questions" && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
                    {questions[currentQuestionIndex]?.type?.toUpperCase()} QUESTION
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {questions[currentQuestionIndex]?.question}
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Take a moment to think about your response. When you're ready, click "Start Recording" to begin.
                    You'll have up to {Math.ceil((questions[currentQuestionIndex]?.expectedDuration || 120) / 60)} minutes to respond.
                  </p>
                </div>

                <VideoRecorder 
                  ref={videoRecorderRef}
                  onVideoRecorded={handleVideoRecorded}
                  onSubmitInterview={handleSubmitInterview}
                  isSubmitting={submitInterviewMutation.isPending}
                  isDemoMode={isDemoMode}
                />
              </div>
            )}



            {currentStep === "completed" && (
              <div className="text-center space-y-6">
                <div className="text-green-500 text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {isDemoMode ? "Demo Completed!" : "Interview Completed!"}
                </h2>
                <div className="max-w-2xl mx-auto space-y-4 text-gray-600">
                  <p>
                    {isDemoMode ? (
                      `Thank you for testing our demo interview for the ${job.title} position at ${job.company}.`
                    ) : (
                      `Thank you for completing your video interview for the ${job.title} position at ${job.company}.`
                    )}
                  </p>
                  <p>
                    {isDemoMode ? (
                      "This was a demonstration of our AI-powered video interview platform. No actual data has been saved or submitted."
                    ) : (
                      "Your responses have been submitted and will be analyzed by our AI system. The hiring team will review your interview and contact you with next steps."
                    )}
                  </p>
                  <div className={`${isDemoMode ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'} border rounded-lg p-4`}>
                    <h3 className={`font-medium ${isDemoMode ? 'text-blue-900' : 'text-green-900'} mb-2`}>
                      {isDemoMode ? "Demo Features Demonstrated:" : "What happens next:"}
                    </h3>
                    <ul className={`text-sm ${isDemoMode ? 'text-blue-800' : 'text-green-800'} space-y-1 text-left`}>
                      {isDemoMode ? (
                        <>
                          <li>• AI-generated interview questions based on job requirements</li>
                          <li>• Video recording with real-time feedback</li>
                          <li>• Seamless user experience and professional interface</li>
                          <li>• Integration capabilities with your existing HR systems</li>
                        </>
                      ) : (
                        <>
                          <li>• Your interview will be analyzed within 24 hours</li>
                          <li>• The hiring team will receive your assessment</li>
                          <li>• You'll be contacted regarding next steps</li>
                          <li>• Keep an eye on your email for updates</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
