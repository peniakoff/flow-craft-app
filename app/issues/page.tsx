import type { Metadata } from "next"
import { IssuesPageClient } from "./page-client"

export const metadata: Metadata = {
  title: "Issues - FlowCraft",
  description: "Manage and track all your project issues, tasks, and backlog items in one place.",
}

export default function IssuesPage() {
  return <IssuesPageClient />
}
