import { cn } from "@/lib/utils";
import { BarChart3, Briefcase, Users, Video, Star, TrendingUp, Settings, Plug, ChevronDown, UserCog, MessageSquare, Calendar } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [currentRole, setCurrentRole] = useState("admin");
  
  const allNavigation = [
    { name: "Dashboard", href: "/", icon: BarChart3, roles: ["admin", "hr_recruiter", "support_reviewer"] },
    { name: "Jobs", href: "/jobs", icon: Briefcase, roles: ["admin", "hr_recruiter"] },
    { name: "Applicants", href: "/applicants", icon: Users, roles: ["admin", "hr_recruiter", "support_reviewer"] },
    { name: "Interviews", href: "/interviews", icon: Video, roles: ["admin", "hr_recruiter", "support_reviewer", "candidate"] },
    { name: "Demo Interview", href: "/demo-interview", icon: Video, roles: ["admin", "hr_recruiter"] },
    { name: "Questions", href: "/questions", icon: MessageSquare, roles: ["admin", "hr_recruiter"] },
    { name: "Calendar", href: "/calendar", icon: Calendar, roles: ["admin", "hr_recruiter"] },
    { name: "Scoring", href: "/scoring", icon: Star, roles: ["admin", "hr_recruiter", "support_reviewer"] },
    { name: "Advanced Analytics", href: "/advanced-scoring", icon: TrendingUp, roles: ["admin", "hr_recruiter"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["admin"] },
    { name: "API Integration", href: "/api", icon: Plug, roles: ["admin"] },
  ];

  // Filter navigation based on current role
  const navigation = allNavigation.filter(item => item.roles.includes(currentRole));

  const roles = [
    { value: "admin", label: "Admin", color: "bg-red-500" },
    { value: "hr_recruiter", label: "HR/Recruiter", color: "bg-blue-500" },
    { value: "support_reviewer", label: "Support Reviewer", color: "bg-green-500" },
    { value: "candidate", label: "Candidate", color: "bg-gray-500" }
  ];

  const getCurrentRoleInfo = () => {
    return roles.find(role => role.value === currentRole) || roles[0];
  };

  return (
    <aside className={cn("w-64 bg-white shadow-sm border-r border-gray-200 flex flex-col", className)}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Video className="text-white" size={16} />
          </div>
          <span className="text-xl font-semibold text-gray-900">AI Interview</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon size={20} />
              <span className={cn("font-medium", isActive ? "" : "font-normal")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-3">
        {/* Role Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Switch Role (Testing)
          </label>
          <Select value={currentRole} onValueChange={setCurrentRole}>
            <SelectTrigger className="w-full">
              <div className="flex items-center space-x-2">
                <div className={cn("w-2 h-2 rounded-full", getCurrentRoleInfo().color)}></div>
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  <div className="flex items-center space-x-2">
                    <div className={cn("w-2 h-2 rounded-full", role.color)}></div>
                    <span>{role.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* User Profile */}
        <div className="flex items-center space-x-3">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
            alt="User Profile" 
            className="w-10 h-10 rounded-full object-cover" 
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">John Smith</p>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs">
                {getCurrentRoleInfo().label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
