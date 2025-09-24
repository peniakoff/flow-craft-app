import type { Issue, Sprint, Priority, IssueStatus } from "@/types"

// Priority color mapping
export const priorityColors: Record<Priority, string> = {
  P0: "bg-red-500 text-white",
  P1: "bg-orange-500 text-white",
  P2: "bg-yellow-500 text-black",
  P3: "bg-blue-500 text-white",
  P4: "bg-green-500 text-white",
  P5: "bg-gray-500 text-white",
}

// Status color mapping
export const statusColors: Record<IssueStatus, string> = {
  Todo: "bg-gray-100 text-gray-800 border-gray-200",
  "In Progress": "bg-blue-100 text-blue-800 border-blue-200",
  "In Review": "bg-yellow-100 text-yellow-800 border-yellow-200",
  Done: "bg-green-100 text-green-800 border-green-200",
}

// Generate auto-incrementing task ID
export const generateTaskId = (existingIssues: Issue[]): string => {
  const maxId = existingIssues.reduce((max, issue) => {
    const num = Number.parseInt(issue.id.replace("TSK-", ""))
    return num > max ? num : max
  }, 0)
  return `TSK-${String(maxId + 1).padStart(3, "0")}`
}

// Sample data
export const initialSprints: Sprint[] = [
  {
    id: "sprint-1",
    name: "Sprint 1 - Foundation",
    status: "Completed",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-14"),
    createdAt: new Date("2023-12-28"),
    updatedAt: new Date("2024-01-14"),
  },
  {
    id: "sprint-2",
    name: "Sprint 2 - Core Features",
    status: "Active",
    startDate: new Date("2024-01-15"),
    endDate: new Date("2024-01-28"),
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "sprint-3",
    name: "Sprint 3 - Polish & Testing",
    status: "Planned",
    startDate: new Date("2024-01-29"),
    endDate: new Date("2024-02-11"),
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
]

export const initialIssues: Issue[] = [
  // Completed sprint issues
  {
    id: "TSK-001",
    title: "Setup project structure",
    description: "Initialize the project with proper folder structure and dependencies",
    priority: "P1",
    status: "Done",
    assignee: "Alice Johnson",
    sprintId: "sprint-1",
    createdAt: new Date("2023-12-28"),
    updatedAt: new Date("2024-01-05"),
  },
  {
    id: "TSK-002",
    title: "Design system components",
    description: "Create reusable UI components following design system",
    priority: "P2",
    status: "Done",
    assignee: "Bob Smith",
    sprintId: "sprint-1",
    createdAt: new Date("2023-12-29"),
    updatedAt: new Date("2024-01-08"),
  },
  {
    id: "TSK-003",
    title: "Database schema design",
    description: "Design and implement the database schema for the application",
    priority: "P1",
    status: "Done",
    assignee: "Charlie Brown",
    sprintId: "sprint-1",
    createdAt: new Date("2023-12-30"),
    updatedAt: new Date("2024-01-10"),
  },

  // Active sprint issues
  {
    id: "TSK-004",
    title: "User authentication system",
    description: "Implement login, registration, and session management",
    priority: "P0",
    status: "In Progress",
    assignee: "Alice Johnson",
    sprintId: "sprint-2",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "TSK-005",
    title: "Dashboard layout",
    description: "Create the main dashboard with navigation and layout components",
    priority: "P1",
    status: "In Review",
    assignee: "Bob Smith",
    sprintId: "sprint-2",
    createdAt: new Date("2024-01-11"),
    updatedAt: new Date("2024-01-19"),
  },
  {
    id: "TSK-006",
    title: "API endpoints for tasks",
    description: "Develop REST API endpoints for CRUD operations on tasks",
    priority: "P1",
    status: "Todo",
    assignee: "Charlie Brown",
    sprintId: "sprint-2",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "TSK-007",
    title: "Real-time notifications",
    description: "Implement WebSocket-based real-time notifications",
    priority: "P2",
    status: "Todo",
    assignee: "Diana Prince",
    sprintId: "sprint-2",
    createdAt: new Date("2024-01-13"),
    updatedAt: new Date("2024-01-13"),
  },

  // Planned sprint issues
  {
    id: "TSK-008",
    title: "Performance optimization",
    description: "Optimize application performance and loading times",
    priority: "P2",
    status: "Todo",
    assignee: "Alice Johnson",
    sprintId: "sprint-3",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "TSK-009",
    title: "Unit test coverage",
    description: "Write comprehensive unit tests for all components",
    priority: "P3",
    status: "Todo",
    assignee: "Bob Smith",
    sprintId: "sprint-3",
    createdAt: new Date("2024-01-21"),
    updatedAt: new Date("2024-01-21"),
  },

  // Backlog issues
  {
    id: "TSK-010",
    title: "Mobile responsive design",
    description: "Ensure the application works well on mobile devices",
    priority: "P2",
    status: "Todo",
    assignee: "Charlie Brown",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "TSK-011",
    title: "Dark mode support",
    description: "Add dark mode theme support throughout the application",
    priority: "P3",
    status: "Todo",
    assignee: "Diana Prince",
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
  {
    id: "TSK-012",
    title: "Export functionality",
    description: "Allow users to export their data in various formats",
    priority: "P4",
    status: "Todo",
    assignee: "Alice Johnson",
    createdAt: new Date("2024-01-17"),
    updatedAt: new Date("2024-01-17"),
  },
  {
    id: "TSK-013",
    title: "Advanced search filters",
    description: "Implement advanced filtering and search capabilities",
    priority: "P3",
    status: "Todo",
    assignee: "Bob Smith",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "TSK-014",
    title: "Integration with external tools",
    description: "Add integrations with popular project management tools",
    priority: "P4",
    status: "Todo",
    assignee: "Charlie Brown",
    createdAt: new Date("2024-01-19"),
    updatedAt: new Date("2024-01-19"),
  },
  {
    id: "TSK-015",
    title: "User onboarding flow",
    description: "Create guided onboarding experience for new users",
    priority: "P2",
    status: "Todo",
    assignee: "Diana Prince",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "TSK-016",
    title: "Analytics dashboard",
    description: "Build analytics dashboard with project insights and metrics",
    priority: "P5",
    status: "Todo",
    assignee: "Alice Johnson",
    createdAt: new Date("2024-01-21"),
    updatedAt: new Date("2024-01-21"),
  },
]
