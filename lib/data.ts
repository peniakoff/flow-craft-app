import type { Priority, IssueStatus, Issue, Sprint } from "@/types"
import { databases, DATABASE_ID, TABLE_IDS } from "@/lib/appwrite"
import { Query } from "appwrite"

// Priority color mapping
export const priorityColors: Record<Priority, string> = {
  1: "bg-red-500 text-white",
  2: "bg-orange-500 text-white",
  3: "bg-yellow-500 text-black",
  4: "bg-blue-500 text-white",
  5: "bg-green-500 text-white",
}

// Status color mapping
export const statusColors: Record<IssueStatus, string> = {
  Todo: "bg-gray-100 text-gray-800 border-gray-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  "In Review": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Done: "bg-green-100 text-green-800 border-green-200",
}

/**
 * Fetch issues for a specific team from Appwrite
 */
export async function fetchIssuesByTeamId(teamId: string): Promise<Issue[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TABLE_IDS.issue,
      [Query.equal("teamId", [teamId])]
    )
    return response.documents as unknown as Issue[]
  } catch (error) {
    console.error("Failed to fetch issues:", error)
    throw error
  }
}

/**
 * Fetch sprints for a specific team from Appwrite
 */
export async function fetchSprintsByTeamId(teamId: string): Promise<Sprint[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TABLE_IDS.sprint,
      [Query.equal("teamId", [teamId])]
    )
    return response.documents as unknown as Sprint[]
  } catch (error) {
    console.error("Failed to fetch sprints:", error)
    throw error
  }
}

/**
 * Create a new issue in Appwrite
 */
export async function createIssue(issueData: Omit<Issue, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$databaseId' | '$collectionId'>): Promise<Issue> {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      TABLE_IDS.issue,
      'unique()',
      issueData
    )
    return response as unknown as Issue
  } catch (error) {
    console.error("Failed to create issue:", error)
    throw error
  }
}

/**
 * Update an existing issue in Appwrite
 */
export async function updateIssue(issueId: string, issueData: Partial<Issue>): Promise<Issue> {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      TABLE_IDS.issue,
      issueId,
      issueData
    )
    return response as unknown as Issue
  } catch (error) {
    console.error("Failed to update issue:", error)
    throw error
  }
}

/**
 * Delete an issue from Appwrite
 */
export async function deleteIssue(issueId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      TABLE_IDS.issue,
      issueId
    )
  } catch (error) {
    console.error("Failed to delete issue:", error)
    throw error
  }
}

/**
 * Create a new sprint in Appwrite
 */
export async function createSprint(sprintData: Omit<Sprint, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$databaseId' | '$collectionId'>): Promise<Sprint> {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      TABLE_IDS.sprint,
      'unique()',
      sprintData
    )
    return response as unknown as Sprint
  } catch (error) {
    console.error("Failed to create sprint:", error)
    throw error
  }
}

/**
 * Update an existing sprint in Appwrite
 */
export async function updateSprint(sprintId: string, sprintData: Partial<Sprint>): Promise<Sprint> {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      TABLE_IDS.sprint,
      sprintId,
      sprintData
    )
    return response as unknown as Sprint
  } catch (error) {
    console.error("Failed to update sprint:", error)
    throw error
  }
}

/**
 * Delete a sprint from Appwrite
 */
export async function deleteSprint(sprintId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      TABLE_IDS.sprint,
      sprintId
    )
  } catch (error) {
    console.error("Failed to delete sprint:", error)
    throw error
  }
}
