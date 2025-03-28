import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./components/landing/LandingPage";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Groups from "./pages/Groups";
import GroupDetail from "./pages/GroupDetail";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Invitations from "./pages/Invitations";
import Header from "./components/layout/Header";
import { ExpenseProvider } from "./contexts/ExpenseContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { BackgroundPaths } from "./components/ui/background-paths";
import GroupSettings from "@/pages/GroupSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ExpenseProvider>
          <ThemeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col bg-background text-foreground relative">
                <BackgroundPaths title="" />
                <Header />
                <main className="flex-1 relative z-10">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/auth" element={<div className="px-4 sm:px-6 md:px-8 lg:px-12"><Auth /></div>} />
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
                          <Dashboard />
                        </div>
                      </ProtectedRoute>
                    } />
                    <Route path="/expenses" element={
                      <ProtectedRoute>
                        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
                          <Expenses />
                        </div>
                      </ProtectedRoute>
                    } />
                    <Route path="/groups" element={
                      <ProtectedRoute>
                        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
                          <Groups />
                        </div>
                      </ProtectedRoute>
                    } />
                    <Route path="/groups/:groupId" element={
                      <ProtectedRoute>
                        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
                          <GroupDetail />
                        </div>
                      </ProtectedRoute>
                    } />
                    <Route path="/groups/:groupId/settings" element={
                      <ProtectedRoute>
                        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
                          <GroupSettings />
                        </div>
                      </ProtectedRoute>
                    } />
                    <Route path="/invitations" element={
                      <ProtectedRoute>
                        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
                          <Invitations />
                        </div>
                      </ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                      <ProtectedRoute>
                        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
                          <Analytics />
                        </div>
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
                          <Profile />
                        </div>
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<div className="px-4 sm:px-6 md:px-8 lg:px-12"><NotFound /></div>} />
                  </Routes>
                </main>
              </div>
            </BrowserRouter>
          </ThemeProvider>
        </ExpenseProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
