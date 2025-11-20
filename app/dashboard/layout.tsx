"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <SidebarProvider defaultOpen={!isMobile}>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
