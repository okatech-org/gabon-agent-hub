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
} from "lucide-react";
import {
  Sidebar as SidebarUI,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

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
    <SidebarUI className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/ministre/dashboard" className="flex items-center space-x-3">
          <div className="neu-raised h-10 w-10 flex items-center justify-center flex-shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-base font-bold text-sidebar-foreground">ADMIN.GA</h2>
              <p className="text-xs text-sidebar-foreground/70">Espace Ministre</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs uppercase tracking-wider px-3 mb-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href.includes('?') && location.pathname + location.search === item.href);
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "rounded-lg transition-all hover:bg-sidebar-accent",
                        isActive &&
                          "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
                      )}
                    >
                      <Link to={item.href} className="flex items-center gap-3 px-3 py-2">
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs uppercase tracking-wider px-3 mb-2">
            Système
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    className={cn(
                      "rounded-lg transition-all hover:bg-sidebar-accent",
                      location.pathname === item.href &&
                        "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
                    )}
                  >
                    <Link to={item.href} className="flex items-center gap-3 px-3 py-2">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {!collapsed && user?.email && (
          <div className="mb-3 px-3">
            <p className="text-xs text-sidebar-foreground/50">Connecté en tant que</p>
            <p className="text-xs text-sidebar-foreground font-medium truncate">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Déconnexion</span>}
        </Button>
      </SidebarFooter>
    </SidebarUI>
  );
}
