"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { List, Kanban, Calendar, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme-toggle";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import type { ViewType } from "@/types";

interface NavigationProps {
  currentView: ViewType;
}

export function Navigation({ currentView }: NavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { issues, sprints, activeSprint } = useApp();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const activeSprintIssues = issues.filter(
    (issue) => issue.sprintId === activeSprint?.id
  );

  const navItems = [
    {
      id: "issues" as ViewType,
      label: "Issues",
      icon: List,
      count: issues.length,
      href: "/dashboard/issues",
    },
    {
      id: "current-sprint" as ViewType,
      label: "Current Sprint",
      icon: Kanban,
      count: activeSprintIssues.length,
      disabled: !activeSprint,
      href: "/dashboard/current-sprint",
    },
    {
      id: "sprints" as ViewType,
      label: "Sprints",
      icon: Calendar,
      count: sprints.length,
      href: "/dashboard/sprints",
    },
    {
      id: "analytics" as const,
      label: "Analytics",
      icon: BarChart3,
      count: issues.filter((i) => i.status === "Done").length,
      href: "/dashboard/analytics",
    },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/dashboard/issues"
              className="flex items-center space-x-2"
            >
              <img
                src="/flowcraft-logo.png"
                alt="FlowCraft Logo"
                className="w-8 h-8 rounded-md"
              />
              <h1 className="text-xl font-semibold">FlowCraft</h1>
            </Link>

            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isDisabled = item.disabled;

                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center gap-2",
                      isActive && "bg-secondary text-secondary-foreground",
                      isDisabled && "opacity-50 cursor-not-allowed"
                    )}
                    asChild={!isDisabled}
                  >
                    {isDisabled ? (
                      <div>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        <Badge variant="outline" className="ml-1 text-xs">
                          {item.count}
                        </Badge>
                      </div>
                    ) : (
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                        <Badge variant="outline" className="ml-1 text-xs">
                          {item.count}
                        </Badge>
                      </Link>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!activeSprint && pathname === "/dashboard/current-sprint" && (
              <div className="text-sm text-muted-foreground">
                No active sprint
              </div>
            )}
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden md:block">
                  {user.name || user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Log Out</span>
                </Button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
