import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  Bot,
  DollarSign,
  FolderOpen,
  FileCheck,
  Bell,
  GraduationCap,
  History,
  AlertTriangle,
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
    href: "/ministre/dashboard",
  },
  {
    title: "iAsted - Assistant IA",
    icon: Bot,
    href: "/ministre/dashboard?tab=iasted",
  },
  {
    title: "Simulations & Réformes",
    icon: TrendingUp,
    href: "/ministre/dashboard?tab=simulations",
  },
];

const economieFinancesItems = [
  {
    title: "Économie & Finances",
    icon: DollarSign,
    href: "/ministre/economie-finances",
  },
];

const actionsGestionItems = [
  {
    title: "Documents",
    icon: FolderOpen,
    href: "/ministre/documents",
  },
  {
    title: "Réglementations",
    icon: FileCheck,
    href: "/ministre/reglementations",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/ministre/notifications",
  },
  {
    title: "Formations",
    icon: GraduationCap,
    href: "/ministre/formations",
  },
  {
    title: "Historique",
    icon: History,
    href: "/ministre/historique",
  },
  {
    title: "Alertes",
    icon: AlertTriangle,
    href: "/ministre/alertes",
  },
];

const vueGlobaleItems = [
  {
    title: "Effectifs & Personnel",
    icon: Users,
    href: "/ministre/effectifs",
  },
  {
    title: "Décisions & Actes",
    icon: FileText,
    href: "/ministre/decisions",
  },
  {
    title: "Indicateurs Clés",
    icon: BarChart3,
    href: "/ministre/indicateurs",
  },
];

const adminItems = [
  {
    title: "Paramètres",
    icon: Settings,
    href: "/ministre/settings",
  },
];

export function MinistreSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarUI className="border-none bg-transparent">
      <div className="p-3">
        <div className="neu-card p-4 mb-4">
          <Link to="/ministre/dashboard" className="flex items-center space-x-3">
            <div className="neu-raised h-10 w-10 flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="text-base font-bold text-foreground">ADMIN.GA</h2>
                <p className="text-xs text-muted-foreground">Espace Ministre</p>
              </div>
            )}
          </Link>
        </div>

        <div className="neu-card p-4 mb-4">
          {!collapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Navigation
            </h3>
          )}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href.includes('?') && location.pathname + location.search === item.href);
              
              return (
                <Link 
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                    isActive 
                      ? "neu-inset text-primary font-medium" 
                      : "hover:neu-raised text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="text-sm">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Économie & Finances */}
        <div className="neu-card p-4 mb-4">
          {!collapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Économie & Finances
            </h3>
          )}
          <div className="space-y-1">
            {economieFinancesItems.map((item) => (
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

        {/* Actions & Gestion */}
        <div className="neu-card p-4 mb-4">
          {!collapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Actions & Gestion
            </h3>
          )}
          <div className="space-y-1">
            {actionsGestionItems.map((item) => (
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

        {/* Vue Globale */}
        <div className="neu-card p-4 mb-4">
          {!collapsed && (
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Vue Globale
            </h3>
          )}
          <div className="space-y-1">
            {vueGlobaleItems.map((item) => (
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
        <div className="neu-card p-4 mb-4">
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

      <div className="p-3">
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
