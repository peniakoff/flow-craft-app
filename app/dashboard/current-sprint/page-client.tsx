"use client";

import { Navigation } from "@/components/navigation";
import { CurrentSprintView } from "@/components/current-sprint-view";
import { useApp } from "@/contexts/app-context";
import type { IssueStatus } from "@/types";

export function CurrentSprintPageClient() {
  const { issues, activeSprint, selectedTeamId, loading, handleEditIssue } =
    useApp();

  // Show message if no team is selected
  if (!selectedTeamId) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation currentView="current-sprint" />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No Team Selected</h2>
            <p className="text-muted-foreground mb-4">
              Please select a team from the Teams page to view the current
              sprint.
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
        <Navigation currentView="current-sprint" />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
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
    <div className="min-h-screen bg-background">
      <Navigation currentView="current-sprint" />
      <main className="container mx-auto px-4 py-8">
        <CurrentSprintView
          sprint={activeSprint || null}
          issues={issues}
          onUpdateIssueStatus={handleUpdateIssueStatus}
        />
      </main>
    </div>
  );
}
