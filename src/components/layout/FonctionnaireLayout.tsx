import { Outlet } from "react-router-dom";
import { FonctionnaireSidebar } from "./FonctionnaireSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export function FonctionnaireLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <FonctionnaireSidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}


