"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Play, Square, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SprintForm } from "./sprint-form";
import type { Sprint, Issue } from "@/types";

interface SprintCardProps {
  sprint: Sprint;
  issues: Issue[];
  onEdit: (sprintData: Partial<Sprint>) => void;
  onStart: (sprintId: string) => void;
  onEnd: (sprintId: string) => void;
  canStart: boolean;
}

export function SprintCard({
  sprint,
  issues,
  onEdit,
  onStart,
  onEnd,
  canStart,
}: SprintCardProps) {
  const sprintIssues = issues.filter((issue) => issue.sprintId === sprint.$id);
  const completedIssues = sprintIssues.filter(
    (issue) => issue.status === "Done"
  );

  const getStatusColor = () => {
    switch (sprint.sprintStatus) {
      case "Active":
        return "bg-accent/30 text-accent-foreground border-accent";
      case "Completed":
        return "bg-muted text-muted-foreground border-muted";
      case "Planned":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{sprint.sprintTitle}</h3>
              <Badge className={getStatusColor()} variant="outline">
                {sprint.sprintStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(sprint.startDate)} - {formatDate(sprint.endDate)}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <SprintForm
                sprint={sprint}
                onSubmit={onEdit}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                }
              />
              {sprint.sprintStatus === "Planned" && (
                <DropdownMenuItem
                  onClick={() => onStart(sprint.$id || "")}
                  disabled={!canStart}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Sprint
                </DropdownMenuItem>
              )}
              {sprint.sprintStatus === "Active" && (
                <DropdownMenuItem onClick={() => onEnd(sprint.$id || "")}>
                  <Square className="h-4 w-4 mr-2" />
                  End Sprint
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Issues</span>
            <span className="font-medium">
              {completedIssues.length} / {sprintIssues.length} completed
            </span>
          </div>
          {sprintIssues.length > 0 && (
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (completedIssues.length / sprintIssues.length) * 100
                  }%`,
                }}
              />
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {sprintIssues.length === 0
              ? "No issues assigned"
              : `${sprintIssues.length} issues in this sprint`}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
