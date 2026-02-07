import { createFileRoute, redirect, useLocation } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";

import AppSidebar from "@/components/app-sidebar";
import BreadcrumbHeader from "@/components/breadcrumb-header";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPageComponent,
  /* beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  }, */
});

function DashboardPageComponent() {
  const location = useLocation();
  console.log("location:", location);

  return (
    <SidebarProvider>
      <AppSidebar user={null} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
            <BreadcrumbHeader />
          </div>
        </header>
        <main className="w-full space-y-6 p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
