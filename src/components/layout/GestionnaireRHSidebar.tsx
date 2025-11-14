import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  Briefcase,
  UserPlus,
  Settings,
  Shield,
  LogOut,
  Bell,
  BarChart3,
  Search,
  ClipboardList,
  Award,
  Target,
  FileCheck,
} from "lucide-react";
import {
  Sidebar as SidebarUI,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  {
    title: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/rh/dashboard",
  },
  {
    title: "Agents",
    icon: Users,
    href: "/rh/agents",
  },
  {
    title: "Validation des Actes",
    icon: FileCheck,
    href: "/rh/actes",
  },
  {
    title: "Carrières & Avancements",
    icon: Award,
    href: "/rh/carrieres",
  },
  {
    title: "Pilotage des Effectifs",
    icon: Target,
    href: "/rh/effectifs",
  },
  {
    title: "Rapports & Statistiques",
    icon: BarChart3,
    href: "/rh/rapports",
  },
];

const toolsItems = [
  {
    title: "Nouveau Agent",
    icon: UserPlus,
    href: "/rh/agents/nouveau",
  },
  {
    title: "Affectations",
    icon: Briefcase,
    href: "/rh/affectations",
  },
  {
    title: "Recherche Avancée",
    icon: Search,
    href: "/rh/recherche",
  },
];

const systemItems = [
  {
    title: "Notifications",
    icon: Bell,
    href: "/rh/notifications",
  },
  {
    title: "Demandes",
    icon: ClipboardList,
    href: "/rh/demandes",
  },
  {
    title: "Paramètres",
    icon: Settings,
    href: "/rh/settings",
  },
];

export function GestionnaireRHSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarUI className="border-none bg-transparent">
      <div className="flex h-full flex-col gap-3 p-3 md:p-4">
        {/* Header */}
        <div className="neu-card p-4">
          <Link to="/rh/dashboard" className="flex items-center gap-3">
            <div className="neu-raised h-10 w-10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-base font-bold text-foreground">ADMIN.GA</h2>
                <p className="text-xs text-muted-foreground">Directeur RH</p>
              </div>
            )}
          </Link>
        </div>

        {/* Menu principal - Scrollable */}
        <div className="neu-card flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto pr-1 md:pr-2">
              <div className="space-y-6 px-4 py-4">
                {/* Menu Principal */}
                <div>
                  {!collapsed && (
                    <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Gestion RH
                    </h3>
                  )}
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <Link 
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                          location.pathname === item.href 
                            ? "neu-inset text-primary font-medium" 
                            : "hover:neu-raised text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Outils */}
                <div>
                  {!collapsed && (
                    <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Outils
                    </h3>
                  )}
                  <div className="space-y-1">
                    {toolsItems.map((item) => (
                      <Link 
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                          location.pathname === item.href 
                            ? "neu-inset text-primary font-medium" 
                            : "hover:neu-raised text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Système */}
                <div>
                  {!collapsed && (
                    <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Système
                    </h3>
                  )}
                  <div className="space-y-1">
                    {systemItems.map((item) => (
                      <Link 
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                          location.pathname === item.href 
                            ? "neu-inset text-primary font-medium" 
                            : "hover:neu-raised text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Déconnexion */}
        <div className="neu-card p-4">
          {!collapsed && user?.email && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground">Connecté en tant que</p>
              <p className="text-xs font-medium text-foreground truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-all hover:neu-raised",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span className="text-sm">Déconnexion</span>}
          </button>
        </div>
      </div>
    </SidebarUI>
  );
}
