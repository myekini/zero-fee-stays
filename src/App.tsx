import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import MobileNavigation from "@/components/MobileNavigation";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import Search from "./pages/Search";
import PropertyDetail from "./pages/PropertyDetail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import BookingSuccess from "./pages/BookingSuccess";
import HostAuth from "./pages/HostAuth";
import HostSignup from "./pages/HostSignup";
import HostDashboard from "./pages/HostDashboard";
import HostProperties from "./pages/HostProperties";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/booking/success" element={<BookingSuccess />} />
            <Route path="/host/auth" element={<HostAuth />} />
            <Route path="/host/signup" element={<HostSignup />} />
            <Route path="/host/dashboard" element={<HostDashboard />} />
            <Route path="/host/properties" element={<HostProperties />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileNavigation />
          <PWAInstallPrompt />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
