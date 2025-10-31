import type { Metadata } from "next"
import { AnalyticsPageClient } from "./page-client"

export const metadata: Metadata = {
  title: "Analytics - Engineer Utilization | FlowCraft",
  description:
    "Detailed analytics and statistics on engineer utilization, team performance, and project efficiency metrics.",
}

export default function AnalyticsPage() {
  return <AnalyticsPageClient />
}
