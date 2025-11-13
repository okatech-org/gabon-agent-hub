import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { MinistreLayout } from "@/components/layout/MinistreLayout";
import { FonctionnaireLayout } from "@/components/layout/FonctionnaireLayout";
import { GestionnaireRHLayout } from "@/components/layout/GestionnaireRHLayout";
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
import MinistreDashboard from "./pages/ministre/MinistreDashboard";
import IAsted from "./pages/ministre/IAsted";
import Documents from "./pages/ministre/Documents";
import Reglementations from "./pages/ministre/Reglementations";
import Notifications from "./pages/ministre/Notifications";
import Formations from "./pages/ministre/Formations";
import Historique from "./pages/ministre/Historique";
import Alertes from "./pages/ministre/Alertes";
import EconomieFinances from "./pages/ministre/EconomieFinances";
import SettingsPage from "./pages/ministre/Settings";
import FonctionnaireDashboard from "./pages/fonctionnaire/Dashboard";
import Dossier from "./pages/fonctionnaire/Dossier";
import Actes from "./pages/fonctionnaire/Actes";
import Demandes from "./pages/fonctionnaire/Demandes";
import FonctionnaireNotifications from "./pages/fonctionnaire/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
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
                  <GestionnaireRHLayout />
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

            {/* Routes Ministre - Protégées */}
            <Route
              element={
                <ProtectedRoute>
                  <MinistreLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/ministre/dashboard" element={<MinistreDashboard />} />
              <Route path="/ministre/iasted" element={<IAsted />} />
              <Route path="/ministre/documents" element={<Documents />} />
              <Route path="/ministre/reglementations" element={<Reglementations />} />
              <Route path="/ministre/notifications" element={<Notifications />} />
              <Route path="/ministre/formations" element={<Formations />} />
              <Route path="/ministre/historique" element={<Historique />} />
              <Route path="/ministre/alertes" element={<Alertes />} />
              <Route path="/ministre/economie-finances" element={<EconomieFinances />} />
              <Route path="/ministre/settings" element={<SettingsPage />} />
            </Route>
            
            {/* Routes Fonctionnaire - Protégées */}
            <Route
              element={
                <ProtectedRoute>
                  <FonctionnaireLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/fonctionnaire/dashboard" element={<FonctionnaireDashboard />} />
              <Route path="/fonctionnaire/dossier" element={<Dossier />} />
              <Route path="/fonctionnaire/actes" element={<Actes />} />
              <Route path="/fonctionnaire/demandes" element={<Demandes />} />
              <Route path="/fonctionnaire/notifications" element={<FonctionnaireNotifications />} />
              <Route path="/fonctionnaire/settings" element={<SettingsPage />} />
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
