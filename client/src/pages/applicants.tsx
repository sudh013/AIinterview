import { useQuery } from "@tanstack/react-query";
import { Search, Mail, Phone, Calendar, FileText, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  resume?: string;
  createdAt: string;
  jobTitle?: string;
  jobCompany?: string;
  applicationStatus?: string;
  interviewStatus?: string;
  overallScore?: number;
}

export default function Applicants() {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data for demonstration
  const mockApplicants: Applicant[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1-555-0123",
      resume: "https://example.com/resume1.pdf",
      createdAt: "2025-06-29T10:30:00Z",
      jobTitle: "Senior Software Engineer",
      jobCompany: "TechCorp Inc.",
      applicationStatus: "reviewed",
      interviewStatus: "completed",
      overallScore: 7.8
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1-555-0124",
      resume: "https://example.com/resume2.pdf",
      createdAt: "2025-06-29T14:15:00Z",
      jobTitle: "Frontend Developer",
      jobCompany: "StartupXYZ",
      applicationStatus: "pending",
      interviewStatus: "scheduled",
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      phone: "+1-555-0125",
      createdAt: "2025-06-30T09:00:00Z",
      jobTitle: "Data Scientist",
      jobCompany: "DataCorp",
      applicationStatus: "new",
      interviewStatus: "pending",
    },
    {
      id: 4,
      name: "David Kim",
      email: "david.kim@email.com",
      createdAt: "2025-06-30T11:20:00Z",
      jobTitle: "DevOps Engineer",
      jobCompany: "CloudTech",
      applicationStatus: "reviewed",
      interviewStatus: "completed",
      overallScore: 8.4
    }
  ];

  const filteredApplicants = mockApplicants.filter(applicant =>
    applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    applicant.jobCompany?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "scheduled": return "secondary";
      case "pending": return "outline";
      case "new": return "destructive";
      default: return "outline";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Applicants</h1>
          <p className="text-gray-600">Manage candidate applications and profiles</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredApplicants.length} applicants
        </Badge>
      </div>

      <div className="grid gap-6">
        {filteredApplicants.map((applicant) => (
          <Card key={applicant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={`https://images.unsplash.com/photo-${1500000000000 + applicant.id}?w=100&h=100&fit=crop&crop=face`} />
                    <AvatarFallback>{getInitials(applicant.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{applicant.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-4 mt-1">
                      <span className="flex items-center">
                        <Mail size={14} className="mr-1" />
                        {applicant.email}
                      </span>
                      {applicant.phone && (
                        <span className="flex items-center">
                          <Phone size={14} className="mr-1" />
                          {applicant.phone}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {applicant.overallScore && (
                    <Badge variant="default" className="text-sm">
                      Score: {applicant.overallScore}/10
                    </Badge>
                  )}
                  <Badge variant={getStatusColor(applicant.interviewStatus || "pending")}>
                    {applicant.interviewStatus || "pending"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <strong className="mr-2">Position:</strong>
                    {applicant.jobTitle} at {applicant.jobCompany}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={14} className="mr-2" />
                    Applied on {new Date(applicant.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  {applicant.resume && (
                    <Button variant="outline" size="sm">
                      <FileText size={14} className="mr-2" />
                      View Resume
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Video size={14} className="mr-2" />
                    Interview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail size={14} className="mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredApplicants.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
            <p className="text-gray-600">No applicants match your search criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}