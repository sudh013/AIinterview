import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, Eye, Send, User, Building } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { InterviewModal } from "@/components/interview-modal";

interface Interview {
  id: number;
  status: string;
  startedAt: string | null;
  completedAt: string | null;
  applicantName: string;
  applicantEmail: string;
  applicantImage: string | null;
  jobTitle: string;
  overallScore: number | null;
}

export default function Interviews() {
  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(null);

  const { data: interviews, isLoading } = useQuery<Interview[]>({
    queryKey: ["/api/interviews/recent"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "pending": return "outline";
      case "expired": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Clock size={14} className="mr-1" />;
      case "in_progress": return <Eye size={14} className="mr-1" />;
      case "pending": return <Send size={14} className="mr-1" />;
      default: return <Calendar size={14} className="mr-1" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
            <p className="text-gray-600">Manage video interviews and track progress</p>
          </div>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-600">Manage video interviews and track progress</p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="text-sm">
            {interviews?.length || 0} interviews
          </Badge>
        </div>
      </div>

      {!interviews || interviews.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled</h3>
            <p className="text-gray-600">Interviews will appear here when candidates are invited.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {interview.applicantImage ? (
                        <img 
                          src={interview.applicantImage} 
                          alt={interview.applicantName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User size={20} className="text-gray-500" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{interview.applicantName}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 mt-1">
                        <Building size={14} />
                        <span>{interview.jobTitle}</span>
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {interview.overallScore && (
                      <Badge variant="default" className="text-sm">
                        {interview.overallScore}/10
                      </Badge>
                    )}
                    <Badge variant={getStatusColor(interview.status)}>
                      {getStatusIcon(interview.status)}
                      {interview.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>Candidate:</strong> {interview.applicantEmail}
                  </div>
                  <div>
                    <strong>Started:</strong> {interview.startedAt 
                      ? new Date(interview.startedAt).toLocaleDateString()
                      : "Not started"
                    }
                  </div>
                  <div>
                    <strong>Completed:</strong> {interview.completedAt
                      ? new Date(interview.completedAt).toLocaleDateString()
                      : "Pending"
                    }
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedInterviewId(interview.id)}
                  >
                    <Eye size={14} className="mr-2" />
                    View Details
                  </Button>
                  {interview.status === "pending" && (
                    <Button variant="outline" size="sm">
                      <Send size={14} className="mr-2" />
                      Resend Invite
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedInterviewId && (
        <InterviewModal
          interviewId={selectedInterviewId}
          isOpen={!!selectedInterviewId}
          onClose={() => setSelectedInterviewId(null)}
        />
      )}
    </div>
  );
}