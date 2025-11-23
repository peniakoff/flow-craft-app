"use client";

import { SprintsView } from "@/components/sprints-view";
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

export function SprintsPageClient() {
  const {
    sprints,
    issues,
    selectedTeamId,
    loading,
    handleCreateSprint,
    handleEditSprint,
    handleStartSprint,
    handleEndSprint,
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
          <BreadcrumbPage>Sprints</BreadcrumbPage>
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
            Please select a team from the Teams page to view and manage sprints.
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
        <h1 className="text-3xl font-bold tracking-tight">Sprints</h1>
        <p className="text-muted-foreground mt-2">
          Plan, manage, and track your project sprints from planning to
          completion.
        </p>
      </div>
      <SprintsView
        sprints={sprints}
        issues={issues}
        onCreateSprint={handleCreateSprint}
        onEditSprint={handleEditSprint}
        onStartSprint={handleStartSprint}
        onEndSprint={handleEndSprint}
      />
    </div>
  );
}
