"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ArrowUpDown, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { IssueForm } from "./issue-form";
import { IssueAssignmentDialog } from "./issue-assignment-dialog";
import { priorityColors, statusColors } from "@/lib/data";
import type { Issue, Sprint } from "@/types";
import { useProjects } from "@/contexts/projects-context";

interface IssueCardProps {
  issue: Issue;
  sprints: Sprint[];
  onEdit: (issueData: Partial<Issue>) => Promise<Issue>;
  onDelete: (issueId: string) => void;
  onAssignToSprint: (issueId: string, sprintId: string | undefined) => void;
  showSprint?: boolean;
}

export function IssueCard({
  issue,
  sprints,
  onEdit,
  onDelete,
  onAssignToSprint,
  showSprint = true,
}: IssueCardProps) {
  const sprint = sprints.find((s) => s.$id === issue.sprintId);
  const { projects } = useProjects();
  const project = issue.projectId
    ? projects.find((candidate) => candidate.$id === issue.projectId)
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow min-w-[270px]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-muted-foreground">
                {issue.$id}
              </span>
              <Badge
                className={priorityColors[issue.priority]}
                variant="secondary"
              >
                P{issue.priority}
              </Badge>
            </div>
            <h3 className="font-medium leading-tight">{issue.title}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <IssueForm
                issue={issue}
                sprints={sprints}
                onSubmit={onEdit}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                }
              />
              <IssueAssignmentDialog
                issue={issue}
                sprints={sprints}
                onAssign={onAssignToSprint}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Assign to Sprint
                  </DropdownMenuItem>
                }
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Issue</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{issue.title}"? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(issue.$id || "")}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {issue.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {issue.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className={statusColors[issue.status]} variant="outline">
              {issue.status}
            </Badge>
            {showSprint && sprint && (
              <Badge variant="secondary" className="text-xs">
                {sprint.sprintTitle}
              </Badge>
            )}
            {showSprint && !sprint && (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                Backlog
              </Badge>
            )}
            {project && (
              <Badge variant="outline" className="text-xs border-dashed">
                {project.name}
              </Badge>
            )}
          </div>
          {issue.assignedUserId && (
            <span className="text-xs text-muted-foreground">Assigned</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
