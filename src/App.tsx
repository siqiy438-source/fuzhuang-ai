import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PhotoAnalysisPage from "./pages/PhotoAnalysisPage";
import StyleAdvisorPage from "./pages/StyleAdvisorPage";
import HistoryPage from "./pages/HistoryPage";
import OutfitGeneratorPage from "./pages/OutfitGeneratorPage";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/photo-analysis" element={<PhotoAnalysisPage />} />
          <Route path="/style-advisor" element={<StyleAdvisorPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/outfit-generator" element={<OutfitGeneratorPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
