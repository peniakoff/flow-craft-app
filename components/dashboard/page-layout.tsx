"use client";

import { ReactNode } from "react";
import { useApp } from "@/contexts/app-context";
import { useTeams } from "@/contexts/teams-context";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface DashboardPageLayoutProps {
  pageName: string;
  children: ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  header?: ReactNode;
  headerActions?: ReactNode;
  breadcrumbOverride?: ReactNode;
}

export function DashboardPageLayout({
  pageName,
  children,
  pageTitle,
  pageDescription,
  loading,
  emptyTitle,
  emptyDescription,
  header,
  headerActions,
  breadcrumbOverride,
}: DashboardPageLayoutProps) {
  const { selectedTeamId } = useApp();
  const { teams } = useTeams();

  const selectedTeamName = selectedTeamId
    ? teams.find((team) => team.$id === selectedTeamId)?.name || "Team"
    : "No team";

  const breadcrumb = breadcrumbOverride ?? (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/projects">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard/teams">Team</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{selectedTeamName}</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{pageName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  const emptyStateTitle = emptyTitle ?? "No Team Selected";
  const emptyStateDescription =
    emptyDescription ?? "Choose a working team to view this dashboard section.";

  if (!selectedTeamId) {
    return (
      <div className="space-y-4">
        {breadcrumb}
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">{emptyStateTitle}</h2>
          <p className="text-muted-foreground">{emptyStateDescription}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {breadcrumb}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const headerNode =
    header ??
    (pageTitle ? (
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{pageTitle}</h1>
          {pageDescription && (
            <p className="text-muted-foreground mt-2">{pageDescription}</p>
          )}
        </div>
        {headerActions && <div className="shrink-0">{headerActions}</div>}
      </div>
    ) : null);

  return (
    <div className="space-y-6">
      {breadcrumb}
      {headerNode}
      {children}
    </div>
  );
}
