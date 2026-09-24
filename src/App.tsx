import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HashRouter } from "react-router-dom";
import { Suspense } from "react";
import AnimatedRoutes from "./components/AnimatedRoutes";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { UnitProvider } from "./contexts/UnitContext";
import OnboardingController from "./components/OnboardingController";
import PwaInstallBanner from "./components/PwaInstallBanner";
import FavoritesFab from "./components/layout/FavoritesFab";

const AppFallback = () => (
  <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
    Loading...
  </div>
);

const App = () => (
  <AppErrorBoundary>
    <UnitProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OnboardingController />
        <HashRouter>
          <FavoritesFab />
          <Suspense fallback={<AppFallback />}>
            <AnimatedRoutes />
          </Suspense>
        </HashRouter>
        <PwaInstallBanner />
      </TooltipProvider>
    </UnitProvider>
  </AppErrorBoundary>
);

export default App;
