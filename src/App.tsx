import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import DemoAccounts from "./pages/DemoAccounts";
import InitDemo from "./pages/InitDemo";
import Dashboard from "./pages/Dashboard";
import Agents from "./pages/Agents";
import GestionnaireRHDashboard from "./pages/rh/GestionnaireRHDashboard";
import AgentsRH from "./pages/rh/AgentsRH";
import ActesRH from "./pages/rh/ActesRH";
import AffectationsRH from "./pages/rh/AffectationsRH";
import AgentForm from "./pages/rh/AgentForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/demo-accounts" element={<DemoAccounts />} />
            <Route path="/init-demo" element={<InitDemo />} />
            
            {/* Routes Gestionnaire RH - Protégées */}
            <Route
              element={
                <ProtectedRoute>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route path="/rh/dashboard" element={<GestionnaireRHDashboard />} />
              <Route path="/rh/agents" element={<AgentsRH />} />
              <Route path="/rh/agents/nouveau" element={<AgentForm />} />
              <Route path="/rh/agents/:id/modifier" element={<AgentForm />} />
              <Route path="/rh/actes" element={<ActesRH />} />
              <Route path="/rh/affectations" element={<AffectationsRH />} />
            </Route>
            
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/structures" element={<div className="p-6">Structures - En cours de développement</div>} />
              <Route path="/postes" element={<div className="p-6">Postes - En cours de développement</div>} />
              <Route path="/carrieres" element={<div className="p-6">Carrières & Actes - En cours de développement</div>} />
              <Route path="/recrutement" element={<div className="p-6">Recrutement - En cours de développement</div>} />
              <Route path="/recensement" element={<div className="p-6">Recensement - En cours de développement</div>} />
              <Route path="/reformes" element={<div className="p-6">Projets de Réforme - En cours de développement</div>} />
              <Route path="/admin" element={<div className="p-6">Administration - En cours de développement</div>} />
              <Route path="/settings" element={<div className="p-6">Paramètres - En cours de développement</div>} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
