import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import UserManagement from "./pages/UserManagement";
import AuditLogs from "./pages/AuditLogs";
import PendingApproval from "./pages/PendingApproval";
import Banned from "./pages/Banned";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Trash from "./pages/Trash";

const queryClient = new QueryClient();

function RecoveryRedirectHandler() {
  useEffect(() => {
    const { pathname, hash } = window.location;
    const isRecoveryLink = hash.includes("type=recovery") || hash.includes("access_token=");

    if (isRecoveryLink && pathname !== "/reset-password") {
      window.location.replace(`/reset-password${hash}`);
    }
  }, []);

  return null;
}

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();
  useEffect(() => {
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    toTop();
    const raf = requestAnimationFrame(toTop);
    // Content loads async (queries, images) and can shift the scroll position
    const timers = [60, 250, 600].map((ms) => window.setTimeout(toTop, ms));
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, [pathname]);
  return null;
}

function DisableScrollRestoration() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      const prev = window.history.scrollRestoration;
      window.history.scrollRestoration = 'manual';
      // Force top on initial mount (covers hard refresh)
      window.scrollTo({ top: 0, left: 0 });
      const onLoad = () => window.scrollTo({ top: 0, left: 0 });
      window.addEventListener('load', onLoad);
      return () => {
        window.removeEventListener('load', onLoad);
        window.history.scrollRestoration = prev;
      };
    }
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RecoveryRedirectHandler />
          <DisableScrollRestoration />
          <ScrollToTopOnNavigate />
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/pending-approval" element={<PendingApproval />} />
            <Route path="/banned" element={<Banned />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/users" element={
              <ProtectedRoute requireAdmin>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/audit-logs" element={
              <ProtectedRoute requireAdmin>
                <AuditLogs />
              </ProtectedRoute>
            } />
            <Route path="/trash" element={
              <ProtectedRoute requireAdmin>
                <Trash />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

