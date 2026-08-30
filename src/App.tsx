import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";
import { Suspense } from "react";
import AnimatedRoutes from "./components/AnimatedRoutes";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { UnitProvider } from "./contexts/UnitContext";

const queryClient = new QueryClient();

const AppFallback = () => (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
    Loading...
  </div>
);

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <UnitProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OnboardingModal />
          <HashRouter>
            <Suspense fallback={<AppFallback />}>
              <AnimatedRoutes />
            </Suspense>
          </HashRouter>
        </TooltipProvider>
      </UnitProvider>
    </QueryClientProvider>
  </AppErrorBoundary>

);

export default App;
