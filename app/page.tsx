import type { Metadata } from "next";
import { LandingPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "FlowCraft - Modern Task Management",
  description:
    "Manage your projects with ease. FlowCraft offers sprints, kanban boards, and powerful issue tracking.",
};

export default function HomePage() {
  return <LandingPageClient />;
}
