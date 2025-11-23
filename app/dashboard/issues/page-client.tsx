"use client";

import { IssuesList } from "@/components/issues-list";
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

export function IssuesPageClient() {
  const {
    issues,
    sprints,
    selectedTeamId,
    loading,
    handleCreateIssue,
    handleEditIssue,
    handleDeleteIssue,
    handleAssignToSprint,
  } = useApp();
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
          <BreadcrumbPage>Issues</BreadcrumbPage>
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
            Please select a team from the Teams page to view and manage issues.
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

  return (
    <div className="space-y-6">
      {breadcrumb}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all your project issues, tasks, and backlog items in
          one place.
        </p>
      </div>
      <IssuesList
        issues={issues}
        sprints={sprints}
        onCreateIssue={handleCreateIssue}
        onEditIssue={handleEditIssue}
        onDeleteIssue={handleDeleteIssue}
        onAssignToSprint={handleAssignToSprint}
      />
    </div>
  );
}
