import { Outlet } from "react-router-dom";
import { GestionnaireRHSidebar } from "./GestionnaireRHSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function GestionnaireRHLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background p-3 gap-3">
        <GestionnaireRHSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
