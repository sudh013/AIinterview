import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Star, Clock, User, Brain, Code, MessageSquare, Briefcase, Globe } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface Question {
  id: number;
  question: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  type: "ai-generated" | "custom";
  tags: string[];
  createdBy: string;
  createdAt: string;
  timeLimit?: number; // in minutes
  jobId?: number | null; // null for generic questions
  jobTitle?: string;
}

export default function Questions() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
    tags: "",
    timeLimit: 5,
    jobId: undefined as number | undefined
  });

  // Simulate current user role (in real app, get from auth context)
  const [currentRole] = useState<"admin" | "hr_recruiter">("admin");

  // Fetch available jobs based on user role
  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs'],
    enabled: true
  });

  const mockQuestions: Question[] = [
    {
      id: 1,
      question: "Tell me about yourself and your background in software development.",
      category: "General",
      difficulty: "easy",
      type: "ai-generated",
      tags: ["introduction", "background"],
      createdBy: "AI Assistant",
      createdAt: "2025-06-30T09:00:00Z",
      timeLimit: 3,
      jobId: undefined, // Generic question
      jobTitle: "All Jobs"
    },
    {
      id: 2,
      question: "Explain the difference between synchronous and asynchronous programming, and provide examples of when you would use each approach.",
      category: "Technical",
      difficulty: "medium",
      type: "ai-generated",
      tags: ["programming", "async", "concepts"],
      createdBy: "AI Assistant",
      createdAt: "2025-06-30T09:05:00Z",
      timeLimit: 5,
      jobId: 2,
      jobTitle: "Frontend Developer"
    },
    {
      id: 3,
      question: "Describe a challenging project you worked on and how you overcame the obstacles.",
      category: "Behavioral",
      difficulty: "medium",
      type: "custom",
      tags: ["problem-solving", "experience"],
      createdBy: "HR Team",
      createdAt: "2025-06-29T14:30:00Z",
      timeLimit: 4,
      jobId: undefined,
      jobTitle: "All Jobs"
    },
    {
      id: 4,
      question: "How do you stay updated with the latest technology trends and what resources do you use?",
      category: "Professional Development",
      difficulty: "easy",
      type: "custom",
      tags: ["learning", "growth"],
      createdBy: "Sarah Johnson",
      createdAt: "2025-06-29T11:15:00Z",
      timeLimit: 3,
      jobId: 2,
      jobTitle: "Frontend Developer"
    },
    {
      id: 5,
      question: "Design a system that can handle 1 million concurrent users. Walk me through your architecture decisions.",
      category: "System Design",
      difficulty: "hard",
      type: "ai-generated",
      tags: ["architecture", "scalability", "design"],
      createdBy: "AI Assistant",
      createdAt: "2025-06-30T08:20:00Z",
      timeLimit: 10,
      jobId: undefined,
      jobTitle: "All Jobs"
    }
  ];

  const handleAddQuestion = () => {
    toast({
      title: "Question Added",
      description: "Your custom question has been added to the question bank.",
    });
    setNewQuestion({ question: "", category: "", difficulty: "medium", tags: "", timeLimit: 5, jobId: undefined });
    setIsCreateDialogOpen(false);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setIsEditDialogOpen(true);
  };

  const handleUpdateQuestion = () => {
    toast({
      title: "Question Updated",
      description: "The question has been updated successfully.",
    });
    setEditingQuestion(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteQuestion = (question: Question) => {
    toast({
      title: "Question Deleted",
      description: "The question has been removed from the question bank.",
      variant: "destructive",
    });
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "General": <User size={16} className="text-blue-600" />,
      "Technical": <Code size={16} className="text-green-600" />,
      "Behavioral": <MessageSquare size={16} className="text-purple-600" />,
      "Professional Development": <Star size={16} className="text-yellow-600" />,
      "System Design": <Brain size={16} className="text-red-600" />,
    };
    return iconMap[category] || <Briefcase size={16} className="text-gray-600" />;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colorMap: Record<string, string> = {
      "easy": "bg-green-100 text-green-800",
      "medium": "bg-yellow-100 text-yellow-800",
      "hard": "bg-red-100 text-red-800",
    };
    return colorMap[difficulty] || "bg-gray-100 text-gray-800";
  };

  const categories = ["General", "Technical", "Behavioral", "Professional Development", "System Design"];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600">Manage custom interview questions and AI-generated content</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Custom Question
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="text-blue-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">AI Generated</p>
                <p className="text-2xl font-bold">{mockQuestions.filter(q => q.type === 'ai-generated').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="text-green-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Custom Questions</p>
                <p className="text-2xl font-bold">{mockQuestions.filter(q => q.type === 'custom').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="text-purple-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{new Set(mockQuestions.map(q => q.category)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-orange-600" size={20} />
              <div>
                <p className="text-sm text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold">{Math.round(mockQuestions.reduce((acc, q) => acc + (q.timeLimit || 0), 0) / mockQuestions.length)}m</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions Library</CardTitle>
          <CardDescription>
            All interview questions including AI-generated and custom questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockQuestions.map((question) => (
              <Card key={question.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getCategoryIcon(question.category)}
                        <span className="font-medium text-gray-700">{question.category}</span>
                        <Badge className={getDifficultyColor(question.difficulty)}>
                          {question.difficulty}
                        </Badge>
                        <Badge variant="outline">
                          {question.type === 'ai-generated' ? 'AI' : 'Custom'}
                        </Badge>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock size={12} className="mr-1" />
                          {question.timeLimit}m
                        </div>
                      </div>
                      <p className="text-gray-900 mb-2">{question.question}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>By: {question.createdBy}</span>
                        <span>•</span>
                        <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-medium">
                          {question.jobId ? `Job: ${question.jobTitle}` : "All Jobs"}
                        </span>
                        {question.tags.length > 0 && (
                          <>
                            <span>•</span>
                            <span>Tags: {question.tags.join(', ')}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditQuestion(question)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteQuestion(question)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Question Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Custom Question</DialogTitle>
            <DialogDescription>
              Create a custom interview question for your question bank
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="question-text">Question</Label>
              <Textarea
                id="question-text"
                placeholder="Enter your interview question..."
                value={newQuestion.question}
                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newQuestion.category} onValueChange={(value) => setNewQuestion({...newQuestion, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="job-selection">Job Assignment</Label>
                <Select value={newQuestion.jobId?.toString() || "generic"} onValueChange={(value) => setNewQuestion({...newQuestion, jobId: value === "generic" ? undefined : parseInt(value)})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job or generic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generic">
                      <div className="flex items-center space-x-2">
                        <Globe size={16} />
                        <span>Generic Question (All Jobs)</span>
                      </div>
                    </SelectItem>
                    {jobs?.filter((job: any) => currentRole === "admin" || job.createdBy === "current_user").map((job: any) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <Briefcase size={16} />
                          <span>{job.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  {currentRole === "admin" 
                    ? "Admin can create questions for any job or generic questions" 
                    : "HR can only create questions for jobs they posted"}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={newQuestion.difficulty} onValueChange={(value) => setNewQuestion({...newQuestion, difficulty: value as "easy" | "medium" | "hard"})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., programming, problem-solving"
                  value={newQuestion.tags}
                  onChange={(e) => setNewQuestion({...newQuestion, tags: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="time-limit">Time Limit (minutes)</Label>
                <Input
                  id="time-limit"
                  type="number"
                  min="1"
                  max="15"
                  value={newQuestion.timeLimit}
                  onChange={(e) => setNewQuestion({...newQuestion, timeLimit: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddQuestion}>
              Add Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Question Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Modify the question details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-question-text">Question</Label>
              <Textarea
                id="edit-question-text"
                defaultValue={editingQuestion?.question}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select defaultValue={editingQuestion?.category}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select defaultValue={editingQuestion?.difficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input
                  id="edit-tags"
                  defaultValue={editingQuestion?.tags.join(', ')}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-time-limit">Time Limit (minutes)</Label>
                <Input
                  id="edit-time-limit"
                  type="number"
                  min="1"
                  max="15"
                  defaultValue={editingQuestion?.timeLimit}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateQuestion}>
              Update Question
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}