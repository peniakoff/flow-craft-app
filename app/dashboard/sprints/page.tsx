import type { Metadata } from "next"
import { SprintsPageClient } from "./page-client"

export const metadata: Metadata = {
  title: "Sprints - FlowCraft",
  description: "Plan, manage, and track your project sprints from planning to completion.",
}

export default function SprintsPage() {
  return <SprintsPageClient />
}
