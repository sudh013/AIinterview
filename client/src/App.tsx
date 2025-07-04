import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import Jobs from "@/pages/jobs";
import Applicants from "@/pages/applicants";
import Interviews from "@/pages/interviews";
import Scoring from "@/pages/scoring";
import AdvancedScoring from "@/pages/advanced-scoring";
import Settings from "@/pages/settings";
import ApiIntegration from "@/pages/api-integration";
import Questions from "@/pages/questions";
import Calendar from "@/pages/calendar";
import Interview from "@/pages/interview";
import NotFound from "@/pages/not-found";

function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  // Hide sidebar for interview pages (candidate view)
  const hideNavigation = location.startsWith('/interview/') || location === '/demo-interview';
  
  if (hideNavigation) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/applicants" component={Applicants} />
        <Route path="/interviews" component={Interviews} />
        <Route path="/demo-interview" component={Interview} />
        <Route path="/questions" component={Questions} />
        <Route path="/scoring" component={Scoring} />
        <Route path="/advanced-scoring" component={AdvancedScoring} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/settings" component={Settings} />
        <Route path="/api" component={ApiIntegration} />
        <Route path="/interview/:token" component={Interview} />
        <Route path="/demo-interview" component={Interview} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;