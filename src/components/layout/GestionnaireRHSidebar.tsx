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
    title: "Actes RH",
    icon: FileText,
    href: "/rh/actes",
  },
  {
    title: "Affectations",
    icon: Briefcase,
    href: "/rh/affectations",
  },
  {
    title: "Nouveau Agent",
    icon: UserPlus,
    href: "/rh/agents/nouveau",
  },
];

const adminItems = [
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
      <div className="p-3 space-y-4">
        {/* Header */}
        <div className="neu-card p-4">
          <Link to="/rh/dashboard" className="flex items-center space-x-3">
            <div className="neu-raised h-10 w-10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-base font-bold text-foreground">ADMIN.GA</h2>
                <p className="text-xs text-muted-foreground">Gestionnaire RH</p>
              </div>
            )}
          </Link>
        </div>

        {/* Menu principal - Tout dans un seul bloc */}
        <div className="neu-card p-4">
          <div className="space-y-6">
            {/* Menu Principal */}
            <div>
              {!collapsed && (
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Menu Principal
                </h3>
              )}
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Link 
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
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
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                  Système
                </h3>
              )}
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <Link 
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
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

        {/* Footer - Déconnexion */}
        <div className="neu-card p-4">
          {!collapsed && user?.email && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground">Connecté en tant que</p>
              <p className="text-xs text-foreground font-medium truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:neu-raised text-foreground",
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
