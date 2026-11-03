import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HashRouter } from "react-router-dom";
import { Suspense, useEffect } from "react";
import AnimatedRoutes from "./components/AnimatedRoutes";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { UnitProvider } from "./contexts/UnitContext";
import OnboardingController from "./components/OnboardingController";
import SupportModalController from "./components/SupportModalController";
import PwaInstallBanner from "./components/PwaInstallBanner";
import FavoritesFab from "./components/layout/FavoritesFab";
import AppSkeleton from "./components/AppSkeleton";
import RotateDeviceOverlay from "./components/RotateDeviceOverlay";
import { lockPortraitOrientation } from "./hooks/use-mobile";

const App = () => {
  useEffect(() => {
    // Aktywne blokowanie orientacji pionowej na smartfonach
    lockPortraitOrientation();

    const handleUserGesture = () => lockPortraitOrientation();
    window.addEventListener("pointerdown", handleUserGesture, { once: true });
    window.addEventListener("touchstart", handleUserGesture, { once: true, passive: true });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") lockPortraitOrientation();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pointerdown", handleUserGesture);
      window.removeEventListener("touchstart", handleUserGesture);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <AppErrorBoundary>
      <UnitProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OnboardingController />
          <SupportModalController />
          <RotateDeviceOverlay />
          <HashRouter>
            <FavoritesFab />
            <Suspense fallback={<AppSkeleton />}>
              <AnimatedRoutes />
            </Suspense>
          </HashRouter>
          <PwaInstallBanner />
        </TooltipProvider>
      </UnitProvider>
    </AppErrorBoundary>
  );
};

export default App;
