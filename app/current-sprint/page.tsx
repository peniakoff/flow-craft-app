import type { Metadata } from "next"
import { CurrentSprintPageClient } from "./page-client"

export const metadata: Metadata = {
  title: "Current Sprint - FlowCraft",
  description: "Track progress and manage tasks in your active sprint with kanban board view.",
}

export default function CurrentSprintPage() {
  return <CurrentSprintPageClient />
}
