"use client";

import { CurrentSprintView } from "@/components/current-sprint-view";
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
import type { IssueStatus } from "@/types";

export function CurrentSprintPageClient() {
  const { issues, activeSprint, selectedTeamId, loading, handleEditIssue } =
    useApp();
  const { teams } = useTeams();

  const selectedTeamName = selectedTeamId
    ? teams.find((team) => team.$id === selectedTeamId)?.name || "Team"
    : "No team";

  const breadcrumb = (
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
          <BreadcrumbPage>Current Sprint</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );

  // Show message if no team is selected
  if (!selectedTeamId) {
    return (
      <div className="space-y-4">
        {breadcrumb}
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No Team Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a team from the Teams page to view the current sprint.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
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

  const handleUpdateIssueStatus = async (
    issueId: string,
    newStatus: IssueStatus
  ) => {
    const issue = issues.find((i) => i.$id === issueId);
    if (issue) {
      await handleEditIssue({ ...issue, status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      {breadcrumb}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Current Sprint</h1>
        <p className="text-muted-foreground mt-2">
          Track progress and manage tasks in your active sprint with kanban
          board view.
        </p>
      </div>
      <CurrentSprintView
        sprint={activeSprint || null}
        issues={issues}
        onUpdateIssueStatus={handleUpdateIssueStatus}
      />
    </div>
  );
}
