import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter } from 'recharts';
import { AlertTriangle, TrendingUp, Users, Clock, Target, Brain, Eye, MessageSquare, Timer, Download } from "lucide-react";
import { useState } from "react";

interface SkillsAnalytics {
  technicalAvg: number;
  communicationAvg: number;
  confidenceAvg: number;
}

interface CandidateComparison {
  candidateId: number;
  name: string;
  email: string;
  jobTitle: string;
  scores: {
    technical: number;
    communication: number;
    confidence: number;
    overall: number;
  };
  metrics: {
    speechPace: number;
    pauseFrequency: number;
    eyeContact: number;
    enthusiasm: number;
    timeManagement: number;
  };
  ranking: number;
}

export default function AdvancedScoring() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("6months");

  const { data: skillsData, isLoading } = useQuery<SkillsAnalytics>({
    queryKey: ["/api/dashboard/analytics"],
  });

  // Advanced analytics data
  const candidateComparisons: CandidateComparison[] = [
    {
      candidateId: 1,
      name: "Sarah Chen",
      email: "sarah.chen@email.com",
      jobTitle: "Senior Frontend Developer",
      scores: { technical: 8.5, communication: 9.2, confidence: 8.8, overall: 8.8 },
      metrics: { speechPace: 165, pauseFrequency: 3, eyeContact: 9, enthusiasm: 8, timeManagement: 95 },
      ranking: 1
    },
    {
      candidateId: 2,
      name: "Marcus Rodriguez",
      email: "marcus.r@email.com", 
      jobTitle: "Backend Engineer",
      scores: { technical: 9.1, communication: 7.8, confidence: 8.2, overall: 8.4 },
      metrics: { speechPace: 145, pauseFrequency: 4, eyeContact: 7, enthusiasm: 8, timeManagement: 110 },
      ranking: 2
    },
    {
      candidateId: 3,
      name: "Emily Watson",
      email: "e.watson@email.com",
      jobTitle: "Product Manager",
      scores: { technical: 7.8, communication: 9.0, confidence: 8.5, overall: 8.4 },
      metrics: { speechPace: 155, pauseFrequency: 2, eyeContact: 9, enthusiasm: 9, timeManagement: 85 },
      ranking: 3
    },
    {
      candidateId: 4,
      name: "David Kim",
      email: "david.kim@email.com",
      jobTitle: "Full Stack Developer", 
      scores: { technical: 8.2, communication: 8.1, confidence: 7.9, overall: 8.1 },
      metrics: { speechPace: 140, pauseFrequency: 5, eyeContact: 8, enthusiasm: 7, timeManagement: 125 },
      ranking: 4
    }
  ];

  const biasAnalysis = {
    scoringConsistency: 0.82,
    demographicDistribution: {
      genderBalance: 0.48,
      experienceDistribution: {
        'junior': 0.32,
        'mid': 0.46,
        'senior': 0.22
      }
    },
    questionFairness: [
      {
        questionId: "tech_1",
        question: "Explain your approach to system design",
        averageScore: 7.2,
        scoreVariation: 1.8,
        potentialBias: false
      },
      {
        questionId: "behav_1",
        question: "Describe a challenging team situation",
        averageScore: 6.8,
        scoreVariation: 2.3,
        potentialBias: true
      }
    ],
    recommendations: [
      "Review questions with high score variation",
      "Consider standardizing scoring rubrics",
      "Good gender balance maintained"
    ]
  };

  const performanceTrends = [
    { month: 'Jan', technical: 7.2, communication: 8.1, confidence: 6.8, overall: 7.4, interviews: 18 },
    { month: 'Feb', technical: 7.5, communication: 8.3, confidence: 7.0, overall: 7.6, interviews: 22 },
    { month: 'Mar', technical: 7.8, communication: 8.0, confidence: 7.2, overall: 7.7, interviews: 28 },
    { month: 'Apr', technical: 7.6, communication: 8.4, confidence: 7.5, overall: 7.8, interviews: 25 },
    { month: 'May', technical: 8.0, communication: 8.2, confidence: 7.3, overall: 7.8, interviews: 31 },
    { month: 'Jun', technical: 7.9, communication: 8.5, confidence: 7.6, overall: 8.0, interviews: 29 }
  ];

  const completionMetrics = [
    { stage: 'Invited', count: 150, rate: 100 },
    { stage: 'Started', count: 127, rate: 84.7 },
    { stage: 'Completed', count: 118, rate: 78.7 },
    { stage: 'Scored', count: 115, rate: 76.7 }
  ];

  const speechMetrics = candidateComparisons.map(candidate => ({
    name: candidate.name,
    speechPace: candidate.metrics.speechPace,
    pauseFrequency: candidate.metrics.pauseFrequency,
    score: candidate.scores.overall
  }));

  const radarData = [
    { skill: 'Technical', score: skillsData?.technicalAvg || 7.5 },
    { skill: 'Communication', score: skillsData?.communicationAvg || 8.1 },
    { skill: 'Confidence', score: skillsData?.confidenceAvg || 7.3 },
    { skill: 'Problem Solving', score: 7.8 },
    { skill: 'Leadership', score: 7.2 },
    { skill: 'Adaptability', score: 8.0 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading) {
    return (
      <div className="space-y-6 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Scoring Analytics</h1>
          <p className="text-muted-foreground">Comprehensive interview analysis and bias detection</p>
        </div>
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Candidate Comparison</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
          <TabsTrigger value="bias">Bias Analysis</TabsTrigger>
          <TabsTrigger value="metrics">Advanced Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">78.7%</div>
                <p className="text-xs text-muted-foreground">
                  +2.3% from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Interview Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18.5 min</div>
                <p className="text-xs text-muted-foreground">
                  -1.2 min from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scoring Consistency</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">82%</div>
                <p className="text-xs text-muted-foreground">
                  AI scoring reliability
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bias Score</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Low</div>
                <p className="text-xs text-green-600">
                  Well-balanced scoring
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Score trends over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[6, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="technical" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="communication" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="confidence" stroke="#ffc658" strokeWidth={2} />
                    <Line type="monotone" dataKey="overall" stroke="#ff7300" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills Radar</CardTitle>
                <CardDescription>Average skill performance across all interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar name="Score" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="candidates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Candidates</CardTitle>
              <CardDescription>Ranked by overall interview performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {candidateComparisons.map((candidate) => (
                  <div key={candidate.candidateId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">#{candidate.ranking}</Badge>
                      <div>
                        <h4 className="font-semibold">{candidate.name}</h4>
                        <p className="text-sm text-muted-foreground">{candidate.jobTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">Technical</p>
                        <p className="text-2xl font-bold text-blue-600">{candidate.scores.technical}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Communication</p>
                        <p className="text-2xl font-bold text-green-600">{candidate.scores.communication}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Confidence</p>
                        <p className="text-2xl font-bold text-yellow-600">{candidate.scores.confidence}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">Overall</p>
                        <p className="text-3xl font-bold">{candidate.scores.overall}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Interview Completion Funnel</CardTitle>
                <CardDescription>Candidate progression through interview stages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={completionMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Interview Volume</CardTitle>
                <CardDescription>Number of interviews conducted over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="interviews" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bias" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Bias Analysis Summary</CardTitle>
                <CardDescription>Overall fairness assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Scoring Consistency</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${biasAnalysis.scoringConsistency * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{Math.round(biasAnalysis.scoringConsistency * 100)}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Gender Balance</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${biasAnalysis.demographicDistribution.genderBalance * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{Math.round(biasAnalysis.demographicDistribution.genderBalance * 100)}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Recommendations</h4>
                  {biasAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Question Fairness Analysis</CardTitle>
                <CardDescription>Potential bias in individual questions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {biasAnalysis.questionFairness.map((question, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium truncate">{question.question}</h5>
                        {question.potentialBias && (
                          <Badge variant="destructive">Potential Bias</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Avg Score: </span>
                          <span className="font-medium">{question.averageScore}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Variation: </span>
                          <span className="font-medium">{question.scoreVariation}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Speech Pattern Analysis</CardTitle>
                <CardDescription>Communication metrics across candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={speechMetrics}>
                    <CartesianGrid />
                    <XAxis dataKey="speechPace" name="Speech Pace" unit=" WPM" />
                    <YAxis dataKey="score" name="Overall Score" unit="/10" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Candidates" dataKey="score" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Metrics</CardTitle>
                <CardDescription>Advanced interview analytics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">156</p>
                      <p className="text-sm text-muted-foreground">Avg Words/Min</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Timer className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">4.2</p>
                      <p className="text-sm text-muted-foreground">Avg Pauses/Min</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Eye className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">8.1</p>
                      <p className="text-sm text-muted-foreground">Avg Eye Contact</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">7.8</p>
                      <p className="text-sm text-muted-foreground">Avg Enthusiasm</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}