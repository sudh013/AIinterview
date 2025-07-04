import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Send } from "lucide-react";

interface Job {
  id: number;
  title: string;
  company: string;
}

interface CreateInterviewModalProps {
  trigger?: React.ReactNode;
}

export function CreateInterviewModal({ trigger }: CreateInterviewModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    applicantEmail: "",
    jobId: "",
    customMessage: "",
    expirationHours: "72"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available jobs
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Create interview invitation mutation
  const createInterviewMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/interviews/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicantEmail: data.applicantEmail,
          jobId: parseInt(data.jobId),
          customMessage: data.customMessage || undefined,
          expirationHours: parseInt(data.expirationHours)
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send interview invitation");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Interview Invitation Sent",
        description: "The candidate has been invited to complete the video interview.",
      });
      
      // Reset form and close modal
      setFormData({
        applicantEmail: "",
        jobId: "",
        customMessage: "",
        expirationHours: "72"
      });
      setOpen(false);
      
      // Refresh interviews data
      queryClient.invalidateQueries({ queryKey: ["/api/interviews/recent"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send interview invitation",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.applicantEmail || !formData.jobId) {
      toast({
        title: "Missing Information",
        description: "Please provide both applicant email and select a job.",
        variant: "destructive",
      });
      return;
    }
    
    createInterviewMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Interview
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Interview</DialogTitle>
          <DialogDescription>
            Send a video interview invitation to a candidate. They'll receive an email with a secure link to complete the interview.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="applicantEmail">Candidate Email</Label>
            <Input
              id="applicantEmail"
              type="email"
              placeholder="candidate@example.com"
              value={formData.applicantEmail}
              onChange={(e) => handleInputChange("applicantEmail", e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jobId">Position</Label>
            <Select
              value={formData.jobId}
              onValueChange={(value) => handleInputChange("jobId", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a job position" />
              </SelectTrigger>
              <SelectContent>
                {jobsLoading ? (
                  <SelectItem value="loading" disabled>Loading positions...</SelectItem>
                ) : jobs.length === 0 ? (
                  <SelectItem value="none" disabled>No positions available</SelectItem>
                ) : (
                  jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()}>
                      {job.title} - {job.company}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="expirationHours">Interview Expires In</Label>
            <Select
              value={formData.expirationHours}
              onValueChange={(value) => handleInputChange("expirationHours", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24">24 Hours</SelectItem>
                <SelectItem value="48">48 Hours</SelectItem>
                <SelectItem value="72">3 Days (Recommended)</SelectItem>
                <SelectItem value="168">1 Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customMessage">Custom Message (Optional)</Label>
            <Textarea
              id="customMessage"
              placeholder="Add a personal message to the invitation email..."
              value={formData.customMessage}
              onChange={(e) => handleInputChange("customMessage", e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={createInterviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createInterviewMutation.isPending || !formData.applicantEmail || !formData.jobId}
            >
              {createInterviewMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}