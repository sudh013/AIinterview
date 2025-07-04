import { Card, CardContent } from "@/components/ui/card";
import { Video, Clock, Star, Plug } from "lucide-react";

interface StatsCardsProps {
  stats?: {
    totalInterviews: number;
    pendingReviews: number;
    averageScore: number;
    apiCalls: number;
  };
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Interviews",
      value: stats?.totalInterviews?.toLocaleString() || "0",
      change: "+12.5%",
      changeLabel: "from last month",
      icon: Video,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      changeColor: "text-green-600",
    },
    {
      title: "Pending Reviews",
      value: stats?.pendingReviews || "0",
      change: "3 urgent",
      changeLabel: "require attention",
      icon: Clock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      changeColor: "text-yellow-600",
    },
    {
      title: "Average Score",
      value: stats?.averageScore?.toFixed(1) || "0.0",
      change: "+0.3",
      changeLabel: "from last quarter",
      icon: Star,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      changeColor: "text-green-600",
    },
    {
      title: "API Calls",
      value: stats?.apiCalls ? `${(stats.apiCalls / 1000).toFixed(1)}K` : "0",
      change: "98.9%",
      changeLabel: "success rate",
      icon: Plug,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      changeColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-semibold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`${card.iconColor}`} size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className={`${card.changeColor} font-medium`}>{card.change}</span>
                <span className="text-gray-500 ml-1">{card.changeLabel}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
