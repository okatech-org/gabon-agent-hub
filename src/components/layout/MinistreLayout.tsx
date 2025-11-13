import { Outlet } from "react-router-dom";
import { MinistreSidebar } from "./MinistreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function MinistreLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background p-3 gap-3">
        <MinistreSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
