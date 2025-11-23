"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import { TeamSwitcher } from "@/components/team-switcher";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const SIDEBAR_STATE_KEY = "sidebar:state";
const SIDEBAR_MOBILE_KEY = "sidebar:mobile";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login`);
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Load sidebar state from localStorage
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    const savedMobile = localStorage.getItem(SIDEBAR_MOBILE_KEY);

    if (savedState && savedMobile === String(isMobile)) {
      // Use saved state if mobile state hasn't changed
      setSidebarOpen(savedState === "true");
    } else {
      // Set default based on mobile state and save it
      const initialState = !isMobile;
      setSidebarOpen(initialState);
      localStorage.setItem(SIDEBAR_STATE_KEY, String(initialState));
      localStorage.setItem(SIDEBAR_MOBILE_KEY, String(isMobile));
    }
  }, [isMobile]);

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

  if (sidebarOpen === undefined) {
    return null; // Wait for sidebar state to be loaded
  }

  return (
    <SidebarProvider
      defaultOpen={sidebarOpen}
      open={sidebarOpen}
      onOpenChange={(open) => {
        setSidebarOpen(open);
        localStorage.setItem(SIDEBAR_STATE_KEY, String(open));
        localStorage.setItem(SIDEBAR_MOBILE_KEY, String(isMobile));
      }}
    >
      <AppSidebar />
      <SidebarInset>
        <div className="border-b bg-card/60 backdrop-blur supports-backdrop-filter:bg-card/80">
          <div className="w-full px-4 py-4 md:container md:mx-auto">
            <TeamSwitcher />
          </div>
        </div>
        <main className="flex-1 overflow-auto">
          <div className="w-full px-4 py-8 md:container md:mx-auto">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
