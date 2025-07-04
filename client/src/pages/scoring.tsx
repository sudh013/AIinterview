import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Target, Users, Star } from "lucide-react";
import { useState } from "react";

interface SkillsAnalytics {
  technicalAvg: number;
  communicationAvg: number;
  confidenceAvg: number;
}

export default function Scoring() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");

  const { data: skillsData } = useQuery<SkillsAnalytics>({
    queryKey: ["/api/dashboard/analytics"],
  });

  // Mock scoring data for charts
  const scoreDistribution = [
    { range: "0-2", count: 2, color: "#ef4444" },
    { range: "2-4", count: 5, color: "#f97316" },
    { range: "4-6", count: 12, color: "#eab308" },
    { range: "6-8", count: 25, color: "#22c55e" },
    { range: "8-10", count: 18, color: "#059669" },
  ];

  const monthlyTrends = [
    { month: "Jan", technical: 7.2, communication: 6.8, confidence: 7.1 },
    { month: "Feb", technical: 7.4, communication: 7.1, confidence: 7.3 },
    { month: "Mar", technical: 7.6, communication: 7.3, confidence: 7.5 },
    { month: "Apr", technical: 7.8, communication: 7.5, confidence: 7.7 },
    { month: "May", technical: 8.0, communication: 7.7, confidence: 7.8 },
    { month: "Jun", technical: 7.9, communication: 7.9, confidence: 7.6 },
  ];

  const departmentScores = [
    { department: "Engineering", avgScore: 8.2, candidates: 45 },
    { department: "Product", avgScore: 7.8, candidates: 23 },
    { department: "Design", avgScore: 7.9, candidates: 18 },
    { department: "Marketing", avgScore: 7.5, candidates: 12 },
    { department: "Sales", avgScore: 8.0, candidates: 31 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scoring Analytics</h1>
          <p className="text-gray-600">Analyze AI-powered interview scores and performance trends</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 days</SelectItem>
            <SelectItem value="30d">30 days</SelectItem>
            <SelectItem value="90d">90 days</SelectItem>
            <SelectItem value="1y">1 year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Technical Average</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {skillsData ? skillsData.technicalAvg.toFixed(1) : '7.6'}
            </div>
            <p className="text-xs text-muted-foreground">
              +0.3 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communication Average</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {skillsData ? skillsData.communicationAvg.toFixed(1) : '8.1'}
            </div>
            <p className="text-xs text-muted-foreground">
              +0.5 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Average</CardTitle>
            <Star className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {skillsData ? skillsData.confidenceAvg.toFixed(1) : '7.2'}
            </div>
            <p className="text-xs text-muted-foreground">
              +0.1 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">78%</div>
            <p className="text-xs text-muted-foreground">
              +2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>
              Distribution of overall interview scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills Trends</CardTitle>
            <CardDescription>
              Monthly average scores by skill category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[6, 9]} />
                <Tooltip />
                <Line type="monotone" dataKey="technical" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="communication" stroke="#16a34a" strokeWidth={2} />
                <Line type="monotone" dataKey="confidence" stroke="#ea580c" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>
            Average scores and candidate volume by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departmentScores.map((dept, index) => (
              <div key={dept.department} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <div>
                    <h4 className="font-medium">{dept.department}</h4>
                    <p className="text-sm text-gray-600">{dept.candidates} candidates</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{dept.avgScore}</div>
                  <Badge variant={dept.avgScore >= 8 ? "default" : dept.avgScore >= 7 ? "secondary" : "destructive"}>
                    {dept.avgScore >= 8 ? "Excellent" : dept.avgScore >= 7 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>AI Scoring Criteria</CardTitle>
          <CardDescription>
            Understanding how candidates are evaluated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600">Technical Skills</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Problem-solving approach</li>
                <li>• Technical accuracy</li>
                <li>• Code quality and best practices</li>
                <li>• System design understanding</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-600">Communication</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Clarity of explanation</li>
                <li>• Structured thinking</li>
                <li>• Question comprehension</li>
                <li>• Professional language</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-orange-600">Confidence</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Eye contact and posture</li>
                <li>• Voice clarity and pace</li>
                <li>• Handling uncertainty</li>
                <li>• Overall presence</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}