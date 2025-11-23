import type { Metadata } from "next";
import { ProjectsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Projects - FlowCraft",
  description:
    "Plan quarterly initiatives, track status, and connect issues without leaving FlowCraft.",
};

export default function ProjectsPage() {
  return <ProjectsPageClient />;
}
