import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Principal from "@/pages/principal";
import NotFound from "@/pages/not-found";
import type { User } from "@shared/schema";
import { useEffect } from "react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    enabled: isAuthenticated,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const isAdminOrCreator = user.role === "admin" || user.role === "creator";
      if (isAdminOrCreator && location === "/") {
        setLocation("/principal");
      } else if (!isAdminOrCreator && location === "/principal") {
        setLocation("/");
      }
    }
  }, [isLoading, isAuthenticated, user, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/principal" component={Principal} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="school-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
