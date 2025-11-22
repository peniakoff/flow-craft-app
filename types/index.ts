export type Priority = number
export type IssueStatus = "Todo" | "In Progress" | "In Review" | "Done"
export type SprintStatus = "Planned" | "Active" | "Completed"

// Base interface for Appwrite database documents
export interface AppwriteDBType {
  $id?: string // Appwrite document ID (auto-generated)
  $createdAt?: string // Appwrite creation timestamp (ISO string)
  $updatedAt?: string // Appwrite update timestamp (ISO string)
  $permissions?: string[] // Appwrite permissions
  $databaseId?: string // Appwrite database ID
  $collectionId?: string // Appwrite collection ID
}

// Database types based on appwrite.config.json tables structure
export interface Issue extends AppwriteDBType {
  status: IssueStatus
  title: string
  description?: string
  sprintId: string // References Sprint.$id
  assignedUserId?: string // References Appwrite User.$id (UUID)
  teamId: string // References Team.$id
  priority: number // 1-5 range as per database constraints
}

export interface Sprint extends AppwriteDBType {
  sprintTitle: string
  sprintDescription?: string
  startDate: string // ISO datetime string
  endDate: string // ISO datetime string
  teamId: string // References Team.$id
  sprintStatus: SprintStatus
}

export type ViewType = "issues" | "current-sprint" | "sprints" | "teams"
