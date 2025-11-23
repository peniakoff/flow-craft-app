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
  Rocket,
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const { selectedTeamId } = useApp();
  const selectedTeam = useTeams().teams.find((t) => t.$id === selectedTeamId);

  const workspaceNav = [
    {
      label: "Projects",
      icon: Rocket,
      href: "/dashboard/projects",
    },
    {
      label: "Teams",
      icon: Users,
      count: teamsCount,
      href: "/dashboard/teams",
    },
  ];

  const teamNav = [
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
      label: "Analytics",
      icon: BarChart3,
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
                href="/dashboard/projects"
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
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workspaceNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {selectedTeam && (
          <>
            <SidebarSeparator className="transition-opacity duration-200" />
            <SidebarGroup className="transition-all duration-200 animate-in fade-in slide-in-from-top-2">
              <SidebarGroupLabel>
                <div className="flex w-full items-center gap-2 overflow-hidden">
                  <div className="shrink-0">Team Views</div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs cursor-default max-w-[60%] overflow-hidden"
                      >
                        <span className="overflow-hidden text-ellipsis whitespace-nowrap">
                          {selectedTeam.name}
                        </span>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {selectedTeam.name}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {teamNav.map((item) => {
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
                            <>
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </>
                          ) : (
                            <Link href={item.href}>
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          )}
                        </SidebarMenuButton>
                        <div className="absolute right-1 top-1.5 flex items-center gap-1 pointer-events-none peer-data-[size=sm]/menu-button:top-1 peer-data-[size=lg]/menu-button:top-2.5 group-data-[collapsible=icon]:hidden">
                          {item.count !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              {item.count}
                            </Badge>
                          )}
                        </div>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
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
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-not-allowed">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-not-allowed">
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
