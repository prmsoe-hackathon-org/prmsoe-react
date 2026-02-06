import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "@/pages/Auth";
import IdentityIntake from "@/pages/IdentityIntake";
import NetworkIngest from "@/pages/NetworkIngest";
import CommandCenter from "@/pages/CommandCenter";
import Loop from "@/pages/Loop";
import Analytics from "@/pages/Analytics";
import Landing from "@/pages/Landing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route index element={<Navigate to="/app/onboard" replace />} />
                    <Route path="onboard" element={<IdentityIntake />} />
                    <Route path="upload" element={<NetworkIngest />} />
                    <Route path="lab" element={<CommandCenter />} />
                    <Route path="loop" element={<Loop />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
