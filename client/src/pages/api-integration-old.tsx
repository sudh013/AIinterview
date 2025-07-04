import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, Plus, Key, Globe, Trash2, Edit, Eye, EyeOff, ExternalLink, Code, Settings, Zap, Mail, Mic, Camera, Brain, Volume2, MessageCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface ApiIntegration {
  id: number;
  name: string;
  apiKey: string;
  webhookUrl?: string;
  status: string;
  createdAt: string;
}

interface AppTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'password' | 'url' | 'textarea';
    required: boolean;
    placeholder?: string;
    description?: string;
  }[];
}

const appTemplates: AppTemplate[] = [
  // HR & ATS Platforms
  {
    id: "greenhouse",
    name: "Greenhouse",
    description: "Bidirectional sync with Greenhouse ATS - jobs and applicants automatically sync",
    icon: Globe,
    color: "green",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "gh_api_...", description: "Your Greenhouse API key for job and candidate sync" },
      { name: "webhookUrl", label: "Webhook URL", type: "url", required: false, placeholder: "https://api.greenhouse.io/webhook", description: "Real-time job and applicant updates" },
      { name: "boardToken", label: "Board Token", type: "password", required: false, placeholder: "board_token_...", description: "Job board integration token" },
      { name: "syncJobs", label: "Auto-sync Jobs", type: "text", required: false, placeholder: "true", description: "Automatically sync jobs posted on Greenhouse" },
      { name: "syncApplicants", label: "Auto-sync Applicants", type: "text", required: false, placeholder: "true", description: "Automatically sync applicant data from Greenhouse" },
      { name: "syncInterval", label: "Sync Interval (minutes)", type: "text", required: false, placeholder: "15", description: "How often to sync data (in minutes)" }
    ]
  },
  {
    id: "workday",
    name: "Workday",
    description: "Bidirectional sync with Workday HCM - jobs, applicants, and employee data sync",
    icon: Settings,
    color: "blue",
    fields: [
      { name: "tenantUrl", label: "Tenant URL", type: "url", required: true, placeholder: "https://impl-cc.workday.com", description: "Your Workday tenant URL" },
      { name: "username", label: "Username", type: "text", required: true, placeholder: "integration@company", description: "Integration service account" },
      { name: "password", label: "Password", type: "password", required: true, description: "Service account password" },
      { name: "clientId", label: "Client ID", type: "text", required: false, placeholder: "workday_client_id", description: "OAuth client ID if applicable" },
      { name: "syncRequisitions", label: "Auto-sync Job Requisitions", type: "text", required: false, placeholder: "true", description: "Automatically sync job postings from Workday" },
      { name: "syncCandidates", label: "Auto-sync Candidates", type: "text", required: false, placeholder: "true", description: "Automatically sync candidate applications" },
      { name: "syncInterval", label: "Sync Interval (minutes)", type: "text", required: false, placeholder: "30", description: "How often to sync data (in minutes)" }
    ]
  },
  {
    id: "lever",
    name: "Lever",
    description: "Bidirectional sync with Lever's recruiting platform - jobs and candidates sync",
    icon: Zap,
    color: "purple",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "lever_api_...", description: "Your Lever API key for job and candidate sync" },
      { name: "webhookSignature", label: "Webhook Signature", type: "password", required: false, description: "Secret for webhook verification" },
      { name: "syncPostings", label: "Auto-sync Job Postings", type: "text", required: false, placeholder: "true", description: "Automatically sync job postings from Lever" },
      { name: "syncCandidates", label: "Auto-sync Candidates", type: "text", required: false, placeholder: "true", description: "Automatically sync candidate applications" },
      { name: "syncInterval", label: "Sync Interval (minutes)", type: "text", required: false, placeholder: "20", description: "How often to sync data (in minutes)" }
    ]
  },
  {
    id: "bamboohr",
    name: "BambooHR",
    description: "Integrate with BambooHR for employee data management",
    icon: Globe,
    color: "orange",
    fields: [
      { name: "subdomain", label: "Subdomain", type: "text", required: true, placeholder: "company", description: "Your BambooHR subdomain" },
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "bamboo_api_...", description: "Your BambooHR API key" }
    ]
  },
  {
    id: "slack",
    name: "Slack",
    description: "Send interview notifications to Slack channels",
    icon: Code,
    color: "indigo",
    fields: [
      { name: "botToken", label: "Bot Token", type: "password", required: true, placeholder: "xoxb-...", description: "Slack bot token" },
      { name: "channel", label: "Default Channel", type: "text", required: true, placeholder: "#hiring", description: "Default notification channel" },
      { name: "webhookUrl", label: "Webhook URL", type: "url", required: false, placeholder: "https://hooks.slack.com/...", description: "Optional incoming webhook" }
    ]
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect to thousands of apps through Zapier automation",
    icon: Zap,
    color: "yellow",
    fields: [
      { name: "webhookUrl", label: "Zapier Webhook URL", type: "url", required: true, placeholder: "https://hooks.zapier.com/...", description: "Your Zapier webhook trigger URL" }
    ]
  },
  // Email & Communication
  {
    id: "brevo",
    name: "Brevo (Sendinblue)",
    description: "Advanced email marketing and transactional email platform",
    icon: Mail,
    color: "blue",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "xkeysib-...", description: "Your Brevo API key" },
      { name: "defaultSender", label: "Default Sender Email", type: "text", required: true, placeholder: "noreply@company.com", description: "Default sender email address" },
      { name: "senderName", label: "Sender Name", type: "text", required: false, placeholder: "Company HR", description: "Default sender name" },
      { name: "templateId", label: "Interview Template ID", type: "text", required: false, placeholder: "1", description: "Default interview invitation template ID" }
    ]
  },
  {
    id: "mailgun",
    name: "Mailgun",
    description: "Reliable email delivery service for transactional emails",
    icon: Mail,
    color: "red",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "key-...", description: "Your Mailgun API key" },
      { name: "domain", label: "Domain", type: "text", required: true, placeholder: "mg.company.com", description: "Your verified Mailgun domain" },
      { name: "region", label: "Region", type: "text", required: false, placeholder: "us", description: "API region (us/eu)" }
    ]
  },
  
  // Transcription Services
  {
    id: "whisper",
    name: "OpenAI Whisper",
    description: "Advanced speech-to-text transcription for interview analysis",
    icon: Mic,
    color: "green",
    fields: [
      { name: "apiKey", label: "OpenAI API Key", type: "password", required: true, placeholder: "sk-...", description: "Your OpenAI API key" },
      { name: "model", label: "Model", type: "text", required: false, placeholder: "whisper-1", description: "Whisper model to use" },
      { name: "language", label: "Language", type: "text", required: false, placeholder: "en", description: "Primary language for transcription" }
    ]
  },
  {
    id: "deepgram",
    name: "Deepgram",
    description: "Real-time speech recognition and audio intelligence",
    icon: Volume2,
    color: "purple",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "dg_...", description: "Your Deepgram API key" },
      { name: "model", label: "Model", type: "text", required: false, placeholder: "nova-2", description: "Deepgram model for transcription" },
      { name: "language", label: "Language", type: "text", required: false, placeholder: "en-US", description: "Language model" },
      { name: "enableDiarization", label: "Speaker Diarization", type: "text", required: false, placeholder: "true", description: "Enable speaker identification" }
    ]
  },
  {
    id: "assemblyai",
    name: "AssemblyAI",
    description: "AI-powered transcription with sentiment analysis",
    icon: MessageCircle,
    color: "indigo",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "assembly_...", description: "Your AssemblyAI API key" },
      { name: "enableSentiment", label: "Sentiment Analysis", type: "text", required: false, placeholder: "true", description: "Enable sentiment detection" },
      { name: "enableEmotions", label: "Emotion Detection", type: "text", required: false, placeholder: "true", description: "Enable emotion analysis" }
    ]
  },
  
  // Tone & Expression Analysis
  {
    id: "google-vision",
    name: "Google Vision AI",
    description: "Advanced facial expression and emotion detection",
    icon: Camera,
    color: "yellow",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "AIza...", description: "Your Google Cloud Vision API key" },
      { name: "projectId", label: "Project ID", type: "text", required: true, placeholder: "my-project-123", description: "Google Cloud Project ID" },
      { name: "enableFaceDetection", label: "Face Detection", type: "text", required: false, placeholder: "true", description: "Enable facial expression analysis" },
      { name: "enableEmotions", label: "Emotion Analysis", type: "text", required: false, placeholder: "true", description: "Detect emotional states" }
    ]
  },
  {
    id: "azure-face",
    name: "Azure Face API",
    description: "Microsoft's facial recognition and emotion analysis",
    icon: Brain,
    color: "blue",
    fields: [
      { name: "subscriptionKey", label: "Subscription Key", type: "password", required: true, placeholder: "azure_key...", description: "Azure Face API subscription key" },
      { name: "endpoint", label: "Endpoint", type: "url", required: true, placeholder: "https://region.api.cognitive.microsoft.com/", description: "Azure Face API endpoint" },
      { name: "detectAttributes", label: "Detection Attributes", type: "text", required: false, placeholder: "emotion,age,gender", description: "Attributes to detect" }
    ]
  },
  {
    id: "hume-ai",
    name: "Hume AI",
    description: "Emotion AI for comprehensive expression analysis",
    icon: Brain,
    color: "purple",
    fields: [
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "hume_...", description: "Your Hume AI API key" },
      { name: "modelType", label: "Model Type", type: "text", required: false, placeholder: "face", description: "Analysis model (face/voice/language)" },
      { name: "confidenceThreshold", label: "Confidence Threshold", type: "text", required: false, placeholder: "0.7", description: "Minimum confidence for predictions" }
    ]
  },
  
  // Custom Integration
  {
    id: "custom",
    name: "Custom API",
    description: "Add a custom API integration with your own endpoints",
    icon: Code,
    color: "gray",
    fields: [
      { name: "baseUrl", label: "Base URL", type: "url", required: true, placeholder: "https://api.yourapp.com", description: "Base API endpoint" },
      { name: "apiKey", label: "API Key", type: "password", required: true, placeholder: "your_api_key", description: "Authentication key" },
      { name: "webhookUrl", label: "Webhook URL", type: "url", required: false, placeholder: "https://api.yourapp.com/webhook", description: "Webhook endpoint for notifications" },
      { name: "customHeaders", label: "Custom Headers", type: "textarea", required: false, placeholder: "Authorization: Bearer token\nCustom-Header: value", description: "Additional headers (one per line)" }
    ]
  }
];

