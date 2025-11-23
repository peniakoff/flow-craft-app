import type { Metadata } from "next";
import { TeamsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Teams - FlowCraft",
  description:
    "Create and manage teams, invite members, and collaborate on projects together.",
};

export default function TeamsPage() {
  return <TeamsPageClient />;
}
