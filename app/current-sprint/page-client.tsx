"use client"

import { Navigation } from "@/components/navigation"
import { CurrentSprintView } from "@/components/current-sprint-view"
import { useApp } from "@/contexts/app-context"

export function CurrentSprintPageClient() {
  const { issues, activeSprint, handleUpdateIssueStatus } = useApp()

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
  )
}
