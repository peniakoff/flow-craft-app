"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const STATUS_STYLES: Record<
  ProjectStatus,
  { label: string; className: string }
> = {
  Planned: {
    label: "Planned",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  "In Progress": {
    label: "In Progress",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  "At Risk": {
    label: "At Risk",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  Completed: {
    label: "Completed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
  const config = STATUS_STYLES[status];

  return (
    <Badge
      variant="outline"
      className={cn("text-xs", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
