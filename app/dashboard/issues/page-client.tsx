"use client";

import { Navigation } from "@/components/navigation";
import { IssuesList } from "@/components/issues-list";
import { useApp } from "@/contexts/app-context";

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

  // Show message if no team is selected
  if (!selectedTeamId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentView="issues" />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No Team Selected</h2>
            <p className="text-muted-foreground mb-4">
              Please select a team from the Teams page to view and manage
              issues.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentView="issues" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView="issues" />
      <main className="container mx-auto px-4 py-8">
        <IssuesList
          issues={issues}
          sprints={sprints}
          onCreateIssue={handleCreateIssue}
          onEditIssue={handleEditIssue}
          onDeleteIssue={handleDeleteIssue}
          onAssignToSprint={handleAssignToSprint}
        />
      </main>
    </div>
  );
}
