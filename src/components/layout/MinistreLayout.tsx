import { Outlet } from "react-router-dom";
import { MinistreSidebar } from "./MinistreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function MinistreLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MinistreSidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
