import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ParametersPage from "./pages/ParametersPage";
import WeightPage from "./pages/WeightPage";
import ConePage from "./pages/ConePage";
import HardnessPage from "./pages/HardnessPage";
import ThreadCalculatorPage from "./pages/ThreadCalculatorPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/parametry" element={<ParametersPage />} />
          <Route path="/waga" element={<WeightPage />} />
          <Route path="/stozek" element={<ConePage />} />
          <Route path="/twardosc" element={<HardnessPage />} />
          <Route path="/kalkulator-gwintow" element={<ThreadCalculatorPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