const getIntegrationIcon = (name: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    "Greenhouse": <Globe size={20} className="text-green-600" />,
    "Slack": <MessageCircle size={20} className="text-purple-600" />,
    "Brevo (Sendinblue)": <Mail size={20} className="text-blue-600" />,
    "OpenAI Whisper": <Mic size={20} className="text-green-600" />,
    "Google Vision AI": <Camera size={20} className="text-yellow-600" />,
    "Deepgram": <Volume2 size={20} className="text-purple-600" />,
    "Workday": <Settings size={20} className="text-blue-600" />,
    "Lever": <Zap size={20} className="text-purple-600" />,
    "BambooHR": <Globe size={20} className="text-orange-600" />,
    "Azure Face API": <Brain size={20} className="text-blue-600" />,
    "Hume AI": <Brain size={20} className="text-purple-600" />,
    "AssemblyAI": <MessageCircle size={20} className="text-indigo-600" />,
    "Mailgun": <Mail size={20} className="text-red-600" />,
    "Custom API": <Code size={20} className="text-gray-600" />,
  };
  return iconMap[name] || <Globe size={20} className="text-blue-600" />;
};

const getIntegrationIconBg = (name: string) => {
  const bgMap: Record<string, string> = {
    "Greenhouse": "bg-green-100",
    "Slack": "bg-purple-100",
    "Brevo (Sendinblue)": "bg-blue-100",
    "OpenAI Whisper": "bg-green-100",
    "Google Vision AI": "bg-yellow-100",
    "Deepgram": "bg-purple-100",
    "Workday": "bg-blue-100",
    "Lever": "bg-purple-100",
    "BambooHR": "bg-orange-100",
    "Azure Face API": "bg-blue-100",
    "Hume AI": "bg-purple-100",
    "AssemblyAI": "bg-indigo-100",
    "Mailgun": "bg-red-100",
    "Custom API": "bg-gray-100",
  };
  return bgMap[name] || "bg-blue-100";
};

