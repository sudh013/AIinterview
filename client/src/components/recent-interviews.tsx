import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { PlayCircle, Eye } from "lucide-react";
import { useState } from "react";
import { InterviewModal } from "./interview-modal";

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

export function RecentInterviews() {
  const [selectedInterviewId, setSelectedInterviewId] = useState<number | null>(null);
  
  const { data: interviews = [], isLoading } = useQuery<Interview[]>({
    queryKey: ["/api/interviews/recent"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string | null) => {
    if (!dateString) return "Not started";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Interviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-6 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Interviews</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">📹</div>
              <p className="text-gray-500">No interviews found</p>
              <p className="text-sm text-gray-400 mt-1">Interviews will appear here once candidates start applying</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={interview.applicantImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(interview.applicantName)}&background=e5e7eb&color=374151`}
                      alt={`${interview.applicantName} Profile`} 
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                    <div>
                      <p className="font-medium text-gray-900">{interview.applicantName}</p>
                      <p className="text-sm text-gray-600">{interview.jobTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      {interview.overallScore ? (
                        <>
                          <p className="text-sm font-medium text-gray-900">
                            {interview.overallScore.toFixed(1)}/10
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(interview.completedAt)}
                          </p>
                        </>
                      ) : interview.status === "in_progress" ? (
                        <>
                          <p className="text-sm font-medium text-gray-900">In Progress</p>
                          <p className="text-xs text-gray-500">15 min remaining</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-900">Pending</p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(interview.startedAt)}
                          </p>
                        </>
                      )}
                    </div>
                    {getStatusBadge(interview.status)}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setSelectedInterviewId(interview.id)}
                      className="text-primary hover:text-primary/80"
                    >
                      {interview.status === "completed" ? (
                        <PlayCircle size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedInterviewId && (
        <InterviewModal 
          interviewId={selectedInterviewId} 
          isOpen={true}
          onClose={() => setSelectedInterviewId(null)}
        />
      )}
    </>
  );
}
