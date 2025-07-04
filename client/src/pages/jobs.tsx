import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Building, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string;
  expertiseLevel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function Jobs() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
    expertiseLevel: "mid"
  });

  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create job");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      setIsCreateDialogOpen(false);
      setFormData({ title: "", company: "", description: "", requirements: "", expertiseLevel: "mid" });
      toast({
        title: "Success",
        description: "Job created successfully",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJobMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
            <p className="text-gray-600">Manage job postings and requirements</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600">Manage job postings and requirements</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Job
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Add a new job posting to start receiving applications and conducting interviews.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. TechCorp Inc."
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List the required skills, experience, and qualifications..."
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expertiseLevel">Expertise Level</Label>
                <Select value={formData.expertiseLevel} onValueChange={(value) => setFormData({ ...formData, expertiseLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select expertise level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid-level (2-5 years)</SelectItem>
                    <SelectItem value="senior">Senior (5+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createJobMutation.isPending}>
                  {createJobMutation.isPending ? "Creating..." : "Create Job"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {jobs && jobs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first job posting.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus size={16} className="mr-2" />
              Create Job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs?.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Building size={14} className="mr-1" />
                      {job.company}
                    </CardDescription>
                  </div>
                  <Badge variant={job.status === "active" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Users size={14} className="mr-1" />
                    {job.expertiseLevel} level
                  </div>
                  <div className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}