"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  List,
  Kanban,
  Calendar,
  BarChart3,
  Users,
  LogOut,
  User,
  Settings,
  HelpCircle,
  MessageSquare,
  ChevronUp,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/app-context";
import { useAuth } from "@/contexts/auth-context";
import { useTeams } from "@/contexts/teams-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupContent,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { issues, sprints, activeSprint } = useApp();
  const { logout, user } = useAuth();
  const { teamsCount } = useTeams();
  const { theme, setTheme } = useTheme();
  const { state } = useSidebar();

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
    (issue) => issue.sprintId === activeSprint?.$id
  );

  const navItems = [
    {
      label: "Issues",
      icon: List,
      count: issues.length,
      href: "/dashboard/issues",
    },
    {
      label: "Current Sprint",
      icon: Kanban,
      count: activeSprintIssues.length,
      disabled: !activeSprint,
      href: "/dashboard/current-sprint",
    },
    {
      label: "Sprints",
      icon: Calendar,
      count: sprints.length,
      href: "/dashboard/sprints",
    },
    {
      label: "Teams",
      icon: Users,
      count: teamsCount,
      href: "/dashboard/teams",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      count: issues.filter((i) => i.status === "Done").length,
      href: "/dashboard/analytics",
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link
                href="/dashboard/issues"
                className="flex items-center gap-2"
              >
                <Image
                  src="/flowcraft-logo.png"
                  alt="FlowCraft Logo"
                  className="w-8 h-8 rounded-md"
                  priority
                  width={32}
                  height={32}
                />
                <span className="text-lg font-semibold">FlowCraft</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                const isDisabled = item.disabled;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild={!isDisabled}
                      disabled={isDisabled}
                      isActive={isActive}
                      tooltip={item.label}
                      className={cn(
                        isDisabled && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isDisabled ? (
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </span>
                      ) : (
                        <Link href={item.href}>
                          <Icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </SidebarMenuButton>
                    {item.count !== undefined && (
                      <SidebarMenuBadge>
                        <Badge variant="outline" className="text-xs">
                          {item.count}
                        </Badge>
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md hover:bg-accent px-2 py-1.5 text-sm w-full">
                  <User className="h-4 w-4" />
                  {state === "expanded" && (
                    <>
                      <span className="flex-1 text-left truncate">
                        {user?.name || user?.email || "User"}
                      </span>
                      <ChevronUp className="h-4 w-4 opacity-50" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/user" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <span>Feedback</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center justify-between gap-2 px-0 py-1.5">
              {state === "expanded" && (
                <div className="flex items-center gap-2 text-sm">
                  <Sun className="h-4 w-4" />
                  <span className="text-xs text-muted-foreground">Light</span>
                </div>
              )}
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) =>
                  setTheme(checked ? "dark" : "light")
                }
                aria-label="Toggle theme"
              />
              {state === "expanded" && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-xs text-muted-foreground">Dark</span>
                  <Moon className="h-4 w-4" />
                </div>
              )}
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarTrigger className="w-full" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
