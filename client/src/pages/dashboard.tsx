import { StatsCards } from "@/components/stats-cards";
import { RecentInterviews } from "@/components/recent-interviews";
import { CreateInterviewModal } from "@/components/create-interview-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Bell, Plus } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/dashboard/analytics"],
  });

  return (
    <div className="space-y-6 p-8">
      <header className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Monitor your AI interview pipeline and performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <CreateInterviewModal trigger={
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Interview
              </Button>
            } />
            <div className="relative">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="product">Product</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          
          <Select defaultValue="7days">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24hours">Last 24 Hours</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <StatsCards stats={stats} isLoading={statsLoading} />
      <RecentInterviews />
    </div>
  );
}