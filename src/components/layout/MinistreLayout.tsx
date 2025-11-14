import { Outlet } from "react-router-dom";
import { MinistreSidebar } from "./MinistreSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export function MinistreLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <MinistreSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4 md:hidden">
            <SidebarTrigger />
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
