import type {
  Priority,
  IssueStatus,
  Issue,
  Sprint,
  Project,
  ProjectStatus,
} from "@/types"
import { databases, DATABASE_ID, TABLE_IDS } from "@/lib/appwrite"
import { Query } from "appwrite"

type ProjectDateFilter = "all" | "overdue" | "this-quarter"

export interface ProjectDirectoryQuery {
  page?: number
  limit?: number
  status?: ProjectStatus
  ownerId?: string
  teamId?: string | null
  privateOnly?: boolean
  dateFilter?: ProjectDateFilter
  viewerId?: string
}

export interface ProjectDirectoryResult {
  projects: Project[]
  total: number
}

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

/**
 * Fetch projects for a specific team from Appwrite
 */
export async function fetchProjectsByTeamId(teamId: string): Promise<Project[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TABLE_IDS.project,
      [Query.equal("teamId", [teamId])]
    )
    return response.documents as unknown as Project[]
  } catch (error) {
    console.error("Failed to fetch projects:", error)
    throw error
  }
}

/**
 * Fetch a single project by its ID from Appwrite
 */
export async function fetchProjectById(projectId: string): Promise<Project> {
  try {
    const response = await databases.getDocument(
      DATABASE_ID,
      TABLE_IDS.project,
      projectId
    )
    return response as unknown as Project
  } catch (error) {
    console.error("Failed to fetch project:", error)
    throw error
  }
}

/**
 * Create a new project in Appwrite
 */
export async function createProject(projectData: Omit<Project, '$id' | '$createdAt' | '$updatedAt' | '$permissions' | '$databaseId' | '$collectionId'>): Promise<Project> {
  try {
    const response = await databases.createDocument(
      DATABASE_ID,
      TABLE_IDS.project,
      'unique()',
      projectData
    )
    return response as unknown as Project
  } catch (error) {
    console.error("Failed to create project:", error)
    throw error
  }
}

/**
 * Update an existing project in Appwrite
 */
export async function updateProject(projectId: string, projectData: Partial<Project>): Promise<Project> {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID,
      TABLE_IDS.project,
      projectId,
      projectData
    )
    return response as unknown as Project
  } catch (error) {
    console.error("Failed to update project:", error)
    throw error
  }
}

/**
 * Delete a project from Appwrite
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      TABLE_IDS.project,
      projectId
    )
  } catch (error) {
    console.error("Failed to delete project:", error)
    throw error
  }
}

function getQuarterBounds(date: Date) {
  const quarter = Math.floor(date.getMonth() / 3)
  const start = new Date(date.getFullYear(), quarter * 3, 1)
  const end = new Date(date.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999)
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export async function fetchProjectsDirectory(
  options: ProjectDirectoryQuery = {}
): Promise<ProjectDirectoryResult> {
  const {
    page = 0,
    limit = 10,
    status,
    ownerId,
    teamId,
    privateOnly = false,
    dateFilter = "all",
    viewerId,
  } = options

  const queries = [
    Query.limit(limit),
    Query.offset(page * limit),
    Query.orderAsc("dueDate"),
  ]

  if (status) {
    queries.push(Query.equal("status", [status]))
  }

  if (privateOnly) {
    queries.push(Query.equal("isPrivate", [true]))
    if (viewerId) {
      queries.push(Query.equal("ownerId", [viewerId]))
    }
  } else if (teamId) {
    queries.push(Query.equal("teamId", [teamId]))
  }

  if (!privateOnly && ownerId) {
    queries.push(Query.equal("ownerId", [ownerId]))
  }

  if (dateFilter === "overdue") {
    const now = new Date().toISOString()
    queries.push(Query.lessThan("dueDate", now))
    queries.push(Query.notEqual("status", ["Completed"]))
  } else if (dateFilter === "this-quarter") {
    const { start, end } = getQuarterBounds(new Date())
    queries.push(Query.greaterThanEqual("dueDate", start))
    queries.push(Query.lessThanEqual("dueDate", end))
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      TABLE_IDS.project,
      queries
    )

    return {
      projects: response.documents as unknown as Project[],
      total: response.total,
    }
  } catch (error) {
    console.error("Failed to fetch projects directory:", error)
    throw error
  }
}
