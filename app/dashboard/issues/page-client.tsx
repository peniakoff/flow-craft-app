"use client"

import { Navigation } from "@/components/navigation"
import { IssuesList } from "@/components/issues-list"
import { useApp } from "@/contexts/app-context"

export function IssuesPageClient() {
  const { issues, sprints, handleCreateIssue, handleEditIssue, handleDeleteIssue, handleAssignToSprint } = useApp()

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
  )
}
