"use client"

import { Navigation } from "@/components/navigation"
import { SprintsView } from "@/components/sprints-view"
import { useApp } from "@/contexts/app-context"

export function SprintsPageClient() {
  const { sprints, issues, handleCreateSprint, handleEditSprint, handleStartSprint, handleEndSprint } = useApp()

  return (
    <div className="min-h-screen bg-background">
      <Navigation currentView="sprints" />
      <main className="container mx-auto px-4 py-8">
        <SprintsView
          sprints={sprints}
          issues={issues}
          onCreateSprint={handleCreateSprint}
          onEditSprint={handleEditSprint}
          onStartSprint={handleStartSprint}
          onEndSprint={handleEndSprint}
        />
      </main>
    </div>
  )
}
