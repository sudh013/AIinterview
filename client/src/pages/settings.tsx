import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon, 
  Mail, 
  Key, 
  Brain, 
  Shield, 
  Clock, 
  Globe,
  BookOpen,
  Briefcase,
  Users,
  Video,
  MessageSquare,
  Calendar,
  Star,
  TrendingUp,
  Plug,
  ExternalLink,
  Database,
  Zap,
  UserCheck,
  Building,
  FileText
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Email Settings
    emailProvider: "brevo",
    emailFrom: "noreply@aiinterview.com",
    emailFromName: "AI Interview Platform",
    
    // AI Settings
    openaiModel: "gpt-4o",
    questionCount: 5,
    videoAnalysisEnabled: true,
    fallbackQuestionsEnabled: true,
    
    // Interview Settings
    maxInterviewDuration: 30,
    videoQualityLimit: "720p",
    autoExpireHours: 72,
    
    // Security Settings
    apiKeyRotationDays: 90,
    requireHttps: true,
    enableCors: true,
    
    // Notifications
    emailNotifications: true,
    scoreThresholdAlert: 8.0,
    dailyReports: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings & Documentation</h1>
          <p className="text-gray-600">Manage platform settings and learn about all features</p>
        </div>
      </div>

      <Tabs defaultValue="documentation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="developer">Developer Guide</TabsTrigger>
          <TabsTrigger value="platform">Platform Settings</TabsTrigger>
          <TabsTrigger value="integrations">Integration Settings</TabsTrigger>
          <TabsTrigger value="security">Security & API</TabsTrigger>
        </TabsList>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Platform Documentation
              </CardTitle>
              <CardDescription>
                Complete guide to managing all features and functionality in the AI Interview Platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Core Management Features */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  Core Management Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Jobs Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Create and manage job postings with AI-powered interview questions
                      </p>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Create job postings with requirements and expertise levels</li>
                        <li>• Auto-generate tailored interview questions using OpenAI</li>
                        <li>• Set job status (active, paused, closed)</li>
                        <li>• View applicant statistics per job</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">Dashboard → Jobs</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Applicants Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Track and manage candidate applications and profiles
                      </p>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• View all candidate applications and profiles</li>
                        <li>• Filter by job position, status, and application date</li>
                        <li>• Send interview invitations manually or automatically</li>
                        <li>• Track application progress through the pipeline</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">Dashboard → Applicants</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Interview Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Conduct and review video interviews with AI analysis
                      </p>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• View all scheduled and completed interviews</li>
                        <li>• Access recorded video interviews</li>
                        <li>• Review AI-generated scores and analysis</li>
                        <li>• Test interview flow with demo interview feature</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">Dashboard → Interviews</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Questions Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Customize interview questions alongside AI-generated content
                      </p>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Create custom interview questions by category</li>
                        <li>• Set difficulty levels and question types</li>
                        <li>• Review and edit AI-generated questions</li>
                        <li>• Organize questions by skill and expertise level</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">Dashboard → Questions</Badge>
                    </CardContent>
                  </Card>

                </div>
              </div>

              <Separator />

              {/* Advanced Features */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Advanced Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Calendar Integration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        One-click interview scheduling with calendar providers
                      </p>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Connect Google Calendar, Outlook, and Calendly</li>
                        <li>• Set available time slots for interviews</li>
                        <li>• Auto-generate meeting URLs and invitations</li>
                        <li>• Sync interview schedules across platforms</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">Dashboard → Calendar</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        AI Scoring System
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Advanced AI-powered candidate evaluation and scoring
                      </p>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• AI analysis of technical skills and communication</li>
                        <li>• Confidence and presentation scoring</li>
                        <li>• Human override capabilities for final decisions</li>
                        <li>• Detailed feedback and improvement suggestions</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">Dashboard → Scoring</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-pink-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Advanced Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Comprehensive reporting and bias analysis tools
                      </p>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Interview completion and performance trends</li>
                        <li>• Candidate comparison and ranking reports</li>
                        <li>• Bias detection and fairness analysis</li>
                        <li>• Export capabilities for detailed reporting</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">Dashboard → Advanced Analytics</Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-teal-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Plug className="h-4 w-4" />
                        API Integrations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">
                        Connect with major HR platforms and ATS systems
                      </p>
                      <ul className="text-sm space-y-1 text-gray-700">
                        <li>• Greenhouse, Workday, Lever, BambooHR integration</li>
                        <li>• Zapier workflows and custom REST APIs</li>
                        <li>• Bidirectional data synchronization</li>
                        <li>• Slack and Teams notifications</li>
                      </ul>
                      <Badge variant="outline" className="mt-2">Dashboard → API Integration</Badge>
                    </CardContent>
                  </Card>

                </div>
              </div>

              <Separator />

              {/* Role-Based Access */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-600" />
                  Role-Based Access Control
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <Card className="bg-red-50 border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Shield className="h-4 w-4 text-red-600" />
                        Admin
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1 text-gray-700">
                        <li>• Full platform access</li>
                        <li>• API key management</li>
                        <li>• Settings configuration</li>
                        <li>• Integration management</li>
                        <li>• Advanced analytics</li>
                        <li>• Security controls</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        HR/Recruiter
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1 text-gray-700">
                        <li>• Job management</li>
                        <li>• Candidate reviews</li>
                        <li>• Interview scheduling</li>
                        <li>• Question customization</li>
                        <li>• Basic analytics</li>
                        <li>• Calendar integration</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Star className="h-4 w-4 text-green-600" />
                        Support Reviewer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1 text-gray-700">
                        <li>• Interview reviews</li>
                        <li>• Candidate viewing</li>
                        <li>• Score verification</li>
                        <li>• Basic reporting</li>
                        <li>• Dashboard access</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-600" />
                        Candidate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1 text-gray-700">
                        <li>• Interview participation</li>
                        <li>• Video recording</li>
                        <li>• Question responses</li>
                        <li>• Interview status</li>
                      </ul>
                    </CardContent>
                  </Card>

                </div>
              </div>

              <Separator />

              {/* Technical Architecture */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Technical Architecture
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Frontend Technology</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1 text-gray-700">
                        <li>• React 18 with TypeScript</li>
                        <li>• Tailwind CSS + Radix UI</li>
                        <li>• TanStack Query for API state</li>
                        <li>• Wouter for routing</li>
                        <li>• Vite for build tooling</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Backend Technology</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1 text-gray-700">
                        <li>• Node.js with Express.js</li>
                        <li>• PostgreSQL with Drizzle ORM</li>
                        <li>• OpenAI API integration</li>
                        <li>• Brevo email service</li>
                        <li>• API key authentication</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">External Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1 text-gray-700">
                        <li>• OpenAI GPT-4o for AI analysis</li>
                        <li>• Google Calendar API</li>
                        <li>• Microsoft Outlook API</li>
                        <li>• Calendly integration</li>
                        <li>• Slack & Teams webhooks</li>
                      </ul>
                    </CardContent>
                  </Card>

                </div>
              </div>

              <Separator />

              {/* Getting Started Guide */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Quick Start Guide
                </h3>
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3 text-blue-800">For Administrators</h4>
                        <ol className="text-sm space-y-2 text-gray-700">
                          <li><strong>1.</strong> Configure API integrations in API Integration page</li>
                          <li><strong>2.</strong> Set up calendar providers in Calendar page</li>
                          <li><strong>3.</strong> Configure platform settings in Settings page</li>
                          <li><strong>4.</strong> Create initial job postings in Jobs page</li>
                          <li><strong>5.</strong> Customize interview questions in Questions page</li>
                        </ol>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3 text-purple-800">For HR/Recruiters</h4>
                        <ol className="text-sm space-y-2 text-gray-700">
                          <li><strong>1.</strong> Create job postings with requirements</li>
                          <li><strong>2.</strong> Review incoming applications in Applicants</li>
                          <li><strong>3.</strong> Schedule interviews using Calendar integration</li>
                          <li><strong>4.</strong> Review completed interviews and AI scores</li>
                          <li><strong>5.</strong> Generate reports using Advanced Analytics</li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Developer Documentation
              </CardTitle>
              <CardDescription>
                Complete technical guide for developers to understand, modify, and extend the AI Interview Platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* Project Architecture */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  Project Architecture
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Frontend Stack</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Core Framework</h4>
                          <ul className="text-xs space-y-1 text-gray-700">
                            <li>• <strong>React 18</strong> with TypeScript for type safety</li>
                            <li>• <strong>Vite</strong> for fast development and build process</li>
                            <li>• <strong>Wouter</strong> for lightweight client-side routing</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">State Management</h4>
                          <ul className="text-xs space-y-1 text-gray-700">
                            <li>• <strong>TanStack Query</strong> for server state management</li>
                            <li>• React hooks for local component state</li>
                            <li>• Context API for global app state when needed</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">UI & Styling</h4>
                          <ul className="text-xs space-y-1 text-gray-700">
                            <li>• <strong>Tailwind CSS</strong> for utility-first styling</li>
                            <li>• <strong>Radix UI</strong> for accessible component primitives</li>
                            <li>• <strong>Lucide React</strong> for consistent iconography</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Backend Stack</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Core Framework</h4>
                          <ul className="text-xs space-y-1 text-gray-700">
                            <li>• <strong>Node.js</strong> with TypeScript runtime</li>
                            <li>• <strong>Express.js</strong> for REST API endpoints</li>
                            <li>• <strong>ESM modules</strong> for modern JavaScript</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">Database Layer</h4>
                          <ul className="text-xs space-y-1 text-gray-700">
                            <li>• <strong>PostgreSQL</strong> via Neon Database</li>
                            <li>• <strong>Drizzle ORM</strong> for type-safe database queries</li>
                            <li>• Connection pooling for optimal performance</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm mb-1">External Services</h4>
                          <ul className="text-xs space-y-1 text-gray-700">
                            <li>• <strong>OpenAI API</strong> for AI-powered features</li>
                            <li>• <strong>Brevo</strong> for email service integration</li>
                            <li>• <strong>Multer</strong> for file upload handling</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>

              <Separator />

              {/* File Structure */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  File Structure & Organization
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Frontend Structure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Radix UI components
│   │   └── sidebar.tsx     # Navigation sidebar
│   ├── pages/              # Route-based page components
│   │   ├── dashboard.tsx   # Main dashboard
│   │   ├── jobs.tsx        # Job management
│   │   ├── applicants.tsx  # Candidate management
│   │   ├── interviews.tsx  # Interview management
│   │   ├── calendar.tsx    # Calendar integration
│   │   ├── questions.tsx   # Question management
│   │   ├── scoring.tsx     # AI scoring system
│   │   ├── settings.tsx    # Settings & docs
│   │   └── interview.tsx   # Video interview UI
│   ├── hooks/              # Custom React hooks
│   │   └── use-toast.ts    # Toast notifications
│   ├── lib/                # Utility libraries
│   │   ├── queryClient.ts  # TanStack Query setup
│   │   ├── api.ts          # API request helpers
│   │   └── utils.ts        # Common utilities
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
└── index.html              # HTML template`}
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Backend Structure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{`server/
├── middleware/             # Express middleware
│   ├── auth.ts            # API key authentication
│   └── rbac.ts            # Role-based access control
├── services/              # Business logic services
│   ├── analytics.ts       # Analytics and reporting
│   ├── calendar.ts        # Calendar integration
│   ├── notifications.ts   # Email/Slack notifications
│   ├── dataSync.ts        # External data sync
│   └── audit.ts           # Audit logging
├── db.ts                  # Database connection
├── storage.ts             # Data access layer
├── routes.ts              # API route definitions
├── index.ts               # Server entry point
└── vite.ts                # Vite development setup

shared/
└── schema.ts              # Database schema & types

Root files:
├── drizzle.config.ts      # Database configuration
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tailwind.config.ts     # Tailwind CSS config
├── vite.config.ts         # Vite configuration
└── replit.md              # Project documentation`}
                      </pre>
                    </CardContent>
                  </Card>

                </div>
              </div>

              <Separator />

              {/* API Endpoints */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-600" />
                  Complete API Reference
                </h3>
                
                {/* Core API Endpoints */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Core Management APIs</h4>
                    <div className="space-y-3">
                      
                      <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Jobs API
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/jobs</code>
                              <span className="text-gray-600">- Retrieve all job postings</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-100">POST</Badge>
                              <code>/api/jobs</code>
                              <span className="text-gray-600">- Create new job posting</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-yellow-100">PUT</Badge>
                              <code>/api/jobs/:id</code>
                              <span className="text-gray-600">- Update job posting</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-red-100">DELETE</Badge>
                              <code>/api/jobs/:id</code>
                              <span className="text-gray-600">- Delete job posting</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-green-50 border-green-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Applicants API
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/applicants</code>
                              <span className="text-gray-600">- Get all applicants</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/applicants/:id</code>
                              <span className="text-gray-600">- Get specific applicant</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-100">POST</Badge>
                              <code>/api/applicants</code>
                              <span className="text-gray-600">- Create applicant profile</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-yellow-100">PATCH</Badge>
                              <code>/api/applicants/:id</code>
                              <span className="text-gray-600">- Update applicant status</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-purple-50 border-purple-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Interviews API
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/interviews</code>
                              <span className="text-gray-600">- List all interviews</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/interviews/:token</code>
                              <span className="text-gray-600">- Get interview by token</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-100">POST</Badge>
                              <code>/api/interviews</code>
                              <span className="text-gray-600">- Create interview session</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-100">POST</Badge>
                              <code>/api/interviews/:id/upload</code>
                              <span className="text-gray-600">- Upload video recording</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-yellow-100">PATCH</Badge>
                              <code>/api/interviews/:id/score</code>
                              <span className="text-gray-600">- Submit AI scores</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold mb-3">Advanced Feature APIs</h4>
                    <div className="space-y-3">
                      
                      <Card className="bg-indigo-50 border-indigo-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Calendar Integration API
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/calendar/providers</code>
                              <span className="text-gray-600">- Get calendar providers</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-100">POST</Badge>
                              <code>/api/calendar/providers</code>
                              <span className="text-gray-600">- Add calendar provider</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/calendar/time-slots</code>
                              <span className="text-gray-600">- Get available slots</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-100">POST</Badge>
                              <code>/api/calendar/schedule</code>
                              <span className="text-gray-600">- Schedule interview</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-pink-50 border-pink-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Analytics API
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/analytics/completion-stats</code>
                              <span className="text-gray-600">- Interview completion data</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/analytics/candidate-comparison</code>
                              <span className="text-gray-600">- Candidate rankings</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/analytics/performance-trends</code>
                              <span className="text-gray-600">- Performance over time</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/analytics/bias-analysis</code>
                              <span className="text-gray-600">- Bias detection results</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-orange-50 border-orange-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Plug className="h-4 w-4" />
                            External Integration API
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-100">POST</Badge>
                              <code>/api/external/job-application</code>
                              <span className="text-gray-600">- External job submissions</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-100">GET</Badge>
                              <code>/api/integrations</code>
                              <span className="text-gray-600">- List all integrations</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-100">POST</Badge>
                              <code>/api/integrations/sync</code>
                              <span className="text-gray-600">- Trigger data sync</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-100">POST</Badge>
                              <code>/api/webhooks/:platform</code>
                              <span className="text-gray-600">- Webhook endpoints</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Database Schema */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-cyan-600" />
                  Database Schema & Models
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Core Tables</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-xs">
                        <div>
                          <h5 className="font-semibold">jobs</h5>
                          <ul className="text-gray-600 ml-2">
                            <li>• id, title, description, company</li>
                            <li>• requirements, expertiseLevel</li>
                            <li>• status, createdAt, updatedAt</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold">applicants</h5>
                          <ul className="text-gray-600 ml-2">
                            <li>• id, email, firstName, lastName</li>
                            <li>• phone, experience, skills</li>
                            <li>• resumeUrl, createdAt</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold">job_applications</h5>
                          <ul className="text-gray-600 ml-2">
                            <li>• id, jobId, applicantId</li>
                            <li>• status, appliedAt</li>
                            <li>• Foreign keys to jobs & applicants</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold">interviews</h5>
                          <ul className="text-gray-600 ml-2">
                            <li>• id, applicationId, token</li>
                            <li>• questions, status, videoPath</li>
                            <li>• startedAt, completedAt</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Advanced Tables</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-xs">
                        <div>
                          <h5 className="font-semibold">interview_scores</h5>
                          <ul className="text-gray-600 ml-2">
                            <li>• id, interviewId, technical</li>
                            <li>• communication, confidence</li>
                            <li>• overall, feedback, createdAt</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold">calendar_providers</h5>
                          <ul className="text-gray-600 ml-2">
                            <li>• id, userId, provider, name</li>
                            <li>• config, isActive</li>
                            <li>• createdAt, updatedAt</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold">interview_schedules</h5>
                          <ul className="text-gray-600 ml-2">
                            <li>• id, interviewId, scheduledAt</li>
                            <li>• meetingUrl, status</li>
                            <li>• calendarEventId</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold">api_integrations</h5>
                          <ul className="text-gray-600 ml-2">
                            <li>• id, name, platform, apiKey</li>
                            <li>• config, isActive, lastSync</li>
                            <li>• createdAt, updatedAt</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>

              <Separator />

              {/* Development Guidelines */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Development Guidelines
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Frontend Development</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-xs">
                        <div>
                          <h5 className="font-semibold">Code Organization</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Use TypeScript for type safety</li>
                            <li>• Follow React hooks patterns</li>
                            <li>• Utilize TanStack Query for API calls</li>
                            <li>• Keep components modular and reusable</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold">Styling Guidelines</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Use Tailwind CSS utility classes</li>
                            <li>• Leverage Radix UI for accessibility</li>
                            <li>• Maintain consistent spacing and colors</li>
                            <li>• Use Lucide React for icons</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold">State Management</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Use TanStack Query for server state</li>
                            <li>• React hooks for local component state</li>
                            <li>• Minimize global state complexity</li>
                            <li>• Implement proper error boundaries</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Backend Development</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-xs">
                        <div>
                          <h5 className="font-semibold">API Design</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Follow RESTful conventions</li>
                            <li>• Use proper HTTP status codes</li>
                            <li>• Implement comprehensive error handling</li>
                            <li>• Validate request data with Zod schemas</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold">Database Access</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Use Drizzle ORM for type safety</li>
                            <li>• Implement proper database relations</li>
                            <li>• Use connection pooling efficiently</li>
                            <li>• Follow migration best practices</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold">Security</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Validate all API inputs</li>
                            <li>• Use API key authentication</li>
                            <li>• Implement rate limiting</li>
                            <li>• Sanitize user-generated content</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>

              <Separator />

              {/* Extension Points */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Plug className="h-5 w-5 text-purple-600" />
                  Extension & Customization Points
                </h3>
                <div className="space-y-4">
                  
                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Adding New Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <h5 className="font-semibold mb-2">New Page/Route</h5>
                          <ol className="space-y-1 text-gray-700">
                            <li>1. Create component in <code>client/src/pages/</code></li>
                            <li>2. Add route to <code>App.tsx</code></li>
                            <li>3. Update sidebar navigation</li>
                            <li>4. Add any required API endpoints</li>
                          </ol>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-2">New Database Entity</h5>
                          <ol className="space-y-1 text-gray-700">
                            <li>1. Define schema in <code>shared/schema.ts</code></li>
                            <li>2. Create relations if needed</li>
                            <li>3. Update storage interface</li>
                            <li>4. Run <code>npm run db:push</code></li>
                          </ol>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-2">New Integration</h5>
                          <ol className="space-y-1 text-gray-700">
                            <li>1. Add service in <code>server/services/</code></li>
                            <li>2. Update integration types</li>
                            <li>3. Add to API integration page</li>
                            <li>4. Implement webhook handlers</li>
                          </ol>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-2">Custom AI Features</h5>
                          <ol className="space-y-1 text-gray-700">
                            <li>1. Extend OpenAI service methods</li>
                            <li>2. Add new scoring criteria</li>
                            <li>3. Update analytics calculations</li>
                            <li>4. Enhance UI components</li>
                          </ol>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Environment & Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <h5 className="font-semibold mb-2">Environment Variables</h5>
                          <ul className="space-y-1 text-gray-700">
                            <li>• <code>DATABASE_URL</code> - PostgreSQL connection</li>
                            <li>• <code>OPENAI_API_KEY</code> - AI service access</li>
                            <li>• <code>BREVO_API_KEY</code> - Email service</li>
                            <li>• <code>SESSION_SECRET</code> - Session security</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-2">Development Commands</h5>
                          <ul className="space-y-1 text-gray-700">
                            <li>• <code>npm run dev</code> - Start development server</li>
                            <li>• <code>npm run build</code> - Build for production</li>
                            <li>• <code>npm run db:push</code> - Push schema changes</li>
                            <li>• <code>npm run db:studio</code> - Open database GUI</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>

              <Separator />

              {/* Troubleshooting */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Common Issues & Troubleshooting
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Development Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-xs">
                        <div>
                          <h5 className="font-semibold text-red-700">Database Connection Errors</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Check DATABASE_URL environment variable</li>
                            <li>• Verify Neon database is running</li>
                            <li>• Test connection with <code>npm run db:studio</code></li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-red-700">OpenAI API Failures</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Verify OPENAI_API_KEY is set correctly</li>
                            <li>• Check API rate limits and quotas</li>
                            <li>• Implement fallback question generation</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-red-700">File Upload Issues</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Check uploads directory permissions</li>
                            <li>• Verify file size limits in multer config</li>
                            <li>• Ensure proper video format handling</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Production Considerations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-xs">
                        <div>
                          <h5 className="font-semibold text-blue-700">Performance Optimization</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Implement database connection pooling</li>
                            <li>• Add Redis caching for frequently accessed data</li>
                            <li>• Optimize video compression and storage</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-700">Security Hardening</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Enable HTTPS for all API endpoints</li>
                            <li>• Implement API rate limiting</li>
                            <li>• Regular security audits and updates</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-blue-700">Monitoring & Logging</h5>
                          <ul className="text-gray-700 space-y-1">
                            <li>• Set up application performance monitoring</li>
                            <li>• Implement comprehensive error logging</li>
                            <li>• Monitor API usage and database performance</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Platform Configuration
              </CardTitle>
              <CardDescription>
                Configure core platform settings and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* AI Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai-model">OpenAI Model</Label>
                    <Select value={settings.openaiModel} onValueChange={(value) => setSettings(prev => ({ ...prev, openaiModel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4O (Recommended)</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-count">Questions Per Interview</Label>
                    <Input 
                      id="question-count" 
                      type="number" 
                      value={settings.questionCount}
                      onChange={(e) => setSettings(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                      min="3" 
                      max="10" 
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="video-analysis" 
                    checked={settings.videoAnalysisEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, videoAnalysisEnabled: checked }))}
                  />
                  <Label htmlFor="video-analysis">Enable AI Video Analysis</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="fallback-questions" 
                    checked={settings.fallbackQuestionsEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, fallbackQuestionsEnabled: checked }))}
                  />
                  <Label htmlFor="fallback-questions">Enable Fallback Questions</Label>
                </div>
              </div>

              <Separator />

              {/* Interview Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Interview Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-duration">Max Interview Duration (minutes)</Label>
                    <Input 
                      id="max-duration" 
                      type="number" 
                      value={settings.maxInterviewDuration}
                      onChange={(e) => setSettings(prev => ({ ...prev, maxInterviewDuration: parseInt(e.target.value) }))}
                      min="15" 
                      max="120" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="video-quality">Video Quality Limit</Label>
                    <Select value={settings.videoQualityLimit} onValueChange={(value) => setSettings(prev => ({ ...prev, videoQualityLimit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1080p">1080p (High)</SelectItem>
                        <SelectItem value="720p">720p (Standard)</SelectItem>
                        <SelectItem value="480p">480p (Basic)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auto-expire">Auto-expire Interviews (hours)</Label>
                    <Input 
                      id="auto-expire" 
                      type="number" 
                      value={settings.autoExpireHours}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoExpireHours: parseInt(e.target.value) }))}
                      min="24" 
                      max="168" 
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Email Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-from">From Email Address</Label>
                    <Input 
                      id="email-from" 
                      type="email" 
                      value={settings.emailFrom}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailFrom: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-from-name">From Name</Label>
                    <Input 
                      id="email-from-name" 
                      value={settings.emailFromName}
                      onChange={(e) => setSettings(prev => ({ ...prev, emailFromName: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="email-notifications" 
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                  <Label htmlFor="email-notifications">Enable Email Notifications</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="daily-reports" 
                    checked={settings.dailyReports}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, dailyReports: checked }))}
                  />
                  <Label htmlFor="daily-reports">Send Daily Reports</Label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="w-full md:w-auto">
                  Save Platform Settings
                </Button>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Integration Settings
              </CardTitle>
              <CardDescription>
                Configure external service integrations and API connections
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="text-center py-8">
                <Plug className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Integration Management</h3>
                <p className="text-gray-600 mb-4">
                  Manage all your external integrations from the dedicated API Integration page
                </p>
                <Button variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Go to API Integration Page
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-sm">ATS Platforms</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-1">
                      <li>• Greenhouse</li>
                      <li>• Workday</li>
                      <li>• Lever</li>
                      <li>• BambooHR</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-sm">Communication</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-1">
                      <li>• Slack</li>
                      <li>• Microsoft Teams</li>
                      <li>• Email (Brevo)</li>
                      <li>• Custom Webhooks</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-purple-50">
                  <CardHeader>
                    <CardTitle className="text-sm">Automation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs space-y-1">
                      <li>• Zapier</li>
                      <li>• Custom REST APIs</li>
                      <li>• Calendar Sync</li>
                      <li>• Data Sync</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & API Settings
              </CardTitle>
              <CardDescription>
                Configure security settings and API access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Security Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="api-rotation">API Key Rotation (days)</Label>
                    <Input 
                      id="api-rotation" 
                      type="number" 
                      value={settings.apiKeyRotationDays}
                      onChange={(e) => setSettings(prev => ({ ...prev, apiKeyRotationDays: parseInt(e.target.value) }))}
                      min="30" 
                      max="365" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="require-https" 
                      checked={settings.requireHttps}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireHttps: checked }))}
                    />
                    <Label htmlFor="require-https">Require HTTPS for all API calls</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enable-cors" 
                      checked={settings.enableCors}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableCors: checked }))}
                    />
                    <Label htmlFor="enable-cors">Enable CORS for API access</Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* API Documentation */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Complete API Documentation
                </h3>
                
                <div className="space-y-4">
                  {/* Authentication */}
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Authentication</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-xs">
                        <div>
                          <h5 className="font-semibold mb-1">API Key Authentication</h5>
                          <p className="text-gray-600 mb-2">Include API key in request headers:</p>
                          <pre className="bg-gray-100 p-2 rounded text-xs">
{`Headers:
X-API-Key: your_api_key_here
Content-Type: application/json`}
                          </pre>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-1">Rate Limits</h5>
                          <ul className="text-gray-600 space-y-1">
                            <li>• 100 requests per minute per API key</li>
                            <li>• 1000 requests per hour per API key</li>
                            <li>• Webhook endpoints: 500 requests per minute</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* External Integration API */}
                  <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">External Integration Endpoints</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-xs">
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-blue-100">POST</Badge>
                            <code className="bg-white px-2 py-1 rounded">/api/external/job-application</code>
                          </div>
                          <p className="text-gray-600 mb-2">Submit job applications from external systems</p>
                          <details className="mb-3">
                            <summary className="font-semibold cursor-pointer">Request Body Example</summary>
                            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
{`{
  "jobId": 123,
  "applicant": {
    "email": "candidate@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1-555-0123",
    "experience": "5 years",
    "skills": ["JavaScript", "React", "Node.js"],
    "resumeUrl": "https://example.com/resume.pdf"
  },
  "source": "greenhouse",
  "metadata": {
    "applicationId": "ext_12345",
    "appliedAt": "2024-01-15T10:30:00Z"
  }
}`}
                            </pre>
                          </details>
                          <details>
                            <summary className="font-semibold cursor-pointer">Response Example</summary>
                            <pre className="bg-gray-100 p-2 rounded mt-1">
{`{
  "success": true,
  "applicationId": 456,
  "interviewToken": "int_abc123xyz",
  "interviewUrl": "https://platform.com/interview/int_abc123xyz",
  "message": "Application submitted successfully"
}`}
                            </pre>
                          </details>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-green-100">GET</Badge>
                            <code className="bg-white px-2 py-1 rounded">/api/external/jobs</code>
                          </div>
                          <p className="text-gray-600 mb-2">Retrieve active job postings for external sync</p>
                          <details className="mb-3">
                            <summary className="font-semibold cursor-pointer">Query Parameters</summary>
                            <ul className="mt-1 text-gray-600 space-y-1">
                              <li>• <code>status</code> - Filter by job status (active, paused, closed)</li>
                              <li>• <code>company</code> - Filter by company name</li>
                              <li>• <code>limit</code> - Number of results (default: 50, max: 100)</li>
                              <li>• <code>offset</code> - Pagination offset</li>
                            </ul>
                          </details>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-green-100">GET</Badge>
                            <code className="bg-white px-2 py-1 rounded">/api/external/applications/:id/status</code>
                          </div>
                          <p className="text-gray-600 mb-2">Check application and interview status</p>
                          <details>
                            <summary className="font-semibold cursor-pointer">Response Example</summary>
                            <pre className="bg-gray-100 p-2 rounded mt-1">
{`{
  "applicationId": 456,
  "status": "interview_completed",
  "interview": {
    "status": "completed",
    "completedAt": "2024-01-16T14:30:00Z",
    "scores": {
      "technical": 8.5,
      "communication": 7.8,
      "confidence": 8.2,
      "overall": 8.1
    }
  }
}`}
                            </pre>
                          </details>
                        </div>

                      </div>
                    </CardContent>
                  </Card>

                  {/* Webhook Documentation */}
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Webhook Endpoints</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-xs">
                        
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-blue-100">POST</Badge>
                            <code className="bg-white px-2 py-1 rounded">/api/webhooks/greenhouse</code>
                          </div>
                          <p className="text-gray-600 mb-2">Receive job and application updates from Greenhouse</p>
                          <details className="mb-3">
                            <summary className="font-semibold cursor-pointer">Webhook Payload Example</summary>
                            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
{`{
  "action": "application_created",
  "payload": {
    "job": {
      "id": 12345,
      "name": "Senior Frontend Developer",
      "status": "open"
    },
    "application": {
      "id": 67890,
      "candidate": {
        "email": "candidate@example.com",
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "applied_at": "2024-01-15T10:30:00Z"
    }
  }
}`}
                            </pre>
                          </details>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2">Supported Webhook Events</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <ul className="text-gray-600 space-y-1">
                              <li>• <code>job_created</code></li>
                              <li>• <code>job_updated</code></li>
                              <li>• <code>application_created</code></li>
                              <li>• <code>application_updated</code></li>
                            </ul>
                            <ul className="text-gray-600 space-y-1">
                              <li>• <code>interview_scheduled</code></li>
                              <li>• <code>interview_completed</code></li>
                              <li>• <code>candidate_hired</code></li>
                              <li>• <code>candidate_rejected</code></li>
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2">Webhook Security</h5>
                          <ul className="text-gray-600 space-y-1">
                            <li>• All webhooks include HMAC-SHA256 signature verification</li>
                            <li>• Signature sent in <code>X-Hub-Signature-256</code> header</li>
                            <li>• Verify using your integration secret key</li>
                            <li>• Reject requests with invalid signatures</li>
                          </ul>
                        </div>

                      </div>
                    </CardContent>
                  </Card>

                  {/* Error Handling */}
                  <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Error Handling & Status Codes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-xs">
                        
                        <div>
                          <h5 className="font-semibold mb-2">HTTP Status Codes</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <h6 className="font-semibold text-green-700">Success Codes</h6>
                              <ul className="text-gray-600 space-y-1">
                                <li>• <code>200</code> - OK (successful GET/PUT/PATCH)</li>
                                <li>• <code>201</code> - Created (successful POST)</li>
                                <li>• <code>204</code> - No Content (successful DELETE)</li>
                              </ul>
                            </div>
                            <div>
                              <h6 className="font-semibold text-red-700">Error Codes</h6>
                              <ul className="text-gray-600 space-y-1">
                                <li>• <code>400</code> - Bad Request (validation errors)</li>
                                <li>• <code>401</code> - Unauthorized (invalid API key)</li>
                                <li>• <code>403</code> - Forbidden (insufficient permissions)</li>
                                <li>• <code>404</code> - Not Found (resource doesn't exist)</li>
                                <li>• <code>429</code> - Too Many Requests (rate limit)</li>
                                <li>• <code>500</code> - Internal Server Error</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2">Error Response Format</h5>
                          <pre className="bg-gray-100 p-2 rounded">
{`{
  "error": true,
  "message": "Validation failed",
  "details": {
    "field": "email",
    "code": "INVALID_EMAIL",
    "description": "Email format is invalid"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_abc123xyz"
}`}
                          </pre>
                        </div>

                      </div>
                    </CardContent>
                  </Card>

                  {/* SDK and Examples */}
                  <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Code Examples & SDK</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-xs">
                        
                        <div>
                          <h5 className="font-semibold mb-2">JavaScript/Node.js Example</h5>
                          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
{`const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'https://your-platform.replit.app/api',
  headers: {
    'X-API-Key': 'your_api_key_here',
    'Content-Type': 'application/json'
  }
});

// Submit job application
async function submitApplication(jobId, applicantData) {
  try {
    const response = await apiClient.post('/external/job-application', {
      jobId,
      applicant: applicantData,
      source: 'custom_integration'
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.response.data);
    throw error;
  }
}

// Get job listings
async function getJobs(params = {}) {
  const response = await apiClient.get('/external/jobs', { params });
  return response.data;
}`}
                          </pre>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2">Python Example</h5>
                          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
{`import requests
import json

class AIInterviewAPI:
    def __init__(self, api_key, base_url):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        }
    
    def submit_application(self, job_id, applicant_data):
        url = f"{self.base_url}/external/job-application"
        payload = {
            'jobId': job_id,
            'applicant': applicant_data,
            'source': 'python_integration'
        }
        
        response = requests.post(url, headers=self.headers, json=payload)
        response.raise_for_status()
        return response.json()
    
    def get_jobs(self, **params):
        url = f"{self.base_url}/external/jobs"
        response = requests.get(url, headers=self.headers, params=params)
        response.raise_for_status()
        return response.json()

# Usage
api = AIInterviewAPI('your_api_key', 'https://your-platform.replit.app/api')
jobs = api.get_jobs(status='active', limit=10)`}
                          </pre>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2">cURL Examples</h5>
                          <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
{`# Submit job application
curl -X POST https://your-platform.replit.app/api/external/job-application \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jobId": 123,
    "applicant": {
      "email": "candidate@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1-555-0123",
      "experience": "5 years",
      "skills": ["JavaScript", "React"]
    },
    "source": "curl_test"
  }'

# Get active jobs
curl -X GET "https://your-platform.replit.app/api/external/jobs?status=active&limit=10" \\
  -H "X-API-Key: your_api_key_here"

# Check application status
curl -X GET https://your-platform.replit.app/api/external/applications/456/status \\
  -H "X-API-Key: your_api_key_here"`}
                          </pre>
                        </div>

                      </div>
                    </CardContent>
                  </Card>

                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} className="w-full md:w-auto">
                  Save Security Settings
                </Button>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}