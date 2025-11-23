"use client";

import { IssuesList } from "@/components/issues-list";
import { useApp } from "@/contexts/app-context";
import { DashboardPageLayout } from "@/components/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { IssueForm } from "@/components/issue-form";
import { Plus } from "lucide-react";

export function IssuesPageClient() {
  const {
    issues,
    sprints,
    loading,
    handleCreateIssue,
    handleEditIssue,
    handleDeleteIssue,
    handleAssignToSprint,
  } = useApp();

  return (
    <DashboardPageLayout
      pageName="Issues"
      pageTitle="Issues"
      pageDescription="Manage and track all your project issues, tasks, and backlog items in one place."
      loading={loading}
      emptyDescription="Please select a team from the Teams page to view and manage issues."
      headerActions={
        <IssueForm
          sprints={sprints}
          onSubmit={handleCreateIssue}
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Issue
            </Button>
          }
        />
      }
    >
      <IssuesList
        issues={issues}
        sprints={sprints}
        onCreateIssue={handleCreateIssue}
        onEditIssue={handleEditIssue}
        onDeleteIssue={handleDeleteIssue}
        onAssignToSprint={handleAssignToSprint}
      />
    </DashboardPageLayout>
  );
}
