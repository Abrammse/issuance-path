import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import AppHeader from "@/components/AppHeader";
import Index from "./pages/Index";
import ServiceCatalog from "./pages/ServiceCatalog";
import SubmitRequest from "./pages/SubmitRequest";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Payment from "./pages/Payment";
import Certificate from "./pages/Certificate";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <AppHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<ServiceCatalog />} />
            <Route path="/submit" element={<SubmitRequest />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/certificate" element={<Certificate />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
