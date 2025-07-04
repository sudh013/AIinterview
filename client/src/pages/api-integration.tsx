import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, Plus, Key, Globe, Trash2, Edit, Eye, EyeOff, ExternalLink, Code, Settings, Zap, Mail, Mic, Camera, Brain, Volume2, MessageCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface ApiIntegration {
  id: number;
  name: string;
  type: "ats" | "communication" | "ai" | "email" | "automation" | "custom";
  apiKey: string;
  webhookUrl?: string;
  supportsWebhooks: boolean;
  syncMethod: "webhook" | "polling" | "manual";
  pollInterval?: number; // minutes
  status: "active" | "pending" | "error" | "sync_failed";
  lastSync?: string;
  createdAt: string;
  features: {
    bidirectionalSync: boolean;
    realTimeUpdates: boolean;
    bulkOperations: boolean;
    rateLimited: boolean;
  };
}

export default function ApiIntegration() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<ApiIntegration | null>(null);
  const [showApiKeys, setShowApiKeys] = useState<Record<number, boolean>>({});
  const [newIntegration, setNewIntegration] = useState({
    name: "",
    type: "",
    apiKey: "",
    webhookUrl: "",
    syncMethod: "polling",
    pollInterval: 15
  });

  const triggerDataSync = async () => {
    try {
      toast({
        title: "Sync Started",
        description: "Triggering data synchronization with all configured platforms...",
      });
      console.log("Triggering data sync...");
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to trigger data synchronization",
        variant: "destructive",
      });
    }
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const handleAddIntegration = () => {
    toast({
      title: "Integration Added",
      description: `${newIntegration.name || newIntegration.type} integration has been added successfully.`,
    });
    setNewIntegration({ 
      name: "", 
      type: "", 
      apiKey: "", 
      webhookUrl: "",
      syncMethod: "polling",
      pollInterval: 15
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditIntegration = (integration: ApiIntegration) => {
    setEditingIntegration(integration);
    setIsEditDialogOpen(true);
  };

  const handleUpdateIntegration = () => {
    toast({
      title: "Integration Updated",
      description: `${editingIntegration?.name} integration has been updated successfully.`,
    });
    setEditingIntegration(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteIntegration = (integration: ApiIntegration) => {
    toast({
      title: "Integration Deleted",
      description: `${integration.name} integration has been removed.`,
      variant: "destructive",
    });
  };

  const mockIntegrations: ApiIntegration[] = [
    {
      id: 1,
      name: "Greenhouse",
      type: "ats",
      apiKey: "gh_api_1234567890abcdef",
      webhookUrl: "https://api.greenhouse.io/webhook",
      supportsWebhooks: true,
      syncMethod: "webhook",
      status: "active",
      lastSync: "2025-06-30T15:00:00Z",
      createdAt: "2025-06-29T10:00:00Z",
      features: {
        bidirectionalSync: true,
        realTimeUpdates: true,
        bulkOperations: true,
        rateLimited: true
      }
    },
    {
      id: 2,
      name: "Workday",
      type: "ats",
      apiKey: "wd_api_workday123456",
      supportsWebhooks: false,
      syncMethod: "polling",
      pollInterval: 30,
      status: "active",
      lastSync: "2025-06-30T14:30:00Z",
      createdAt: "2025-06-29T09:00:00Z",
      features: {
        bidirectionalSync: true,
        realTimeUpdates: false,
        bulkOperations: true,
        rateLimited: true
      }
    },
    {
      id: 3,
      name: "Lever",
      type: "ats",
      apiKey: "lever_api_987654321",
      webhookUrl: "https://api.lever.co/webhook",
      supportsWebhooks: true,
      syncMethod: "webhook",
      status: "active",
      lastSync: "2025-06-30T15:05:00Z",
      createdAt: "2025-06-29T08:00:00Z",
      features: {
        bidirectionalSync: true,
        realTimeUpdates: true,
        bulkOperations: false,
        rateLimited: true
      }
    },
    {
      id: 4,
      name: "BambooHR",
      type: "ats",
      apiKey: "bamboo_api_bamboo456",
      supportsWebhooks: false,
      syncMethod: "polling",
      pollInterval: 60,
      status: "active",
      lastSync: "2025-06-30T14:00:00Z",
      createdAt: "2025-06-29T07:00:00Z",
      features: {
        bidirectionalSync: false,
        realTimeUpdates: false,
        bulkOperations: true,
        rateLimited: true
      }
    },
    {
      id: 5,
      name: "Zapier",
      type: "automation",
      apiKey: "zap_api_zapier789012",
      webhookUrl: "https://hooks.zapier.com/hooks/catch/123456/abc123/",
      supportsWebhooks: true,
      syncMethod: "webhook",
      status: "active",
      lastSync: "2025-06-30T15:10:00Z",
      createdAt: "2025-06-30T06:00:00Z",
      features: {
        bidirectionalSync: true,
        realTimeUpdates: true,
        bulkOperations: false,
        rateLimited: false
      }
    },
    {
      id: 6,
      name: "Slack",
      type: "communication",
      apiKey: "xoxb-1234567890-abcdefghij",
      supportsWebhooks: false,
      syncMethod: "manual",
      status: "active",
      lastSync: "2025-06-30T12:00:00Z",
      createdAt: "2025-06-28T15:30:00Z",
      features: {
        bidirectionalSync: false,
        realTimeUpdates: false,
        bulkOperations: false,
        rateLimited: true
      }
    },
    {
      id: 7,
      name: "Microsoft Teams",
      type: "communication",
      apiKey: "teams_api_microsoft345",
      supportsWebhooks: false,
      syncMethod: "manual",
      status: "active",
      lastSync: "2025-06-30T11:30:00Z",
      createdAt: "2025-06-30T14:00:00Z",
      features: {
        bidirectionalSync: false,
        realTimeUpdates: false,
        bulkOperations: false,
        rateLimited: true
      }
    },
    {
      id: 8,
      name: "Brevo (Sendinblue)",
      type: "email",
      apiKey: "xkeysib-abc123def456789",
      supportsWebhooks: true,
      syncMethod: "webhook",
      webhookUrl: "https://api.brevo.com/webhook",
      status: "active",
      lastSync: "2025-06-30T15:08:00Z",
      createdAt: "2025-06-30T09:15:00Z",
      features: {
        bidirectionalSync: false,
        realTimeUpdates: true,
        bulkOperations: true,
        rateLimited: true
      }
    },
    {
      id: 9,
      name: "Mailgun",
      type: "email",
      apiKey: "key-mailgun123456789",
      supportsWebhooks: true,
      syncMethod: "webhook",
      webhookUrl: "https://api.mailgun.net/webhook",
      status: "active",
      lastSync: "2025-06-30T15:02:00Z",
      createdAt: "2025-06-30T13:00:00Z",
      features: {
        bidirectionalSync: false,
        realTimeUpdates: true,
        bulkOperations: true,
        rateLimited: true
      }
    },
    {
      id: 10,
      name: "OpenAI Whisper",
      type: "ai",
      apiKey: "sk-proj-whisper123456789",
      supportsWebhooks: false,
      syncMethod: "manual",
      status: "active",
      lastSync: "2025-06-30T10:00:00Z",
      createdAt: "2025-06-30T08:45:00Z",
      features: {
        bidirectionalSync: false,
        realTimeUpdates: false,
        bulkOperations: false,
        rateLimited: true
      }
    },
    {
      id: 11,
      name: "Google Vision AI",
      type: "ai",
      apiKey: "AIzaSyC_vision_api_key_123",
      supportsWebhooks: false,
      syncMethod: "manual",
      status: "active",
      lastSync: "2025-06-30T09:30:00Z",
      createdAt: "2025-06-30T07:30:00Z",
      features: {
        bidirectionalSync: false,
        realTimeUpdates: false,
        bulkOperations: true,
        rateLimited: true
      }
    },
    {
      id: 12,
      name: "Azure Face API",
      type: "ai",
      apiKey: "azure_face_api_key_456",
      supportsWebhooks: false,
      syncMethod: "manual",
      status: "active",
      lastSync: "2025-06-30T08:00:00Z",
      createdAt: "2025-06-30T12:00:00Z",
      features: {
        bidirectionalSync: false,
        realTimeUpdates: false,
        bulkOperations: true,
        rateLimited: true
      }
    },
    {
      id: 13,
      name: "Hume AI",
      type: "ai",
      apiKey: "hume_emotion_api_789",
      supportsWebhooks: false,
      syncMethod: "manual",
      status: "active",
      lastSync: "2025-06-30T07:45:00Z",
      createdAt: "2025-06-30T11:00:00Z",
      features: {
        bidirectionalSync: false,
        realTimeUpdates: false,
        bulkOperations: false,
        rateLimited: true
      }
    },
    {
      id: 14,
      name: "AssemblyAI",
      type: "ai",
      apiKey: "assembly_transcription_012",
      supportsWebhooks: true,
      syncMethod: "webhook",
      webhookUrl: "https://api.assemblyai.com/webhook",
      status: "active",
      lastSync: "2025-06-30T15:12:00Z",
      createdAt: "2025-06-30T10:00:00Z",
      features: {
        bidirectionalSync: false,
        realTimeUpdates: true,
        bulkOperations: true,
        rateLimited: true
      }
    },
    {
      id: 15,
      name: "Deepgram",
      type: "ai",
      apiKey: "dg_transcription_key_456",
      supportsWebhooks: false,
      syncMethod: "polling",
      pollInterval: 15,
      status: "sync_failed",
      lastSync: "2025-06-30T13:45:00Z",
      createdAt: "2025-06-30T06:00:00Z",
      features: {
        bidirectionalSync: false,
        realTimeUpdates: false,
        bulkOperations: true,
        rateLimited: true
      }
    },
    {
      id: 16,
      name: "Custom REST API",
      type: "custom",
      apiKey: "custom_rest_api_key_345",
      webhookUrl: "https://your-custom-api.com/webhook",
      supportsWebhooks: true,
      syncMethod: "webhook",
      status: "active",
      lastSync: "2025-06-30T15:15:00Z",
      createdAt: "2025-06-30T05:00:00Z",
      features: {
        bidirectionalSync: true,
        realTimeUpdates: true,
        bulkOperations: true,
        rateLimited: false
      }
    }
  ];

  const getIntegrationIcon = (name: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "Greenhouse": <Globe size={20} className="text-green-600" />,
      "Workday": <Globe size={20} className="text-blue-600" />,
      "Lever": <Globe size={20} className="text-purple-600" />,
      "BambooHR": <Globe size={20} className="text-green-600" />,
      "Zapier": <Zap size={20} className="text-orange-600" />,
      "Slack": <MessageCircle size={20} className="text-purple-600" />,
      "Microsoft Teams": <MessageCircle size={20} className="text-blue-600" />,
      "Brevo (Sendinblue)": <Mail size={20} className="text-blue-600" />,
      "Mailgun": <Mail size={20} className="text-red-600" />,
      "OpenAI Whisper": <Mic size={20} className="text-green-600" />,
      "Google Vision AI": <Camera size={20} className="text-yellow-600" />,
      "Azure Face API": <Brain size={20} className="text-blue-600" />,
      "Hume AI": <Brain size={20} className="text-purple-600" />,
      "AssemblyAI": <MessageCircle size={20} className="text-indigo-600" />,
      "Deepgram": <Volume2 size={20} className="text-purple-600" />,
      "Custom REST API": <Code size={20} className="text-gray-600" />,
    };
    return iconMap[name] || <Globe size={20} className="text-blue-600" />;
  };

  const getIntegrationIconBg = (name: string) => {
    const bgMap: Record<string, string> = {
      "Greenhouse": "bg-green-100",
      "Workday": "bg-blue-100",
      "Lever": "bg-purple-100",
      "BambooHR": "bg-green-100",
      "Zapier": "bg-orange-100",
      "Slack": "bg-purple-100",
      "Microsoft Teams": "bg-blue-100",
      "Brevo (Sendinblue)": "bg-blue-100",
      "Mailgun": "bg-red-100",
      "OpenAI Whisper": "bg-green-100",
      "Google Vision AI": "bg-yellow-100",
      "Azure Face API": "bg-blue-100",
      "Hume AI": "bg-purple-100",
      "AssemblyAI": "bg-indigo-100",
      "Deepgram": "bg-purple-100",
      "Custom REST API": "bg-gray-100",
    };
    return bgMap[name] || "bg-blue-100";
  };

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
          <Button 
            variant="outline"
            onClick={() => window.open('/demo-interview', '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Test Interview
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Add Integration
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Active Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Integrations</CardTitle>
          <CardDescription>
            Manage your connected platforms and their synchronization settings
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                        <h3 className="font-semibold text-lg">{integration.name}</h3>
                        <p className="text-sm text-gray-500">
                          Connected {new Date(integration.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={integration.status === "active" ? "default" : integration.status === "pending" ? "secondary" : "destructive"}>
                        {integration.status}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditIntegration(integration)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteIntegration(integration)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* API Key */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Key:</span>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {showApiKeys[integration.id] 
                            ? integration.apiKey 
                            : `${integration.apiKey.substring(0, 8)}...`}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowApiKeys(prev => ({
                            ...prev,
                            [integration.id]: !prev[integration.id]
                          }))}
                        >
                          {showApiKeys[integration.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyApiKey(integration.apiKey)}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>

                    {/* Sync Method */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sync Method:</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant={integration.syncMethod === "webhook" ? "default" : integration.syncMethod === "polling" ? "secondary" : "outline"}>
                          {integration.syncMethod === "webhook" ? "Real-time (Webhook)" : 
                           integration.syncMethod === "polling" ? `Polling (${integration.pollInterval}min)` : 
                           "Manual"}
                        </Badge>
                      </div>
                    </div>

                    {/* Webhook Support */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Webhook Support:</span>
                      <div className="flex items-center space-x-2">
                        {integration.supportsWebhooks ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            ✓ Supported
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            ✗ Not Available
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Last Sync */}
                    {integration.lastSync && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Sync:</span>
                        <span className="text-xs text-gray-500">
                          {new Date(integration.lastSync).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Features */}
                    <div className="border-t pt-3">
                      <span className="text-sm font-medium mb-2 block">Features:</span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${integration.features.bidirectionalSync ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Bidirectional Sync
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${integration.features.realTimeUpdates ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Real-time Updates
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${integration.features.bulkOperations ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          Bulk Operations
                        </div>
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${integration.features.rateLimited ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                          {integration.features.rateLimited ? 'Rate Limited' : 'No Rate Limits'}
                        </div>
                      </div>
                    </div>

                    {/* Webhook URL if available */}
                    {integration.webhookUrl && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-green-800">Webhook URL:</span>
                          <Badge variant="outline" className="text-green-700 border-green-300">Active</Badge>
                        </div>
                        <code className="text-xs bg-white p-2 rounded border text-green-700 block">
                          {integration.webhookUrl}
                        </code>
                      </div>
                    )}

                    {/* Alternative sync info for non-webhook APIs */}
                    {!integration.supportsWebhooks && integration.syncMethod === "polling" && (
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-orange-800">Polling Schedule:</span>
                        </div>
                        <div className="text-xs text-orange-700">
                          • Data is synced every {integration.pollInterval} minutes
                          • {integration.features.bidirectionalSync ? 'Full bidirectional sync' : 'One-way data import only'}
                          • Next sync in {Math.floor(Math.random() * 15) + 1} minutes
                        </div>
                      </div>
                    )}

                    {/* Manual sync info */}
                    {integration.syncMethod === "manual" && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <span className="text-sm font-medium text-gray-800">Manual Integration:</span>
                        </div>
                        <div className="text-xs text-gray-700">
                          • Used for notifications and one-way communication
                          • No automatic data synchronization
                          • Triggered by platform events and user actions
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle>Data Synchronization Status</CardTitle>
          <CardDescription>
            Monitor your bidirectional data flow with external platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Jobs Synced Today</h3>
              <p className="text-2xl font-bold text-green-900">12</p>
              <p className="text-sm text-green-600">From 3 platforms</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Applicants Synced</h3>
              <p className="text-2xl font-bold text-blue-900">47</p>
              <p className="text-sm text-blue-600">Last hour</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">Next Sync</h3>
              <p className="text-2xl font-bold text-purple-900">15m</p>
              <p className="text-sm text-purple-600">All platforms</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Integration Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Integration</DialogTitle>
            <DialogDescription>
              Connect a new platform or service to your AI interview system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="integration-type">Integration Type</Label>
              <Select value={newIntegration.type} onValueChange={(value) => setNewIntegration({...newIntegration, type: value, name: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select integration type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Greenhouse">Greenhouse (ATS)</SelectItem>
                  <SelectItem value="Workday">Workday (ATS)</SelectItem>
                  <SelectItem value="Lever">Lever (ATS)</SelectItem>
                  <SelectItem value="BambooHR">BambooHR (ATS)</SelectItem>
                  <SelectItem value="Zapier">Zapier (Automation)</SelectItem>
                  <SelectItem value="Slack">Slack (Communication)</SelectItem>
                  <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                  <SelectItem value="Brevo (Sendinblue)">Brevo Email Service</SelectItem>
                  <SelectItem value="Mailgun">Mailgun Email Service</SelectItem>
                  <SelectItem value="OpenAI Whisper">OpenAI Whisper (Audio)</SelectItem>
                  <SelectItem value="Google Vision AI">Google Vision AI</SelectItem>
                  <SelectItem value="Azure Face API">Azure Face API</SelectItem>
                  <SelectItem value="Hume AI">Hume AI (Emotion)</SelectItem>
                  <SelectItem value="AssemblyAI">AssemblyAI (Speech)</SelectItem>
                  <SelectItem value="Deepgram">Deepgram (Audio)</SelectItem>
                  <SelectItem value="Custom REST API">Custom REST API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="custom-name">Custom Name (Optional)</Label>
              <Input
                id="custom-name"
                placeholder="Enter custom integration name"
                value={newIntegration.name}
                onChange={(e) => setNewIntegration({...newIntegration, name: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                placeholder="Enter API key"
                value={newIntegration.apiKey}
                onChange={(e) => setNewIntegration({...newIntegration, apiKey: e.target.value})}
                type="password"
              />
            </div>
            
            <div>
              <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
              <Input
                id="webhook-url"
                placeholder="https://your-webhook-url.com"
                value={newIntegration.webhookUrl}
                onChange={(e) => setNewIntegration({...newIntegration, webhookUrl: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddIntegration}>
              Add Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Integration Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Integration</DialogTitle>
            <DialogDescription>
              Update API keys and settings for {editingIntegration?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-api-key">API Key</Label>
              <Input
                id="edit-api-key"
                placeholder="Enter new API key"
                defaultValue={editingIntegration?.apiKey}
                type="password"
              />
            </div>
            
            <div>
              <Label htmlFor="edit-webhook-url">Webhook URL</Label>
              <Input
                id="edit-webhook-url"
                placeholder="https://your-webhook-url.com"
                defaultValue={editingIntegration?.webhookUrl || ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateIntegration}>
              Update Integration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}