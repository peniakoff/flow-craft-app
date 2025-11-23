"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import { TeamSwitcher } from "@/components/team-switcher";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider
      key={isMobile ? "mobile" : "desktop"}
      defaultOpen={!isMobile}
    >
      <AppSidebar />
      <SidebarInset>
        <div className="border-b bg-card/60 backdrop-blur supports-backdrop-filter:bg-card/80">
          <div className="container mx-auto px-4 py-4">
            <TeamSwitcher />
          </div>
        </div>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
