import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";

interface InterviewModalProps {
  interviewId: number;
  isOpen: boolean;
  onClose: () => void;
}

interface InterviewDetails {
  interview: {
    id: number;
    status: string;
    questions: any[];
    videoPath: string | null;
  };
  score: {
    technicalScore: number;
    communicationScore: number;
    confidenceScore: number;
    overallScore: number;
    feedback: string;
    analysisDetails: any;
  } | null;
  job: {
    title: string;
    company: string;
  };
  applicant: {
    name: string;
    email: string;
  };
  videoUrl: string | null;
}

export function InterviewModal({ interviewId, isOpen, onClose }: InterviewModalProps) {
  const { data: interviewDetails, isLoading } = useQuery<InterviewDetails>({
    queryKey: [`/api/interviews/${interviewId}`],
    enabled: isOpen && !!interviewId,
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Interview Details</DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : interviewDetails ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Player Section */}
            <div>
              {interviewDetails.videoUrl ? (
                <div className="bg-gray-900 rounded-lg aspect-video">
                  <video 
                    controls 
                    className="w-full h-full rounded-lg"
                    src={interviewDetails.videoUrl}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4 opacity-75">▶️</div>
                    <p className="text-lg">Interview Recording</p>
                    <p className="text-sm opacity-75">
                      {interviewDetails.interview.status === "completed" 
                        ? "Video processing..." 
                        : "Not yet recorded"
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Candidate Info */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Candidate Information</h3>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {interviewDetails.applicant.name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Email:</strong> {interviewDetails.applicant.email}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Position:</strong> {interviewDetails.job.title}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Company:</strong> {interviewDetails.job.company}
                </p>
              </div>
            </div>
            
            {/* Scoring Details */}
            <div className="space-y-4">
              {interviewDetails.score ? (
                <>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">AI Assessment Scores</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Technical Knowledge</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(interviewDetails.score.technicalScore / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">
                            {interviewDetails.score.technicalScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Communication Skills</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${(interviewDetails.score.communicationScore / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">
                            {interviewDetails.score.communicationScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Confidence Level</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(interviewDetails.score.confidenceScore / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-8">
                            {interviewDetails.score.confidenceScore.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">Overall Score</span>
                          <span className="text-lg font-semibold text-primary">
                            {interviewDetails.score.overallScore.toFixed(1)}/10
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">AI Feedback Summary</h3>
                    <p className="text-sm text-gray-600">
                      {interviewDetails.score.feedback}
                    </p>
                  </div>

                  {interviewDetails.score.analysisDetails && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Detailed Analysis</h3>
                      {interviewDetails.score.analysisDetails.strengths && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium text-green-900 mb-1">Strengths:</h4>
                          <ul className="text-sm text-green-800 list-disc list-inside">
                            {interviewDetails.score.analysisDetails.strengths.map((strength: string, index: number) => (
                              <li key={index}>{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {interviewDetails.score.analysisDetails.improvements && (
                        <div>
                          <h4 className="text-sm font-medium text-orange-900 mb-1">Areas for Improvement:</h4>
                          <ul className="text-sm text-orange-800 list-disc list-inside">
                            {interviewDetails.score.analysisDetails.improvements.map((improvement: string, index: number) => (
                              <li key={index}>{improvement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h3 className="font-medium text-yellow-900 mb-2">Analysis Pending</h3>
                  <p className="text-sm text-yellow-800">
                    {interviewDetails.interview.status === "completed" 
                      ? "AI analysis is in progress. Results will be available shortly."
                      : "Interview has not been completed yet."
                    }
                  </p>
                </div>
              )}

              {/* Questions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Interview Questions</h3>
                <div className="space-y-2">
                  {interviewDetails.interview.questions.map((q: any, index: number) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-gray-700">{index + 1}. </span>
                      <span className="text-gray-600">{q.question}</span>
                      <span className="text-xs text-gray-500 ml-2">({q.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-500">Interview details not found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
