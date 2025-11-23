"use client";

import { SprintsView } from "@/components/sprints-view";
import { useApp } from "@/contexts/app-context";
import { DashboardPageLayout } from "@/components/dashboard/page-layout";
import { Button } from "@/components/ui/button";
import { SprintForm } from "@/components/sprint-form";
import { Plus } from "lucide-react";

export function SprintsPageClient() {
  const {
    sprints,
    issues,
    loading,
    handleCreateSprint,
    handleEditSprint,
    handleStartSprint,
    handleEndSprint,
  } = useApp();

  return (
    <DashboardPageLayout
      pageName="Sprints"
      pageTitle="Sprints"
      pageDescription="Plan, manage, and track your project sprints from planning to completion."
      loading={loading}
      emptyDescription="Please select a team from the Teams page to view and manage sprints."
      headerActions={
        <SprintForm
          onSubmit={handleCreateSprint}
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Sprint
            </Button>
          }
        />
      }
    >
      <SprintsView
        sprints={sprints}
        issues={issues}
        onCreateSprint={handleCreateSprint}
        onEditSprint={handleEditSprint}
        onStartSprint={handleStartSprint}
        onEndSprint={handleEndSprint}
      />
    </DashboardPageLayout>
  );
}