export default function ApiIntegration() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AppTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showApiKeys, setShowApiKeys] = useState<Record<number, boolean>>({});

  const { data: integrations, isLoading } = useQuery<ApiIntegration[]>({
    queryKey: ["/api/integrations"],
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (data: any) => {
      // This would be implemented in the backend
      return { success: true, id: Date.now() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsCreateDialogOpen(false);
      setSelectedTemplate(null);
      setFormData({});
      toast({
        title: "Integration Added",
        description: "API integration has been configured successfully.",
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

  const handleTemplateSelect = (template: AppTemplate) => {
    setSelectedTemplate(template);
    const initialData: Record<string, string> = {};
    template.fields.forEach(field => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    const integrationData = {
      name: selectedTemplate.name,
      type: selectedTemplate.id,
      ...formData
    };

    createIntegrationMutation.mutate(integrationData);
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const triggerDataSync = async () => {
    try {
      toast({
        title: "Sync Started",
        description: "Triggering data synchronization with all configured platforms...",
      });
      
      // TODO: Call sync API endpoint
      console.log("Triggering data sync...");
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to trigger data synchronization",
        variant: "destructive",
      });
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      green: "bg-green-100 text-green-800 border-green-200",
      blue: "bg-blue-100 text-blue-800 border-blue-200",
      purple: "bg-purple-100 text-purple-800 border-purple-200",
      orange: "bg-orange-100 text-orange-800 border-orange-200",
      indigo: "bg-indigo-100 text-indigo-800 border-indigo-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      red: "bg-red-100 text-red-800 border-red-200",
      gray: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[color] || colors.gray;
  };



  // Mock data for demonstration
  const mockIntegrations: ApiIntegration[] = [
    {
      id: 1,
      name: "Greenhouse",
      apiKey: "gh_api_1234567890abcdef",
      webhookUrl: "https://api.greenhouse.io/webhook",
      status: "active",
      createdAt: "2025-06-29T10:00:00Z"
    },
    {
      id: 2,
      name: "Slack",
      apiKey: "xoxb-1234567890-abcdefghij",
      status: "active",
      createdAt: "2025-06-28T15:30:00Z"
    },
    {
      id: 3,
      name: "Brevo (Sendinblue)",
      apiKey: "xkeysib-abc123def456789",
      status: "active",
      createdAt: "2025-06-30T09:15:00Z"
    },
    {
      id: 4,
      name: "OpenAI Whisper",
      apiKey: "sk-proj-whisper123456789",
      status: "active",
      createdAt: "2025-06-30T08:45:00Z"
    },
    {
      id: 5,
      name: "Google Vision AI",
      apiKey: "AIzaSyC_vision_api_key_123",
      status: "active",
      createdAt: "2025-06-30T07:30:00Z"
    },
    {
      id: 6,
      name: "Deepgram",
      apiKey: "dg_transcription_key_456",
      status: "pending",
      createdAt: "2025-06-30T06:00:00Z"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Integration</h1>
          <p className="text-gray-600">Connect with external platforms and manage bidirectional data sync</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => triggerDataSync()}
          >
            <Key className="mr-2 h-4 w-4" />
            Sync Data
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Choose an application to integrate with your AI Interview Platform
              </DialogDescription>
            </DialogHeader>

            {!selectedTemplate ? (
              <div className="py-4 space-y-6">
                {/* HR & ATS Platforms */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">HR & ATS Platforms</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Bidirectional sync: Jobs posted on external platforms automatically sync with applicant data
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appTemplates.filter(t => ['greenhouse', 'workday', 'lever', 'bamboohr', 'slack', 'zapier'].includes(t.id)).map((template) => {
                      const Icon = template.icon;
                      return (
                        <Card
                          key={template.id}
                          className={`cursor-pointer hover:shadow-lg transition-all border-2 ${getColorClasses(template.color)}`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                              <Icon size={24} />
                              <div>
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {template.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Email & Communication */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Email & Communication</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appTemplates.filter(t => ['brevo', 'mailgun'].includes(t.id)).map((template) => {
                      const Icon = template.icon;
                      return (
                        <Card
                          key={template.id}
                          className={`cursor-pointer hover:shadow-lg transition-all border-2 ${getColorClasses(template.color)}`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                              <Icon size={24} />
                              <div>
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {template.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Transcription Services */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Transcription Services</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appTemplates.filter(t => ['whisper', 'deepgram', 'assemblyai'].includes(t.id)).map((template) => {
                      const Icon = template.icon;
                      return (
                        <Card
                          key={template.id}
                          className={`cursor-pointer hover:shadow-lg transition-all border-2 ${getColorClasses(template.color)}`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                              <Icon size={24} />
                              <div>
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {template.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Tone & Expression Analysis */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tone & Expression Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appTemplates.filter(t => ['google-vision', 'azure-face', 'hume-ai'].includes(t.id)).map((template) => {
                      const Icon = template.icon;
                      return (
                        <Card
                          key={template.id}
                          className={`cursor-pointer hover:shadow-lg transition-all border-2 ${getColorClasses(template.color)}`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                              <Icon size={24} />
                              <div>
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {template.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Integration */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Integration</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {appTemplates.filter(t => t.id === 'custom').map((template) => {
                      const Icon = template.icon;
                      return (
                        <Card
                          key={template.id}
                          className={`cursor-pointer hover:shadow-lg transition-all border-2 ${getColorClasses(template.color)}`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-center space-x-3">
                              <Icon size={24} />
                              <div>
                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                <CardDescription className="text-sm mt-1">
                                  {template.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 py-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <selectedTemplate.icon size={24} />
                  <div>
                    <h3 className="font-semibold">{selectedTemplate.name}</h3>
                    <p className="text-sm text-gray-600">{selectedTemplate.description}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedTemplate.fields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name}>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={field.name}
                          value={formData[field.name] || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                          placeholder={field.placeholder}
                          required={field.required}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={field.name}
                          type={field.type}
                          value={formData[field.name] || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, [field.name]: e.target.value }))}
                          placeholder={field.placeholder}
                          required={field.required}
                        />
                      )}
                      {field.description && (
                        <p className="text-xs text-gray-500">{field.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedTemplate(null);
                      setFormData({});
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={createIntegrationMutation.isPending}>
                    {createIntegrationMutation.isPending ? "Adding..." : "Add Integration"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Integrations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Active Integrations</h2>
        
        {mockIntegrations.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations configured</h3>
              <p className="text-gray-600 mb-4">Connect with external platforms to automate your hiring workflow.</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus size={16} className="mr-2" />
                Add Integration
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {mockIntegrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIntegrationIconBg(integration.name)}`}>
                        {getIntegrationIcon(integration.name)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription>
                          Connected on {new Date(integration.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={integration.status === "active" ? "default" : "secondary"}>
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">API Key</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type={showApiKeys[integration.id] ? "text" : "password"}
                          value={integration.apiKey}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowApiKeys(prev => ({ ...prev, [integration.id]: !prev[integration.id] }))}
                        >
                          {showApiKeys[integration.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyApiKey(integration.apiKey)}
                        >
                          <Copy size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    {integration.webhookUrl && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Webhook URL</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="url"
                            value={integration.webhookUrl}
                            readOnly
                            className="text-sm"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(integration.webhookUrl, '_blank')}
                          >
                            <ExternalLink size={16} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="outline" size="sm">
                      <Edit size={14} className="mr-2" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Test Connection
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 size={14} className="mr-2" />
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Code className="mr-2" size={20} />
            API Documentation
          </CardTitle>
          <CardDescription>
            Integration endpoints and webhook information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">External API Endpoints</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code>POST /api/external/job-application</code>
                  <Badge variant="outline">Submit Application</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code>GET /api/interviews/:id</code>
                  <Badge variant="outline">Get Interview</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code>POST /api/interviews/invite</code>
                  <Badge variant="outline">Send Invitation</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Webhook Events</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code>interview.completed</code>
                  <Badge variant="secondary">Score Available</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code>application.submitted</code>
                  <Badge variant="secondary">New Candidate</Badge>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <code>interview.started</code>
                  <Badge variant="secondary">In Progress</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">
              <ExternalLink size={16} className="mr-2" />
              View Full API Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
            </Dialog>
          </div>
        </div>
    </div>
  );
}