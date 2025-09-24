"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { List, Kanban, Calendar, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme-toggle";
import { useApp } from "@/contexts/app-context";
import type { ViewType } from "@/types";

interface NavigationProps {
  currentView: ViewType;
}

export function Navigation({ currentView }: NavigationProps) {
  const pathname = usePathname();
  const { issues, sprints, activeSprint } = useApp();

  const activeSprintIssues = issues.filter(
    (issue) => issue.sprintId === activeSprint?.id
  );

  const navItems = [
    {
      id: "issues" as ViewType,
      label: "Issues",
      icon: List,
      count: issues.length,
      href: "/issues",
    },
    {
      id: "current-sprint" as ViewType,
      label: "Current Sprint",
      icon: Kanban,
      count: activeSprintIssues.length,
      disabled: !activeSprint,
      href: "/current-sprint",
    },
    {
      id: "sprints" as ViewType,
      label: "Sprints",
      icon: Calendar,
      count: sprints.length,
      href: "/sprints",
    },
    {
      id: "analytics" as const,
      label: "Analytics",
      icon: BarChart3,
      count: issues.filter((i) => i.status === "Done").length,
      href: "/analytics",
    },
  ];

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/issues" className="flex items-center space-x-2">
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
            {!activeSprint && pathname === "/current-sprint" && (
              <div className="text-sm text-muted-foreground">
                No active sprint
              </div>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
