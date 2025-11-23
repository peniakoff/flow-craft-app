"use client";

import { CurrentSprintView } from "@/components/current-sprint-view";
import { useApp } from "@/contexts/app-context";
import { DashboardPageLayout } from "@/components/dashboard/page-layout";
import { Badge } from "@/components/ui/badge";
import type { IssueStatus } from "@/types";

export function CurrentSprintPageClient() {
  const { issues, activeSprint, loading, handleEditIssue } = useApp();

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
    <DashboardPageLayout
      pageName="Current Sprint"
      pageTitle="Current Sprint"
      pageDescription="Track progress and manage tasks in your active sprint with kanban board view."
      loading={loading}
      emptyDescription="Please select a team from the Teams page to view the current sprint."
      headerActions={
        activeSprint ? (
          <Badge
            className="bg-green-100 text-green-800 border-green-200"
            variant="outline"
          >
            Active
          </Badge>
        ) : null
      }
    >
      <CurrentSprintView
        sprint={activeSprint || null}
        issues={issues}
        onUpdateIssueStatus={handleUpdateIssueStatus}
      />
    </DashboardPageLayout>
  );
}
