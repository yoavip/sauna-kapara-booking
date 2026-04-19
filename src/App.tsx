import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TourGuide from "./pages/TourGuide";
import NotFound from "./pages/NotFound";
import ReportBugButton from "./components/ReportBugButton";
import SnookerLanding from "./pages/SnookerLanding";
import SnookerRules from "./pages/SnookerRules";
import SnookerRegister from "./pages/SnookerRegister";
import EffiBooking from "./pages/EffiBooking";
import EffiAdmin from "./pages/EffiAdmin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ReportBugButton />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/snooker" element={<SnookerLanding />} />
          <Route path="/snooker/rules" element={<SnookerRules />} />
          <Route path="/snooker/register" element={<SnookerRegister />} />
          <Route path="/tour-guide" element={<TourGuide />} />
          <Route path="/effi" element={<EffiBooking />} />
          <Route path="/effi/admin" element={<EffiAdmin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
