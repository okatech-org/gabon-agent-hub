import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileText,
  UserPlus,
  Fingerprint,
  TrendingUp,
  Shield,
  Settings,
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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Agents",
    icon: Users,
    href: "/agents",
  },
  {
    title: "Structures",
    icon: Building2,
    href: "/structures",
  },
  {
    title: "Postes",
    icon: Briefcase,
    href: "/postes",
  },
  {
    title: "Carrières & Actes",
    icon: FileText,
    href: "/carrieres",
  },
  {
    title: "Recrutement",
    icon: UserPlus,
    href: "/recrutement",
  },
  {
    title: "Recensement",
    icon: Fingerprint,
    href: "/recensement",
  },
  {
    title: "Projets de Réforme",
    icon: TrendingUp,
    href: "/reformes",
  },
];

const adminItems = [
  {
    title: "Administration",
    icon: Shield,
    href: "/admin",
  },
  {
    title: "Paramètres",
    icon: Settings,
    href: "/settings",
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <SidebarUI>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">ADMIN.GA</h2>
            <p className="text-xs text-sidebar-foreground/70">Fonction Publique</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    className={cn(
                      location.pathname === item.href &&
                        "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    )}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Système</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.href}
                    className={cn(
                      location.pathname === item.href &&
                        "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                    )}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarUI>
  );
}
