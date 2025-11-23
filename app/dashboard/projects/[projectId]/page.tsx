import type { Metadata } from "next";
import { ProjectDetailsPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Project Details - FlowCraft",
  description:
    "Inspect project health, linked issues, and sprint alignment for a single initiative.",
};

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectDetailsPageClient projectId={projectId} />;
}
