"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { initialIssues, initialSprints, generateTaskId } from "@/lib/data"
import type { Issue, Sprint, IssueStatus } from "@/types"

interface AppContextType {
  // State
  issues: Issue[]
  sprints: Sprint[]

  // Issue management functions
  handleCreateIssue: (issueData: Partial<Issue>) => void
  handleEditIssue: (updatedIssue: Issue) => void
  handleDeleteIssue: (issueId: string) => void
  handleUpdateIssueStatus: (issueId: string, newStatus: IssueStatus) => void
  handleAssignToSprint: (issueId: string, sprintId: string | undefined) => void

  // Sprint management functions
  handleCreateSprint: (sprintData: Partial<Sprint>) => void
  handleEditSprint: (updatedSprint: Sprint) => void
  handleStartSprint: (sprintId: string) => void
  handleEndSprint: (sprintId: string) => void

  // Computed values
  activeSprint: Sprint | undefined
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [issues, setIssues] = useState<Issue[]>(initialIssues)
  const [sprints, setSprints] = useState<Sprint[]>(initialSprints)

  // Issue management functions
  const handleCreateIssue = (issueData: Partial<Issue>) => {
    const newIssue: Issue = {
      id: generateTaskId(issues),
      title: issueData.title || "",
      description: issueData.description || "",
      priority: issueData.priority || "P3",
      status: issueData.status || "Todo",
      assignee: issueData.assignee || "",
      sprintId: issueData.sprintId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setIssues([...issues, newIssue])
  }

  const handleEditIssue = (updatedIssue: Issue) => {
    setIssues(
      issues.map((issue) =>
        issue.id === updatedIssue.id
          ? {
              ...issue,
              ...updatedIssue,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )
  }

  const handleDeleteIssue = (issueId: string) => {
    setIssues(issues.filter((issue) => issue.id !== issueId))
  }

  const handleUpdateIssueStatus = (issueId: string, newStatus: IssueStatus) => {
    setIssues(
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              status: newStatus,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )
  }

  const handleAssignToSprint = (issueId: string, sprintId: string | undefined) => {
    setIssues(
      issues.map((issue) =>
        issue.id === issueId
          ? {
              ...issue,
              sprintId,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )
  }

  // Sprint management functions
  const handleCreateSprint = (sprintData: Partial<Sprint>) => {
    const newSprint: Sprint = {
      id: `sprint-${Date.now()}`,
      name: sprintData.name || "",
      status: "Planned",
      startDate: sprintData.startDate || new Date(),
      endDate: sprintData.endDate || new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setSprints([...sprints, newSprint])
  }

  const handleEditSprint = (updatedSprint: Sprint) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === updatedSprint.id
          ? {
              ...sprint,
              ...updatedSprint,
              updatedAt: new Date(),
            }
          : sprint,
      ),
    )
  }

  const handleStartSprint = (sprintId: string) => {
    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              status: "Active" as const,
              updatedAt: new Date(),
            }
          : sprint,
      ),
    )
  }

  const handleEndSprint = (sprintId: string) => {
    // Move unfinished issues back to backlog
    const unfinishedIssues = issues.filter((issue) => issue.sprintId === sprintId && issue.status !== "Done")

    setIssues(
      issues.map((issue) =>
        unfinishedIssues.some((ui) => ui.id === issue.id)
          ? {
              ...issue,
              sprintId: undefined,
              updatedAt: new Date(),
            }
          : issue,
      ),
    )

    // Update sprint status
    setSprints(
      sprints.map((sprint) =>
        sprint.id === sprintId
          ? {
              ...sprint,
              status: "Completed" as const,
              updatedAt: new Date(),
            }
          : sprint,
      ),
    )
  }

  // Computed values
  const activeSprint = sprints.find((sprint) => sprint.status === "Active")

  const value: AppContextType = {
    issues,
    sprints,
    handleCreateIssue,
    handleEditIssue,
    handleDeleteIssue,
    handleUpdateIssueStatus,
    handleAssignToSprint,
    handleCreateSprint,
    handleEditSprint,
    handleStartSprint,
    handleEndSprint,
    activeSprint,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
